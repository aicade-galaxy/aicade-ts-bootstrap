import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import dotenv from "dotenv";

// Load environment variables (used to read the upload URL)
dotenv.config();

/**
 * Re-implement `upload_script.sh` behavior in Node.js:
 * 1) npm run build
 * 2) Check whether dist/ exists
 * 3) zip -r dist.zip dist
 * 4) Calculate Content-MD5 (Base64)
 * 5) Calculate X-File-MD5 (Base64), source string: ${ContentMD5B64}${DappKey}
 * 6) POST upload, headers: DappKey, X-File-MD5, form: file=@dist.zip
 * 7) Clean up dist.zip
 */

const DIST_DIR = "dist";
const ZIP_FILE = "dist.zip";

const runOrExit = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });

  if (result.error) {
    console.error(`Error: failed to run ${command}:`, result.error);
    process.exit(1);
  }

  if (typeof result.status === "number" && result.status !== 0) {
    console.error(`Error: ${command} exited with code ${result.status}`);
    process.exit(result.status ?? 1);
  }
};

const md5Base64OfFile = (filePath) => {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(buf).digest("base64");
};

const md5Base64OfString = (text) => {
  return crypto.createHash("md5").update(text, "utf8").digest("base64");
};

const ensureWebApiGlobals = () => {
  // Node 18+ provides fetch / FormData / Blob by default
  if (typeof fetch !== "function") {
    console.error(
      "Error: Current Node version does not support global fetch. Please run this script with Node 18+.",
    );
    process.exit(1);
  }
  if (typeof FormData !== "function" || typeof Blob !== "function") {
    console.error(
      "Error: Current Node version does not support FormData/Blob. Please run this script with Node 18+.",
    );
    process.exit(1);
  }
};

const printUsageAndExit = (exitCode = 0) => {
  console.log(
    [
      "Usage:",
      "  npm run upload",
      "  node upload.js",
      "  # Optional: override DappKey from .env via CLI args",
      "  npm run upload -- <DappKey>",
      "  node upload.js <DappKey>",
      "\nNotes:",
      "  - Runs npm run build first, then zips dist/ into dist.zip and uploads it.",
      "  - Upload uses headers DappKey and X-File-MD5, and sends the file field via multipart/form-data.",
      "\nEnvironment variables (optional):",
      "  - VITE_AICADE_API_KEY / DAPP_KEY: DappKey (read from here by default).",
      "  - VITE_AICADE_API_UPLOAD / UPLOAD_URL: Upload URL.",
      "    * If the value is a relative path (e.g. /v1/... or /UploadFile), it will be resolved against the origin of VITE_AICADE_API_URL; if not provided, fallback is http://localhost:8081.",
      "  - VITE_AICADE_API_URL: Base API URL (used to resolve relative upload URLs).",
      "\nExamples:",
      "  npm run upload",
      "  npm run upload -- your_dapp_key",
    ].join("\n"),
  );
  process.exit(exitCode);
};

const resolveUploadUrl = (raw) => {
  const defaultAbsolute = "http://xxx/v1/client/upload";
  if (!raw) return defaultAbsolute;

  // Absolute URL
  if (/^https?:\/\//i.test(raw)) return raw;

  // Relative path: prefer resolving from VITE_AICADE_API_URL, otherwise fallback to xxx
  if (raw.startsWith("/")) {
    const base = process.env.VITE_AICADE_API_URL;
    if (base) {
      try {
        // Support two common configurations:
        // 1) VITE_AICADE_API_URL=https://host/v1  + VITE_AICADE_API_UPLOAD=/v1/xxx  => https://host/v1/xxx
        // 2) VITE_AICADE_API_URL=https://host/v1  + VITE_AICADE_API_UPLOAD=/xxx     => https://host/v1/xxx
        //    (many people only put /v1 in the base URL)
        const baseUrl = new URL(base);
        const origin = baseUrl.origin;

        // If raw already contains /v1..., join it directly to origin
        if (raw.startsWith("/v1/")) return `${origin}${raw}`;

        // If base has a pathname prefix (e.g. /v1) and raw does not include /v1, append raw after base pathname
        const basePath = baseUrl.pathname.replace(/\/+$/, "");
        if (basePath && basePath !== "/") {
          return `${origin}${basePath}${raw}`;
        }

        // If base has no path prefix, use regular origin + raw
        return `${origin}${raw}`;
      } catch {
        // ignore
      }
    }
    return `http://localhost:8081${raw}`;
  }

  // Fallback: if parsing fails, use the default URL
  console.warn(
    `Warning: Failed to parse upload URL '${raw}', using default URL ${defaultAbsolute}`,
  );
  return defaultAbsolute;
};

const upload = async () => {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    printUsageAndExit(0);
  }

  // dappKey is read from .env by default; CLI args can override it
  const dappKey =
    args[0] ?? process.env.VITE_AICADE_API_KEY ?? process.env.DAPP_KEY;
  if (!dappKey) {
    printUsageAndExit(1);
  }

  const secretKey =
    args[1] ??
    process.env.VITE_AICADE_API_SECRET_KEY ??
    process.env.DAPP_SECRET_KEY;
  if (!secretKey) {
    printUsageAndExit(1);
  }

  // Match upload_script.sh behavior: default to local URL, but allow env override.
  const uploadUrl = resolveUploadUrl(
    process.env.VITE_AICADE_API_UPLOAD ?? process.env.UPLOAD_URL,
  );

  ensureWebApiGlobals();

  // 1) Build
  console.log("Building the project...");
  // More reliable on macOS/Linux: use the npm executable directly
  runOrExit("npm", ["run", "build"]);

  // 2) Check dist
  const distPath = path.join(process.cwd(), DIST_DIR);
  if (!fs.existsSync(distPath) || !fs.statSync(distPath).isDirectory()) {
    console.error(`Error: '${DIST_DIR}' directory not found after build.`);
    process.exit(1);
  }

  // 3) Zip dist
  const zipPath = path.join(process.cwd(), ZIP_FILE);
  if (fs.existsSync(zipPath)) fs.rmSync(zipPath);

  console.log(`Zipping the '${DIST_DIR}' directory...`);
  // Same as the bash script: rely on the system zip command
  runOrExit("zip", ["-r", ZIP_FILE, DIST_DIR]);

  if (!fs.existsSync(zipPath)) {
    console.error(`Error: Failed to create zip file: ${zipPath}`);
    process.exit(1);
  }

  // 4) Content-MD5 Base64
  console.log("Calculating MD5 hash...");
  const contentMd5B64 = md5Base64OfFile(zipPath);
  console.log(`Content-MD5 (Base64): ${contentMd5B64}`);

  // 5) X-File-MD5 Base64
  console.log("Calculating X-File-MD5 signature...");
  console.log(`Source: ${contentMd5B64}${secretKey}`);
  const xFileMd5 = md5Base64OfString(`${contentMd5B64}${secretKey}`);
  console.log(`X-File-MD5: ${xFileMd5}`);

  // 6) Upload
  console.log(`Uploading ${ZIP_FILE} with DappKey: ${dappKey} to ${uploadUrl}`);
  const fileContent = fs.readFileSync(zipPath);
  const blob = new Blob([fileContent], { type: "application/zip" });
  const formData = new FormData();
  formData.append("file", blob, ZIP_FILE);

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      DappKey: dappKey,
      "X-File-MD5": xFileMd5,
    },
    body: formData,
  });

  const responseText = await response.text().catch(() => "");
  const jsonObject = JSON.parse(responseText || "{}");
  if (!response.ok || jsonObject.data != "ok") {
    console.error(`Upload failed: ${response.status} ${response.statusText}`);
    if (responseText) console.error(responseText);
    process.exit(1);
  }

  console.log("Upload success!", responseText);

  // 7) Clean up
  console.log("\nCleaning up...");
  fs.rmSync(zipPath);
  console.log("Upload complete. Check the server logs for details.");
};

upload().catch((error) => {
  console.error("Error occurred during upload:", error);
  // best-effort cleanup
  try {
    const zipPath = path.join(process.cwd(), ZIP_FILE);
    if (fs.existsSync(zipPath)) fs.rmSync(zipPath);
  } catch {
    // ignore
  }
  process.exit(1);
});

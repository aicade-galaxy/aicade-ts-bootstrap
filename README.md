# aicade-ts-bootstrap

An aicade application bootstrap based on `Vite + React + TypeScript`, with a built-in `aicade-ts-sdk` local package dependency and an upload script. It is suitable for quickly creating/integrating aicade platform applications (especially mini-game Web Apps).

## Project Purpose

- Serve as a frontend starting point for aicade apps (React + TS)
- Quickly integrate `aicade-ts-sdk`
- Support local development, build, and preview
- Package `dist` and upload it to the platform endpoint via `upload.js`

The default page is intentionally minimal (`src/App.tsx` is a placeholder), so you can extend it directly based on your business needs.

## aicade TS SDK Integration Overview (Based on `doc/README*.md`)

Usage of `aicade-ts-sdk` can be understood in 3 layers:

- `AicadeSDK` core instance: initialization, ready state, module retrieval, event subscription
- Business modules: capability-based modules (such as `Application`, `Ticket`, `AppScore`, `AicadeCurrency`, `AIChat`, `LocalStorageTools`)
- Utility methods: such as `Web3Utils`, `bigNumber`, etc. for numeric/Web3 handling

Recommended integration order:

1. Create an `AicadeSDK` instance.
2. Call `init(...)` to initialize.
3. Call `waitForReady()` to ensure the SDK is ready.
4. Use `getModule(...)` to obtain business modules and reuse their instances.
5. Subscribe to events when you need to react to state changes, and keep remove handlers.
6. Call `destroy()` when the app is torn down.

Common modules (for mini-game scenarios):

- `Application`: get app information, exit app
- `Ticket`: ticket/subscription/playability status
- `AppScore`: refresh score, submit score, leaderboard
- `AicadeCurrency`: point refresh, consume, exchange
- `LocalStorageTools`: replace browser `localStorage`
- `AIChat` / `AICoinMarket`: AI chat and market assistant related capabilities (optional)

Practical suggestions:

- Reuse module instances in your app code; do not recreate the SDK repeatedly
- Use `try/catch` for all async calls
- Use event subscriptions to sync UI for account, points, and score changes
- Prefer SDK capabilities over native storage/platform-specific logic

## AI-Assisted Development Guide (Based on `doc/AICreateApplication*.md`)

This project supports AI-assisted generation of complete apps/mini-games. Recommended workflow:

1. Define business requirements clearly first (gameplay, UI, data rules, audio/art style, etc.).
2. Organize requirements into a structured prompt (role setup, goals, mechanics, technical requirements).
3. Add aicade platform constraints to the prompt (this is critical):
   - Point exchange ratio (e.g. `100:1`)
   - Daily exchange limit
   - Exchange trigger timing (e.g. game over)
   - Wallet address / point balance display
   - Replace `localStorage` with `LocalStorageTools`
4. Paste the prompt into an IDE assistant (such as VS Code / Cursor) to generate code.
5. Do a quick manual review:
   - Are SDK calls correct?
   - Are platform constraints implemented?
   - Are there any leftover native browser capability calls?
6. Run local debugging, then upload after verification.

Suggested prompt structure:

- Role setup (what engineering role you want the AI to act as)
- Project goal (game/app objective)
- Functional and interaction rules
- Visual and audio requirements
- aicade TS SDK integration requirements
- Technical constraints (project environment, code structure, file format)

One-line principle: first make the AI understand your business, then make it follow aicade platform rules.

## Tech Stack

- `React 18`
- `TypeScript 5`
- `Vite 5`
- `aicade-ts-sdk` (imported from a local tgz package)
- `dotenv` (used by the upload script to read environment variables)

## Requirements

- `Node.js 18+` (`upload.js` depends on global `fetch / FormData / Blob`)
- `npm`
- System `zip` command (used by the upload script)

## Quick Start

```bash
npm install
npm run dev
```

Default local dev server settings:

- Port: `3010`
- `open: true` is enabled in `vite.config.ts`

## Recommended Development Flow (With `doc/` Docs)

1. Read [SDK API Reference (English)](./doc/README.md) to confirm SDK initialization flow and target module APIs.
2. Read [AI Integration and Application Development Guide (English)](./doc/AICreateApplication.md) to organize your business requirements and AI prompt.
3. Implement pages and logic in `src/App.tsx`, prioritizing SDK capabilities over native browser features (such as local storage).
4. Use `npm run dev` for local debugging, then run `npm run upload` after completion.

## Common Commands

- `npm run dev`: start local development
- `npm run build`: TypeScript compile + production build
- `npm run preview`: preview the build locally
- `npm run lint`: lint code
- `npm run watch`: watch `src`, rebuild, and copy `dist/` to `../web-core/public/`
- `npm run upload`: build, zip, and upload `dist.zip`

## Upload Guide (`upload.js`)

`npm run upload` performs the following steps:

1. Run `npm run build`
2. Check whether `dist/` exists
3. Zip `dist/` into `dist.zip`
4. Calculate `Content-MD5` (Base64)
5. Calculate `X-File-MD5` using `Content-MD5 + secretKey`
6. Upload via `multipart/form-data` (field name: `file`)
7. Clean up `dist.zip` after upload

### Upload-Related Environment Variables

- `VITE_AICADE_API_KEY` / `DAPP_KEY`: request header `DappKey`
- `VITE_AICADE_API_SECRET_KEY` / `DAPP_SECRET_KEY`: used to generate `X-File-MD5`
- `VITE_AICADE_API_UPLOAD` / `UPLOAD_URL`: upload URL (absolute URL or relative path)
- `VITE_AICADE_API_URL`: used to complete origin/base path when upload URL is a relative path

### CLI Overrides (Optional)

```bash
npm run upload -- <DappKey> <SecretKey>
```

or:

```bash
node upload.js <DappKey> <SecretKey>
```

## Directory Structure (Current)

```text
.
├── src/
│   ├── App.tsx            # App entry component (currently a placeholder)
│   ├── main.tsx           # React mount entry
│   └── index.css          # Global styles
├── doc/
│   ├── README.md          # SDK API Reference (English)
│   └── AICreateApplication.md       # AI integration app development guide (English)
├── upload.js              # Build + zip + upload script
├── vite.config.ts         # Vite config (aliases, port, headers, etc.)
├── package.json
└── index.html
```

## Development Suggestions

- Integrate `aicade-ts-sdk` in `src/App.tsx` based on your business scenario
- Prefer SDK `LocalStorageTools` for local storage
- For score/currency logic, refer to `AppScore` and `AicadeCurrency` in the [SDK API Reference (English)](./doc/README.md)
- For account/wallet display, refer to `AicadeSDK` login and account info capabilities (see [SDK API Reference (English)](./doc/README.md))
- Before integration, read [AI Integration and Application Development Guide (English)](./doc/AICreateApplication.md)

## Notes

- `aicade-ts-sdk` is currently imported via the local package `aicade-ts-sdk-1.0.1.tgz`; when upgrading, update both the package file and version declaration
- `upload.js` depends on the system `zip` command; install it if unavailable
- If your upload URL is a relative path, configure `VITE_AICADE_API_URL` correctly

## Documentation Navigation (`doc/`)

This project relies on the documentation in `doc/`. Since this README is in English, start with these English documents:

- [AI Integration and Application Development Guide (English)](./doc/AICreateApplication.md): from requirement planning and prompt writing to code generation and upload
- [aicade TS SDK API Reference (English)](./doc/README.md): SDK modules/API signatures and event reference

Notes:

- `doc/AICreateApplication.md` focuses on AI development workflow and platform integration constraints
- `doc/README.md` focuses on SDK API capabilities

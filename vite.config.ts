import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/styles": path.resolve(__dirname, "./src/styles"),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          // 可以在这里定义 Antd 主题变量
          // '@primary-color': '#1890ff',
        },
      },
    },
  },
  server: {
    port: 3010,
    open: true,
    allowedHosts: ["localhost:3000", "127.0.0.1:3000"],
    headers: {
      "Access-Control-Allow-Origin": "*",
      Origin: "http://localhost:3000",
    },
  },
});

import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";

const isProd = process.env.NODE_ENV === "production";

// 此配置仅应用于前端编译
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    isProd &&
      legacy({
        targets: ["defaults", "not IE 11"],
        polyfills: [
          "es/array",
          "es/array-buffer",
          "es/object",
          "es/string",
          "es/number",
          "es/function",
          "es/map",
          "es/math",
          "es/set",
          "es/promise",
          "es/regexp",
          "es/weak-set",
          "es/weak-map",
          "es/date",
        ],
      }),
  ],
  server: {
    proxy: {
      "/mark-proxy": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});

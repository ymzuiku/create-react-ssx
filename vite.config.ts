import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import reactJsx from "vite-react-jsx";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactJsx(), reactRefresh()],
  // esbuild: {
  //   jsxInject: `import React from 'react';`,
  // },
});

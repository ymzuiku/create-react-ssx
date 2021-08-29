import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import reactJsx from "vite-react-jsx";
import viteImagemin from "vite-plugin-imagemin";
import legacy from "@vitejs/plugin-legacy";

const isProd = process.env.NODE_ENV === "production";

// 仅应用于前端编译配置
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    reactJsx(),
    // isProd && legacy({ targets: ["defaults", "not IE 11"] }),
    isProd &&
      viteImagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false,
        },
        optipng: {
          optimizationLevel: 7,
        },
        mozjpeg: {
          quality: 20,
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4,
        },
        svgo: {
          plugins: [
            {
              name: "removeViewBox",
            },
            {
              name: "removeEmptyAttrs",
              active: false,
            },
          ],
        },
      }),
  ].filter(Boolean),
  // esbuild: {
  //   jsxInject: `import React from 'react';`,
  // },
});

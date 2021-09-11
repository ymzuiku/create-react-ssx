const Vite = require("vite");
const reactJsx = require("vite-react-jsx").default;
const reactRefresh = require("@vitejs/plugin-react-refresh").default;
const viteImagemin = require("vite-plugin-imagemin");
const isProd = process.env.NODE_ENV === "production";
const mode = isProd ? "production" : "development";
const cwd = process.cwd();
const serverIndex = "server/index.ts";

exports.serverDev = (define) =>
  Vite.defineConfig({
    configFile: false,
    root: cwd,
    mode,
    logLevel: "error",
    define,
    build: {
      brotliSize: false,
      ssr: true,
      sourcemap: true,
      minify: false,
      target: "es6",
      lib: {
        name: "server-dev",
        formats: ["cjs"],
        entry: serverIndex,
      },
      outDir: "dist/server-dev",
      emptyOutDir: true,
      watch: {
        buildDelay: 30,
      },
    },
  });

exports.server = (define) =>
  Vite.defineConfig({
    configFile: false,
    root: cwd,
    mode,
    logLevel: "info",
    define,
    build: {
      brotliSize: false,
      ssr: true,
      sourcemap: false,
      minify: true,
      target: "es6",
      lib: {
        name: "server",
        formats: ["cjs"],
        entry: serverIndex,
      },
      outDir: "dist/server",
      emptyOutDir: true,
    },
  });

exports.tmp = (entry) =>
  Vite.defineConfig({
    root: cwd,
    mode,
    configFile: false,
    plugins: [reactRefresh(), reactJsx()],
    logLevel: "error",
    build: {
      ssr: true,
      sourcemap: !isProd,
      minify: false,
      target: "es6",
      brotliSize: false,
      lib: {
        name: entry,
        formats: ["cjs"],
        entry,
      },
      outDir: "dist/tmp",
      emptyOutDir: false,
    },
  });

exports.entryServer = (define) =>
  Vite.defineConfig({
    root: cwd,
    mode,
    define,
    logLevel: "error",
    configFile: false,
    plugins: [reactRefresh(), reactJsx()],
    build: {
      ssr: true,
      sourcemap: false,
      minify: false,
      target: "es6",
      brotliSize: false,
      lib: {
        name: "appServer",
        formats: ["cjs"],
        entry: "scripts/appServer.tsx",
      },
      emptyOutDir: false,
      outDir: "dist/server",
      emptyOutDir: false,
    },
  });

exports.static = () =>
  Vite.defineConfig({
    root: cwd,
    plugins: [
      reactRefresh(),
      reactJsx(),
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
    ],
    mode,
    logLevel: "info",
    build: {
      brotliSize: false,
      outDir: "dist/static",
    },
  });

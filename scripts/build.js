const Vite = require("vite");
const path = require("path");

const child_process = require("child_process");
const Cwd = (...args) => path.resolve(process.cwd(), ...args);
const isProd = process.env.NODE_ENV === "production";
const mode = isProd ? "production" : "development";
const cwd = process.cwd();
const buildPath = Cwd("dist/server/index.js");

const configs = {
  server: Vite.defineConfig({
    configFile: false,
    root: cwd,
    mode,
    logLevel: isProd ? "info" : "error",
    define: process.env,
    build: {
      ssr: true,
      sourcemap: true,
      minify: false,
      target: "es6",
      lib: {
        name: "server",
        formats: ["cjs"],
        entry: "server/index.ts",
      },
      outDir: "dist/server",
      emptyOutDir: true,
      watch: isProd
        ? void 0
        : {
            buildDelay: 50,
            clearScreen: false,
          },
    },
  }),
  prerender: Vite.defineConfig({
    root: cwd,
    mode,
    logLevel: isProd ? "info" : "error",
    build: {
      ssr: true,
      sourcemap: true,
      minify: false,
      target: "es6",
      lib: {
        name: "prerender",
        formats: ["cjs"],
        entry: "scripts/prerender.ts",
      },
      outDir: "dist/prerender",
      emptyOutDir: false,
    },
  }),
  static: Vite.defineConfig({
    root: cwd,
    mode,
    define: process.env,
    logLevel: isProd ? "info" : "error",
    build: {
      outDir: "dist/static",
    },
  }),
};

let child;
async function onBoundleEnd() {
  if (child) {
    child.kill(1);
    child = null;
  }
  child = child_process.spawn("node", [buildPath], {
    stdio: "inherit",
    env: process.env,
  });
  console.log("Runing...");
}

async function start() {
  const watcher = await Vite.build(configs.server);

  if (!isProd) {
    watcher.on("event", (event) => {
      if (event.code === "BUNDLE_END") {
        onBoundleEnd();
      }
    });
  }

  if (isProd) {
    await Vite.build(configs.static);
    await Vite.build(configs.prerender);
    require(Cwd("dist/prerender/prerender.js"));
  }
}

start();

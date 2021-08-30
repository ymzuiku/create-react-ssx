const Vite = require("vite");
const path = require("path");
const fs = require("fs-extra");

const child_process = require("child_process");
const Cwd = (...args) => path.resolve(process.cwd(), ...args);
const isProd = process.env.NODE_ENV === "production";
const mode = isProd ? "production" : "development";
const cwd = process.cwd();
const devServerPath = Cwd("dist/server-dev/index.js");

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
        name: isProd ? "server" : "server-dev",
        formats: ["cjs"],
        entry: "server/index.ts",
      },
      outDir: isProd ? "dist/server" : "dist/server-dev",
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
  entryServer: Vite.defineConfig({
    root: cwd,
    mode,
    logLevel: isProd ? "info" : "error",
    build: {
      ssr: true,
      sourcemap: true,
      minify: false,
      target: "es6",
      lib: {
        name: "entry-server",
        formats: ["cjs"],
        entry: "src/entry-server.tsx",
      },
      emptyOutDir: false,
      outDir: "dist/server",
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
  child = child_process.spawn("node", [devServerPath], {
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
    await Vite.build(configs.entryServer);
    fs.copySync(Cwd("dist/static"), "dist/server/static");
    require(Cwd("dist/prerender/prerender.js"));
    setTimeout(() => {
      fs.removeSync("dist/prerender");
    });
  }
}

start();

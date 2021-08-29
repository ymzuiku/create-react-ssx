const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const Vite = require("vite");
const path = require("path");
const fs = require("fs-extra");
const child_process = require("child_process");
const conf = yargs(hideBin(process.argv))
  .option("dev", {
    type: "boolean",
    description: "Watch on dev",
  })
  .parseSync();

const Cwd = (...args) => path.resolve(process.cwd(), ...args);

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;
const isDev = conf.dev || process.env.NODE_ENV === "dev";
const cwd = process.cwd();

const useConfig = (entry, outDir, isWatch) => {
  return Vite.defineConfig({
    configFile: false,
    root: cwd,
    logLevel: isTest ? "error" : "info",
    build: {
      ssr: true,
      sourcemap: true,
      minify: false,
      target: "es6",
      lib: {
        name: entry,
        formats: ["cjs"],
        entry,
      },
      outDir,
      watch: isWatch
        ? {
            clearScreen: false,
          }
        : void 0,
    },
  });
};

async function start() {
  await Vite.build(useConfig("scripts/prerender.ts", "dist/prerender"));
  await Vite.build(useConfig("src/entry-server.tsx", "dist/entry-server"));
  await Vite.build(useConfig(isDev ? "scripts/server-dev.ts" : "scripts/server.ts", "dist/server", isDev));
  if (isDev) {
    setTimeout(() => {
      const devPath = Cwd("dist/build/server-dev.js");
      if (!fs.existsSync(devPath)) {
        throw "未找到 server-dev.js";
      }
      // require(Cwd("dist/build/server-dev.js"));

      const ls = child_process.spawn("npx", ["node", devPath], {
        stdio: "inherit",
      });
    }, 500);
  }
}

start();

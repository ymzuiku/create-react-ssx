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

const useConfig = ({ entry, outDir, isWatch, configFile } = {}) => {
  return Vite.defineConfig({
    configFile,
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
  await Vite.build(useConfig({ entry: "scripts/prerender.ts", outDir: "dist/prerender" }));
  await Vite.build(useConfig({ entry: "src/entry-server.tsx", outDir: "dist/entry-server", configFile: false }));
  await Vite.build(
    useConfig({
      entry: isDev ? "scripts/server-dev.ts" : "scripts/server.ts",
      outDir: "dist/server-dev",
      isWatch: isDev,
      configFile: false,
    }),
  );
  if (isDev) {
    const devPath = Cwd("dist/server-dev/server-dev.js");
    if (!fs.existsSync(devPath)) {
      throw "未找到 server-dev.js";
    }
    // require(Cwd("dist/build/server-dev.js"));

    const ls = child_process.spawn("npx", ["node", devPath], {
      stdio: "inherit",
      env: process.env,
    });
  }
}

start();

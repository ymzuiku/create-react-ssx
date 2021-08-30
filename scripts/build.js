const Vite = require("vite");
const path = require("path");
const fs = require("fs-extra");
const configs = require("./vite.configs");

const child_process = require("child_process");
const Cwd = (...args) => path.resolve(process.cwd(), ...args);
const isProd = process.env.NODE_ENV === "production";
const isSSR = process.env.USE_SSR === "1" && fs.existsSync(Cwd("src/pages"));
let buildStatic = process.env.BUILD === "static";
let buildServer = process.env.BUILD === "server";
if (!buildServer && !buildStatic) {
  buildServer = true;
  buildStatic = true;
}
if (!buildStatic && isSSR) {
  buildStatic = true;
}
const devServerPath = Cwd("dist/server-dev/index.js");

const requireTs = async (entry = "") => {
  await Vite.build(configs.tmp(entry));
  return require(Cwd("dist/tmp", path.parse(Cwd(entry)).name));
};

function copyFiles(files = [""]) {
  files.forEach((file) => {
    const p = Cwd(file);
    if (fs.existsSync(p)) {
      fs.copyFileSync(p, Cwd("dist/server", file));
    }
  });
}

function copyPackage() {
  const pkg = require(Cwd("package.json"));
  delete pkg.devDependencies;
  delete pkg.scripts;
  delete pkg["lint-staged"];
  delete pkg["prettier"];
  fs.writeJSONSync(Cwd("dist/server/package.json"), pkg, { spaces: 2 });
}

let worker;
async function onBoundleEnd() {
  if (worker) {
    worker.kill(1);
    worker = null;
  }
  console.clear();
  worker = child_process.spawn("node", [devServerPath], {
    stdio: "inherit",
    env: process.env,
  });
}

async function build() {
  if (buildServer) {
    const watcher = await Vite.build(isProd ? configs.server : configs.serverDev);

    if (!isProd) {
      watcher.on("event", (event) => {
        if (event.code === "BUNDLE_END") {
          onBoundleEnd();
        }
      });
    }
  }

  if (isProd) {
    if (buildStatic) {
      await Vite.build(configs.static);
      await requireTs("scripts/prerender.ts");
    }

    if (buildServer) {
      if (isSSR) {
        await Vite.build(configs.entryServer);
        fs.copySync(Cwd("dist/static"), "dist/server/static");
        const loader = await requireTs("scripts/loader.ts");
        const ssrPages = loader.loadPages(Cwd("src/pages"));
        fs.writeJSONSync(Cwd("dist/server/ssr-pages.json"), ssrPages, { spaces: 2 });
      }

      copyPackage();
      copyFiles([".env", "pnpm-lock.yaml", "yarn.lock", "package-lock.json"]);
    }

    setTimeout(() => {
      fs.removeSync("dist/tmp");
    });
  }
}

build();

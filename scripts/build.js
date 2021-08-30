const Vite = require("vite");
const path = require("path");
const fs = require("fs-extra");
const configs = require("./viteConfigs");

const child_process = require("child_process");
const Cwd = (...args) => path.resolve(process.cwd(), ...args);
const isProd = process.env.NODE_ENV === "production";

function checkIsSSR() {
  const isHaveSrc = fs.existsSync(Cwd("src")) && fs.existsSync(Cwd("index.html"));
  // 是否使用SSR
  let isSSR = process.env.USE_SSR === "1" && fs.existsSync(Cwd("src/pages"));

  // 若工程为开发环境，且有 src 和 index.html 那么默认启动 SSR
  if (!isProd && isHaveSrc && process.env.USE_SSR === void 0) {
    isSSR = true;
  }
  // 若未有 src 和 index.html，不启用SSR
  if (!isHaveSrc) {
    isSSR = false;
  }
  return isSSR;
}

function checkBuildStatic() {
  let buildStatic = process.env.BUILD === "static";
  // 若使用SSR，必定需要编译静态资源
  if (checkIsSSR()) {
    buildStatic = true;
  }
  return buildStatic;
}

function checkBuildServer() {
  let buildServer = process.env.BUILD === "server";
  // 若均没有设置，默认启动服务端编译
  if (process.env.BUILD !== "server" && process.env.BUILD !== "static") {
    buildServer = true;
  }
  return buildServer;
}

const isSSR = checkIsSSR();
const buildStatic = checkBuildStatic();
const buildServer = checkBuildServer();

const define = {
  "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
  "process.env.USE_SSR": `"${isSSR ? process.env.USE_SSR : "0"}"`,
};

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
  // console.clear();
  worker = child_process.spawn("node", [devServerPath], {
    stdio: "inherit",
    env: process.env,
  });
}

async function build() {
  if (buildServer) {
    const watcher = await Vite.build(isProd ? configs.server(define) : configs.serverDev(define));

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
      await Vite.build(configs.static(define));
      await requireTs("scripts/prerender.ts");
    }

    if (buildServer) {
      if (isSSR) {
        await Vite.build(configs.entryServer());
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

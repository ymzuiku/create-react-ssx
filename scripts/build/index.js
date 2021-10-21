#!/usr/bin/env node

const Vite = require("vite");
const path = require("path");
const fs = require("fs-extra");
const configs = require("./viteConfigs");

const child_process = require("child_process");
const Cwd = (...args) => path.posix.resolve(process.cwd(), ...args);
const isProd = process.env.NODE_ENV === "production";

function checkIsSSR() {
  const isHaveSrc = fs.existsSync(Cwd("pages")) && fs.existsSync(Cwd("index.html"));
  if (!isHaveSrc) {
    return false;
  }
  return process.env.BUILD === "ssr";
}

const isSSR = checkIsSSR();
const isSSG = process.env.BUILD === "ssg";
const isBuildStatic = process.env.BUILD !== "server";
const isBuildServer = process.env.BUILD !== "static";
const define = {
  "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
  "process.env.BUILD": `"${process.env.BUILD}"`,
};

const devServerPath = Cwd("dist/server-dev/server.js");

const requireTs = async (entry = "") => {
  await Vite.build(configs.tmp(entry));
  return require(Cwd("dist/tmp", path.posix.parse(Cwd(entry)).name));
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
  if (isBuildServer) {
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
    if (isBuildStatic) {
      await Vite.build(configs.static(define));
      const { ssg } = await requireTs("scripts/build/prerender.ts");
      await ssg();
    }

    if (isBuildServer) {
      if (isSSR || isSSG) {
        fs.copySync(Cwd("dist/static"), "dist/server/static");
      }
      if (isSSR) {
        await Vite.build(configs.entryServer(define));
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

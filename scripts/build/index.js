#!/usr/bin/env node

const Vite = require("vite");
const path = require("path");
const fs = require("fs-extra");
const configs = require("./viteConfigs");

const child_process = require("child_process");
const Cwd = (...args) => path.resolve(process.cwd(), ...args);
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

function getBuildReleaseDir() {
  return process.env.BUILD_DIR || "dist/server";
}

function getBuildDevDir() {
  return process.env.BUILD_DIR || "dist/server-dev";
}

function getBuildDirIsProd() {
  return process.env.BUILD_DIR || (isProd ? "dist/server" : "dist/server-dev");
}

const devServerPath = Cwd(getBuildDevDir() + "/index.js");

function copyPackage() {
  const pkg = require(Cwd("package.json"));
  delete pkg.devDependencies;
  delete pkg.dependencies;
  delete pkg.scripts;
  delete pkg["lint-staged"];
  delete pkg["prettier"];

  fs.writeJSONSync(
    Cwd(getBuildDevDir() + "/package.json"),
    {
      ...pkg,
      bin: {
        [pkg.name]: "./index.js",
      },
      pkg: {
        assets: ["static/**/*", ".env"],
        outputPath: "./",
      },
    },
    { spaces: 2 },
  );
}

const requireTs = async (entry = "") => {
  await Vite.build(configs.tmp(entry));
  return require(Cwd("dist/tmp", path.parse(Cwd(entry)).name));
};

function copyFiles(files = [""]) {
  files.forEach((file) => {
    const p = Cwd(file);
    if (fs.existsSync(p)) {
      fs.copyFileSync(p, Cwd(getBuildReleaseDir(), file));
    }
  });
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

    if (isProd) {
      const list = fs.readdirSync(getBuildReleaseDir());
      list.forEach((file) => {
        if (file !== "index.js") {
          const p = path.resolve(getBuildReleaseDir(), file);
          fs.rmSync(p, { force: true, recursive: true });
        }
      });
    }

    if (process.env.COPY_DIR) {
      fs.copySync(Cwd(process.env.COPY_DIR), getBuildDirIsProd());
    }

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
        fs.copySync(Cwd("dist/static"), getBuildReleaseDir() + "/static");
      }
      if (isSSR) {
        await Vite.build(configs.entryServer(define));
      }

      copyFiles([".env"]);
      if (process.env.BUILD_PKG) {
        copyPackage();
      }
      require("@vercel/ncc")(Cwd(`./${getBuildReleaseDir()}/index.js`), {
        cache: false,
        filterAssetBase: process.cwd(), // default
        minify: true, // default
        sourceMap: false, // default
        assetBuilds: false, // default
        quiet: false, // default
        debugLog: false, // default
      }).then(({ code, map, assets }) => {
        fs.writeFileSync(Cwd(`./${getBuildReleaseDir()}/index.js`), code);
      });
    }

    setTimeout(() => {
      fs.removeSync("dist/tmp");
    });
  }
}

build();

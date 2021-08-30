const Vite = require("vite");
const path = require("path");
const fs = require("fs-extra");
const configs = require("./vite.configs");

const child_process = require("child_process");
const Cwd = (...args) => path.resolve(process.cwd(), ...args);
const isProd = process.env.NODE_ENV === "production";
const devServerPath = Cwd("dist/server-dev/index.js");

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
  const watcher = await Vite.build(isProd ? configs.server : configs.serverDev);

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

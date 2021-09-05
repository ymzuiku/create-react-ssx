#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const argv = process.argv.splice(2);
const Cwd = (...args) => path.resolve(process.cwd(), ...args);
let dir = argv[0];

function copyFolderSync(from, to) {
  fs.mkdirSync(to);
  fs.readdirSync(from).forEach((element) => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

if (!dir) {
  console.log("Please input project name, like this:");
  console.log("npx create-react-ssx my-project");
  process.exit(1);
}

if (dir === "--update") {
  dir = "updateby-create-react-ssx";
}

if (fs.existsSync(Cwd(dir))) {
  console.log("Error, the dir is exists:");
  console.log(Cwd(dir));
  process.exit(1);
}

console.log("Target Project:", Cwd(dir));
console.log("Creating...");
const worker = spawn("git", ["clone", "--depth=1", "https://github.com/ymzuiku/create-react-ssx", dir], {
  // stdio: "inherit",
  env: process.env,
});

worker.addListener("close", (code) => {
  if (code === 0) {
    fs.rmSync(Cwd(dir, ".git"), { recursive: true, force: true });
    fs.rmSync(Cwd(dir, "packages"), { recursive: true, force: true });
    fs.rmSync(Cwd(dir, "pnpm-lock.yaml"), { recursive: true, force: true });
    console.log(" ");
    console.log("Create Project Done! Please go on:");
    console.log(`cd ${dir} && npm install`);
    if (dir === "updateby-create-react-ssx") {
      const oldPkg = require(Cwd("package.json"));
      const newPkg = require(Cwd(dir, "package.json"));
      oldPkg.dependencies = {
        ...oldPkg.dependencies,
        ...newPkg.dependencies,
      };
      oldPkg.devDependencies = {
        ...oldPkg.devDependencies,
        ...newPkg.devDependencies,
      };
      fs.writeFileSync(Cwd("package.json"), JSON.stringify(oldPkg, null, 2));

      fs.renameSync("scripts", "scripts_" + Date.now());
      copyFolderSync(Cwd(dir, "scripts"), Cwd("scripts"));
      fs.rmSync(Cwd(dir), { recursive: true, force: true });
    }
  }
});

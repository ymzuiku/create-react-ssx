#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { spawn } = require("child_process")
const argv = process.argv.splice(2)
const Cwd = (...args)=>path.resolve(process.cwd(), ...args)
const dir = argv[0];

if (!dir) {
  console.log("Please input project name, like this:")
  console.log("npx create-react-ssx my-project");
  process.exit(1)
}

if (fs.existsSync(Cwd(dir))){
  console.log("Error, the dir is exists:");
  console.log(Cwd(dir))
  process.exit(1)
}

console.log("Target Project:", Cwd(dir));
console.log("Creating...")
const worker = spawn("git", ['clone', '--depth=1', 'https://github.com/ymzuiku/create-react-ssx', dir], {
  // stdio: "inherit",
  env: process.env,
})
worker.addListener('close', (code)=>{
  if (code === 0) {
    fs.rmSync(Cwd(dir, ".git"), {recursive: true, force: true})
    fs.rmSync(Cwd(dir, "packages"), {recursive: true, force: true})
    fs.rmSync(Cwd(dir, "pnpm-lock.yaml"), {recursive: true, force: true})
    console.log(" ")
    console.log("Create react SSX Done! Please go on:")
    console.log(`cd ${dir} && npm install`)
  }
})

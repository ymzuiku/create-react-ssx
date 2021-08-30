// Pre-render the app into static HTML.
// run `yarn generate` and then `dist/static` can be served as a static site.
import fs from "fs-extra";
import path from "path";
import { parseURL } from "./parser";
import { loadPages, Cwd } from "./loadPages";
import { render } from "../src/entry-server";
// const { render } = require(toAbsolute("node_modules/.ssr/entry-server.js"));

const distPath = "dist/static";
const template = fs.readFileSync(Cwd(distPath + "/index.html"), "utf-8");

async function ssg() {
  const routesToPrerender = loadPages(Cwd("src/pages"));
  routesToPrerender.forEach((v) => {
    const real = Cwd(distPath, v.replace("/", ""));
    fs.mkdirpSync(path.parse(real).dir);
  });

  for (const url of routesToPrerender) {
    const context = {};
    const appHtml = await render(parseURL(url), context);

    const html = template.replace(`<!--app-html-->`, appHtml);
    const filePath = `${distPath}${url}.html`;

    fs.writeFileSync(Cwd(filePath), html);
    console.log("pre-rendered:", filePath);
  }
}

ssg();

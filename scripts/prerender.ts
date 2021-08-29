// Pre-render the app into static HTML.
// run `yarn generate` and then `dist/static` can be served as a static site.
import fs from "fs-extra";
import path from "path";
import { parseURL } from "./parser";
import { render } from "../src/entry-server";
// const { render } = require(toAbsolute("node_modules/.ssr/entry-server.js"));
const toAbsolute = (p: string) => path.resolve(process.cwd(), p);
const distPath = "dist/static";
const template = fs.readFileSync(toAbsolute(distPath + "/index.html"), "utf-8");

// determine routes to pre-render from src/pages
let routesToPrerender = [];
function fixPagesRouter(dir: string) {
  fs.readdirSync(dir)
    .filter((v) => !/\.(css|json|md)/.test(v))
    .forEach((file) => {
      if (file[0] === "_") {
        return;
      }
      const subDir = path.resolve(dir, file);
      if (fs.statSync(subDir).isDirectory()) {
        fixPagesRouter(subDir);
        return;
      }
      let name = file.replace(/\.tsx$/, "").toLowerCase();
      name = "/" + name;
      routesToPrerender.push(dir + name);
    });
}
const basePath = toAbsolute("src/pages");
fixPagesRouter(basePath);
routesToPrerender = routesToPrerender.map((v) => v.replace(basePath, ""));
routesToPrerender.forEach((v) => {
  const real = path.resolve(process.cwd(), distPath, v.replace("/", ""));
  fs.mkdirpSync(path.parse(real).dir);
});

async function ssg() {
  // pre-render each route...
  for (const url of routesToPrerender) {
    const context = {};
    const appHtml = await render(parseURL(url), context);

    const html = template.replace(`<!--app-html-->`, appHtml);
    const filePath = `${distPath}${url}.html`;

    fs.writeFileSync(toAbsolute(filePath), html);
    console.log("pre-rendered:", filePath);
  }
}

ssg();

// Pre-render the app into static HTML.
// run `yarn generate` and then `dist/static` can be served as a static site.
import fs from "fs-extra";
import path from "path";
import { parseURL } from "./parsers";
import { loadPages, Cwd } from "./loaders";
import { render } from "../src/entry-server";
// const { render } = require(toAbsolute("node_modules/.ssr/entry-server.js"));

const distPath = "dist/static";
const template = fs.readFileSync(Cwd(distPath + "/index.html"), "utf-8");

const cacheRemove: Record<string, unknown> = {};
function removeGlob(key: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const glob = global as any;

  if (glob[key]) {
    cacheRemove[key] = glob[key];
    glob[key] = void 0;
  }
}

function applyGlob(key: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const glob = global as any;

  if (cacheRemove[key]) {
    glob[key] = cacheRemove[key];
  }
}

export async function ssg() {
  removeGlob("fetch");
  removeGlob("window");
  removeGlob("document");

  const routesToPrerender = loadPages(Cwd("src/pages"));
  routesToPrerender.forEach((v) => {
    const real = Cwd(distPath, v.replace("/", ""));
    fs.mkdirpSync(path.parse(real).dir);
  });

  fs.writeFileSync(Cwd(`${distPath}/__tmp__.html`), template);

  for (const url of routesToPrerender) {
    const context = {};
    const [appHtml] = await render(parseURL(url), context);
    const html = template.replace(`<!--app-html-->`, appHtml);
    const filePath = `${distPath}${url}.html`;
    fs.writeFileSync(Cwd(filePath), html);
    console.log("pre-rendered:", filePath);
  }

  applyGlob("fetch");
  applyGlob("window");
  applyGlob("document");
}

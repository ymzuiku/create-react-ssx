// Pre-render the app into static HTML.
import fs from "fs-extra";
import path from "path";
import { parseURL } from "./parsers";
import { Cwd, loadPages } from "./helpers";
import { render } from "./appServer";

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

  const routesToPrerender = loadPages(Cwd("pages"));
  routesToPrerender.forEach((v) => {
    const real = Cwd(distPath, v.replace("/", ""));
    fs.mkdirpSync(path.posix.parse(real).dir);
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

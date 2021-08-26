// Pre-render the app into static HTML.
// run `yarn generate` and then `dist/static` can be served as a static site.

const fs = require("fs-extra");
const path = require("path");

const toAbsolute = (p) => path.resolve(__dirname, p);

const template = fs.readFileSync(toAbsolute("dist/static/index.html"), "utf-8");
const { render } = require("./dist/server/entry-server.js");

// determine routes to pre-render from src/pages
let routesToPrerender = [];
function fixPagesRouter(dir) {
  fs.readdirSync(dir)
    .filter((v) => !/\.(css|json|md)/.test(v))
    .forEach((file, ...rest) => {
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
  const real = path.resolve(__dirname, "dist/static", v.replace("/", ""));
  fs.mkdirpSync(path.parse(real).dir);
});

async function ssg() {
  // pre-render each route...
  for (const url of routesToPrerender) {
    const context = {};
    const appHtml = await render(url, context);

    const html = template.replace(`<!--app-html-->`, appHtml);

    const filePath = `dist/static${url}.html`;

    fs.writeFileSync(toAbsolute(filePath), html);
    console.log("pre-rendered:", filePath);
  }
}

ssg();

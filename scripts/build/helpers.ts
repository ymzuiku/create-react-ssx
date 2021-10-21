/* eslint-disable @typescript-eslint/no-var-requires */
import path from "path";
import fs from "fs-extra";
import type { FastifyInstance } from "fastify";

const cwd = process.cwd();
export const Cwd = (...args: string[]) => path.resolve(cwd, ...args);
export const Dir = (...args: string[]) => path.resolve(__dirname, ...args);

export function loadPages(basePath: string) {
  let routesToPrerender: string[] = [];
  function fixPagesRouter(dir: string) {
    fs.readdirSync(dir)
      .filter((v) => !/\.(css|json|md|go)/.test(v))
      .forEach((file) => {
        const subDir = path.resolve(dir, file);
        if (fs.statSync(subDir).isDirectory()) {
          fixPagesRouter(subDir);
          return;
        }
        if (!/index\.tsx/.test(file)) {
          return;
        }
        let name = file.replace(/\.tsx$/, "").toLowerCase();
        name = "/" + name;
        routesToPrerender.push(path.join(dir, name));
      });
  }
  fixPagesRouter(basePath);
  routesToPrerender = routesToPrerender.map((v) => v.replace(basePath, ""));

  return routesToPrerender;
}

let routersCache: string[];
export function loadStaticRoutes() {
  if (routersCache !== void 0) {
    return routersCache;
  }
  const staticPath = Dir("static");
  if (!fs.existsSync(staticPath)) {
    routersCache = [];
    return [];
  }
  const fg = require("fast-glob");
  routersCache = fg
    .sync([Dir("static") + "/**/*.html"])
    .map((v = "") => v.replace(staticPath, "").replace("/index.html", "").replace(".html", ""))
    .filter(Boolean);
  return routersCache;
}

export function loadFastifyStatic(app: FastifyInstance, globHtml?: boolean) {
  const staticPath = Dir("static");
  if (fs.existsSync(staticPath)) {
    app.register(require("fastify-compress"), { global: false });
    app.register(require("fastify-static"), {
      root: staticPath,
      prefix: "/",
    });
    if (globHtml) {
      loadStaticRoutes().forEach((route) => {
        const indexPath = Dir("static", route.replace("/", "") + "/index.html");
        const namePath = Dir("static", route.replace("/", "") + ".html");
        const buff = fs.existsSync(indexPath) ? fs.readFileSync(indexPath) : fs.readFileSync(namePath);
        app.get(route, (req, reply) => {
          reply.type("text/html").send(buff);
        });
      });
    }
  }
}

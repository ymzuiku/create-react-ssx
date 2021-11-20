/* eslint-disable @typescript-eslint/no-var-requires */
import path from "path";
import fs from "fs-extra";
import type { FastifyInstance } from "fastify";

const cwd = process.cwd();
export const Cwd = (...args: string[]) => path.resolve(cwd, ...args);
export const Dir = (...args: string[]) => path.resolve("./", ...args);

export function loadPages(basePath: string) {
  let routesToPrerender: string[] = [];
  function fixPagesRouter(dir: string) {
    fs.readdirSync(dir)
      .filter((v) => !/\.(css|json|md|go)/.test(v))
      .forEach((file) => {
        const subDir = path.resolve(dir, file);
        if (fs.statSync(subDir).isDirectory()) {
          if (/\/_/.test(subDir)) {
            return;
          }
          fixPagesRouter(subDir);
          return;
        }
        if (!/index\.tsx/.test(file)) {
          return;
        }
        let name = file.replace(/\.tsx$/, "").toLowerCase();
        name = path.sep + name;
        const routePath = path.join(dir, name);
        if (/\/_/.test(routePath)) {
          return;
        }
        routesToPrerender.push(routePath);
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
    .sync([staticPath.replace(/\\/g, "/") + "/**/*.html"])
    .map((v = "") => v.replace(staticPath.replace(/\\/g, "/"), "").replace("/index.html", "").replace(".html", ""))
    .filter((v: string) => {
      if (!v) {
        return false;
      }
      if (/__tmp__/.test(v)) {
        return false;
      }
      return true;
    });

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
        const indexPath = Dir("static", route.replace(path.sep, "") + path.sep + "index.html");
        const buff = fs.readFileSync(indexPath);
        app.get(route.replace(/\\/g, "/"), (req, reply) => {
          reply.type("text/html").send(buff);
        });
      });
    }
  }
}

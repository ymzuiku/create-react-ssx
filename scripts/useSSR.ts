/* eslint-disable @typescript-eslint/no-var-requires */
import type { FastifyInstance } from "fastify";
import fs from "fs-extra";
import { parseURL } from "./parsers";
import { loadPages, loadStaticRoutes, loadFastifyStatic, Cwd, Dir } from "./loaders";
import "./proxyFetch";

export const useSSR = async (app: FastifyInstance) => {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    if (process.env.BUILD === "ssr") {
      loadFastifyStatic(app);
    } else if (process.env.BUILD === "ssg") {
      loadFastifyStatic(app, true);
    }
  }
  if (process.env.BUILD !== "ssr") {
    return;
  }
  const indexProd = isProd ? fs.readFileSync(Dir("static/index.html"), "utf-8") : "";
  let baseHTML: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let render: any;
  let routers: string[];
  await app.register(require("middie"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let vite: any;
  if (isProd) {
    routers = loadStaticRoutes();
    render = require(Dir("entry-server.js")).render;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vite = await (require as any)("vite").createServer({
      root: process.cwd(),
      logLevel: "error",
      server: {
        middlewareMode: "ssr",
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100,
        },
      },
    });

    routers = loadPages(Cwd("src/pages"));
    render = (await vite.ssrLoadModule("src/entry-server.tsx")).render;
    baseHTML = fs.readFileSync(Cwd("index.html"), "utf-8");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app as any).use(vite.middlewares);
  }
  routers.map(parseURL).forEach((url) => {
    app.get(url, async (req, reply) => {
      try {
        const url = req.url;

        let template: string;
        if (isProd) {
          template = indexProd;
        } else {
          template = await vite.transformIndexHtml(url, baseHTML);
        }
        const context: { url?: string } = {};

        const appHtml = await render(parseURL(url), context, {
          headers: req.headers,
          query: req.query,
          params: req.params,
          ips: req.ips,
          ip: req.ip,
          hostname: req.hostname,
          url: req.url,
          protocol: req.protocol,
          routerPath: req.routerPath,
        });

        if (isProd && context.url) {
          // Somewhere a `<Redirect>` was rendered
          return reply.redirect(301, context.url);
        }
        const html = template.replace(`<!--app-html-->`, appHtml);
        reply.status(200).headers({ "Content-Type": "text/html" }).send(html);
      } catch (e) {
        if (!isProd) {
          vite.ssrFixStacktrace(e);
        }
        console.log(e.stack);
        // res.status(500).end(e.stack);
        reply.status(500).send(e.stack);
      }
    });
  });
};

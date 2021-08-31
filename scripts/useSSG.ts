/* eslint-disable @typescript-eslint/no-var-requires */
import type { FastifyInstance } from "fastify";
import fs from "fs-extra";
import { parseURL } from "./parsers";
import { loadPages, loadFastifyStatic, Cwd } from "./loaders";
import "./proxyFetch";

export const useSSG = async (app: FastifyInstance) => {
  if (process.env.NODE_ENV === "production") {
    if (process.env.BUILD === "ssg") {
      loadFastifyStatic(app);
    }
    return;
  }
  await app.register(require("middie"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vite = await (require as any)("vite").createServer({
    root: process.cwd(),
    logLevel: "error",
    server: {
      middlewareMode: "ssr",
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
  });

  const routers = loadPages(Cwd("src/pages"));
  const render = (await vite.ssrLoadModule("src/entry-server.tsx")).render;
  const baseHTML = fs.readFileSync(Cwd("index.html"), "utf-8");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (app as any).use(vite.middlewares);
  routers.map(parseURL).forEach((url) => {
    app.get(url, async (req, reply) => {
      try {
        const url = req.url;

        const template = await vite.transformIndexHtml(url, baseHTML);
        const context: { url?: string } = {};

        const appHtml = await render(parseURL(url), context, {
          query: req.query,
          routerPath: req.routerPath,
        });
        const html = template.replace(`<!--app-html-->`, appHtml);
        reply.status(200).headers({ "Content-Type": "text/html" }).send(html);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        console.log(e.stack);
        reply.status(500).send(e.stack);
      }
    });
  });
};

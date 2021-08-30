/* eslint-disable @typescript-eslint/no-var-requires */
import type { FastifyInstance } from "fastify";
import fs from "fs-extra";
import { parseURL } from "./parser";
import { loadPages, Cwd, Dir } from "./loader";

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;
const isProd = process.env.NODE_ENV === "production";

export const useSSR = async (app: FastifyInstance) => {
  const indexProd = isProd ? fs.readFileSync(Dir("static/index.html"), "utf-8") : "";
  let baseHTML: string;
  await app.register(require("middie"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let vite: any;
  if (isProd) {
    app.register(require("fastify-compress"), { global: false });
    const staticPath = Dir("static");
    if (fs.existsSync(staticPath)) {
      app.register(require("fastify-static"), {
        root: staticPath,
        prefix: "/",
      });
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vite = await (require as any)("vite").createServer({
      root: process.cwd(),
      logLevel: isTest ? "error" : "info",
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
    baseHTML = fs.readFileSync(Cwd("index.html"), "utf-8");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app as any).use(vite.middlewares);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let render: any;
  if (isProd) {
    render = require(Dir("entry-server.js")).render;
  } else {
    render = (await vite.ssrLoadModule("src/entry-server.tsx")).render;
  }

  loadPages(Cwd("src/pages"))
    .map(parseURL)
    .forEach((url) => {
      app.get(url, async (req, res) => {
        try {
          const url = req.url;

          let template: string;
          if (isProd) {
            template = indexProd;
          } else {
            template = await vite.transformIndexHtml(url, baseHTML);
          }
          const context: { url?: string } = {};
          const appHtml = render(parseURL(url), context);

          if (context.url) {
            // Somewhere a `<Redirect>` was rendered
            return res.redirect(301, context.url);
          }
          const html = template.replace(`<!--app-html-->`, appHtml);
          res.status(200).headers({ "Content-Type": "text/html" }).send(html);
        } catch (e) {
          if (!isProd) {
            vite.ssrFixStacktrace(e);
          }
          console.log(e.stack);
          // res.status(500).end(e.stack);
          res.status(500).send(e.stack);
        }
      });
    });
};

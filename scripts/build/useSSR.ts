/* eslint-disable @typescript-eslint/no-var-requires */
import type { FastifyInstance } from "fastify";
import fs from "fs-extra";
import { parseURL } from "./parsers";
import { Cwd, Dir, loadFastifyStatic, loadPages, loadStaticRoutes } from "./helpers";
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
  let baseHTML: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let render: any;
  let routers: string[];
  const indexTemp = isProd ? fs.readFileSync(Dir(`static/__tmp__.html`), "utf-8") : "";
  await app.register(require("middie"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let vite: any;
  if (isProd) {
    routers = loadStaticRoutes();
    render = require(Dir("appServer.js")).render;
  } else {
    const reactJsx = require("vite-react-jsx").default;
    const reactRefresh = require("@vitejs/plugin-react-refresh").default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vite = await (require as any)("vite").createServer({
      root: process.cwd(),
      logLevel: "error",
      plugins: [reactRefresh(), reactJsx()],
      server: {
        middlewareMode: "ssr",
        watch: {},
      },
    });

    routers = loadPages(Cwd("pages"));
    render = (await vite.ssrLoadModule("scripts/build/appServer.tsx")).render;
    baseHTML = fs.readFileSync(Cwd("index.html"), "utf-8");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app as any).use(vite.middlewares);
  }

  routers.map(parseURL).forEach((url) => {
    if (/__tmp__/.test(url)) {
      return;
    }
    app.get(url, async (req, reply) => {
      try {
        const url = req.url;
        const parsededURL = parseURL(url);

        let template: string;
        if (isProd) {
          template = indexTemp;
        } else {
          template = await vite.transformIndexHtml(url, baseHTML);
        }
        const context: { url?: string } = {};

        const [appHtml, ssrProps] = await render(parsededURL, context, {
          query: req.query,
          routerPath: req.routerPath,
        });

        if (isProd && context.url) {
          return reply.redirect(301, context.url);
        }
        const html = template.replace(`<!--app-html-->`, appHtml).replace("<!--app-ssr-->", ssrProps);
        reply.status(200).headers({ "Content-Type": "text/html" }).send(html);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (!isProd) {
          vite.ssrFixStacktrace(e);
        }
        console.log(e.stack);
        reply.status(500).send(e.stack);
      }
    });
  });
};

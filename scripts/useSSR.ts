/* eslint-disable @typescript-eslint/no-var-requires */
import type { FastifyInstance } from "fastify";
import path from "path";
import fs from "fs";
import { parseURL } from "./parser";

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;
const Cwd = (...args: string[]) => path.resolve(process.cwd(), ...args);

export const useSSR = async (app: FastifyInstance) => {
  await app.register(require("middie"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vite = await (require as any)("vite").createServer({
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

  const render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;

  app.use(vite.middlewares);

  app.get("*", async (req, res) => {
    try {
      const url = req.url;

      let template: string;
      template = fs.readFileSync(Cwd("index.html"), "utf-8");
      template = await vite.transformIndexHtml(url, template);
      const context: { url?: string } = {};
      console.log(url);
      const appHtml = render(parseURL(url), context);

      if (context.url) {
        // Somewhere a `<Redirect>` was rendered
        return res.redirect(301, context.url);
      }
      const html = template.replace(`<!--app-html-->`, appHtml);
      res.status(200).headers({ "Content-Type": "text/html" }).send(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.log(e.stack);
      // res.status(500).end(e.stack);
      res.status(500).send(e.stack);
    }
  });
};

/* eslint-disable @typescript-eslint/no-var-requires */
import fs from "fs";
import path from "path";
import { fastify } from "fastify";
import { parseURL } from "./parser";
import Middle from "middie";

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;
const isProd = process.env.NODE_ENV !== "dev";
const PORT = process.env.PORT || 3000;

const Cwd = (...args: string[]) => path.resolve(process.cwd(), ...args);

async function createServer() {
  const app = fastify({});
  await app.register(Middle);

  /**
   * @type {import('vite').ViteDevServer}
   */
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

  app.get("*", async (req, res) => {
    try {
      const url = req.url;

      let template: string;
      const { render } = require(Cwd("dist/entry-server/entry-server.js"));
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

      // res.status(200).set({ "Content-Type": "text/html" }).end(html);
      res.status(200).headers({ "Content-Type": "text/html" }).send(html);
    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e);
      console.log(e.stack);
      // res.status(500).end(e.stack);
      res.status(500).send(e.stack);
    }
  });

  return { app, vite };
}

if (!isTest) {
  createServer().then(({ app }) => {
    const start = async () => {
      console.log(`http://localhost:${PORT}`);
      try {
        await app.listen(PORT);
      } catch (err) {
        app.log.error(err);
        process.exit(1);
      }
    };
    start();
  });
}

// for test use
exports.createServer = createServer;

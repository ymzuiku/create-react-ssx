import fs from "fs";
import path from "path";
import { fastify } from "fastify";
import { parseURL } from "./parser";
import Middle from "middie";
import Compress from "fastify-compress";
import Static from "fastify-static";

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;
const PORT = process.env.PORT || 3000;
const distPath = "dist/static";

const Cwd = (...args: string[]) => path.resolve(process.cwd(), ...args);
const isProd = process.env.NODE_ENV !== "dev";

async function createServer() {
  const app = fastify({});
  await app.register(Middle);

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  if (!isProd) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vite = (require as any)("vite").createServer({
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
    // use vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    app.register(Compress, { global: false });
    const staticPath = Cwd(distPath);
    // if (fs.existsSync(staticPath)) {
    // }
    app.register(Static, {
      root: staticPath,
      prefix: "/",
    });
  }

  const indexProd = isProd ? fs.readFileSync(Cwd(distPath + "/index.html"), "utf-8") : "";
  app.get("*", async (req, res) => {
    try {
      const url = req.url;

      let template: string;
      const { render } = await import("../src/entry-server");
      if (!isProd) {
        // always read fresh template in dev
        template = fs.readFileSync(Cwd("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        // render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
      } else {
        template = indexProd;
      }

      const context: { url?: string } = {};
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

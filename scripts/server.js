const fs = require("fs");
const path = require("path");
const fastify = require("fastify").default;
const cwd = process.cwd();
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;
const PORT = process.env.PORT || 3000;
const { parseUrl } = require("./parseUrl");
const distPath = "dist/static";

async function createServer(root = process.cwd(), isProd = process.env.NODE_ENV === "production") {
  const resolve = (...args) => path.resolve(cwd, ...args);

  const indexProd = isProd ? fs.readFileSync(resolve(distPath + "/index.html"), "utf-8") : "";

  const app = fastify({});
  await app.register(require("middie"));

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  if (!isProd) {
    vite = await require("vite").createServer({
      root,
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
    app.register(require("fastify-compress"), { global: false });
    const staticPath = resolve(distPath);
    if (fs.existsSync(staticPath)) {
      app.register(require("fastify-static"), {
        root: resolve(distPath),
        prefix: "/",
      });
    }
  }

  app.get("*", async (req, res) => {
    try {
      const url = req.url;

      let template, render;
      if (!isProd) {
        // always read fresh template in dev
        template = fs.readFileSync(resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
      } else {
        template = indexProd;
        render = require(resolve("node_modules/.ssr/entry-server.js")).render;
      }

      const context = {};
      const appHtml = render(parseUrl(url), context);

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

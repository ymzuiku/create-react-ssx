const fs = require("fs");
const path = require("path");
const express = require("express");
const cwd = process.cwd();
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;
const PORT = process.env.PORT || 3000;

function fixUrl(name) {
  if (name === "/index") {
    return "/";
  }
  const list = name.split("/");
  if (list[list.length - 1] === "index") {
    list.pop();
  }
  return list.join("/").toLocaleLowerCase();
}

async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production"
) {
  const resolve = (...args) => path.resolve(cwd, ...args);

  const indexProd = isProd
    ? fs.readFileSync(resolve("dist/index.html"), "utf-8")
    : "";

  const app = express();

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
    app.use(require("compression")());
    app.use(require("serve-static")(resolve("dist"), { index: false }));
  }

  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl;

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
      const appHtml = render(fixUrl(url), context);

      if (context.url) {
        // Somewhere a `<Redirect>` was rendered
        return res.redirect(301, context.url);
      }

      const html = template.replace(`<!--app-html-->`, appHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e);
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  return { app, vite };
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    })
  );
}

// for test use
exports.createServer = createServer;

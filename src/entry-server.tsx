import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import type { StaticRouterContext } from "react-router";
import { App } from "./App";
import { parsePages } from "../scripts/parsers";
const pages = import.meta.globEager("./pages/**/*.tsx");
const isProd = process.env.NODE_ENV === "production";

const routeMap: Record<
  string,
  {
    path: string;
    routerPath: string;
    Component: React.FC;
    getServerSideProps?: (query: Record<string, unknown>, routerPath: string) => Promise<Record<string, unknown>>;
  }
> = {};

const routes = parsePages(pages).map(({ path, key, routerPath }) => {
  routeMap[path] = {
    path,
    routerPath,
    Component: pages[key].default,
    getServerSideProps: pages[key].getServerSideProps,
  };
  return routeMap[path];
});

const serverSideProps: Record<string, unknown> = {};

export async function render(
  url: string,
  context: StaticRouterContext,
  req?: { routerPath: string; query: Record<string, unknown> },
) {
  if (isProd && req) {
    const route = routeMap[req.routerPath];
    if (route && route.getServerSideProps) {
      serverSideProps[req.routerPath] = await Promise.resolve(route.getServerSideProps(req.query, req.routerPath));
    }
  }

  const appHtml = ReactDOMServer.renderToString(
    <StaticRouter location={url} context={context}>
      <App routes={routes} ssr serverSideProps={serverSideProps} />
    </StaticRouter>,
  );

  const serverSideStr = `<script>
    window.serverSideProps = ${JSON.stringify(serverSideProps)}
  </script>`;

  return [appHtml, serverSideStr];
}

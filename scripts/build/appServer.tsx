import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import type { StaticRouterContext } from "react-router";
import { App } from "../App";
import { parsePages } from "./parsers";
import { getComponent } from "./getComponent";

// const pages = import.meta.globEager("../pages/**/[[:word:]]+.tsx");
const pages = import.meta.globEager("../../pages/**/index.tsx");

const serverRouteMap: Record<
  string,
  {
    path: string;
    routerPath: string;
    Component: React.FC;
    getServerSideProps?: (query: Record<string, unknown>, routerPath: string) => Promise<Record<string, unknown>>;
  }
> = {};

const routes = parsePages(pages).map(({ path, key, routerPath }) => {
  serverRouteMap[path] = {
    path,
    routerPath,
    Component: getComponent(pages[key]),
    getServerSideProps: pages[key].getServerSideProps,
  };
  return serverRouteMap[path];
});

const serverSideProps: Record<string, unknown> = {};

export async function render(
  url: string,
  context: StaticRouterContext,
  req?: { routerPath: string; query: Record<string, unknown> },
) {
  if (req) {
    const route = serverRouteMap[req.routerPath];
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

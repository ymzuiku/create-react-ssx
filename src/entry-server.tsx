import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import type { StaticRouterContext } from "react-router";
import { App } from "./App";
import { parsePages } from "../scripts/parser";

const pages = import.meta.globEager("./pages/**/*.tsx");

const routes = parsePages(pages).map(({ path, key }) => {
  return {
    path,
    Component: pages[key].default,
  };
});

export function render(url: string, context: StaticRouterContext) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url} context={context}>
      <App routes={routes} ssr />
    </StaticRouter>,
  );
}

import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import type { StaticRouterContext } from "react-router";
import { App } from "./App";
import { parsePages } from "../scripts/parsers";
const pages = import.meta.globEager("./pages/**/*.tsx");

const routeMap: Record<
  string,
  {
    path: string;
    Component: React.FC;
    getServerSideProps?: (query: Record<string, unknown>) => Promise<Record<string, unknown>>;
  }
> = {};

const routes = parsePages(pages).map(({ path, key }) => {
  routeMap[path] = {
    path,
    Component: pages[key].default,
  };
  return routeMap[path];
});

export async function render(url: string, context: StaticRouterContext) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url} context={context}>
      <App routes={routes} ssr />
    </StaticRouter>,
  );
}

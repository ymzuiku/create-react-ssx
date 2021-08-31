import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import type { StaticRouterContext } from "react-router";
import { App } from "./App";
import { parsePages } from "../scripts/parsers";
import type { GetServerSideRequire } from "../scripts/serverSideProps";
const pages = import.meta.globEager("./pages/**/*.tsx");

const routeMap: Record<
  string,
  {
    path: string;
    routerPath: string;
    Component: React.FC;
    getServerSideProps?: (req: GetServerSideRequire) => Promise<Record<string, unknown>>;
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

export async function render(url: string, context: StaticRouterContext, req?: GetServerSideRequire) {
  if (req) {
    const route = routeMap[req.routerPath];
    if (route && route.getServerSideProps) {
      serverSideProps[req.routerPath] = await Promise.resolve(route.getServerSideProps(req));
    }
  }

  return ReactDOMServer.renderToString(
    <>
      {req && (
        <div id="ssr-props" style={{ display: "none" }}>
          {JSON.stringify(serverSideProps)}
        </div>
      )}
      <StaticRouter location={url} context={context}>
        <App routes={routes} ssr serverSideProps={serverSideProps} />
      </StaticRouter>
    </>,
  );
}

import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import type { StaticRouterContext } from "react-router";
import { App } from "./App";

const pages = import.meta.globEager("./pages/**/*.tsx");

function fixUrl(name: string): string {
  name = name.match(/\.\/pages\/(.*)\.tsx$/)![1];
  const list = name.split("/");
  if (list.length && list[list.length - 1] === "index") {
    list.pop();
  }
  return "/" + list.join("/").toLocaleLowerCase();
}

const routes = Object.keys(pages).map((path) => {
  return {
    path: fixUrl(path),
    Component: pages[path].default,
  };
});

export function render(url: string, context: StaticRouterContext) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url} context={context}>
      <App routes={routes} ssr />
    </StaticRouter>
  );
}

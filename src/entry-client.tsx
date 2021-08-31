import "./assets/tailwind.css";
import { hydrate } from "react-dom";
import { lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { parsePages, parseSearch } from "../scripts/parsers";

const pages = import.meta.glob("./pages/**/*.tsx");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serverSideProps: any = {};
const ssrEle = document.getElementById("ssr-props");
if (ssrEle) {
  serverSideProps = JSON.parse(ssrEle.innerText);
}

const lazyFn = {} as Record<string, (props: unknown) => Promise<unknown>>;

const fisrtInRoutes = {} as Record<string, boolean>;

const routes = parsePages(pages).map(({ path, key, routerPath }) => {
  lazyFn[path] = pages[key];
  return {
    path,
    routerPath,
    Component: lazy(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { default: Component, getServerSideProps } = await (pages[key] as any)();
      const ssrProps = serverSideProps[window.location.pathname];
      if (!fisrtInRoutes[path] && ssrProps) {
        fisrtInRoutes[path] = true;
        return {
          default: () => Component({ ...ssrProps, bySSR: true }),
        };
      }
      if (getServerSideProps) {
        const nowProps = await getServerSideProps(parseSearch(window.location.search), window.location.pathname);
        return {
          default: (props: Record<string, unknown>) => Component({ ...props, ...nowProps }),
        };
      }
      return {
        default: Component,
      };
    }),
  };
});

function render() {
  // return;
  hydrate(
    <BrowserRouter>
      <App routes={routes} serverSideProps={serverSideProps} />
    </BrowserRouter>,
    document.getElementById("app"),
  );
}

if (lazyFn[window.location.pathname]) {
  Promise.resolve(lazyFn[window.location.pathname]({})).then(render);
} else {
  render();
}

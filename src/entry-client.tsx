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

const routeMap: Record<
  string,
  {
    path: string;
    routerPath: string;
    lazyFn: () => Promise<{ default: React.FC }>;
    Component: React.FC;
    getServerSideProps?: (query: Record<string, unknown>, routerPath: string) => Promise<Record<string, unknown>>;
  }
> = {};

const routes = parsePages(pages).map(({ path, key, routerPath }) => {
  const lazyFn = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { default: Component, getServerSideProps } = await (pages[key] as any)();
    // const ssrProps = serverSideProps[window.location.pathname];
    // if (ssrProps) {
    //   return {
    //     default: () => Component({ ...ssrProps, bySSR: true }),
    //   };
    // }
    if (getServerSideProps) {
      const nowProps = await getServerSideProps(parseSearch(window.location.search), window.location.pathname);
      return {
        default: (props: Record<string, unknown>) => Component({ ...props, ...nowProps }),
      };
    }
    return {
      default: Component,
    };
  };
  routeMap[path] = {
    path,
    routerPath,
    lazyFn,
    Component: lazy(lazyFn),
  };
  return routeMap[path];
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

if (routeMap[window.location.pathname]) {
  Promise.resolve(routeMap[window.location.pathname].lazyFn()).then(render);
} else {
  render();
}

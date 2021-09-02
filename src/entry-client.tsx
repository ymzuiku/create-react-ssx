import { hydrate } from "react-dom";
import React, { lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { parsePages, parseSearch } from "../scripts/parsers";

const pages = import.meta.glob("./pages/**/*.tsx");
const basePath = window.location.pathname;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serverSideProps: any = (window as any).serverSideProps || {};

const HOCSuspense = (path: string, Component: React.FC): React.FC => {
  if (path === basePath) {
    return Component;
  }
  return ((props: never) =>
    Suspense({ children: Component(props), fallback: <div style={{ all: "unset" }}></div> })) as React.FC;
};

const routerMap = {} as Record<
  string,
  {
    path: string;
    loader: () => Promise<{ default: React.FC }>;
    routerPath: string;
    Component: React.FC;
    getServerSideProps?: (query: Record<string, unknown>, routerPath: string) => Promise<Record<string, unknown>>;
  }
>;
const routes = parsePages(pages).map(({ path, key, routerPath }) => {
  routerMap[path] = {
    path,
    loader: pages[key] as never,
    routerPath,
    Component: lazy((async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { default: Component, getServerSideProps } = await (pages[key] as any)();
      const ssrProps = serverSideProps[window.location.pathname];
      if (ssrProps) {
        return {
          default: (props: Record<string, unknown>) => HOCSuspense(path, Component({ ...props, ...ssrProps })),
        };
      }
      if (getServerSideProps) {
        const nowProps = await getServerSideProps(parseSearch(window.location.search), window.location.pathname);
        return {
          default: (props: Record<string, unknown>) => HOCSuspense(path, Component({ ...props, ...nowProps })),
        };
      }
      return {
        default: HOCSuspense(path, Component),
      };
    }) as never) as React.FC,
  };
  return routerMap[path];
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

if (routerMap[basePath]) {
  const route = routerMap[basePath];
  route.loader().then((page) => {
    route.Component = page.default;
    render();
  });
} else {
  render();
}

import { hydrate, render } from "react-dom";
import React, { lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app";
import { parsePages, parseSearch } from "./parsers";

const isProd = process.env.NODE_ENV === "production";
const pages = import.meta.glob("../pages/**/*.tsx");
const basePath = window.location.pathname;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serverSideProps: any = (window as any).serverSideProps || {};

const HOCSuspense = (path: string, Component: React.FC): React.FC => {
  if (path === basePath) {
    return Component;
  }
  return function LazyRoute(props: Record<string, unknown>) {
    return (
      <Suspense fallback={<div style={{ all: "unset" }}></div>}>
        <Component {...props}></Component>
      </Suspense>
    );
  };
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = pages[key] as any;
  routerMap[path] = {
    path,
    loader: page,
    routerPath,
    Component: HOCSuspense(
      path,
      lazy((async () => {
        const { default: Component, getServerSideProps } = await page();
        const ssrProps = serverSideProps[window.location.pathname];
        if (ssrProps) {
          return {
            default: (props: Record<string, unknown>) => Component({ ...props, ...ssrProps }),
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
      }) as never) as React.FC,
    ),
  };
  return routerMap[path];
});

function inject() {
  const theRender = isProd ? hydrate : render;
  theRender(
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
    inject();
  });
} else {
  inject();
}

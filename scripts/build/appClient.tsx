import { hydrate, render } from "react-dom";
import React, { lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { App } from "../App";
import { parsePages, parseSearch } from "./parsers";
import { routeMap } from "../preload";
import { getComponent } from "./getComponent";

const isProd = process.env.NODE_ENV === "production";
const pages = import.meta.glob("../../pages/**/index.tsx");

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

const routes = parsePages(pages).map(({ path, key, routerPath }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = pages[key] as any;
  routeMap[path] = {
    path,
    load: page,
    routerPath,
    Component: HOCSuspense(
      path,
      lazy((async () => {
        const _page = await page();
        const Component = getComponent(_page);
        const getServerSideProps = _page.getServerSideProps;
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
  return routeMap[path];
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

if (routeMap[basePath]) {
  const route = routeMap[basePath];
  route.load().then((page) => {
    route.Component = getComponent(page);
    inject();
  });
} else {
  inject();
}

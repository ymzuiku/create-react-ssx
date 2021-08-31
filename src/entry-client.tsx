import "./assets/tailwind.css";
import { hydrate } from "react-dom";
import { lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { parsePages, parseSearch } from "../scripts/parsers";

const pages = import.meta.glob("./pages/**/*.tsx");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serverSidePropsString = (window as any).serverSideProps;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serverSideProps: any = serverSidePropsString ? JSON.parse(serverSidePropsString) : {};

const lazyFn = {} as Record<string, (props: unknown) => Promise<unknown>>;

const routes = parsePages(pages).map(({ path, key, routerPath }) => {
  lazyFn[path] = pages[key];
  return {
    path,
    routerPath,
    Component: lazy(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { default: Component, getServerSideProps } = await (pages[key] as any)();
      const ssrProps = serverSideProps[window.location.pathname];
      if (ssrProps) {
        return {
          default: () => Component(ssrProps),
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

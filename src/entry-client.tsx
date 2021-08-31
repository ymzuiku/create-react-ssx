import "./assets/tailwind.css";
import { hydrate } from "react-dom";
import { lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { parsePages } from "../scripts/parsers";

const pages = import.meta.glob("./pages/**/*.tsx");

let serverSideProps = {} as Record<string, unknown>;
const ssrEle = document.getElementById("ssr-props");
if (ssrEle) {
  serverSideProps = JSON.parse(ssrEle.innerText);
}

const routes = parsePages(pages).map(({ path, key, routerPath }) => {
  return {
    path,
    routerPath,
    Component: lazy(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { default: Component, getServerSideProps } = await (pages[key] as any)();
      if (serverSideProps[window.location.pathname]) {
        return {
          default: () => Component(serverSideProps[window.location.pathname]),
        };
      }
      if (getServerSideProps) {
        const ssrProps = await getServerSideProps(window.location.search, window.location.pathname);
        return {
          default: () => Component(ssrProps),
        };
      }
      return {
        default: Component,
      };
    }),
  };
});

hydrate(
  <BrowserRouter>
    <App routes={routes} serverSideProps={serverSideProps} />
  </BrowserRouter>,
  document.getElementById("app"),
);

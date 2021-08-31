import "./assets/tailwind.css";
import { hydrate } from "react-dom";
import { lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { parsePages } from "../scripts/parsers";

const pages = import.meta.glob("./pages/**/*.tsx");

const routes = parsePages(pages).map(({ path, key, routerPath }) => {
  return {
    path,
    routerPath,
    Component: lazy(pages[key] as never),
  };
});

let serverSideProps = {} as Record<string, unknown>;
const ssrEle = document.getElementById("ssr-props");
if (ssrEle) {
  serverSideProps = JSON.parse(ssrEle.innerText);
}

hydrate(
  <BrowserRouter>
    <App routes={routes} serverSideProps={serverSideProps} />
  </BrowserRouter>,
  document.getElementById("app"),
);

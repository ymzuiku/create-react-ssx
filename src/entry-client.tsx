import "./assets/tailwind.css";
import { hydrate } from "react-dom";
import { lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { parsePages } from "../scripts/parsePages";

const pages = import.meta.glob("./pages/**/*.tsx");

const routes = parsePages(pages).map(({ path, key }) => {
  return {
    path,
    Component: lazy(pages[key] as never),
  };
});

hydrate(
  <BrowserRouter>
    <App routes={routes} />
  </BrowserRouter>,
  document.getElementById("app")
);

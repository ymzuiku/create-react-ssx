import "./assets/tailwind-jit.css";
import { hydrate } from "react-dom";
import { lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

const pages = import.meta.glob("./pages/**/*.tsx");

function fixUrl(name: string): string {
  name = name.match(/\.\/pages\/(.*)\.tsx$/)![1];
  const list = name.split("/");
  if (list.length && list[list.length - 1] === "index") {
    list.pop();
  }
  return "/" + list.join("/").toLocaleLowerCase();
}

const routes = Object.keys(pages).map((name) => {
  return {
    path: fixUrl(name),
    Component: lazy(pages[name] as never),
  };
});

hydrate(
  <BrowserRouter>
    <App routes={routes} />
  </BrowserRouter>,
  document.getElementById("app")
);

import "./assets/tailwind.css";
import { hydrate } from "react-dom";
import React, { lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { parsePages } from "../scripts/parsers";

const pages = import.meta.glob("./pages/**/*.tsx");

const lazyFnMap = {} as Record<string, () => Promise<{ default: React.FC }>>;

const routes = parsePages(pages).map(({ path, key }) => {
  const lazyFn = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Component = (await Promise.resolve((pages[key] as any)())).default;
    return { default: Component };
  };
  lazyFnMap[path] = lazyFn;
  return {
    path,
    Component: lazy(lazyFn),
  };
});

function render() {
  hydrate(
    <BrowserRouter>
      <App routes={routes} />
    </BrowserRouter>,
    document.getElementById("app"),
  );
}

if (lazyFnMap[window.location.pathname]) {
  Promise.resolve(lazyFnMap[window.location.pathname]()).then(render);
} else {
  render();
}

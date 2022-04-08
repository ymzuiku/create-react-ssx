import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import { Root } from "../pages/root";
import { routerHooks } from "./routerHelper";
import { cacheUseHistory } from "./ssxHistory";
import "./tailwind.css";

export interface AppProps {
  ssr?: boolean;
  serverSideProps: Record<string, unknown>;
  routes: {
    path: string;
    routerPath: string;
    Component: React.FC;
  }[];
}

function BeforeComponent({ Component, path, ...rest }: { Component: React.FC; path: string }): JSX.Element {
  if (typeof window !== "undefined") {
    const str = routerHooks.before(path);
    if (str) {
      return <Redirect to={str} />;
    }
  }
  return <Component {...rest} />;
}

export function App({ routes, serverSideProps }: AppProps) {
  const h = useHistory();
  Object.assign(cacheUseHistory, h);

  return (
    <>
      <Root />
      <Switch>
        {routes.map(({ path, Component, routerPath }) => {
          const ssrProps = (serverSideProps[routerPath] || {}) as Record<string, unknown>;
          return (
            <Route exact key={path} path={[path, path + ".html"]}>
              <BeforeComponent Component={Component} path={path} {...ssrProps} />
            </Route>
          );
        })}
      </Switch>
    </>
  );
}

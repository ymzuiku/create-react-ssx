import "./assets/tailwind.css";
import { Route, Switch } from "react-router-dom";

export interface AppProps {
  ssr?: boolean;
  serverSideProps: Record<string, unknown>;
  routes: {
    path: string;
    routerPath: string;
    Component: React.FC;
  }[];
}

export function App({ routes, serverSideProps }: AppProps) {
  return (
    <Switch>
      {routes.map(({ path, Component, routerPath }) => {
        const ssrProps = (serverSideProps[routerPath] || {}) as Record<string, unknown>;
        return (
          <Route exact key={path} path={[path, path + ".html"]}>
            <Component {...ssrProps} />
          </Route>
        );
      })}
    </Switch>
  );
}

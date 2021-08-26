import { Suspense, ReactNode } from "react";
import { Route, Switch } from "react-router-dom";

interface CSRSuspenseProps {
  ssr?: boolean;
  fallback: NonNullable<ReactNode> | null;
  children: ReactNode;
}

const CSRSuspense = ({ ssr, children, fallback }: CSRSuspenseProps) => {
  if (ssr) {
    return <>{children}</>;
  }
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

export interface AppProps {
  ssr?: boolean;
  routes: {
    path: string;
    Component: React.FC;
  }[];
}

export function App({ ssr, routes }: AppProps) {
  return (
    <CSRSuspense ssr={ssr} fallback={<div style={{ all: "unset" }}></div>}>
      <Switch>
        {routes.map(({ path, Component }) => {
          return (
            <Route exact key={path} path={path}>
              <Component />
            </Route>
          );
        })}
      </Switch>
    </CSRSuspense>
  );
}

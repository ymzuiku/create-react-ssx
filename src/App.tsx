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
  serverSideProps: Record<string, unknown>;
  routes: {
    path: string;
    routerPath: string;
    Component: React.FC;
    getServerSideProps?: (query: Record<string, unknown>, routerPath: string) => Promise<Record<string, unknown>>;
  }[];
}

export function App({ ssr, routes, serverSideProps }: AppProps) {
  return (
    <CSRSuspense ssr={ssr} fallback={<div style={{ all: "unset" }}></div>}>
      <Switch>
        {routes.map(({ path, Component, routerPath }) => {
          const ssrProps = serverSideProps[routerPath] as Record<string, unknown>;
          return (
            <Route exact key={path} path={[path, path + ".html"]}>
              <Component {...(ssrProps || {})} />
            </Route>
          );
        })}
      </Switch>
    </CSRSuspense>
  );
}

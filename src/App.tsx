import { Route, Switch } from "react-router-dom";

// Auto generates routes from files under ./pages
// https://vitejs.dev/guide/features.html#glob-import
const pages = import.meta.globEager("./pages/**/*.tsx");

const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages\/(.*)\.tsx$/)![1];
  return {
    name,
    path: name === "index" ? "/" : `/${name.toLowerCase()}`,
    Component: pages[path].default,
  };
});

export function App() {
  return (
    <>
      <Switch>
        {routes.map(({ path, Component }) => {
          return (
            <Route exact={path === "/"} key={path} path={path}>
              <Component />
            </Route>
          );
        })}
      </Switch>
    </>
  );
}

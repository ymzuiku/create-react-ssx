import { Route, Switch } from "react-router-dom";

// Auto generates routes from files under ./pages
// https://vitejs.dev/guide/features.html#glob-import
const pages = import.meta.globEager("./pages/**/*.tsx");

function fixUrl(name: string): string {
  const list = name.split("/");
  if (list[list.length - 1] === "index") {
    list.pop();
  }
  return "/" + list.join("/").toLocaleLowerCase();
}

const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages\/(.*)\.tsx$/)![1];
  return {
    // name,
    // path: name === "index" ? "/" : `/${name.toLowerCase()}`,
    path: fixUrl(name),
    Component: pages[path].default,
  };
});

export const urls = routes.map((v) => v.path);

export function App() {
  return (
    <>
      <Switch>
        {routes.map(({ path, Component }) => {
          return (
            <Route exact key={path} path={path}>
              <Component />
            </Route>
          );
        })}
      </Switch>
    </>
  );
}

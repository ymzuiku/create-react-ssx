export function parseURL(name: string) {
  if (name === "/index" || name === "/") {
    return "/";
  }
  if (/\.tsx/.test(name)) {
    name = name.match(/\.\/pages\/(.*)\.tsx$/)![1];
  }
  const list = name.split("/");
  if (list.length && list[list.length - 1] === "index") {
    list.pop();
  }
  return list.join("/").toLocaleLowerCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parsePages(data: any) {
  return Object.keys(data)
    .filter((v) => {
      if (!/\.tsx$/.test(v)) {
        return false;
      }
      if (/(\.test|_test|\.spec|_spce)/.test(v)) {
        return false;
      }
      if (v.split("/").find((v) => v[0] === "_")) {
        return false;
      }
      return true;
    })
    .map((v) => {
      const path = "/" + parseURL(v);
      return {
        path,
        routerPath: path.split("?")[0],
        key: v,
      };
    });
}

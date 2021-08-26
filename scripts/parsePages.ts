function fixPath(name: string) {
  name = name.match(/\.\/pages\/(.*)\.tsx$/)![1];
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
      if (v.split("/").find((v) => v[0] === "_")) {
        return false;
      }
      return true;
    })
    .map((v) => {
      return {
        path: "/" + fixPath(v),
        key: v,
      };
    });
}

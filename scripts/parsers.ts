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
  const url = list.join("/").toLocaleLowerCase();
  return url.split("?")[0];
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

function decode(input: string) {
  try {
    return decodeURIComponent(input.replace(/\+/g, " "));
  } catch (e) {
    return null;
  }
}

export function parseSearch(search?: string, withoutNumber?: boolean) {
  if (!search) {
    return {};
  }

  const parser = /([^=?&]+)=?([^&]*)/g;
  const result: Record<string, unknown> = {};
  let part;

  while ((part = parser.exec(search))) {
    const key = decode(part[1]);
    const value = decode(part[2]);

    if (key === null || value === null || key in result) {
      continue;
    }
    if (!withoutNumber && typeof value === "string") {
      const num = Number(value);
      const numberValue = isNaN(num) ? value : num;

      result[key] = value == numberValue.toString() ? numberValue : value;
    } else {
      result[key] = value;
    }
  }

  return result;
}

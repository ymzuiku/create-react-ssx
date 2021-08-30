import path from "path";
import fs from "fs-extra";

export function loadPages(basePath: string) {
  let routesToPrerender: string[] = [];
  function fixPagesRouter(dir: string) {
    fs.readdirSync(dir)
      .filter((v) => !/\.(css|json|md)/.test(v))
      .forEach((file) => {
        if (file[0] === "_") {
          return;
        }
        const subDir = path.resolve(dir, file);
        if (fs.statSync(subDir).isDirectory()) {
          fixPagesRouter(subDir);
          return;
        }
        let name = file.replace(/\.tsx$/, "").toLowerCase();
        name = "/" + name;
        routesToPrerender.push(path.join(dir, name));
      });
  }
  fixPagesRouter(basePath);
  routesToPrerender = routesToPrerender.map((v) => v.replace(basePath, ""));

  return routesToPrerender;
}

const cwd = process.cwd();
export const Cwd = (...args: string[]) => path.resolve(cwd, ...args);
export const Dir = (...args: string[]) => path.resolve(__dirname, ...args);

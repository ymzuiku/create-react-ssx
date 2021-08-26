function parseUrl(name) {
  if (name === "/index") {
    return "/";
  }
  const list = name.split("/");
  if (list[list.length - 1] === "index") {
    list.pop();
  }
  return list.join("/").toLocaleLowerCase();
}

module.exports = { parseUrl };

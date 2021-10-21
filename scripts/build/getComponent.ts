const upRegex = /[A-Z]/;

// eslint-disable-next-line
export function getComponent(object: { [key: string]: any }): any {
  if (object.default) {
    return object.default;
  }
  const keys = Object.keys(object);
  // eslint-disable-next-line
  let out: any;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (upRegex.test(key[0]) && typeof object[key] === "function") {
      out = object[key];
      break;
    }
  }
  if (!out) {
    throw new Error("[create-react-ssx] Find page component error, first label need upperCase: " + keys.join(","));
  }

  return out;
}

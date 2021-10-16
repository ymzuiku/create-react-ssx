import fetch, { RequestInit } from "node-fetch";

export const proxyFetch = (url: string, opt: RequestInit) => {
  if (url[0] === "/") {
    if (process.env.PROXY_FETCH) {
      url = process.env.PROXY_FETCH + url;
    } else {
      url = "http://127.0.0.1:" + (process.env.PORT || 3000) + url;
    }
  }
  return fetch(url, opt);
};

if (global) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).fetch = proxyFetch;
}

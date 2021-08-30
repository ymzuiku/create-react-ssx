/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import fetch from "node-fetch";
window.React = React;

const proxyFetch = (url: string, opt: any) => {
  return fetch(process.env.PROXY_FETCH || "" + url, opt);
};

if (global) {
  (global as any).fetch = proxyFetch;
  (window as any).fetch = proxyFetch;
}

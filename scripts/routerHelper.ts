import { BrowserHistory, createBrowserHistory } from "history";

// 若返回的字符串不为空，则重定向新的url
export const routerHooks = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  before: (path: string) => "",
};

const historyCache: { history: BrowserHistory | undefined } = { history: undefined };

export const getHistory = (): BrowserHistory | undefined => {
  if (historyCache.history) {
    return historyCache.history;
  }
  if (typeof window === "undefined") {
    return undefined;
  }
  historyCache.history = createBrowserHistory();
  return historyCache.history;
};

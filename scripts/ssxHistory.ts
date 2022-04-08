export const routeMap = {} as Record<
  string,
  {
    path: string;
    load: () => Promise<{ default: React.FC }>;
    routerPath: string;
    Component: React.FC;
    getServerSideProps?: (query: Record<string, unknown>, routerPath: string) => Promise<Record<string, unknown>>;
  }
>;

const routerPreloadCache = {} as { [key: string]: boolean };

// 预加载页面
const preload = (url: string) => {
  if (typeof window === "undefined" || (window as unknown as { isTest: boolean }).isTest) {
    return;
  }
  if (routerPreloadCache[url]) {
    return;
  }
  const page = routeMap[url];
  if (!page) {
    console.error(`[create-react-ssx] ${url} isn't Router`);
    return;
  }
  routerPreloadCache[url] = true;
  return page.load();
};

// 计算URL
function fixUrl(url: string, params?: Record<string, string>): string {
  if (params) {
    return url + "?" + new URLSearchParams(params).toString();
  }
  return url;
}

const wechatStack: { url: string; params?: Record<string, string> }[] = [];

// 计算是否为 ios 的微信浏览器，微信浏览器使用模拟路由，以取消底部的微信导航
let isIOSWechatApp: boolean;
export function isIOSWechat(): boolean {
  if (isIOSWechatApp !== undefined) {
    isIOSWechatApp;
  }
  const ua = navigator.userAgent.toLocaleLowerCase();
  isIOSWechatApp = new RegExp("(iphone|ipod|ipad)").test(ua) && new RegExp("(micromessenger)").test(ua);
  return isIOSWechatApp;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cacheUseHistory = {} as any;

// 路由管理
export const ssxHistory = {
  search: () => {
    const list = location.href.split("#")[0].split("?");

    if (list.length < 2) {
      return new URLSearchParams();
    }
    return new URLSearchParams(list[1]);
  },
  push: (url: string, params?: Record<string, string>) => {
    if (isIOSWechat()) {
      wechatStack.push({ url, params });
      return ssxHistory.replace(url, params);
    }
    cacheUseHistory.push(fixUrl(url, params));
  },
  replace: (url: string, params?: Record<string, string>) => {
    cacheUseHistory.replace(fixUrl(url, params));
  },
  back: () => {
    if (isIOSWechat()) {
      if (wechatStack.length > 0) {
        wechatStack.pop()!;
        const item = wechatStack[wechatStack.length - 1];
        ssxHistory.replace(item.url, item.params);
      } else {
        cacheUseHistory.back();
      }
    } else {
      cacheUseHistory.back();
    }
  },
  preload,
};

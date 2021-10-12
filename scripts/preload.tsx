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

const preloadCache = {} as { [key: string]: boolean };

export const preload = (url: string) => {
  if (typeof window === "undefined" || (window as unknown as { isTest: boolean }).isTest) {
    return;
  }
  if (preloadCache[url]) {
    return;
  }
  const page = routeMap[url.toLowerCase()];
  if (!page) {
    throw new Error(`${url} isn't Router`);
  }
  preloadCache[url] = true;
  return page.load();
};

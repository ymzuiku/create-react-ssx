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

export const preload = (url: string) => {
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

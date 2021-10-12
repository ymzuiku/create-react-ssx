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

export const preload = (url: string) => {
  if (typeof window === "undefined") {
    return;
  }
  const page = routeMap[url];
  if (!page) {
    throw new Error(`${url} isn't Router`);
  }
  page.load();
};

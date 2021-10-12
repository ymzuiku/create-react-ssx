export const routeMap = {} as Record<
  string,
  {
    path: string;
    preload: () => Promise<{ default: React.FC }>;
    routerPath: string;
    Component: React.FC;
    getServerSideProps?: (query: Record<string, unknown>, routerPath: string) => Promise<Record<string, unknown>>;
  }
>;

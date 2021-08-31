export interface GetServerSideRequire {
  readonly headers: Record<string, unknown>;
  readonly ip: string;
  readonly ips?: string[];
  readonly query: Record<string, unknown>;
  readonly params: Record<string, unknown>;
  readonly hostname: string;
  readonly url: string;
  readonly protocol: "http" | "https";
  readonly routerPath: string;
}

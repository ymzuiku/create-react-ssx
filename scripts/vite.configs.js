const Vite = require("vite");

const isProd = process.env.NODE_ENV === "production";
const mode = isProd ? "production" : "development";
const cwd = process.cwd();

const nodeLibs = [
  "assert",
  "async_hooks",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "crypto",
  "dgram",
  "diagnostics_channel",
  "dns",
  "domain",
  "events",
  "fs",
  "fs/*",
  "http",
  "http2",
  "https",
  "inspector",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "tls",
  "util",
  "trace_events",
  "tty",
  "url",
  "v8",
  "vm",
  "wasi",
  "stream",
  "node:stream/*",
  "node:stream/web",
  "worker_threads",
  "zlib",
];

exports.serverDev = Vite.defineConfig({
  configFile: false,
  root: cwd,
  mode,
  logLevel: "error",
  define: process.env,
  build: {
    brotliSize: false,
    ssr: true,
    sourcemap: true,
    minify: false,
    target: "es6",
    lib: {
      name: "server-dev",
      formats: ["cjs"],
      entry: "server/index.ts",
    },
    outDir: "dist/server-dev",
    emptyOutDir: true,
    watch: {
      buildDelay: 50,
      clearScreen: false,
    },
  },
});

exports.server = Vite.defineConfig({
  configFile: false,
  root: cwd,
  mode,
  logLevel: "info",
  define: process.env,
  build: {
    brotliSize: false,
    ssr: true,
    sourcemap: false,
    minify: true,
    target: "es6",
    lib: {
      name: "server",
      formats: ["cjs"],
      entry: "server/index.ts",
    },
    outDir: "dist/server",
    emptyOutDir: true,
  },
  // esbuild: {
  //   target: "es6",
  //   exclude: [...nodeLibs],
  // },
});

exports.prerender = Vite.defineConfig({
  root: cwd,
  mode,
  logLevel: "info",
  build: {
    ssr: true,
    sourcemap: !isProd,
    minify: false,
    target: "es6",
    brotliSize: false,
    lib: {
      name: "prerender",
      formats: ["cjs"],
      entry: "scripts/prerender.ts",
    },
    outDir: "dist/prerender",
    emptyOutDir: false,
  },
});

exports.entryServer = Vite.defineConfig({
  root: cwd,
  mode,
  logLevel: "info",
  build: {
    ssr: true,
    sourcemap: false,
    minify: false,
    target: "es6",
    brotliSize: false,
    lib: {
      name: "entry-server",
      formats: ["cjs"],
      entry: "src/entry-server.tsx",
    },
    emptyOutDir: false,
    outDir: "dist/server",
    emptyOutDir: false,
  },
});

exports.static = Vite.defineConfig({
  root: cwd,
  mode,
  define: process.env,
  logLevel: "info",
  build: {
    brotliSize: false,
    outDir: "dist/static",
  },
});

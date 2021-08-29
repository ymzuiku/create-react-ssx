import { fastify } from "fastify";
import { useSSR } from "../scripts/useSSR";
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";
console.log("-----isProd", isProd);

const app = fastify({});

async function start() {
  if (!isProd) {
    await useSSR(app);
  }
  try {
    console.log(`http://localhost:${PORT}`);
    await app.listen(PORT);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
start();

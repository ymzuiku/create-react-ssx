import { fastify } from "fastify";
import { useSSR } from "./useSSR";
const PORT = process.env.PORT || 3000;

const app = fastify({});
app.get("/ping", async (res) => {
  return { name: "pong", data: res.body };
});

async function start() {
  await useSSR(app);
  try {
    console.log(`http://localhost:${PORT}`);
    await app.listen(PORT);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
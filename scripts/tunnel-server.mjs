import { createServer } from "node:http";
import next from "next";

const origin = new URL(process.env.AIRL_PUBLIC_ORIGIN || "http://invalid");
if (
  origin.protocol !== "https:" ||
  origin.username ||
  origin.password ||
  origin.port ||
  origin.pathname !== "/" ||
  origin.search ||
  origin.hash ||
  !/^[a-z0-9-]+\.(ngrok-free\.dev|ngrok-free\.app|ngrok\.app)$/.test(
    origin.hostname,
  )
) {
  throw new Error(
    "AIRL_PUBLIC_ORIGIN must be your exact HTTPS ngrok development origin.",
  );
}
const port = Number(process.env.AIRL_TUNNEL_PORT || 3456);
if (!Number.isInteger(port) || port < 1024 || port > 65535 || port === 11434) {
  throw new Error(
    "Choose AIRL_TUNNEL_PORT between 1024 and 65535, excluding the Ollama port.",
  );
}
const server = createServer();
const app = next({
  dev: false,
  hostname: origin.hostname,
  port,
  httpServer: server,
});
await app.prepare();
const handle = app.getRequestHandler();
server.on("request", (request, response) => {
  if (![origin.host, `${origin.hostname}:443`].includes(request.headers.host)) {
    response.writeHead(421).end("Use the configured public demo address.");
    return;
  }
  // The ngrok agent connects over loopback. Derive HTTPS identity from our configured
  // origin, never from proxy headers supplied by a visitor.
  request.headers.host = origin.host;
  delete request.headers.forwarded;
  request.headers["x-forwarded-proto"] = "https";
  request.headers["x-forwarded-host"] = origin.host;
  request.headers["x-forwarded-port"] = "443";
  request.headers["x-forwarded-for"] = request.socket.remoteAddress;
  response.setHeader("X-Content-Type-Options", "nosniff");
  void handle(request, response);
});
server.listen(port, "127.0.0.1", () => {
  console.log(`AIRL tunnel upstream listening on loopback port ${port}.`);
  process.send?.({ ready: true });
});
server.on("error", () => {
  console.error("AIRL could not bind its loopback upstream.");
  process.exit(1);
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.close();
    server.closeAllConnections();
    void app.close().then(() => process.exit(0));
  });

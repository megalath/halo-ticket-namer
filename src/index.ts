import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import pino from "pino";
import { loadConfig } from "./config.js";
import { createWebhookRoute } from "./webhook.js";

const config = loadConfig();
const logger = pino({ level: config.logLevel });

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));
app.route("/webhook", createWebhookRoute(config, logger));

serve({ fetch: app.fetch, port: config.port }, () => {
  logger.info(
    { port: config.port, categories: config.categories.length },
    "halo-ticket-namer listening",
  );
});

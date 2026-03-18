import { Hono } from "hono";
import type { Config, WebhookPayload } from "./types.js";
import { getTicket, updateTicket } from "./halo.js";
import { classifyTicket } from "./ai.js";
import type { Logger } from "pino";

// Track recently processed tickets to prevent infinite loops
// (our update could trigger another webhook from Halo)
const recentlyProcessed = new Map<number, number>();

function cleanupProcessed() {
  const now = Date.now();
  for (const [id, timestamp] of recentlyProcessed) {
    if (now - timestamp > 60_000) {
      recentlyProcessed.delete(id);
    }
  }
}

export function createWebhookRoute(config: Config, logger: Logger) {
  const app = new Hono();

  app.post("/", async (c) => {
    // Authenticate webhook
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token !== config.webhookSecret) {
      logger.warn("Webhook auth failed");
      return c.json({ ok: false, error: "Unauthorized" }, 401);
    }

    let payload: WebhookPayload;
    try {
      payload = await c.req.json<WebhookPayload>();
    } catch {
      logger.warn("Invalid webhook payload");
      return c.json({ ok: false, error: "Invalid payload" }, 400);
    }

    const ticketId = payload.object_id;
    if (!ticketId) {
      logger.warn("Webhook payload missing object_id");
      return c.json({ ok: false, error: "Missing object_id" }, 400);
    }

    // Infinite loop guard
    cleanupProcessed();
    if (recentlyProcessed.has(ticketId)) {
      logger.info({ ticketId }, "Skipping recently processed ticket");
      return c.json({ ok: true, skipped: true });
    }
    recentlyProcessed.set(ticketId, Date.now());

    const start = Date.now();

    try {
      // Fetch full ticket details
      logger.info({ ticketId }, "Fetching ticket");
      const ticket = await getTicket(config, ticketId);

      // Classify with AI
      logger.info(
        { ticketId, originalSummary: ticket.summary },
        "Classifying ticket",
      );
      const result = await classifyTicket(
        ticket,
        config.rules,
        config.categories,
      );

      // Update ticket in Halo
      logger.info(
        { ticketId, newSummary: result.summary, category: result.category_1 },
        "Updating ticket",
      );
      await updateTicket(config, ticketId, result);

      const duration = Date.now() - start;
      logger.info({ ticketId, duration }, "Ticket processed");

      return c.json({
        ok: true,
        ticketId,
        summary: result.summary,
        category_1: result.category_1,
        duration,
      });
    } catch (err) {
      const duration = Date.now() - start;
      logger.error({ ticketId, duration, err }, "Failed to process ticket");
      // Return 200 to prevent Halo from retrying — retries won't fix systemic errors
      return c.json({ ok: false, error: String(err) }, 200);
    }
  });

  return app;
}

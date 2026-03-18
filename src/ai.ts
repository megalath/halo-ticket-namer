import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { HaloTicket } from "./types.js";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function buildTicketPrompt(ticket: HaloTicket): string {
  const parts = [
    `Summary: ${ticket.summary}`,
    `Details: ${stripHtml(ticket.details || "")}`,
  ];

  if (ticket.client_name) parts.push(`Client: ${ticket.client_name}`);
  if (ticket.site_name) parts.push(`Site: ${ticket.site_name}`);
  if (ticket.user_name) parts.push(`Reported by: ${ticket.user_name}`);
  if (ticket.priority?.name) parts.push(`Priority: ${ticket.priority.name}`);

  if (ticket.notes?.length) {
    const recentNotes = ticket.notes
      .slice(0, 3)
      .map((n) => stripHtml(n.note))
      .join("\n---\n");
    parts.push(`\nRecent notes:\n${recentNotes}`);
  }

  return parts.join("\n");
}

export async function classifyTicket(
  ticket: HaloTicket,
  rules: string,
  categories: string[],
): Promise<{ summary: string; category_1: string }> {
  const schema = z.object({
    summary: z
      .string()
      .describe("A clean, standardized ticket summary under 80 characters"),
    category_1: z
      .enum(categories as [string, ...string[]])
      .describe("The primary category for this ticket"),
  });

  const { output } = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema }),
    system: `You are a ticket naming and categorization assistant for an MSP help desk.\n\nFollow these rules EXACTLY:\n\n${rules}\n\nValid categories: ${categories.join(", ")}`,
    prompt: `Classify this ticket:\n\n${buildTicketPrompt(ticket)}`,
  });

  if (!output) {
    throw new Error("AI returned no output");
  }

  return output;
}

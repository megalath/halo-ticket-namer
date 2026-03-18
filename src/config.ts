import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Config } from "./types.js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(): Config {
  const rulesPath = join(process.cwd(), "RULES.md");
  const categoriesPath = join(process.cwd(), "categories.json");

  let rules: string;
  try {
    rules = readFileSync(rulesPath, "utf-8");
  } catch {
    throw new Error(`Cannot read RULES.md at ${rulesPath}`);
  }

  let categories: string[];
  try {
    const raw = JSON.parse(readFileSync(categoriesPath, "utf-8"));
    categories = raw.categories;
    if (!Array.isArray(categories) || categories.length === 0) {
      throw new Error("categories.json must have a non-empty 'categories' array");
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in categories.json: ${err.message}`);
    }
    throw err;
  }

  return {
    port: parseInt(process.env.PORT ?? "3000", 10),
    logLevel: process.env.LOG_LEVEL ?? "info",
    haloBaseUrl: requireEnv("HALO_BASE_URL").replace(/\/+$/, ""),
    haloAuthUrl: requireEnv("HALO_AUTH_URL"),
    haloClientId: requireEnv("HALO_CLIENT_ID"),
    haloClientSecret: requireEnv("HALO_CLIENT_SECRET"),
    openaiApiKey: requireEnv("OPENAI_API_KEY"),
    webhookSecret: requireEnv("WEBHOOK_SECRET"),
    rules,
    categories,
  };
}

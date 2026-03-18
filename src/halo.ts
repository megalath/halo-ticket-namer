import type { Config, HaloTicket } from "./types.js";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(config: Config): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const response = await fetch(config.haloAuthUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: config.haloClientId,
      client_secret: config.haloClientSecret,
      scope: "all",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Halo auth failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = data.access_token;
  // Refresh 5 minutes before expiry
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

  return cachedToken;
}

async function haloFetch(
  config: Config,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getAccessToken(config);
  const response = await fetch(`${config.haloBaseUrl}/api${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  // On 401, clear cached token and retry once
  if (response.status === 401) {
    cachedToken = null;
    tokenExpiresAt = 0;
    const retryToken = await getAccessToken(config);
    return fetch(`${config.haloBaseUrl}/api${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${retryToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  }

  return response;
}

export async function getTicket(
  config: Config,
  ticketId: number,
): Promise<HaloTicket> {
  const response = await haloFetch(
    config,
    `/Tickets/${ticketId}?includedetails=true`,
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Halo GET /Tickets/${ticketId} failed (${response.status}): ${body}`,
    );
  }

  return (await response.json()) as HaloTicket;
}

export async function updateTicket(
  config: Config,
  ticketId: number,
  updates: { summary: string; category_1: string },
): Promise<void> {
  const response = await haloFetch(config, "/Tickets", {
    method: "POST",
    body: JSON.stringify([{ id: ticketId, ...updates }]),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Halo POST /Tickets (update ${ticketId}) failed (${response.status}): ${body}`,
    );
  }
}

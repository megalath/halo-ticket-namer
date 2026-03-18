export interface HaloTicket {
  id: number;
  summary: string;
  details: string;
  client_name?: string;
  site_name?: string;
  user_name?: string;
  priority?: { id: number; name: string };
  category_1?: string;
  category_2?: string;
  category_3?: string;
  category_4?: string;
  notes?: Array<{ id: number; note: string; who: string }>;
}

export interface WebhookPayload {
  object_id: number;
  event_type?: string;
  webhook_id?: number;
  message?: string;
  timestamp?: string;
}

export interface Config {
  port: number;
  logLevel: string;
  haloBaseUrl: string;
  haloAuthUrl: string;
  haloClientId: string;
  haloClientSecret: string;
  openaiApiKey: string;
  webhookSecret: string;
  rules: string;
  categories: string[];
}

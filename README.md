# halo-ticket-namer

AI-powered ticket naming and categorization for [Halo ITSM](https://haloitsm.com/). When a new ticket comes in, this service renames it with a clean, standardized subject and assigns a category — using rules you define in a simple markdown file.

## How it works

1. A new ticket is created in Halo
2. Halo sends a webhook to this service
3. The service fetches the full ticket details
4. An AI model (GPT-4o-mini) reads the ticket and your custom rules
5. The ticket summary and category are updated in Halo

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/megalath/halo-ticket-namer.git
cd halo-ticket-namer
npm install
```

### 2. Configure

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `HALO_BASE_URL` | Your Halo instance URL (e.g., `https://yourcompany.halopsa.com`) |
| `HALO_AUTH_URL` | Halo auth endpoint (e.g., `https://yourcompany.halopsa.com/auth/token`) |
| `HALO_CLIENT_ID` | OAuth client ID from Halo API settings |
| `HALO_CLIENT_SECRET` | OAuth client secret from Halo API settings |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `WEBHOOK_SECRET` | A random secret string for authenticating webhooks |
| `PORT` | Server port (default: `3000`) |
| `LOG_LEVEL` | Logging level (default: `info`) |

### 3. Set up Halo API access

1. In Halo, go to **Configuration > Integrations > Halo API**
2. Create a new application
3. Note the **Client ID** and **Client Secret**
4. Set the API permissions to allow reading and updating tickets

### 4. Set up the webhook in Halo

1. Go to **Configuration > Integrations > Webhooks**
2. Create a new webhook:
   - **URL**: `https://your-server:3000/webhook`
   - **Event**: New Ticket Created
   - **Authentication**: Set the token to match your `WEBHOOK_SECRET`
3. Test the webhook from the Halo UI to verify connectivity

### 5. Run

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

### 6. Docker (optional)

```bash
docker compose up
```

The `docker-compose.yml` mounts `RULES.md` and `categories.json` as volumes, so you can edit them without rebuilding the image.

## Customizing the rules

### RULES.md

This is the core of the tool. Edit `RULES.md` to control how tickets are named and categorized. The file is injected directly as the AI's instructions — what you write is what the AI follows.

The default rules use the format `[System] - [Brief description]` and include examples. You can change this to match your MSP's style. Add your own examples to improve consistency.

### categories.json

This file defines the valid categories. The AI is constrained to only output categories from this list. Edit it to match your Halo category_1 values:

```json
{
  "categories": [
    "Email & Collaboration",
    "Networking & Connectivity",
    "Your Custom Category"
  ]
}
```

## API

### `GET /health`
Health check endpoint. Returns `{ "ok": true }`.

### `POST /webhook`
Receives Halo webhook events. Requires `Authorization: Bearer <WEBHOOK_SECRET>` header.

**Request body:**
```json
{ "object_id": 12345 }
```

**Response:**
```json
{
  "ok": true,
  "ticketId": 12345,
  "summary": "Outlook - Unable to send emails",
  "category_1": "Email & Collaboration",
  "duration": 2340
}
```

## License

MIT

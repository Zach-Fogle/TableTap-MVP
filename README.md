# TableTap

TableTap is a mobile-first service request app for restaurants. Guests scan a
table QR code, choose what they need, and the request is routed to staff through
configured integrations.

The current MVP stores requests in a built-in mock POS dashboard and can also
forward structured payloads to Discord, a generic POS bridge, or a
Toast-specific bridge. It does not store guest data, process payments, or
require a real POS connection to run.

## Features

- Dynamic QR-friendly table pages: `/table/[tableId]`
- Large mobile touch targets for common requests
- Optional custom guest note
- Success, loading, and friendly error states
- Duplicate-submission lockout after a successful request
- Server-side validation and error logging
- Discord webhook delivery
- Built-in Toast-style mock POS dashboard
- Optional generic POS webhook bridge
- Optional Toast bridge payload
- Manager-facing pitch page: `/pitch`

## How It Works

```text
Guest scans QR code
→ opens /table/7
→ submits request
→ POST /api/request
→ built-in mock POS dashboard
→ optional Discord webhook
→ optional Toast/POS bridge
```

Each table URL is generated automatically by the Next.js dynamic route:

```text
app/table/[tableId]/page.tsx
```

To create a QR code for a new table, point the QR code at the deployed URL:

```text
https://your-domain.com/table/12
```

No new page file is needed for each table.

## Project Structure

```text
app/
  api/request/route.ts       Validated request endpoint
  api/mock-pos/              Mock POS request and table APIs
  pos/page.tsx               Toast-style floor and request dashboard
  pos/table/[tableId]/       Mock table/check detail view
  pitch/page.tsx             Manager-facing product pitch page
  table/[tableId]/page.tsx   Dynamic table route
  globals.css                Global Tailwind and theme styles
  layout.tsx                 Root metadata and viewport
  page.tsx                   Landing page
components/
  pos-dashboard.tsx          Staff-facing mock POS queue
  pos-table-detail.tsx       Mock POS table/check detail page
  request-icons.tsx          Request button icons
  request-panel.tsx          Interactive customer request form
docs/
  GM_PITCH.md                Script and pilot plan for restaurant managers
  TOAST_INTEGRATION.md       Toast POS integration plan
lib/
  integrations/              Discord, Toast, and POS delivery adapters
  mock-pos-store.ts          In-memory demo POS request store
  table-request.ts           Request validation and timestamp helpers
```

## Local Development

Requirements:

- Node.js 20 or newer
- npm

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000/table/7
```

For the full demo, open the mock POS dashboard in another browser tab:

```text
http://localhost:3000/pos
```

Then submit a request from `/table/7` and watch it appear in `/pos`.

## Environment Variables

Create `.env.local` from `.env.example`.

```dotenv
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
RESTAURANT_TIME_ZONE=America/New_York
MOCK_POS_ENABLED=true

POS_WEBHOOK_URL=
POS_WEBHOOK_SECRET=

TOAST_BRIDGE_WEBHOOK_URL=
TOAST_BRIDGE_SECRET=
TOAST_RESTAURANT_EXTERNAL_ID=
TOAST_LOCATION_NAME=
```

Keep real secrets in `.env.local` and Vercel environment variables. Never commit
`.env.local`.

## Discord Setup

1. In Discord, open **Server Settings > Integrations > Webhooks**.
2. Create a webhook for the channel staff will monitor.
3. Copy the webhook URL.
4. Add it as `DISCORD_WEBHOOK_URL`.

Discord is optional because the mock POS dashboard can receive demo requests on
its own. Add `DISCORD_WEBHOOK_URL` when you also want staff alerts in a Discord
channel.

## Mock POS Demo

The built-in mock POS gives you a Toast-style demonstration without needing
Toast approval or credentials.

Open:

```text
/pos
```

The dashboard shows:

- Table statuses
- Separate Active and Completed request tabs
- New, Seen, In Progress, and Done states
- Table detail pages at `/pos/table/[tableId]`

The mock POS uses temporary in-memory server state. It is useful for demos, but
it is not durable storage. On Vercel, memory can reset when the serverless
function restarts. A production version should move request storage to a real
database such as Vercel Postgres, Neon, or Supabase.

## Toast / POS Setup

TableTap does not directly create Toast orders yet. Toast production API access
requires credentials, scopes, restaurant approval, and a Toast restaurant GUID.

For now, TableTap supports a Toast bridge:

```text
TableTap → TOAST_BRIDGE_WEBHOOK_URL → Toast integration service → Toast POS
```

The Toast bridge is optional. If it fails but the mock POS receives the request,
the guest still sees a success message.

See [docs/TOAST_INTEGRATION.md](docs/TOAST_INTEGRATION.md) for the integration
plan, required Toast information, and payload shape.

## Quality Checks

```bash
npm run lint
npm test
npm run build
npm audit --audit-level=low
```

## Deploy To Vercel

1. Push the project to GitHub.
2. Import the repository at `https://vercel.com/new`.
3. Add `DISCORD_WEBHOOK_URL` in **Project Settings > Environment Variables**.
4. Optionally add `RESTAURANT_TIME_ZONE`, `TOAST_BRIDGE_WEBHOOK_URL`,
   `TOAST_BRIDGE_SECRET`, `TOAST_RESTAURANT_EXTERNAL_ID`,
   `TOAST_LOCATION_NAME`, and any generic POS bridge variables.
5. Deploy.

After deployment, create QR codes pointing to URLs such as:

```text
https://your-domain.com/table/7
```

## GitHub Upload Checklist

Before pushing, run:

```bash
npm run lint
npm test
npm run build
npm audit --audit-level=low
git status
```

Safe files to commit include source code, docs, `package.json`,
`package-lock.json`, `.env.example`, and `next-env.d.ts`.

Do not commit:

- `.env.local`
- `.next/`
- `node_modules/`
- `.vercel/`
- `.venv/`

These are already covered by `.gitignore`.

## Current Limitations

- No persistent database yet
- Mock POS dashboard state is temporary and can reset on server restart
- No authentication for manager/admin pages
- Direct Toast API order creation is not implemented
- Table IDs are URL-based and not yet mapped to Toast table GUIDs

## Recommended Next Steps

1. Run a small pilot using Discord delivery.
2. Replace the mock POS memory store with a database.
3. Confirm the restaurant's Toast product and API access path.
4. Build the Toast bridge service once credentials and mapping rules exist.
5. Decide which requests should become POS actions and which should remain staff
   alerts.

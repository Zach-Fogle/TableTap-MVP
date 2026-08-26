# TableTap

TableTap is a mobile-first restaurant service request app. Guests scan a table
QR code, choose what they need, and the request is delivered through configured
integrations. Discord is the default required integration, and an optional POS
webhook bridge can be enabled when a POS provider or middleware endpoint is
available.

## Project Structure

```text
app/
  api/request/route.ts       Validated request endpoint
  pitch/page.tsx             Manager-facing product pitch page
  table/[tableId]/page.tsx   Dynamic table route
  globals.css                Global Tailwind and theme styles
  layout.tsx                 Root metadata and viewport
  page.tsx                   Landing page
components/
  request-icons.tsx          Request button icons
  request-panel.tsx          Interactive customer request form
lib/
  integrations/              Discord and POS delivery adapters
  table-request.ts           Request validation and timestamp helpers
docs/
  GM_PITCH.md                Script and pilot plan for restaurant managers
```

## Local Development

Requirements: Node.js 20 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000/table/7`.

Use `/table/1`, `/table/7`, or any other alphanumeric table ID in each QR code.
Use `/pitch` for the manager-facing demo page.

## Environment Variables

Create `.env.local` from `.env.example`:

```dotenv
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
RESTAURANT_TIME_ZONE=America/New_York
POS_WEBHOOK_URL=
POS_WEBHOOK_SECRET=
POS_INTEGRATION_REQUIRED=false
```

Keep real secrets in `.env.local` and Vercel environment variables. Do not
commit `.env.local`.

## Quality Checks

```bash
npm run lint
npm test
npm run build
```

## Deploy To Vercel

1. Push the project to GitHub.
2. Import the repository at `https://vercel.com/new`.
3. Add `DISCORD_WEBHOOK_URL` in **Project Settings > Environment Variables**.
4. Optionally add `RESTAURANT_TIME_ZONE`, `POS_WEBHOOK_URL`,
   `POS_WEBHOOK_SECRET`, and `POS_INTEGRATION_REQUIRED`.
5. Deploy. Vercel detects Next.js and runs `npm run build` automatically.

After deployment, create QR codes pointing to URLs such as
`https://your-domain.com/table/7`.

## POS Integration Path

Most restaurant POS systems require partner approval, OAuth credentials, and
restaurant-specific object mapping before they allow direct order or ticket
creation. For that reason, TableTap has an integration layer instead of
hard-coding a single POS provider.

The optional `POS_WEBHOOK_URL` sends this structured payload whenever a guest
submits a request:

```json
{
  "source": "tabletap",
  "tableId": "7",
  "requestType": "Refill",
  "customMessage": "No ice",
  "requestedAt": "2026-08-26T20:30:00.000Z"
}
```

Use this endpoint for a POS middleware service, an automation tool, or a custom
server that translates TableTap requests into the chosen POS. If
`POS_INTEGRATION_REQUIRED=true`, TableTap treats POS delivery failure as a
failed customer request. If it is false, Discord can continue working while the
POS bridge is being tested.

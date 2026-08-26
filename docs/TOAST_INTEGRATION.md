# Toast POS Integration Plan

This document explains how TableTap should connect to Toast without overstating
what is possible before Toast credentials and restaurant approval exist.

## Summary

The recommended architecture is:

```text
TableTap guest page
→ TableTap API
→ Toast bridge endpoint
→ Toast APIs
→ Toast POS / kitchen / order workflow
```

TableTap already supports the first bridge hop through
`TOAST_BRIDGE_WEBHOOK_URL`.

For demos, TableTap also includes a local Toast-style mock POS at `/pos`. It is
not Toast, but it shows the final workflow without needing credentials.

## Why A Bridge Is Needed

Toast has public developer documentation, but production API access is not just
a URL you paste into the app. A real integration needs:

- Toast API client credentials
- Toast-approved scopes
- Restaurant/location GUID
- Menu item GUIDs if creating orders or adding items
- Dining option / revenue center / table mapping
- Business approval from the restaurant and, often, Toast partner approval

For TableTap's current request types, not every request belongs in Toast. A
refill or napkin request may be better as a staff alert, while "extra sauce"
could become an item, modifier, service ticket, or kitchen note depending on the
restaurant's configuration.

## Current TableTap Toast Bridge

When configured, TableTap sends this payload to `TOAST_BRIDGE_WEBHOOK_URL`:

```json
{
  "source": "tabletap",
  "provider": "toast",
  "restaurantExternalId": "00000000-0000-0000-0000-000000000001",
  "locationName": "Downtown",
  "tableId": "7",
  "requestType": "Refill",
  "customMessage": "No ice",
  "requestedAt": "2026-08-26T20:30:00.000Z"
}
```

The bridge should return a successful 2xx response after it accepts or forwards
the request.

## Built-In Mock POS

The mock POS receives requests automatically when `MOCK_POS_ENABLED` is not set
to `false`.

```dotenv
MOCK_POS_ENABLED=true
```

Use this flow for demos:

1. Open `/pos` on a laptop or tablet.
2. Open `/table/7` on a phone.
3. Send a request.
4. Mark the request Seen, Working, or Done in the POS dashboard.

The mock POS uses temporary in-memory server state. It proves the workflow, but
it is not a substitute for a real Toast API integration or database-backed staff
dashboard.

## Environment Variables

```dotenv
TOAST_BRIDGE_WEBHOOK_URL=https://your-toast-bridge.example.com/tabletap
TOAST_BRIDGE_SECRET=shared-secret-between-tabletap-and-bridge
TOAST_INTEGRATION_REQUIRED=false
TOAST_RESTAURANT_EXTERNAL_ID=toast-location-guid
TOAST_LOCATION_NAME=Friendly location name
```

Keep `TOAST_INTEGRATION_REQUIRED=false` while testing. That lets Discord stay
working even if the Toast bridge fails.

## Direct Toast API Requirements

Based on Toast's official documentation:

- Toast APIs use OAuth 2 client credentials.
- Authentication uses `clientId`, `clientSecret`, and
  `userAccessType: "TOAST_MACHINE_CLIENT"`.
- Secure API requests include an `Authorization: Bearer ...` header.
- Restaurant-scoped requests include `Toast-Restaurant-External-ID`.
- Creating orders requires write scopes and order-specific configuration.

## Direct API Work Still Needed

Once credentials exist, the bridge needs to:

1. Authenticate with Toast and cache the bearer token until it expires.
2. Store the Toast restaurant external ID.
3. Map TableTap table IDs to Toast table/order context.
4. Decide the action for each request type.
5. Fetch menu/configuration data if requests become order items.
6. Create or update Toast orders only when that is operationally correct.
7. Log failures and retry safe operations.

## Request Mapping Draft

```text
Refill        → staff alert only at first
Napkins       → staff alert only at first
Plates        → staff alert only at first
Check Please  → server/manager alert, not payment automation
Extra Sauce   → possible Toast item/modifier later
Custom note   → staff alert unless mapped manually
```

This conservative mapping keeps the pilot useful without creating accidental
orders, charges, kitchen tickets, or payment confusion.

## Questions To Answer Before Direct Toast Work

- Does the restaurant have Toast API access or a Toast partner contact?
- Is this Toast POS, Toast for Hotel Restaurants, or another Toast product?
- What is the Toast restaurant/location GUID?
- Are table identifiers available through the API or only inside the POS UI?
- Should TableTap create orders, add items to checks, print chits, or only send
  service alerts?
- Which request types are allowed to touch the kitchen workflow?

## Official Toast References

- Toast API overview: https://doc.toasttab.com/doc/devguide/apiOverview.html
- Toast authentication guide: https://doc.toasttab.com/doc/devguide/authentication.html
- Toast orders overview: https://doc.toasttab.com/doc/devguide/portalOrdersApiOverview.html
- Submitting first order: https://doc.toasttab.com/doc/devguide/apiOrdersFirstOrder.html
- Toast partner process: https://doc.toasttab.com/doc/devguide/integrationDevProcess.html

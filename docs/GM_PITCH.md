# TableTap GM Pitch

## Short Version

TableTap lets guests scan a QR code at their table and send simple service
requests to staff. It is meant to reduce missed small requests and make table
service smoother during busy shifts.

## 30-Second Pitch

"I built a working demo called TableTap. Guests scan a table QR code, tap what
they need, and staff get a table-numbered alert immediately. It does not touch
payments, customer accounts, or the POS for the first pilot. I would like to
test it on a few tables for one shift and see whether it helps or gets in the
way."

## Problem It Solves

- Guests wait to flag down staff for small requests.
- Servers get interrupted while carrying food, taking orders, or closing checks.
- Small requests can be forgotten during a rush.
- Managers have little visibility into repeated service bottlenecks.

## What Guests See

- Restaurant logo placeholder
- Table number
- Large request buttons
- Optional custom note
- Confirmation after sending

## What Staff Sees Today

- Mock POS dashboard
- Optional Discord alert or shared-device notification
- Table number
- Request type
- Optional note
- Timestamp

## Why It Is Safe To Pilot

- No payments
- No customer personal data
- No POS access required
- No app download
- Can be tested on a few tables
- Can be turned off by removing the QR codes

## Suggested Pilot

Run TableTap on 5-10 tables for one shift.

Track:

- How many requests are submitted
- Which request types are used most
- Whether alerts are useful or distracting
- Whether guests understand the QR code
- Which request categories should change

## Good GM Questions

- Which tables would be safest for a small test?
- Who should receive the alerts?
- Which request categories should be allowed?
- Which requests should be excluded?
- What would make this useful enough to keep?
- If the pilot works, who would approve a larger rollout?

## Future Version

After the pilot, TableTap can grow into:

- Staff dashboard with New, Seen, and Done states
- Toast-style POS demo screen
- Request analytics by table, shift, and category
- Role-based routing for servers, bussers, bar, kitchen, and managers
- Restaurant branding and configurable categories
- QR code generation for every table
- Toast/POS bridge integration where appropriate
- Separate active and completed request queues

## Demo Script

1. Open the public TableTap URL.
2. Visit `/table/7`.
3. Tap "Refill" and submit.
4. Show the request appear in `/pos`.
5. Explain that every table gets its own QR code URL.
6. Open `/pitch` for the manager-facing overview.
7. Ask for a small one-shift pilot.

## Ask

"Can we test this on a small section for one shift and review whether it helped
or got in the way?"

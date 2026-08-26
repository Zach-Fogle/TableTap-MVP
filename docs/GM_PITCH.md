# TableTap GM Pitch

## Short version

TableTap is a QR-based table request system. A guest scans the table QR code,
taps what they need, and the request is routed to staff with the table number.
It is meant to reduce small service delays like refills, napkins, sauce, plates,
and check requests.

## 30-second pitch

"I built a small demo called TableTap for our restaurant. The idea is simple:
guests scan a QR code at the table and request common items without waiting to
flag someone down. The request comes through immediately with the table number.
It does not touch payments or the POS for the first pilot, so the risk is low.
I would like to test it on a few tables for one shift and see whether it helps
staff respond faster to simple requests."

## Problem it solves

- Guests sometimes need small things while servers are busy.
- Servers get interrupted while carrying food, taking orders, or closing checks.
- Managers do not have a simple way to see repeated small service issues.
- Table requests are easy to miss during a rush.

## What the guest sees

- Restaurant logo placeholder
- Table number
- Large request buttons
- Optional custom note
- Confirmation that the request was sent

## What staff sees today

- A request alert in a Discord channel or shared device
- Table number
- Request type
- Optional note
- Timestamp

## Why this is safe to pilot

- No payment processing
- No customer accounts
- No customer personal data required
- No POS dependency for the first version
- Can be tested on a small number of tables
- Can be turned off by removing the QR codes

## Suggested pilot

Run it on 5-10 tables for one shift.

Track:

- Number of requests submitted
- Which request types are used most
- Whether staff found alerts useful or distracting
- Whether guests understood the QR code
- Any request categories that should be added or removed

## Questions to ask the GM

- Which tables should be included in a first test?
- Who should receive the alerts?
- Should hosts, servers, bussers, or managers own different request types?
- Which requests should be allowed?
- Are there requests we should avoid because they create operational problems?
- What would make this useful enough to keep?

## Future version

After the pilot, TableTap can grow into:

- Staff dashboard with New, Seen, and Done states
- POS integration once the restaurant's POS provider and access rules are known
- Different routing for servers, bussers, bar, and managers
- Request analytics by table, shift, and category
- Custom branding for the restaurant
- QR code generation for every table

## Demo script

1. Open the public TableTap URL.
2. Visit `/table/7`.
3. Tap "Refill" and submit.
4. Show the staff alert with the table number.
5. Explain that each table gets its own QR code URL.
6. Ask for permission to pilot a few tables for one shift.

## Ask

"Can we test this on a small section for one shift and review whether it helped
or got in the way?"

# TableTap Stakeholder Walkthrough Brief

## Purpose

TableTap is a working restaurant service-workflow prototype. Guests open a
table-specific QR page and submit a routine request. Authenticated staff see the
request in a restaurant-scoped queue, claim responsibility, update its status,
and retain a persistent event history.

The next decision is whether the workflow is clear enough for a limited pilot.
That decision should follow an employee walkthrough, not a live guest test.

## Thirty-Second Overview

"I built TableTap to explore a common service gap: guests sometimes need a
routine item while staff are occupied elsewhere. The prototype gives guests an
optional request channel and gives staff one shared queue with visible ownership.
I would like a server and shift leader to walk through the workflow, identify
where it adds work or ambiguity, and decide whether a small pilot is warranted."

## Demonstrated Today

- Table-specific guest pages with quick requests and optional notes
- Server-side validation and duplicate-submission protection
- Authenticated staff access with eight-hour signed sessions
- Restaurant-scoped active and completed queues
- Claim, reassignment, status, completion, and reopening controls
- SQLite persistence and request event history
- Stale-update protection for competing dashboard actions
- Optional Discord, generic POS, and Toast-bridge delivery adapters
- Ten passing automated tests

## Evidence and Boundaries

The concept is informed by firsthand restaurant-service experience and separate
interviews with two California Dreaming servers conducted July 27, 2026. Those
interviews shaped the workflow, but they do not establish restaurant approval or
measured service improvement.

The prototype does not process payments, create Toast orders, or contain a
verified Toast integration. The shared demonstration PIN and local SQLite
database are appropriate for a controlled walkthrough, not production use.

## Walkthrough Agenda

1. Submit and claim a routine request.
2. Reassign it when the first owner becomes unavailable.
3. Decide how to handle a duplicate request.
4. Explain what happens when nobody can monitor the queue.
5. Mark the request complete and define how physical delivery is confirmed.

Use [the employee walkthrough guide](EMPLOYEE_WALKTHROUGH.md) to record task
completion, confusion, workarounds, missing controls, and requested changes.

## Stakeholder Questions

- Who owns an unassigned request during a busy shift?
- How should the table's server learn that another employee responded?
- Which request types belong in the queue, and which should remain verbal?
- What should guests see when the queue is not being monitored?
- Does the workflow reduce missed needs or create another screen to watch?
- What must change before a limited live pilot could be considered?

## Decision

Choose one outcome after the walkthrough:

- **Revise and repeat** when staff cannot complete or explain the workflow.
- **Prepare a limited pilot proposal** when ownership and fallback behavior are
  clear and no critical issue remains.
- **Stop** when the coordination effort outweighs the service problem.

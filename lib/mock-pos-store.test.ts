import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addMockPosRequest,
  assignMockPosRequest,
  listMockPosRequestEvents,
  listMockPosRequests,
  updateMockPosRequestStatus,
} from "@/lib/mock-pos-store";

let testDirectory: string;

beforeEach(() => {
  testDirectory = mkdtempSync(join(tmpdir(), "tabletap-store-"));
  process.env.TABLETAP_DB_PATH = join(testDirectory, "tabletap.db");
});

afterEach(() => {
  delete process.env.TABLETAP_DB_PATH;
  rmSync(testDirectory, { recursive: true, force: true });
});

describe("persistent POS request store", () => {
  it("persists ownership, status, timestamps, and event history", () => {
    const request = addMockPosRequest({
      tableId: "7",
      requestType: "Napkins",
      customMessage: "Two extra napkins",
      requestedAt: new Date("2026-07-27T18:00:00.000Z"),
    });

    const assignment = assignMockPosRequest(request.id, "Hannah", request.version);
    expect(assignment.ok).toBe(true);
    if (!assignment.ok) return;

    const completion = updateMockPosRequestStatus(
      request.id,
      "done",
      assignment.request.version,
      "Hannah",
    );
    expect(completion.ok).toBe(true);

    const persisted = listMockPosRequests()[0];
    expect(persisted.assignedTo).toBe("Hannah");
    expect(persisted.status).toBe("done");
    expect(persisted.completedAt).not.toBeNull();
    expect(persisted.version).toBe(3);
    expect(listMockPosRequestEvents(request.id).map((event) => event.eventType)).toEqual([
      "created",
      "assigned",
      "status_changed",
    ]);
  });

  it("rejects an update made from a stale queue snapshot", () => {
    const request = addMockPosRequest({
      tableId: "4",
      requestType: "Refill",
      customMessage: "",
      requestedAt: new Date("2026-07-27T18:05:00.000Z"),
    });

    expect(assignMockPosRequest(request.id, "Savannah", request.version).ok).toBe(true);
    expect(updateMockPosRequestStatus(request.id, "done", request.version)).toEqual({
      ok: false,
      reason: "conflict",
    });
  });
});

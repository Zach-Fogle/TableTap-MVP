import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { TableRequestEvent } from "@/lib/table-request";

export type PosRequestStatus = "new" | "seen" | "in_progress" | "done";

export type PosRequest = {
  id: string;
  tableId: string;
  requestType: string;
  customMessage: string;
  requestedAt: string;
  status: PosRequestStatus;
  assignedTo: string | null;
  assignedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
  version: number;
};

export type PosTable = {
  id: string;
  name: string;
  status: "open" | "needs_attention" | "check_requested" | "clear";
  requests: PosRequest[];
};

export type PosRequestEvent = {
  id: number;
  requestId: string;
  eventType: "created" | "status_changed" | "assigned" | "reassigned";
  actor: string | null;
  previousValue: string | null;
  newValue: string | null;
  occurredAt: string;
};

type RequestRow = {
  id: string;
  table_id: string;
  request_type: string;
  custom_message: string;
  requested_at: string;
  status: PosRequestStatus;
  assigned_to: string | null;
  assigned_at: string | null;
  completed_at: string | null;
  updated_at: string;
  version: number;
};

export type UpdateResult =
  | { ok: true; request: PosRequest }
  | { ok: false; reason: "not_found" | "conflict" };

const INITIAL_TABLE_IDS = Array.from({ length: 16 }, (_, index) => String(index + 1));

function databasePath() {
  return process.env.TABLETAP_DB_PATH || join(process.cwd(), ".data", "tabletap.db");
}

function openDatabase() {
  const path = databasePath();
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const database = new DatabaseSync(path);
  database.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  database.exec(`
    CREATE TABLE IF NOT EXISTS pos_requests (
      id TEXT PRIMARY KEY,
      table_id TEXT NOT NULL,
      request_type TEXT NOT NULL,
      custom_message TEXT NOT NULL DEFAULT '',
      requested_at TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('new', 'seen', 'in_progress', 'done')),
      assigned_to TEXT,
      assigned_at TEXT,
      completed_at TEXT,
      updated_at TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS pos_request_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      actor TEXT,
      previous_value TEXT,
      new_value TEXT,
      occurred_at TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES pos_requests(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_pos_requests_table ON pos_requests(table_id);
    CREATE INDEX IF NOT EXISTS idx_pos_requests_status ON pos_requests(status);
    CREATE INDEX IF NOT EXISTS idx_pos_request_events_request ON pos_request_events(request_id);
  `);
  return database;
}

function mapRequest(row: RequestRow): PosRequest {
  return {
    id: row.id,
    tableId: row.table_id,
    requestType: row.request_type,
    customMessage: row.custom_message,
    requestedAt: row.requested_at,
    status: row.status,
    assignedTo: row.assigned_to,
    assignedAt: row.assigned_at,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
    version: row.version,
  };
}

function createRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getTableStatus(requests: PosRequest[]): PosTable["status"] {
  if (requests.some((request) => request.status !== "done")) {
    if (requests.some((request) => request.status !== "done" && request.requestType === "Check Please")) {
      return "check_requested";
    }
    return "needs_attention";
  }
  return requests.length > 0 ? "clear" : "open";
}

function findRequest(database: DatabaseSync, requestId: string) {
  const row = database.prepare("SELECT * FROM pos_requests WHERE id = ?").get(requestId) as RequestRow | undefined;
  return row ? mapRequest(row) : null;
}

export function addMockPosRequest(event: TableRequestEvent) {
  const database = openDatabase();
  try {
    const now = event.requestedAt.toISOString();
    const request: PosRequest = {
      id: createRequestId(), tableId: event.tableId, requestType: event.requestType,
      customMessage: event.customMessage, requestedAt: now, status: "new",
      assignedTo: null, assignedAt: null, completedAt: null, updatedAt: now, version: 1,
    };
    database.exec("BEGIN IMMEDIATE");
    database.prepare(`INSERT INTO pos_requests
      (id, table_id, request_type, custom_message, requested_at, status, updated_at, version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(request.id, request.tableId, request.requestType, request.customMessage,
        request.requestedAt, request.status, request.updatedAt, request.version);
    database.prepare(`INSERT INTO pos_request_events
      (request_id, event_type, new_value, occurred_at) VALUES (?, 'created', ?, ?)`)
      .run(request.id, request.status, now);
    database.exec("COMMIT");
    return request;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  } finally {
    database.close();
  }
}

export function listMockPosRequests() {
  const database = openDatabase();
  try {
    const rows = database.prepare("SELECT * FROM pos_requests ORDER BY requested_at DESC").all() as RequestRow[];
    return rows.map(mapRequest);
  } finally { database.close(); }
}

export function listMockPosTables() {
  const requests = listMockPosRequests();
  const tableIds = new Set([...INITIAL_TABLE_IDS, ...requests.map((request) => request.tableId)]);
  return [...tableIds].sort((a, b) => Number(a) - Number(b)).map((tableId) => {
    const tableRequests = requests.filter((request) => request.tableId === tableId);
    return { id: tableId, name: `Table ${tableId}`, status: getTableStatus(tableRequests), requests: tableRequests };
  });
}

export function getMockPosTable(tableId: string) {
  return listMockPosTables().find((table) => table.id === tableId) || null;
}

export function updateMockPosRequestStatus(
  requestId: string, status: PosRequestStatus, expectedVersion?: number, actor?: string,
): UpdateResult {
  const database = openDatabase();
  try {
    const current = findRequest(database, requestId);
    if (!current) return { ok: false, reason: "not_found" };
    if (expectedVersion !== undefined && current.version !== expectedVersion) return { ok: false, reason: "conflict" };
    const now = new Date().toISOString();
    const completedAt = status === "done" ? now : null;
    const result = database.prepare(`UPDATE pos_requests
      SET status = ?, completed_at = ?, updated_at = ?, version = version + 1
      WHERE id = ? AND version = ?`).run(status, completedAt, now, requestId, current.version);
    if (result.changes !== 1) return { ok: false, reason: "conflict" };
    database.prepare(`INSERT INTO pos_request_events
      (request_id, event_type, actor, previous_value, new_value, occurred_at)
      VALUES (?, 'status_changed', ?, ?, ?, ?)`)
      .run(requestId, actor || null, current.status, status, now);
    return { ok: true, request: findRequest(database, requestId)! };
  } finally { database.close(); }
}

export function assignMockPosRequest(requestId: string, assignee: string, expectedVersion?: number): UpdateResult {
  const database = openDatabase();
  try {
    const current = findRequest(database, requestId);
    if (!current) return { ok: false, reason: "not_found" };
    if (expectedVersion !== undefined && current.version !== expectedVersion) return { ok: false, reason: "conflict" };
    const now = new Date().toISOString();
    const result = database.prepare(`UPDATE pos_requests
      SET assigned_to = ?, assigned_at = ?, updated_at = ?, version = version + 1
      WHERE id = ? AND version = ?`).run(assignee, now, now, requestId, current.version);
    if (result.changes !== 1) return { ok: false, reason: "conflict" };
    database.prepare(`INSERT INTO pos_request_events
      (request_id, event_type, actor, previous_value, new_value, occurred_at)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run(requestId, current.assignedTo ? "reassigned" : "assigned",
        assignee, current.assignedTo, assignee, now);
    return { ok: true, request: findRequest(database, requestId)! };
  } finally { database.close(); }
}

export function listMockPosRequestEvents(requestId: string) {
  const database = openDatabase();
  try {
    return database.prepare(`SELECT id, request_id AS requestId, event_type AS eventType,
      actor, previous_value AS previousValue, new_value AS newValue,
      occurred_at AS occurredAt FROM pos_request_events
      WHERE request_id = ? ORDER BY id ASC`).all(requestId) as PosRequestEvent[];
  } finally { database.close(); }
}

export function isValidPosStatus(status: unknown): status is PosRequestStatus {
  return status === "new" || status === "seen" || status === "in_progress" || status === "done";
}

export function isValidAssignee(assignee: unknown): assignee is string {
  return typeof assignee === "string" && assignee.trim().length >= 1 && assignee.trim().length <= 80;
}

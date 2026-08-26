import type { TableRequestEvent } from "@/lib/table-request";

export type PosRequestStatus = "new" | "seen" | "in_progress" | "done";

export type PosRequest = {
  id: string;
  tableId: string;
  requestType: string;
  customMessage: string;
  requestedAt: string;
  status: PosRequestStatus;
};

export type PosTable = {
  id: string;
  name: string;
  status: "open" | "needs_attention" | "check_requested" | "clear";
  requests: PosRequest[];
};

type MockPosState = {
  requests: PosRequest[];
};

declare global {
  var tableTapMockPosState: MockPosState | undefined;
}

const INITIAL_TABLE_IDS = Array.from({ length: 16 }, (_, index) =>
  String(index + 1),
);

function getState() {
  globalThis.tableTapMockPosState ??= { requests: [] };
  return globalThis.tableTapMockPosState;
}

function createRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getTableStatus(requests: PosRequest[]): PosTable["status"] {
  if (requests.some((request) => request.status !== "done")) {
    if (
      requests.some(
        (request) =>
          request.status !== "done" && request.requestType === "Check Please",
      )
    ) {
      return "check_requested";
    }

    return "needs_attention";
  }

  if (requests.length > 0) {
    return "clear";
  }

  return "open";
}

export function addMockPosRequest(event: TableRequestEvent) {
  const request: PosRequest = {
    id: createRequestId(),
    tableId: event.tableId,
    requestType: event.requestType,
    customMessage: event.customMessage,
    requestedAt: event.requestedAt.toISOString(),
    status: "new",
  };

  getState().requests.unshift(request);

  return request;
}

export function listMockPosRequests() {
  return [...getState().requests];
}

export function listMockPosTables() {
  const requests = listMockPosRequests();
  const tableIds = new Set([
    ...INITIAL_TABLE_IDS,
    ...requests.map((request) => request.tableId),
  ]);

  return [...tableIds].sort((a, b) => Number(a) - Number(b)).map((tableId) => {
    const tableRequests = requests.filter(
      (request) => request.tableId === tableId,
    );

    return {
      id: tableId,
      name: `Table ${tableId}`,
      status: getTableStatus(tableRequests),
      requests: tableRequests,
    };
  });
}

export function getMockPosTable(tableId: string) {
  return listMockPosTables().find((table) => table.id === tableId) || null;
}

export function updateMockPosRequestStatus(
  requestId: string,
  status: PosRequestStatus,
) {
  const request = getState().requests.find((item) => item.id === requestId);

  if (!request) {
    return null;
  }

  request.status = status;

  return request;
}

export function isValidPosStatus(status: unknown): status is PosRequestStatus {
  return (
    status === "new" ||
    status === "seen" ||
    status === "in_progress" ||
    status === "done"
  );
}

const ALLOWED_REQUEST_TYPES = new Set([
  "Refill",
  "Extra Sauce",
  "Napkins",
  "Plates",
  "Check Please",
  "Custom Request",
]);

export type RequestPayload = {
  tableId?: unknown;
  requestType?: unknown;
  customMessage?: unknown;
};

export type ValidatedTableRequest = {
  tableId: string;
  requestType: string;
  customMessage: string;
};

export type TableRequestEvent = ValidatedTableRequest & {
  requestedAt: Date;
};

export function validateTableRequest(payload: RequestPayload) {
  const tableId =
    typeof payload.tableId === "string" ? payload.tableId.trim() : "";
  const requestType =
    typeof payload.requestType === "string" ? payload.requestType.trim() : "";
  const customMessage =
    typeof payload.customMessage === "string"
      ? payload.customMessage.trim()
      : "";

  if (!/^[A-Za-z0-9-]{1,20}$/.test(tableId)) {
    return { error: "A valid table ID is required." } as const;
  }

  if (!ALLOWED_REQUEST_TYPES.has(requestType)) {
    return { error: "A valid request type is required." } as const;
  }

  if (customMessage.length > 500) {
    return { error: "The custom message is too long." } as const;
  }

  if (requestType === "Custom Request" && !customMessage) {
    return { error: "A custom message is required." } as const;
  }

  return { tableId, requestType, customMessage } as const;
}

export function formatRequestTime(date: Date) {
  const timeZone = process.env.RESTAURANT_TIME_ZONE || "America/New_York";

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    console.error(
      `Invalid RESTAURANT_TIME_ZONE "${timeZone}". Falling back to UTC.`,
    );

    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
}

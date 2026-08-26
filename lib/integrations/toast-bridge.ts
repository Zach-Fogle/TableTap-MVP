import type { RequestIntegration } from "@/lib/integrations/types";

function getToastBridgeHeaders(): Record<string, string> {
  const secret = process.env.TOAST_BRIDGE_SECRET;

  if (!secret) {
    return {};
  }

  return {
    Authorization: `Bearer ${secret}`,
  };
}

export function createToastBridgeIntegration(): RequestIntegration {
  return {
    name: "toast-bridge",
    required: process.env.TOAST_INTEGRATION_REQUIRED === "true",
    isConfigured() {
      return Boolean(process.env.TOAST_BRIDGE_WEBHOOK_URL);
    },
    async send(event) {
      const webhookUrl = process.env.TOAST_BRIDGE_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error("TOAST_BRIDGE_WEBHOOK_URL is not configured.");
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getToastBridgeHeaders(),
        },
        body: JSON.stringify({
          source: "tabletap",
          provider: "toast",
          restaurantExternalId:
            process.env.TOAST_RESTAURANT_EXTERNAL_ID || null,
          locationName: process.env.TOAST_LOCATION_NAME || null,
          tableId: event.tableId,
          requestType: event.requestType,
          customMessage: event.customMessage,
          requestedAt: event.requestedAt.toISOString(),
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Toast bridge webhook failed.", {
          status: response.status,
          response: responseText.slice(0, 300),
        });

        throw new Error("Toast bridge delivery failed.");
      }
    },
  };
}

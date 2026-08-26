import type { RequestIntegration } from "@/lib/integrations/types";

function getAuthHeaders(): Record<string, string> {
  const secret = process.env.POS_WEBHOOK_SECRET;

  if (!secret) {
    return {};
  }

  return {
    Authorization: `Bearer ${secret}`,
  };
}

export function createPosWebhookIntegration(): RequestIntegration {
  return {
    name: "pos-webhook",
    isConfigured() {
      return Boolean(process.env.POS_WEBHOOK_URL);
    },
    async send(event) {
      const webhookUrl = process.env.POS_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error("POS_WEBHOOK_URL is not configured.");
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          source: "tabletap",
          tableId: event.tableId,
          requestType: event.requestType,
          customMessage: event.customMessage,
          requestedAt: event.requestedAt.toISOString(),
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error("POS webhook failed.", {
          status: response.status,
          response: responseText.slice(0, 300),
        });

        throw new Error("POS webhook delivery failed.");
      }
    },
  };
}

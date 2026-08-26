import { createDiscordIntegration } from "@/lib/integrations/discord";
import { createMockPosIntegration } from "@/lib/integrations/mock-pos";
import { createPosWebhookIntegration } from "@/lib/integrations/pos-webhook";
import { createToastBridgeIntegration } from "@/lib/integrations/toast-bridge";
import type { DeliveryResult } from "@/lib/integrations/types";
import type { TableRequestEvent } from "@/lib/table-request";

function getIntegrations() {
  return [
    createMockPosIntegration(),
    createDiscordIntegration(),
    createToastBridgeIntegration(),
    createPosWebhookIntegration(),
  ];
}

export async function sendTableRequest(event: TableRequestEvent) {
  const integrations = getIntegrations();
  const activeIntegrations = integrations.filter((integration) =>
    integration.isConfigured(),
  );

  if (activeIntegrations.length === 0) {
    console.error("No request integrations are configured.");
    throw new Error("No request integrations are configured.");
  }

  const results: DeliveryResult[] = [];

  for (const integration of activeIntegrations) {
    try {
      await integration.send(event);
      results.push({
        channel: integration.name,
        delivered: true,
      });
    } catch (error) {
      console.error(`${integration.name} integration failed.`, error);

      results.push({
        channel: integration.name,
        delivered: false,
      });
    }
  }

  if (!results.some((result) => result.delivered)) {
    console.error("All request integrations failed.");
    throw new Error("All request integrations failed.");
  }

  return results;
}

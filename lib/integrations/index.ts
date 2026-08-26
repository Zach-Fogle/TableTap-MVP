import { createDiscordIntegration } from "@/lib/integrations/discord";
import { createMockPosIntegration } from "@/lib/integrations/mock-pos";
import { createPosWebhookIntegration } from "@/lib/integrations/pos-webhook";
import { createToastBridgeIntegration } from "@/lib/integrations/toast-bridge";
import type { DeliveryResult } from "@/lib/integrations/types";
import type { TableRequestEvent } from "@/lib/table-request";

const integrations = [
  createMockPosIntegration(),
  createDiscordIntegration(),
  createToastBridgeIntegration(),
  createPosWebhookIntegration(),
];

export async function sendTableRequest(event: TableRequestEvent) {
  const activeIntegrations = integrations.filter((integration) =>
    integration.isConfigured(),
  );

  const missingRequired = integrations.filter(
    (integration) => integration.required && !integration.isConfigured(),
  );

  if (missingRequired.length > 0) {
    missingRequired.forEach((integration) => {
      console.error(`${integration.name} integration is not configured.`);
    });

    throw new Error("A required request integration is not configured.");
  }

  const results: DeliveryResult[] = [];

  for (const integration of activeIntegrations) {
    try {
      await integration.send(event);
      results.push({
        channel: integration.name,
        delivered: true,
        required: integration.required,
      });
    } catch (error) {
      console.error(`${integration.name} integration failed.`, error);

      if (integration.required) {
        throw error;
      }

      results.push({
        channel: integration.name,
        delivered: false,
        required: integration.required,
      });
    }
  }

  return results;
}

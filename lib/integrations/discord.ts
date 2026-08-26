import type { RequestIntegration } from "@/lib/integrations/types";
import { formatRequestTime } from "@/lib/table-request";

function escapeDiscordMarkdown(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/([*_~`>|])/g, "\\$1")
    .replace(/@/g, "@\u200b");
}

export function createDiscordIntegration(): RequestIntegration {
  return {
    name: "discord",
    required: true,
    isConfigured() {
      return Boolean(process.env.DISCORD_WEBHOOK_URL);
    },
    async send(event) {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error("DISCORD_WEBHOOK_URL is not configured.");
      }

      const table = escapeDiscordMarkdown(event.tableId);
      const requestType = escapeDiscordMarkdown(event.requestType);
      const note = event.customMessage
        ? `\nNote: ${escapeDiscordMarkdown(event.customMessage)}`
        : "";
      const content = [
        "🚨 **New Table Request**",
        "",
        `**Table:** ${table}`,
        `**Request:** ${requestType}${note}`,
        `**Time:** ${formatRequestTime(event.requestedAt)}`,
      ].join("\n");

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          allowed_mentions: { parse: [] },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Discord webhook failed.", {
          status: response.status,
          response: responseText.slice(0, 300),
        });

        throw new Error("Discord webhook delivery failed.");
      }
    },
  };
}

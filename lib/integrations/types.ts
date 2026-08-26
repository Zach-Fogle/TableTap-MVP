import type { TableRequestEvent } from "@/lib/table-request";

export type DeliveryResult = {
  channel: string;
  delivered: boolean;
};

export type RequestIntegration = {
  name: string;
  isConfigured(): boolean;
  send(event: TableRequestEvent): Promise<void>;
};

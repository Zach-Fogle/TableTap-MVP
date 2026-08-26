import type { TableRequestEvent } from "@/lib/table-request";

export type DeliveryResult = {
  channel: string;
  delivered: boolean;
  required: boolean;
};

export type RequestIntegration = {
  name: string;
  required: boolean;
  isConfigured(): boolean;
  send(event: TableRequestEvent): Promise<void>;
};

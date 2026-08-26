import type { RequestIntegration } from "@/lib/integrations/types";
import { addMockPosRequest } from "@/lib/mock-pos-store";

export function createMockPosIntegration(): RequestIntegration {
  return {
    name: "mock-pos",
    isConfigured() {
      return process.env.MOCK_POS_ENABLED !== "false";
    },
    async send(event) {
      addMockPosRequest(event);
    },
  };
}

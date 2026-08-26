import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

function createRequest(body: unknown) {
  return new Request("http://localhost/api/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/request", () => {
  beforeEach(() => {
    process.env.DISCORD_WEBHOOK_URL =
      "https://discord.com/api/webhooks/test/token";
    process.env.RESTAURANT_TIME_ZONE = "America/New_York";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.DISCORD_WEBHOOK_URL;
    delete process.env.RESTAURANT_TIME_ZONE;
    delete process.env.POS_WEBHOOK_URL;
    delete process.env.POS_WEBHOOK_SECRET;
    delete process.env.POS_INTEGRATION_REQUIRED;
  });

  it("forwards a valid request to Discord", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    const response = await POST(
      createRequest({
        tableId: "7",
        requestType: "Refill",
        customMessage: "No ice",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      deliveries: [{ channel: "discord", delivered: true, required: true }],
    });
    expect(fetchMock).toHaveBeenCalledOnce();

    const [, options] = fetchMock.mock.calls[0];
    const discordBody = JSON.parse(String(options?.body));

    expect(discordBody.content).toContain("**Table:** 7");
    expect(discordBody.content).toContain("**Request:** Refill");
    expect(discordBody.content).toContain("Note: No ice");
    expect(discordBody.allowed_mentions).toEqual({ parse: [] });
  });

  it("rejects an invalid request type", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await POST(
      createRequest({
        tableId: "7",
        requestType: "Secret menu",
        customMessage: "",
      }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a gateway error when Discord rejects the webhook", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Invalid webhook", { status: 404 }),
    );
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(
      createRequest({
        tableId: "12",
        requestType: "Check Please",
        customMessage: "",
      }),
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "The request could not be delivered.",
    });
  });

  it("also forwards to an optional POS webhook when configured", async () => {
    process.env.POS_WEBHOOK_URL = "https://pos.example.com/table-requests";
    process.env.POS_WEBHOOK_SECRET = "test-secret";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    const response = await POST(
      createRequest({
        tableId: "patio-3",
        requestType: "Napkins",
        customMessage: "",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      deliveries: [
        { channel: "discord", delivered: true, required: true },
        { channel: "pos-webhook", delivered: true, required: false },
      ],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [posUrl, posOptions] = fetchMock.mock.calls[1];
    const posBody = JSON.parse(String(posOptions?.body));

    expect(posUrl).toBe("https://pos.example.com/table-requests");
    expect(posOptions?.headers).toMatchObject({
      Authorization: "Bearer test-secret",
      "Content-Type": "application/json",
    });
    expect(posBody).toMatchObject({
      source: "tabletap",
      tableId: "patio-3",
      requestType: "Napkins",
      customMessage: "",
    });
    expect(posBody.requestedAt).toEqual(expect.any(String));
  });
});

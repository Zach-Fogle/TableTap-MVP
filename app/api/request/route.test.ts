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
    delete process.env.MOCK_POS_ENABLED;
    delete process.env.POS_WEBHOOK_URL;
    delete process.env.POS_WEBHOOK_SECRET;
    delete process.env.TOAST_BRIDGE_WEBHOOK_URL;
    delete process.env.TOAST_BRIDGE_SECRET;
    delete process.env.TOAST_RESTAURANT_EXTERNAL_ID;
    delete process.env.TOAST_LOCATION_NAME;
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
      deliveries: [
        { channel: "mock-pos", delivered: true },
        { channel: "discord", delivered: true },
      ],
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

  it("succeeds with mock POS when Discord is not configured", async () => {
    process.env.DISCORD_WEBHOOK_URL =
      "https://discord.com/api/webhooks/your-webhook-id/your-webhook-token";
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await POST(
      createRequest({
        tableId: "12",
        requestType: "Check Please",
        customMessage: "",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      deliveries: [{ channel: "mock-pos", delivered: true }],
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("still succeeds when an optional Discord webhook fails", async () => {
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

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      deliveries: [
        { channel: "mock-pos", delivered: true },
        { channel: "discord", delivered: false },
      ],
    });
  });

  it("returns a gateway error when no output receives the request", async () => {
    process.env.MOCK_POS_ENABLED = "false";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Invalid webhook", { status: 404 }),
    );
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(
      createRequest({
        tableId: "8",
        requestType: "Plates",
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
        { channel: "mock-pos", delivered: true },
        { channel: "discord", delivered: true },
        { channel: "pos-webhook", delivered: true },
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

  it("also forwards to a Toast bridge when configured", async () => {
    process.env.TOAST_BRIDGE_WEBHOOK_URL =
      "https://toast-bridge.example.com/tabletap";
    process.env.TOAST_BRIDGE_SECRET = "toast-secret";
    process.env.TOAST_RESTAURANT_EXTERNAL_ID =
      "00000000-0000-0000-0000-000000000001";
    process.env.TOAST_LOCATION_NAME = "Downtown";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    const response = await POST(
      createRequest({
        tableId: "bar-4",
        requestType: "Check Please",
        customMessage: "",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      deliveries: [
        { channel: "mock-pos", delivered: true },
        { channel: "discord", delivered: true },
        { channel: "toast-bridge", delivered: true },
      ],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [toastUrl, toastOptions] = fetchMock.mock.calls[1];
    const toastBody = JSON.parse(String(toastOptions?.body));

    expect(toastUrl).toBe("https://toast-bridge.example.com/tabletap");
    expect(toastOptions?.headers).toMatchObject({
      Authorization: "Bearer toast-secret",
      "Content-Type": "application/json",
    });
    expect(toastBody).toMatchObject({
      source: "tabletap",
      provider: "toast",
      restaurantExternalId: "00000000-0000-0000-0000-000000000001",
      locationName: "Downtown",
      tableId: "bar-4",
      requestType: "Check Please",
      customMessage: "",
    });
    expect(toastBody.requestedAt).toEqual(expect.any(String));
  });
});

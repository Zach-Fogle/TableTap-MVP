import { NextResponse } from "next/server";
import { sendTableRequest } from "@/lib/integrations";
import {
  type RequestPayload,
  validateTableRequest,
} from "@/lib/table-request";

export async function POST(request: Request) {
  let payload: RequestPayload;

  try {
    payload = (await request.json()) as RequestPayload;
  } catch {
    return NextResponse.json(
      { error: "The request body must be valid JSON." },
      { status: 400 },
    );
  }

  const validated = validateTableRequest(payload);

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const deliveries = await sendTableRequest({
      ...validated,
      requestedAt: new Date(),
    });

    return NextResponse.json({ success: true, deliveries }, { status: 200 });
  } catch (error) {
    console.error("Table request delivery failed.", error);
    return NextResponse.json(
      { error: "The request could not be delivered." },
      { status: 502 },
    );
  }
}

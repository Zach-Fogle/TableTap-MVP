import { NextResponse } from "next/server";
import {
  isValidPosStatus,
  updateMockPosRequestStatus,
} from "@/lib/mock-pos-store";

type RequestStatusRouteProps = {
  params: Promise<{ requestId: string }>;
};

export async function PATCH(request: Request, { params }: RequestStatusRouteProps) {
  const { requestId } = await params;
  const payload = (await request.json()) as { status?: unknown };

  if (!isValidPosStatus(payload.status)) {
    return NextResponse.json(
      { error: "A valid request status is required." },
      { status: 400 },
    );
  }

  const updatedRequest = updateMockPosRequestStatus(requestId, payload.status);

  if (!updatedRequest) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  return NextResponse.json({ request: updatedRequest });
}

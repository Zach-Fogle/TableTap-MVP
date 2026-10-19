import { NextResponse } from "next/server";
import {
  assignMockPosRequest,
  isValidAssignee,
  isValidPosStatus,
  updateMockPosRequestStatus,
} from "@/lib/mock-pos-store";
import { getRequestStaffSession } from "@/lib/staff-auth";

type RequestStatusRouteProps = {
  params: Promise<{ requestId: string }>;
};

export async function PATCH(request: Request, { params }: RequestStatusRouteProps) {
  const { requestId } = await params;
  const session = getRequestStaffSession(request);
  if (!session) {
    return NextResponse.json({ error: "Staff sign-in required." }, { status: 401 });
  }
  const payload = (await request.json()) as {
    status?: unknown;
    assignee?: unknown;
    expectedVersion?: unknown;
    actor?: unknown;
  };
  const expectedVersion =
    typeof payload.expectedVersion === "number"
      ? payload.expectedVersion
      : undefined;

  if (payload.assignee !== undefined) {
    if (!isValidAssignee(payload.assignee)) {
      return NextResponse.json(
        { error: "An assignee between 1 and 80 characters is required." },
        { status: 400 },
      );
    }

    const result = assignMockPosRequest(
      requestId,
      payload.assignee.trim(),
      expectedVersion,
      session.restaurantId,
    );

    if (!result.ok) {
      return NextResponse.json(
        {
          error:
            result.reason === "conflict"
              ? "Request changed. Refresh and try again."
              : "Request not found.",
        },
        { status: result.reason === "conflict" ? 409 : 404 },
      );
    }

    return NextResponse.json({ request: result.request });
  }

  if (!isValidPosStatus(payload.status)) {
    return NextResponse.json(
      { error: "A valid request status is required." },
      { status: 400 },
    );
  }

  const result = updateMockPosRequestStatus(
    requestId,
    payload.status,
    expectedVersion,
    session.staffName,
    session.restaurantId,
  );

  if (!result.ok) {
    return NextResponse.json(
      {
        error:
          result.reason === "conflict"
            ? "Request changed. Refresh and try again."
            : "Request not found.",
      },
      { status: result.reason === "conflict" ? 409 : 404 },
    );
  }

  return NextResponse.json({ request: result.request });
}

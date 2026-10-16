import { NextResponse } from "next/server";
import {
  listMockPosRequests,
  listMockPosTables,
} from "@/lib/mock-pos-store";
import { getRequestStaffSession } from "@/lib/staff-auth";

export async function GET(request: Request) {
  const session = getRequestStaffSession(request);
  if (!session) {
    return NextResponse.json({ error: "Staff sign-in required." }, { status: 401 });
  }
  return NextResponse.json({
    requests: listMockPosRequests(session.restaurantId),
    tables: listMockPosTables(session.restaurantId),
    staff: session,
  });
}

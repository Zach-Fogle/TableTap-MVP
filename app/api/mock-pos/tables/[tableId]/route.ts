import { NextResponse } from "next/server";
import { getMockPosTable } from "@/lib/mock-pos-store";
import { getRequestStaffSession } from "@/lib/staff-auth";

type TableRouteProps = {
  params: Promise<{ tableId: string }>;
};

export async function GET(request: Request, { params }: TableRouteProps) {
  const session = getRequestStaffSession(request);
  if (!session) {
    return NextResponse.json({ error: "Staff sign-in required." }, { status: 401 });
  }
  const { tableId } = await params;
  const table = getMockPosTable(tableId, session.restaurantId);

  if (!table) {
    return NextResponse.json({ error: "Table not found." }, { status: 404 });
  }

  return NextResponse.json({ table });
}

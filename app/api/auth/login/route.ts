import { NextResponse } from "next/server";
import {
  createStaffSessionToken,
  isValidStaffPin,
  STAFF_SESSION_COOKIE,
  staffSessionCookieOptions,
} from "@/lib/staff-auth";

export async function POST(request: Request) {
  const payload = (await request.json()) as { staffName?: unknown; pin?: unknown };
  const staffName = typeof payload.staffName === "string" ? payload.staffName.trim() : "";
  if (staffName.length < 1 || staffName.length > 80) {
    return NextResponse.json({ error: "Enter a staff name." }, { status: 400 });
  }
  try {
    if (!isValidStaffPin(payload.pin)) {
      return NextResponse.json({ error: "The staff PIN is incorrect." }, { status: 401 });
    }
    const response = NextResponse.json({ success: true });
    response.cookies.set(STAFF_SESSION_COOKIE, createStaffSessionToken(staffName), staffSessionCookieOptions);
    return response;
  } catch (error) {
    console.error("Staff authentication is not configured.", error);
    return NextResponse.json({ error: "Staff authentication is not configured." }, { status: 503 });
  }
}

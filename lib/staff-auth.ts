import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const STAFF_SESSION_COOKIE = "tabletap_staff_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

export type StaffSession = {
  staffName: string;
  restaurantId: string;
  expiresAt: number;
};

function authSecret() {
  const secret = process.env.TABLETAP_AUTH_SECRET || "";
  if (secret.length < 32) throw new Error("TABLETAP_AUTH_SECRET must contain at least 32 characters.");
  return secret;
}

function configuredPin() {
  const pin = process.env.TABLETAP_STAFF_PIN || "";
  if (pin.length < 4) throw new Error("TABLETAP_STAFF_PIN must contain at least 4 characters.");
  return pin;
}

function signature(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isValidStaffPin(value: unknown) {
  return typeof value === "string" && safeEqual(value, configuredPin());
}

export function createStaffSessionToken(staffName: string) {
  const session: StaffSession = {
    staffName,
    restaurantId: process.env.TABLETAP_RESTAURANT_ID || "demo-restaurant",
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifyStaffSessionToken(token: string | undefined | null) {
  if (!token) return null;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature || !safeEqual(suppliedSignature, signature(payload))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as StaffSession;
    if (
      typeof session.staffName !== "string" ||
      typeof session.restaurantId !== "string" ||
      typeof session.expiresAt !== "number" ||
      session.expiresAt <= Date.now()
    ) return null;
    return session;
  } catch {
    return null;
  }
}

function cookieValue(request: Request) {
  const header = request.headers.get("cookie") || "";
  return header.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${STAFF_SESSION_COOKIE}=`))
    ?.slice(STAFF_SESSION_COOKIE.length + 1);
}

export function getRequestStaffSession(request: Request) {
  return verifyStaffSessionToken(cookieValue(request));
}

export async function getCurrentStaffSession() {
  const cookieStore = await cookies();
  return verifyStaffSessionToken(cookieStore.get(STAFF_SESSION_COOKIE)?.value);
}

export const staffSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: SESSION_DURATION_SECONDS,
  path: "/",
};

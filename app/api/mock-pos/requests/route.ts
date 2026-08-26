import { NextResponse } from "next/server";
import {
  listMockPosRequests,
  listMockPosTables,
} from "@/lib/mock-pos-store";

export async function GET() {
  return NextResponse.json({
    requests: listMockPosRequests(),
    tables: listMockPosTables(),
  });
}

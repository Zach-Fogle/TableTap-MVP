import { NextResponse } from "next/server";
import { getMockPosTable } from "@/lib/mock-pos-store";

type TableRouteProps = {
  params: Promise<{ tableId: string }>;
};

export async function GET(_request: Request, { params }: TableRouteProps) {
  const { tableId } = await params;
  const table = getMockPosTable(tableId);

  if (!table) {
    return NextResponse.json({ error: "Table not found." }, { status: 404 });
  }

  return NextResponse.json({ table });
}

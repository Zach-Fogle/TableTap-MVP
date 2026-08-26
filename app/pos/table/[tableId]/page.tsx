import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PosTableDetail from "@/components/pos-table-detail";

type PosTablePageProps = {
  params: Promise<{ tableId: string }>;
};

function isValidTableId(tableId: string) {
  return /^[A-Za-z0-9-]{1,20}$/.test(tableId);
}

export async function generateMetadata({
  params,
}: PosTablePageProps): Promise<Metadata> {
  const { tableId } = await params;

  return {
    title: `POS Table ${tableId}`,
    description: `Mock POS detail for Table ${tableId}.`,
  };
}

export default async function PosTablePage({ params }: PosTablePageProps) {
  const { tableId } = await params;

  if (!isValidTableId(tableId)) {
    notFound();
  }

  return <PosTableDetail tableId={tableId} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RequestPanel from "@/components/request-panel";

type TablePageProps = {
  params: Promise<{ tableId: string }>;
};

function isValidTableId(tableId: string) {
  return /^[A-Za-z0-9-]{1,20}$/.test(tableId);
}

export async function generateMetadata({
  params,
}: TablePageProps): Promise<Metadata> {
  const { tableId } = await params;

  return {
    title: `Table ${tableId}`,
    description: `Request service for table ${tableId}.`,
  };
}

export default async function TablePage({ params }: TablePageProps) {
  const { tableId } = await params;

  if (!isValidTableId(tableId)) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-10">
      <RequestPanel tableId={tableId} />
    </main>
  );
}

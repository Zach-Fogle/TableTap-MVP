import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PosDashboard from "@/components/pos-dashboard";
import { getCurrentStaffSession } from "@/lib/staff-auth";

export const metadata: Metadata = {
  title: "POS Demo",
  description: "A Toast-style TableTap request dashboard.",
};

export default async function PosPage() {
  const session = await getCurrentStaffSession();
  if (!session) redirect("/pos/login");
  return <PosDashboard staffName={session.staffName} />;
}

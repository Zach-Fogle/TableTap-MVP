import type { Metadata } from "next";
import PosDashboard from "@/components/pos-dashboard";

export const metadata: Metadata = {
  title: "POS Demo",
  description: "A Toast-style TableTap request dashboard.",
};

export default function PosPage() {
  return <PosDashboard />;
}

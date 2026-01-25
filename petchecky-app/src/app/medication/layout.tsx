import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("medication");

export default function MedicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("vetRecords");

export default function VetRecordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

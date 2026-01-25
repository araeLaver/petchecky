import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("expense");

export default function ExpenseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

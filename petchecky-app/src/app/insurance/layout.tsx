import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("insurance");

export default function InsuranceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

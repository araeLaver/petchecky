import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("allergy");

export default function AllergyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

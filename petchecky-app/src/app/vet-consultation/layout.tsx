import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("vetConsultation");

export default function VetConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

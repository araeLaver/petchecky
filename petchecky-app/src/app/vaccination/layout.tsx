import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("vaccination");

export default function VaccinationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

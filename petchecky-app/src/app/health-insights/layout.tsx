import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("healthInsights");

export default function HealthInsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

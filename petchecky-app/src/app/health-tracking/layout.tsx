import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("healthTracking");

export default function HealthTrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

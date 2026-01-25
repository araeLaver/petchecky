import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("imageAnalysis");

export default function ImageAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

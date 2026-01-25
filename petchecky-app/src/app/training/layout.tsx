import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("training");

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

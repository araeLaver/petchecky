import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("walk");

export default function WalkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("diet");

export default function DietLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

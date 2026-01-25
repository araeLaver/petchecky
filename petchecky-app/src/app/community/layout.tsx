import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("community");

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

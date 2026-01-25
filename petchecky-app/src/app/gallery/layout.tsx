import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("gallery");

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

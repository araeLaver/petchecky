import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("qrPetId");

export default function QrPetIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

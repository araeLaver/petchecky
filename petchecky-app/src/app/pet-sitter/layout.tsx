import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("petSitter");

export default function PetSitterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

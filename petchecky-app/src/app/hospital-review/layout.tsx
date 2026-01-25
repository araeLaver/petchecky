import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("hospitalReview");

export default function HospitalReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

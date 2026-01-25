import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata("calendar");

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

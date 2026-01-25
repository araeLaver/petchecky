import { Metadata } from "next";
import { PerformanceDashboard } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Performance Dashboard | Admin | 펫체키",
  description: "실시간 성능 모니터링 대시보드",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PerformancePage() {
  return <PerformanceDashboard />;
}

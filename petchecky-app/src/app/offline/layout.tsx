import { Metadata } from "next";

export const metadata: Metadata = {
  title: "오프라인",
  description: "인터넷 연결이 필요합니다. 연결 상태를 확인해주세요.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

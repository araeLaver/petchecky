"use client";

import { useState, useRef } from "react";
import { PetProfile } from "@/app/page";
import { ChatRecord } from "./ChatHistory";

interface HealthReportProps {
  pet: PetProfile;
  records: ChatRecord[];
  onClose: () => void;
}

interface SeverityStats {
  low: number;
  medium: number;
  high: number;
  total: number;
}

export default function HealthReport({ pet, records, onClose }: HealthReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // 해당 펫의 상담 기록만 필터링
  const petRecords = records.filter(r => r.petName === pet.name);

  // 통계 계산
  const stats: SeverityStats = petRecords.reduce(
    (acc, record) => {
      acc.total++;
      if (record.severity === "low") acc.low++;
      else if (record.severity === "medium") acc.medium++;
      else if (record.severity === "high") acc.high++;
      return acc;
    },
    { low: 0, medium: 0, high: 0, total: 0 }
  );

  // 최근 3개월 상담 필터링
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recentRecords = petRecords
    .filter(r => new Date(r.date) >= threeMonthsAgo)
    .slice(0, 10);

  // 월별 통계
  const monthlyStats = petRecords.reduce((acc, record) => {
    const date = new Date(record.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) {
      acc[key] = { low: 0, medium: 0, high: 0, total: 0 };
    }
    acc[key].total++;
    if (record.severity === "low") acc[key].low++;
    else if (record.severity === "medium") acc[key].medium++;
    else if (record.severity === "high") acc[key].high++;
    return acc;
  }, {} as Record<string, SeverityStats>);

  // PDF 생성 (라이브러리 동적 로드)
  const generatePDF = async () => {
    if (!reportRef.current) return;

    setIsGenerating(true);

    try {
      // 라이브러리 동적 임포트 (필요 시에만 로드)
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      // 이미지가 한 페이지를 넘으면 분할
      const scaledHeight = imgHeight * ratio;

      if (scaledHeight <= pdfHeight) {
        pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, scaledHeight);
      } else {
        // 여러 페이지로 분할
        let heightLeft = scaledHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", imgX, position, imgWidth * ratio, scaledHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = -pdfHeight + position;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", imgX, position, imgWidth * ratio, scaledHeight);
          heightLeft -= pdfHeight;
        }
      }

      const fileName = `${pet.name}_건강리포트_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF 생성 오류:", error);
      alert("PDF 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case "high": return { text: "위험", color: "text-red-600", bg: "bg-red-100" };
      case "medium": return { text: "주의", color: "text-yellow-600", bg: "bg-yellow-100" };
      case "low": return { text: "안심", color: "text-green-600", bg: "bg-green-100" };
      default: return { text: "-", color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">건강 리포트</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={generatePDF}
              disabled={isGenerating || petRecords.length === 0}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  생성 중...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF 다운로드
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 리포트 내용 (PDF로 변환될 영역) */}
        <div ref={reportRef} className="p-6 bg-white">
          {/* 타이틀 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-3xl">{pet.species === "dog" ? "🐕" : "🐈"}</span>
              <h1 className="text-2xl font-bold text-gray-800">{pet.name} 건강 리포트</h1>
            </div>
            <p className="text-sm text-gray-500">
              생성일: {new Date().toLocaleDateString("ko-KR")}
            </p>
          </div>

          {/* 펫 정보 카드 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">반려동물 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">이름</p>
                <p className="font-medium text-gray-800">{pet.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">종류</p>
                <p className="font-medium text-gray-800">
                  {pet.species === "dog" ? "강아지" : "고양이"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">품종</p>
                <p className="font-medium text-gray-800">{pet.breed}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">나이</p>
                <p className="font-medium text-gray-800">{pet.age}세</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">체중</p>
                <p className="font-medium text-gray-800">{pet.weight}kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">총 상담 횟수</p>
                <p className="font-medium text-gray-800">{stats.total}회</p>
              </div>
            </div>
          </div>

          {/* 상담 통계 */}
          {stats.total > 0 ? (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">상담 통계</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.low}</p>
                    <p className="text-xs text-green-700">안심</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.total > 0 ? Math.round((stats.low / stats.total) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
                    <p className="text-xs text-yellow-700">주의</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.total > 0 ? Math.round((stats.medium / stats.total) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.high}</p>
                    <p className="text-xs text-red-700">위험</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.total > 0 ? Math.round((stats.high / stats.total) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* 월별 통계 */}
              {Object.keys(monthlyStats).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">월별 상담 현황</h3>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-600">월</th>
                          <th className="px-4 py-2 text-center text-gray-600">총 상담</th>
                          <th className="px-4 py-2 text-center text-green-600">안심</th>
                          <th className="px-4 py-2 text-center text-yellow-600">주의</th>
                          <th className="px-4 py-2 text-center text-red-600">위험</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(monthlyStats)
                          .sort((a, b) => b[0].localeCompare(a[0]))
                          .slice(0, 6)
                          .map(([month, stat]) => (
                            <tr key={month} className="border-t border-gray-100">
                              <td className="px-4 py-2 text-gray-800">{month}</td>
                              <td className="px-4 py-2 text-center text-gray-800">{stat.total}</td>
                              <td className="px-4 py-2 text-center text-green-600">{stat.low}</td>
                              <td className="px-4 py-2 text-center text-yellow-600">{stat.medium}</td>
                              <td className="px-4 py-2 text-center text-red-600">{stat.high}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 최근 상담 기록 */}
              {recentRecords.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">
                    최근 상담 내역 (최근 3개월)
                  </h3>
                  <div className="space-y-3">
                    {recentRecords.map((record) => {
                      const severity = getSeverityLabel(record.severity);
                      return (
                        <div
                          key={record.id}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs text-gray-500">
                              {formatDate(record.date)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${severity.bg} ${severity.color}`}
                            >
                              {severity.text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {record.preview}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 건강 조언 */}
              <div className="bg-blue-50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  건강 관리 조언
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  {stats.high > 0 && (
                    <li>• 위험 판정 {stats.high}건이 있었습니다. 정기적인 동물병원 검진을 권장합니다.</li>
                  )}
                  {stats.medium > 0 && (
                    <li>• 주의가 필요한 증상이 {stats.medium}건 있었습니다. 증상이 지속되면 수의사와 상담하세요.</li>
                  )}
                  {stats.low === stats.total && stats.total > 0 && (
                    <li>• 모든 상담에서 안심 판정을 받았습니다. 건강한 상태를 유지하고 있어요!</li>
                  )}
                  <li>• 정기적인 예방접종과 건강검진을 잊지 마세요.</li>
                  <li>• 갑작스러운 행동 변화나 식욕 변화에 주의를 기울여주세요.</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-500 mb-2">아직 상담 기록이 없습니다</p>
              <p className="text-sm text-gray-400">
                AI 상담을 이용하시면 건강 리포트가 생성됩니다
              </p>
            </div>
          )}

          {/* 푸터 */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              이 리포트는 펫체키 AI 상담 기록을 기반으로 생성되었습니다.
            </p>
            <p className="text-xs text-gray-400">
              정확한 진단은 반드시 수의사와 상담하세요.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              © {new Date().getFullYear()} 펫체키 - AI 반려동물 건강 상담 서비스
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

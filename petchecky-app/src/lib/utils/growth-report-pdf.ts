"use client";

import type { ChildProfile, GrowthRecord, ChildVaccination, MilestoneRecord } from "@/types/baby";

interface GrowthReportData {
  child: ChildProfile;
  growthRecords: GrowthRecord[];
  vaccinations: ChildVaccination[];
  milestones: MilestoneRecord[];
}

function getAgeText(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years > 0) {
    return `${years}세 ${remainingMonths}개월`;
  }
  return `${months}개월`;
}

/**
 * Generate a growth report as a printable HTML page and trigger print/save as PDF
 */
export function generateGrowthReportPDF(data: GrowthReportData): void {
  const { child, growthRecords, vaccinations, milestones } = data;

  const sortedGrowth = [...growthRecords].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const completedVaccinations = vaccinations.filter((v) => v.completedDate);
  const pendingVaccinations = vaccinations.filter((v) => !v.completedDate);
  const achievedMilestones = milestones.filter((m) => m.achievedDate);

  const latestGrowth = sortedGrowth[sortedGrowth.length - 1];

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${child.name} 성장 리포트</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 24px; color: #ec4899; margin-bottom: 4px; }
    h2 { font-size: 18px; color: #374151; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #f3f4f6; }
    h3 { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
    .header { text-align: center; margin-bottom: 32px; }
    .header p { color: #6b7280; font-size: 14px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .info-item { background: #f9fafb; padding: 12px; border-radius: 8px; }
    .info-label { font-size: 12px; color: #9ca3af; }
    .info-value { font-size: 16px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
    th { background: #f9fafb; padding: 8px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
    td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .badge-done { background: #d1fae5; color: #065f46; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; padding-top: 16px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${child.name}의 성장 리포트</h1>
    <p>생성일: ${new Date().toLocaleDateString("ko-KR")}</p>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">이름</div>
      <div class="info-value">${child.name}</div>
    </div>
    <div class="info-item">
      <div class="info-label">생년월일</div>
      <div class="info-value">${new Date(child.birthDate).toLocaleDateString("ko-KR")}</div>
    </div>
    <div class="info-item">
      <div class="info-label">현재 나이</div>
      <div class="info-value">${getAgeText(child.birthDate)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">성별</div>
      <div class="info-value">${child.gender === "male" ? "남아" : "여아"}</div>
    </div>
    ${child.birthWeight ? `<div class="info-item"><div class="info-label">출생 체중</div><div class="info-value">${child.birthWeight} kg</div></div>` : ""}
    ${child.birthHeight ? `<div class="info-item"><div class="info-label">출생 신장</div><div class="info-value">${child.birthHeight} cm</div></div>` : ""}
    ${latestGrowth?.weight ? `<div class="info-item"><div class="info-label">최근 체중</div><div class="info-value">${latestGrowth.weight} kg</div></div>` : ""}
    ${latestGrowth?.height ? `<div class="info-item"><div class="info-label">최근 신장</div><div class="info-value">${latestGrowth.height} cm</div></div>` : ""}
  </div>

  ${sortedGrowth.length > 0 ? `
  <h2>성장 기록</h2>
  <table>
    <thead>
      <tr><th>날짜</th><th>체중 (kg)</th><th>신장 (cm)</th><th>머리둘레 (cm)</th><th>비고</th></tr>
    </thead>
    <tbody>
      ${sortedGrowth.map((r) => `
        <tr>
          <td>${new Date(r.date).toLocaleDateString("ko-KR")}</td>
          <td>${r.weight ?? "-"}</td>
          <td>${r.height ?? "-"}</td>
          <td>${r.headCircumference ?? "-"}</td>
          <td>${r.notes ?? ""}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  ` : ""}

  ${completedVaccinations.length > 0 || pendingVaccinations.length > 0 ? `
  <h2>예방접종 현황</h2>
  <table>
    <thead>
      <tr><th>백신</th><th>차수</th><th>예정일</th><th>접종일</th><th>상태</th></tr>
    </thead>
    <tbody>
      ${[...completedVaccinations, ...pendingVaccinations].map((v) => `
        <tr>
          <td>${v.vaccineName}</td>
          <td>${v.doseNumber}차</td>
          <td>${new Date(v.scheduledDate).toLocaleDateString("ko-KR")}</td>
          <td>${v.completedDate ? new Date(v.completedDate).toLocaleDateString("ko-KR") : "-"}</td>
          <td><span class="badge ${v.completedDate ? "badge-done" : "badge-pending"}">${v.completedDate ? "완료" : "예정"}</span></td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  ` : ""}

  ${achievedMilestones.length > 0 ? `
  <h2>달성한 발달 마일스톤</h2>
  <table>
    <thead>
      <tr><th>마일스톤</th><th>달성일</th><th>비고</th></tr>
    </thead>
    <tbody>
      ${achievedMilestones.map((m) => `
        <tr>
          <td>${m.milestoneKey}</td>
          <td>${m.achievedDate ? new Date(m.achievedDate).toLocaleDateString("ko-KR") : "-"}</td>
          <td>${m.notes ?? ""}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  ` : ""}

  <div class="footer">
    <p>이 리포트는 베이비체키(BabyChecky)에서 생성되었습니다.</p>
    <p>의료적 진단이나 처방을 대체하지 않습니다. 전문 의료인과 상담하세요.</p>
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

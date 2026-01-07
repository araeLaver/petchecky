"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { HealthRecord } from "@/app/health-tracking/page";

interface WeightChartProps {
  records: HealthRecord[];
  petName: string;
}

export default function WeightChart({ records, petName }: WeightChartProps) {
  const weightRecords = records.filter((r) => r.weight !== undefined);

  if (weightRecords.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-gray-200 p-8 text-center">
        <p className="text-gray-500">체중 기록이 없습니다</p>
      </div>
    );
  }

  const chartData = weightRecords.map((record) => ({
    date: new Date(record.date).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    }),
    fullDate: record.date,
    weight: record.weight,
    bodyCondition: record.bodyCondition,
  }));

  const weights = weightRecords.map((r) => r.weight!);
  const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  // Y축 범위 계산 (최소/최대에 여유 추가)
  const yMin = Math.floor(minWeight * 0.9);
  const yMax = Math.ceil(maxWeight * 1.1);

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-4">
      <h3 className="font-bold text-gray-800 mb-4">
        {petName}의 체중 변화
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tickFormatter={(value) => `${value}kg`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value) => [`${Number(value).toFixed(1)} kg`, "체중"]}
              labelFormatter={(label) => `날짜: ${label}`}
            />
            <ReferenceLine
              y={avgWeight}
              stroke="#9ca3af"
              strokeDasharray="5 5"
              label={{
                value: `평균 ${avgWeight.toFixed(1)}kg`,
                position: "right",
                fontSize: 10,
                fill: "#9ca3af",
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{
                fill: "#3b82f6",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: "#3b82f6",
                strokeWidth: 2,
                r: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className="mt-4 flex justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-blue-500" />
          <span>체중</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-gray-400 border-dashed" style={{ borderTop: "2px dashed #9ca3af" }} />
          <span>평균 체중</span>
        </div>
      </div>
    </div>
  );
}

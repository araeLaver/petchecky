"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import {
  WEIGHT_FOR_AGE_BOYS,
  WEIGHT_FOR_AGE_GIRLS,
  HEIGHT_FOR_AGE_BOYS,
  HEIGHT_FOR_AGE_GIRLS,
  generatePercentileCurves,
  getPercentile,
} from "@/lib/constants/growth-standards";
import type { GrowthRecord, Gender } from "@/types/baby";

interface GrowthChartProps {
  records: GrowthRecord[];
  gender: Gender;
  birthDate: string;
  type: "weight" | "height";
}

export default function GrowthChart({ records, gender, birthDate, type }: GrowthChartProps) {
  const lmsData = useMemo(() => {
    if (type === "weight") {
      return gender === "male" ? WEIGHT_FOR_AGE_BOYS : WEIGHT_FOR_AGE_GIRLS;
    }
    return gender === "male" ? HEIGHT_FOR_AGE_BOYS : HEIGHT_FOR_AGE_GIRLS;
  }, [gender, type]);

  const percentileCurves = useMemo(() => {
    return generatePercentileCurves(lmsData, [3, 15, 50, 85, 97]);
  }, [lmsData]);

  const chartData = useMemo(() => {
    const birth = new Date(birthDate);

    // Base data from percentile curves
    const baseData = percentileCurves.map((pc) => ({
      month: pc.month,
      p3: pc.values.p3,
      p15: pc.values.p15,
      p50: pc.values.p50,
      p85: pc.values.p85,
      p97: pc.values.p97,
      actual: undefined as number | undefined,
    }));

    // Overlay actual records
    for (const record of records) {
      const value = type === "weight" ? record.weight : record.height;
      if (!value) continue;

      const recordDate = new Date(record.date);
      const ageMonths = Math.round(
        (recordDate.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      );

      // Find or create the entry for this month
      const existing = baseData.find((d) => d.month === ageMonths);
      if (existing) {
        existing.actual = value;
      } else {
        // Insert at correct position
        const entry = {
          month: ageMonths,
          p3: percentileCurves.find((pc) => pc.month >= ageMonths)?.values.p3,
          p15: percentileCurves.find((pc) => pc.month >= ageMonths)?.values.p15,
          p50: percentileCurves.find((pc) => pc.month >= ageMonths)?.values.p50,
          p85: percentileCurves.find((pc) => pc.month >= ageMonths)?.values.p85,
          p97: percentileCurves.find((pc) => pc.month >= ageMonths)?.values.p97,
          actual: value,
        };
        baseData.push(entry as typeof baseData[0]);
      }
    }

    return baseData.sort((a, b) => a.month - b.month);
  }, [percentileCurves, records, birthDate, type]);

  // Latest percentile
  const latestPercentile = useMemo(() => {
    const latestRecord = records
      .filter((r) => (type === "weight" ? r.weight : r.height))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!latestRecord) return null;

    const value = type === "weight" ? latestRecord.weight : latestRecord.height;
    if (!value) return null;

    const birth = new Date(birthDate);
    const recordDate = new Date(latestRecord.date);
    const ageMonths = Math.round(
      (recordDate.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    );

    return getPercentile(lmsData, ageMonths, value);
  }, [records, birthDate, type, lmsData]);

  const unit = type === "weight" ? "kg" : "cm";
  const label = type === "weight" ? "체중" : "신장";
  const color = type === "weight" ? "#3B82F6" : "#10B981";

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {label} 성장 곡선
        </h3>
        {latestPercentile !== null && (
          <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
            상위 {(100 - latestPercentile).toFixed(0)}% ({latestPercentile.toFixed(0)}백분위)
          </span>
        )}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="month"
              label={{ value: "월령", position: "insideBottomRight", offset: -5 }}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              label={{ value: unit, angle: -90, position: "insideLeft" }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number, name: string): [string, string] => {
                const labels: Record<string, string> = {
                  p3: "3백분위",
                  p15: "15백분위",
                  p50: "50백분위 (중앙)",
                  p85: "85백분위",
                  p97: "97백분위",
                  actual: "우리 아이",
                };
                return [`${value} ${unit}`, labels[name] || name];
              }) as never}
              labelFormatter={(label) => `${label}개월`}
            />

            {/* Percentile bands */}
            <Area
              type="monotone"
              dataKey="p97"
              stroke="none"
              fill="#FEE2E2"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="p3"
              stroke="none"
              fill="#FFFFFF"
              fillOpacity={1}
            />

            {/* Percentile lines */}
            <Line type="monotone" dataKey="p3" stroke="#D1D5DB" strokeWidth={1} dot={false} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="p15" stroke="#9CA3AF" strokeWidth={1} dot={false} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="p50" stroke="#6B7280" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="p85" stroke="#9CA3AF" strokeWidth={1} dot={false} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="p97" stroke="#D1D5DB" strokeWidth={1} dot={false} strokeDasharray="4 4" />

            {/* Actual data */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: color, r: 4, strokeWidth: 2, stroke: "#fff" }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 rounded" style={{ backgroundColor: color }} />
          우리 아이
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 rounded border-b border-dashed border-gray-400" />
          WHO 백분위 (3, 15, 50, 85, 97)
        </span>
      </div>
    </div>
  );
}

"use client";

import { ReactNode } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ============================================
// 공통 타입 및 상수
// ============================================

export const CHART_COLORS = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#06B6D4", // cyan-500
  "#84CC16", // lime-500
] as const;

interface BaseChartProps {
  data: Record<string, unknown>[];
  height?: number;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
}

// ============================================
// ChartContainer 컴포넌트
// ============================================

interface ChartContainerProps {
  title?: string;
  description?: string;
  children: ReactNode;
  height?: number;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function ChartContainer({
  title,
  description,
  children,
  height = 300,
  className,
  loading,
  emptyMessage = "데이터가 없습니다",
  isEmpty,
}: ChartContainerProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className || ""}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="flex flex-col items-center gap-2">
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm text-gray-500">로딩 중...</span>
          </div>
        </div>
      ) : isEmpty ? (
        <div
          className="flex items-center justify-center text-gray-500"
          style={{ height }}
        >
          {emptyMessage}
        </div>
      ) : (
        <div style={{ height }}>{children}</div>
      )}
    </div>
  );
}

// ============================================
// CustomTooltip 컴포넌트
// ============================================

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  formatter?: (value: number, name: string) => string;
}

function CustomTooltip({
  active,
  payload,
  label,
  formatter,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-medium text-gray-900 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600">{item.name}:</span>
            <span className="font-medium text-gray-900">
              {formatter ? formatter(item.value, item.name) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// LineChart 컴포넌트
// ============================================

interface LineChartProps extends BaseChartProps {
  xKey: string;
  lines: {
    dataKey: string;
    name: string;
    color?: string;
    strokeWidth?: number;
    dot?: boolean;
  }[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (value: number, name: string) => string;
  showGrid?: boolean;
  showLegend?: boolean;
}

/**
 * 라인 차트
 *
 * @example
 * ```tsx
 * <LineChart
 *   data={weightData}
 *   xKey="date"
 *   lines={[
 *     { dataKey: "weight", name: "체중", color: "#3B82F6" }
 *   ]}
 *   height={300}
 * />
 * ```
 */
export function LineChart({
  data,
  xKey,
  lines,
  height = 300,
  className,
  loading,
  emptyMessage,
  xAxisLabel,
  yAxisLabel,
  tooltipFormatter,
  showGrid = true,
  showLegend = true,
}: LineChartProps) {
  return (
    <ChartContainer
      height={height}
      className={className}
      loading={loading}
      emptyMessage={emptyMessage}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
            label={xAxisLabel ? { value: xAxisLabel, position: "bottom" } : undefined}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: "insideLeft" }
                : undefined
            }
          />
          <Tooltip content={<CustomTooltip formatter={tooltipFormatter} />} />
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={line.strokeWidth || 2}
              dot={line.dot !== false}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ============================================
// BarChart 컴포넌트
// ============================================

interface BarChartProps extends BaseChartProps {
  xKey: string;
  bars: {
    dataKey: string;
    name: string;
    color?: string;
    stackId?: string;
  }[];
  layout?: "horizontal" | "vertical";
  tooltipFormatter?: (value: number, name: string) => string;
  showGrid?: boolean;
  showLegend?: boolean;
}

/**
 * 막대 차트
 *
 * @example
 * ```tsx
 * <BarChart
 *   data={activityData}
 *   xKey="month"
 *   bars={[
 *     { dataKey: "walks", name: "산책", color: "#3B82F6" },
 *     { dataKey: "training", name: "훈련", color: "#10B981" }
 *   ]}
 * />
 * ```
 */
export function BarChart({
  data,
  xKey,
  bars,
  height = 300,
  className,
  loading,
  emptyMessage,
  layout = "horizontal",
  tooltipFormatter,
  showGrid = true,
  showLegend = true,
}: BarChartProps) {
  return (
    <ChartContainer
      height={height}
      className={className}
      loading={loading}
      emptyMessage={emptyMessage}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
          {layout === "horizontal" ? (
            <>
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                dataKey={xKey}
                type="category"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip formatter={tooltipFormatter} />} />
          {showLegend && <Legend />}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || CHART_COLORS[index % CHART_COLORS.length]}
              stackId={bar.stackId}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ============================================
// PieChart 컴포넌트
// ============================================

interface PieChartProps extends BaseChartProps {
  dataKey: string;
  nameKey: string;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
  showLabel?: boolean;
  showLegend?: boolean;
  tooltipFormatter?: (value: number, name: string) => string;
}

/**
 * 파이/도넛 차트
 *
 * @example
 * ```tsx
 * <PieChart
 *   data={[
 *     { name: "산책", value: 30 },
 *     { name: "식사", value: 25 },
 *     { name: "훈련", value: 20 },
 *   ]}
 *   dataKey="value"
 *   nameKey="name"
 *   innerRadius={60} // 도넛 차트
 * />
 * ```
 */
export function PieChart({
  data,
  dataKey,
  nameKey,
  height = 300,
  className,
  loading,
  emptyMessage,
  colors = CHART_COLORS as unknown as string[],
  innerRadius = 0,
  outerRadius = 80,
  showLabel = true,
  showLegend = true,
  tooltipFormatter,
}: PieChartProps) {
  return (
    <ChartContainer
      height={height}
      className={className}
      loading={loading}
      emptyMessage={emptyMessage}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            label={showLabel}
            labelLine={showLabel}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip formatter={tooltipFormatter} />} />
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ============================================
// AreaChart 컴포넌트
// ============================================

interface AreaChartProps extends BaseChartProps {
  xKey: string;
  areas: {
    dataKey: string;
    name: string;
    color?: string;
    fillOpacity?: number;
    stackId?: string;
  }[];
  tooltipFormatter?: (value: number, name: string) => string;
  showGrid?: boolean;
  showLegend?: boolean;
}

/**
 * 영역 차트
 *
 * @example
 * ```tsx
 * <AreaChart
 *   data={activityData}
 *   xKey="date"
 *   areas={[
 *     { dataKey: "steps", name: "걸음수", color: "#3B82F6" }
 *   ]}
 * />
 * ```
 */
export function AreaChart({
  data,
  xKey,
  areas,
  height = 300,
  className,
  loading,
  emptyMessage,
  tooltipFormatter,
  showGrid = true,
  showLegend = true,
}: AreaChartProps) {
  return (
    <ChartContainer
      height={height}
      className={className}
      loading={loading}
      emptyMessage={emptyMessage}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <Tooltip content={<CustomTooltip formatter={tooltipFormatter} />} />
          {showLegend && <Legend />}
          {areas.map((area, index) => {
            const color = area.color || CHART_COLORS[index % CHART_COLORS.length];
            return (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                name={area.name}
                stroke={color}
                fill={color}
                fillOpacity={area.fillOpacity ?? 0.3}
                stackId={area.stackId}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ============================================
// StatCard 컴포넌트
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon?: ReactNode;
  description?: string;
  className?: string;
}

/**
 * 통계 카드
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="총 산책 횟수"
 *   value={42}
 *   change={{ value: 12, type: "increase" }}
 *   icon={<WalkIcon />}
 * />
 * ```
 */
export function StatCard({
  title,
  value,
  change,
  icon,
  description,
  className,
}: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className || ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">{icon}</div>
        )}
      </div>

      {(change || description) && (
        <div className="mt-3 flex items-center gap-2">
          {change && (
            <span
              className={`inline-flex items-center text-sm font-medium ${
                change.type === "increase"
                  ? "text-green-600"
                  : change.type === "decrease"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {change.type === "increase" ? (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : change.type === "decrease" ? (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              ) : null}
              {change.value > 0 ? "+" : ""}
              {change.value}%
            </span>
          )}
          {description && (
            <span className="text-sm text-gray-500">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// MiniChart 컴포넌트 (Sparkline)
// ============================================

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

/**
 * 미니 차트 (스파크라인)
 *
 * @example
 * ```tsx
 * <MiniChart data={[10, 20, 15, 30, 25]} color="#3B82F6" />
 * ```
 */
export function MiniChart({
  data,
  color = CHART_COLORS[0],
  height = 40,
  width = 100,
  className,
}: MiniChartProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// 펫 관련 특화 차트
// ============================================

interface WeightChartProps {
  data: { date: string; weight: number }[];
  targetWeight?: number;
  unit?: string;
  height?: number;
  className?: string;
  loading?: boolean;
}

/**
 * 체중 추적 차트 (펫 전용)
 */
export function WeightChart({
  data,
  targetWeight,
  unit = "kg",
  height = 300,
  className,
  loading,
}: WeightChartProps) {
  const chartData = targetWeight
    ? data.map((d) => ({ ...d, target: targetWeight }))
    : data;

  const lines = [
    { dataKey: "weight", name: "체중", color: CHART_COLORS[0] },
    ...(targetWeight
      ? [{ dataKey: "target", name: "목표", color: CHART_COLORS[3], dot: false }]
      : []),
  ];

  return (
    <LineChart
      data={chartData}
      xKey="date"
      lines={lines}
      height={height}
      className={className}
      loading={loading}
      tooltipFormatter={(value) => `${value}${unit}`}
    />
  );
}

interface ActivityChartProps {
  data: { date: string; walks: number; training: number; play: number }[];
  height?: number;
  className?: string;
  loading?: boolean;
}

/**
 * 활동 추적 차트 (펫 전용)
 */
export function ActivityChart({
  data,
  height = 300,
  className,
  loading,
}: ActivityChartProps) {
  return (
    <BarChart
      data={data}
      xKey="date"
      bars={[
        { dataKey: "walks", name: "산책", color: CHART_COLORS[0] },
        { dataKey: "training", name: "훈련", color: CHART_COLORS[1] },
        { dataKey: "play", name: "놀이", color: CHART_COLORS[2] },
      ]}
      height={height}
      className={className}
      loading={loading}
      tooltipFormatter={(value) => `${value}회`}
    />
  );
}

interface MealChartProps {
  data: { name: string; value: number }[];
  height?: number;
  className?: string;
  loading?: boolean;
}

/**
 * 식사 구성 차트 (펫 전용)
 */
export function MealChart({
  data,
  height = 300,
  className,
  loading,
}: MealChartProps) {
  return (
    <PieChart
      data={data}
      dataKey="value"
      nameKey="name"
      innerRadius={60}
      outerRadius={80}
      height={height}
      className={className}
      loading={loading}
      tooltipFormatter={(value) => `${value}g`}
    />
  );
}

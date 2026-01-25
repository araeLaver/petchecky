"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useWebVitals,
  usePerformanceMonitor,
  useFrameRate,
} from "@/hooks/usePerformance";
import {
  LineChart,
  BarChart,
  StatCard,
  ChartContainer,
} from "@/components/charts";
import { usePrefersReducedMotion } from "@/hooks/useAccessibility";

// ============================================
// Types
// ============================================

interface MetricCardProps {
  name: string;
  value: number | string;
  unit?: string;
  rating?: "good" | "needs-improvement" | "poor";
  description?: string;
  threshold?: { good: number; poor: number };
}

interface PerformanceHistory {
  timestamp: number;
  lcp?: number;
  fcp?: number;
  cls?: number;
  inp?: number;
  ttfb?: number;
  fps?: number;
  memory?: number;
}

// ============================================
// Rating Colors
// ============================================

const ratingColors = {
  good: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  "needs-improvement": {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
  },
  poor: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

// ============================================
// MetricCard Component
// ============================================

function MetricCard({
  name,
  value,
  unit,
  rating,
  description,
  threshold,
}: MetricCardProps) {
  const colors = rating ? ratingColors[rating] : ratingColors.good;

  return (
    <div
      className={`rounded-lg border p-4 ${colors.bg} ${colors.border}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{name}</h3>
        {rating && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${colors.text}`}>
            <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
            {rating === "good" ? "Good" : rating === "needs-improvement" ? "Needs Work" : "Poor"}
          </span>
        )}
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold text-gray-900">
          {typeof value === "number" ? value.toFixed(2) : value}
        </span>
        {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
      </div>
      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
      {threshold && (
        <div className="mt-2 text-xs text-gray-400">
          Good: &lt;{threshold.good} | Poor: &gt;{threshold.poor}
        </div>
      )}
    </div>
  );
}

// ============================================
// WebVitalsSection Component
// ============================================

function WebVitalsSection() {
  const { vitals, isCollecting } = useWebVitals();

  const vitalsConfig = [
    {
      key: "LCP",
      name: "Largest Contentful Paint",
      unit: "ms",
      description: "Time until largest content element is visible",
      threshold: { good: 2500, poor: 4000 },
    },
    {
      key: "FCP",
      name: "First Contentful Paint",
      unit: "ms",
      description: "Time until first content is painted",
      threshold: { good: 1800, poor: 3000 },
    },
    {
      key: "CLS",
      name: "Cumulative Layout Shift",
      unit: "",
      description: "Visual stability score",
      threshold: { good: 0.1, poor: 0.25 },
    },
    {
      key: "INP",
      name: "Interaction to Next Paint",
      unit: "ms",
      description: "Responsiveness to user interactions",
      threshold: { good: 200, poor: 500 },
    },
    {
      key: "TTFB",
      name: "Time to First Byte",
      unit: "ms",
      description: "Server response time",
      threshold: { good: 800, poor: 1800 },
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Core Web Vitals</h2>
        {isCollecting && (
          <span className="inline-flex items-center gap-2 text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Collecting
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {vitalsConfig.map((config) => {
          const vital = vitals[config.key as keyof typeof vitals];
          return (
            <MetricCard
              key={config.key}
              name={config.name}
              value={vital?.value ?? "-"}
              unit={config.unit}
              rating={vital?.rating}
              description={config.description}
              threshold={config.threshold}
            />
          );
        })}
      </div>
    </section>
  );
}

// ============================================
// SystemMetricsSection Component
// ============================================

function SystemMetricsSection() {
  const { memoryUsage, connectionInfo, longTaskCount } = usePerformanceMonitor();
  const { fps, isMonitoring } = useFrameRate();

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "-";
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getFpsTrend = () => {
    if (fps >= 55) return { value: fps, type: "increase" as const };
    if (fps >= 30) return { value: fps, type: "neutral" as const };
    return { value: fps, type: "decrease" as const };
  };

  const getLongTaskTrend = () => {
    if (longTaskCount === 0) return { value: 0, type: "increase" as const };
    if (longTaskCount < 5) return { value: longTaskCount, type: "neutral" as const };
    return { value: longTaskCount, type: "decrease" as const };
  };

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Frame Rate"
          value={isMonitoring ? `${fps} FPS` : "-"}
          change={isMonitoring ? getFpsTrend() : undefined}
          description="Current animation smoothness"
        />
        <StatCard
          title="Memory Usage"
          value={formatBytes(memoryUsage?.usedJSHeapSize)}
          description={`Limit: ${formatBytes(memoryUsage?.jsHeapSizeLimit)}`}
        />
        <StatCard
          title="Long Tasks"
          value={`${longTaskCount} tasks`}
          change={getLongTaskTrend()}
          description="Tasks blocking main thread"
        />
        <StatCard
          title="Connection"
          value={connectionInfo?.effectiveType || "-"}
          description={connectionInfo?.rtt ? `RTT: ${connectionInfo.rtt}ms` : undefined}
        />
      </div>
    </section>
  );
}

// ============================================
// PerformanceHistoryChart Component
// ============================================

function PerformanceHistoryChart() {
  const [history, setHistory] = useState<PerformanceHistory[]>([]);
  const { vitals } = useWebVitals();
  const { fps } = useFrameRate();
  const { memoryUsage } = usePerformanceMonitor();

  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prev) => {
        const newEntry: PerformanceHistory = {
          timestamp: Date.now(),
          lcp: vitals.LCP?.value,
          fcp: vitals.FCP?.value,
          cls: vitals.CLS?.value,
          inp: vitals.INP?.value,
          ttfb: vitals.TTFB?.value,
          fps,
          memory: memoryUsage?.usedJSHeapSize
            ? memoryUsage.usedJSHeapSize / 1024 / 1024
            : undefined,
        };
        const updated = [...prev, newEntry].slice(-30); // Keep last 30 entries
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [vitals, fps, memoryUsage]);

  const chartData = history.map((h, i) => ({
    name: `${i + 1}`,
    FPS: h.fps || 0,
    Memory: h.memory || 0,
  }));

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance History</h2>
      <ChartContainer
        title="Real-time Metrics"
        description="FPS and Memory usage over time"
        loading={history.length < 2}
        className="h-80"
      >
        <LineChart
          data={chartData}
          xKey="name"
          lines={[
            { dataKey: "FPS", color: "#10b981", name: "FPS" },
            { dataKey: "Memory", color: "#6366f1", name: "Memory (MB)" },
          ]}
          height={280}
          showGrid
          showLegend
        />
      </ChartContainer>
    </section>
  );
}

// ============================================
// ResourceTimingSection Component
// ============================================

function ResourceTimingSection() {
  const [resources, setResources] = useState<
    { name: string; duration: number; type: string }[]
  >([]);

  useEffect(() => {
    if (typeof performance === "undefined") return;

    const entries = performance.getEntriesByType(
      "resource"
    ) as PerformanceResourceTiming[];

    const sorted = entries
      .map((e) => ({
        name: e.name.split("/").pop() || e.name,
        duration: e.duration,
        type: e.initiatorType,
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    setResources(sorted);
  }, []);

  const chartData = resources.map((r) => ({
    name: r.name.length > 20 ? r.name.substring(0, 20) + "..." : r.name,
    duration: Math.round(r.duration),
    type: r.type,
  }));

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Slowest Resources
      </h2>
      <ChartContainer
        title="Resource Loading Times"
        description="Top 10 slowest resources"
        isEmpty={resources.length === 0}
        emptyMessage="No resource timing data available"
        className="h-80"
      >
        <BarChart
          data={chartData}
          xKey="name"
          bars={[{ dataKey: "duration", color: "#f59e0b", name: "Duration (ms)" }]}
          height={280}
          layout="vertical"
        />
      </ChartContainer>
    </section>
  );
}

// ============================================
// PerformanceDashboard Component
// ============================================

export function PerformanceDashboard() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const content = (
    <div className="p-6 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time performance monitoring and analytics
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Refresh
        </button>
      </header>

      <WebVitalsSection />
      <SystemMetricsSection />
      <PerformanceHistoryChart />
      <ResourceTimingSection />
    </div>
  );

  if (prefersReducedMotion) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {content}
    </motion.div>
  );
}

export default PerformanceDashboard;

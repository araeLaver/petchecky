"use client";

interface WalkStatsProps {
  stats: {
    totalWalks: number;
    totalDuration: number;
    totalDistance: number;
    avgDuration: number;
    thisWeekCount: number;
  };
}

export default function WalkStats({ stats }: WalkStatsProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl bg-white border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🐾</span>
          <span className="text-xs text-gray-500">총 산책</span>
        </div>
        <p className="text-2xl font-bold text-gray-800">
          {stats.totalWalks}
          <span className="text-sm font-normal text-gray-500 ml-1">회</span>
        </p>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">⏱️</span>
          <span className="text-xs text-gray-500">총 시간</span>
        </div>
        <p className="text-2xl font-bold text-gray-800">
          {formatDuration(stats.totalDuration)}
        </p>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">📍</span>
          <span className="text-xs text-gray-500">총 거리</span>
        </div>
        <p className="text-2xl font-bold text-green-600">
          {stats.totalDistance.toFixed(1)}
          <span className="text-sm font-normal text-gray-500 ml-1">km</span>
        </p>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">📅</span>
          <span className="text-xs text-gray-500">이번 주</span>
        </div>
        <p className="text-2xl font-bold text-blue-600">
          {stats.thisWeekCount}
          <span className="text-sm font-normal text-gray-500 ml-1">회</span>
        </p>
      </div>
    </div>
  );
}

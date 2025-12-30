"use client";

interface ChatRecord {
  id: string;
  petName: string;
  petSpecies: "dog" | "cat";
  date: string;
  preview: string;
  severity?: "low" | "medium" | "high";
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    severity?: "low" | "medium" | "high";
  }>;
}

interface ChatHistoryProps {
  records: ChatRecord[];
  onSelect: (record: ChatRecord) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export default function ChatHistory({ records, onSelect, onDelete, onBack }: ChatHistoryProps) {
  const getSeverityBadge = (severity?: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">위험</span>;
      case "medium":
        return <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">주의</span>;
      case "low":
        return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">안심</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "오늘";
    } else if (diffDays === 1) {
      return "어제";
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white px-4 py-4">
        <div className="mx-auto max-w-3xl flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            ←
          </button>
          <h1 className="text-lg font-bold text-gray-800">상담 기록</h1>
          <span className="text-sm text-gray-400">({records.length}개)</span>
        </div>
      </div>

      {/* Records List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {records.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-5xl">📋</div>
              <p className="text-gray-500">아직 상담 기록이 없어요.</p>
              <p className="mt-1 text-sm text-gray-400">상담을 시작하면 기록이 저장됩니다.</p>
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => onSelect(record)}
                    className="flex-1 text-left"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-lg">{record.petSpecies === "dog" ? "🐕" : "🐈"}</span>
                      <span className="font-medium text-gray-800">{record.petName}</span>
                      {getSeverityBadge(record.severity)}
                      <span className="text-xs text-gray-400">{formatDate(record.date)}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{record.preview}</p>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("이 상담 기록을 삭제할까요?")) {
                        onDelete(record.id);
                      }
                    }}
                    className="shrink-0 rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export type { ChatRecord };

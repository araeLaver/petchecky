"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TrainingCommand {
  id: string;
  petId: string;
  name: string;
  category: "basic" | "advanced" | "trick" | "behavior";
  status: "learning" | "practicing" | "mastered";
  progress: number; // 0-100
  sessions: TrainingSession[];
  notes?: string;
  createdAt: string;
}

interface TrainingSession {
  id: string;
  date: string;
  duration: number; // minutes
  rating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

interface BehaviorIssue {
  id: string;
  petId: string;
  name: string;
  severity: "mild" | "moderate" | "severe";
  status: "active" | "improving" | "resolved";
  logs: BehaviorLog[];
  notes?: string;
  createdAt: string;
}

interface BehaviorLog {
  id: string;
  date: string;
  occurred: boolean;
  trigger?: string;
  notes?: string;
}

interface Pet {
  id: string;
  name: string;
  species: "dog" | "cat";
}

const CATEGORIES: { value: TrainingCommand["category"]; label: string; icon: string; color: string }[] = [
  { value: "basic", label: "기본 훈련", icon: "🎯", color: "blue" },
  { value: "advanced", label: "심화 훈련", icon: "🏆", color: "purple" },
  { value: "trick", label: "재주/묘기", icon: "🎪", color: "pink" },
  { value: "behavior", label: "행동 교정", icon: "🧠", color: "orange" },
];

const PRESET_COMMANDS = {
  dog: {
    basic: ["앉아", "기다려", "엎드려", "이리와", "안돼"],
    advanced: ["옆으로 붙어", "뒤로 가", "빙글빙글", "가져와", "놔"],
    trick: ["악수", "하이파이브", "죽은 척", "구르기", "점프"],
    behavior: ["짖음 자제", "물건 물지 않기", "분리불안 완화", "공격성 감소", "배변 훈련"],
  },
  cat: {
    basic: ["이리와", "앉아", "기다려", "안돼", "내려와"],
    advanced: ["하이파이브", "점프", "통과", "캐리어 들어가기", "양치 허용"],
    trick: ["앉아서 기다려", "손 따라가기", "벨 울리기", "물건 가져오기", "링 통과"],
    behavior: ["할퀴지 않기", "물지 않기", "스크래처 사용", "야옹 자제", "발톱 깎기 허용"],
  },
};

export default function TrainingPage() {
  const [commands, setCommands] = useState<TrainingCommand[]>([]);
  const [behaviors, setBehaviors] = useState<BehaviorIssue[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"commands" | "behaviors">("commands");
  const [showForm, setShowForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState<TrainingCommand | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [form, setForm] = useState({
    name: "",
    category: "basic" as TrainingCommand["category"],
    notes: "",
  });

  const [sessionForm, setSessionForm] = useState({
    duration: "10",
    rating: 3 as TrainingSession["rating"],
    notes: "",
  });

  // Load data
  useEffect(() => {
    const savedPets = localStorage.getItem("petProfiles");
    if (savedPets) {
      const parsed = JSON.parse(savedPets);
      const petList = Array.isArray(parsed) ? parsed : [parsed];
      setPets(petList);
      if (petList.length > 0) {
        setSelectedPetId(petList[0].id);
      }
    }

    const savedCommands = localStorage.getItem("trainingCommands");
    if (savedCommands) {
      setCommands(JSON.parse(savedCommands));
    }

    const savedBehaviors = localStorage.getItem("behaviorIssues");
    if (savedBehaviors) {
      setBehaviors(JSON.parse(savedBehaviors));
    }
  }, []);

  // Save data
  useEffect(() => {
    if (commands.length > 0) {
      localStorage.setItem("trainingCommands", JSON.stringify(commands));
    }
  }, [commands]);

  useEffect(() => {
    if (behaviors.length > 0) {
      localStorage.setItem("behaviorIssues", JSON.stringify(behaviors));
    }
  }, [behaviors]);

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const presets = selectedPet ? PRESET_COMMANDS[selectedPet.species] : PRESET_COMMANDS.dog;

  const handleAddCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const newCommand: TrainingCommand = {
      id: Date.now().toString(),
      petId: selectedPetId,
      name: form.name,
      category: form.category,
      status: "learning",
      progress: 0,
      sessions: [],
      notes: form.notes || undefined,
      createdAt: new Date().toISOString(),
    };
    setCommands([...commands, newCommand]);
    setForm({ name: "", category: "basic", notes: "" });
    setShowForm(false);
  };

  const handleAddPresetCommand = (name: string, category: TrainingCommand["category"]) => {
    const exists = commands.some(c => c.petId === selectedPetId && c.name === name);
    if (exists) {
      alert("이미 등록된 훈련입니다.");
      return;
    }

    const newCommand: TrainingCommand = {
      id: Date.now().toString(),
      petId: selectedPetId,
      name,
      category,
      status: "learning",
      progress: 0,
      sessions: [],
      createdAt: new Date().toISOString(),
    };
    setCommands([...commands, newCommand]);
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSessionForm) return;

    const session: TrainingSession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      duration: parseInt(sessionForm.duration),
      rating: sessionForm.rating,
      notes: sessionForm.notes || undefined,
    };

    // Calculate new progress based on ratings
    const updatedCommand = {
      ...showSessionForm,
      sessions: [...showSessionForm.sessions, session],
    };

    const avgRating = updatedCommand.sessions.reduce((sum, s) => sum + s.rating, 0) / updatedCommand.sessions.length;
    const newProgress = Math.min(100, Math.round((avgRating / 5) * 100 * (1 + updatedCommand.sessions.length * 0.1)));

    let newStatus: TrainingCommand["status"] = "learning";
    if (newProgress >= 80) newStatus = "mastered";
    else if (newProgress >= 40) newStatus = "practicing";

    setCommands(commands.map(c =>
      c.id === showSessionForm.id
        ? { ...updatedCommand, progress: newProgress, status: newStatus }
        : c
    ));

    setSessionForm({ duration: "10", rating: 3, notes: "" });
    setShowSessionForm(null);
  };

  const handleDeleteCommand = (id: string) => {
    if (confirm("이 훈련을 삭제하시겠습니까?")) {
      setCommands(commands.filter(c => c.id !== id));
    }
  };

  const filteredCommands = commands
    .filter(c => c.petId === selectedPetId)
    .filter(c => categoryFilter === "all" || c.category === categoryFilter);

  const stats = {
    total: commands.filter(c => c.petId === selectedPetId).length,
    mastered: commands.filter(c => c.petId === selectedPetId && c.status === "mastered").length,
    practicing: commands.filter(c => c.petId === selectedPetId && c.status === "practicing").length,
    learning: commands.filter(c => c.petId === selectedPetId && c.status === "learning").length,
    totalSessions: commands.filter(c => c.petId === selectedPetId).reduce((sum, c) => sum + c.sessions.length, 0),
    totalMinutes: commands.filter(c => c.petId === selectedPetId).reduce((sum, c) => sum + c.sessions.reduce((s, sess) => s + sess.duration, 0), 0),
  };

  const getStatusColor = (status: TrainingCommand["status"]) => {
    switch (status) {
      case "mastered": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "practicing": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "learning": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  const getStatusLabel = (status: TrainingCommand["status"]) => {
    switch (status) {
      case "mastered": return "마스터";
      case "practicing": return "연습 중";
      case "learning": return "학습 중";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-bold text-gray-800 dark:text-white">펫체키</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">🎓 훈련 트래커</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Pet Selection */}
        {pets.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {pets.map(pet => (
              <button
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedPetId === pet.id
                    ? "bg-purple-500 text-white"
                    : "bg-white border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                }`}
              >
                <span>{pet.species === "dog" ? "🐕" : "🐈"}</span>
                <span>{pet.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white border border-gray-100 p-4 text-center dark:bg-gray-800 dark:border-gray-700">
            <p className="text-3xl font-bold text-purple-600">{stats.mastered}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">마스터</p>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 p-4 text-center dark:bg-gray-800 dark:border-gray-700">
            <p className="text-3xl font-bold text-yellow-600">{stats.practicing}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">연습 중</p>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 p-4 text-center dark:bg-gray-800 dark:border-gray-700">
            <p className="text-3xl font-bold text-blue-600">{stats.learning}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">학습 중</p>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 p-4 text-center dark:bg-gray-800 dark:border-gray-700">
            <p className="text-3xl font-bold text-gray-600">{stats.totalMinutes}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">총 훈련 시간(분)</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          <button
            onClick={() => setActiveTab("commands")}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
              activeTab === "commands"
                ? "bg-white text-purple-600 shadow dark:bg-gray-700 dark:text-purple-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            🎯 명령어 훈련
          </button>
          <button
            onClick={() => setActiveTab("behaviors")}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
              activeTab === "behaviors"
                ? "bg-white text-purple-600 shadow dark:bg-gray-700 dark:text-purple-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            🧠 행동 교정
          </button>
        </div>

        {activeTab === "commands" && (
          <>
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  categoryFilter === "all"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                전체
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 ${
                    categoryFilter === cat.value
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Preset Commands */}
            {filteredCommands.length === 0 && (
              <div className="rounded-2xl bg-purple-50 border border-purple-200 p-5 dark:bg-purple-900/20 dark:border-purple-800">
                <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-3">
                  추천 훈련 목록
                </h3>
                <div className="space-y-3">
                  {CATEGORIES.map(cat => (
                    <div key={cat.value}>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-2">
                        {cat.icon} {cat.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {presets[cat.value as keyof typeof presets].map(cmd => (
                          <button
                            key={cmd}
                            onClick={() => handleAddPresetCommand(cmd, cat.value as TrainingCommand["category"])}
                            className="px-3 py-1.5 bg-white rounded-full text-sm text-purple-700 hover:bg-purple-100 dark:bg-gray-800 dark:text-purple-300 dark:hover:bg-gray-700"
                          >
                            + {cmd}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Command List */}
            <div className="space-y-3">
              {filteredCommands.map(cmd => (
                <div
                  key={cmd.id}
                  className="rounded-2xl bg-white border border-gray-100 p-5 dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {CATEGORIES.find(c => c.value === cmd.category)?.icon}
                        </span>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{cmd.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(cmd.status)}`}>
                          {getStatusLabel(cmd.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {cmd.sessions.length}회 훈련 •
                        {cmd.sessions.reduce((sum, s) => sum + s.duration, 0)}분
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCommand(cmd.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">진행도</span>
                      <span className="font-medium text-purple-600">{cmd.progress}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cmd.status === "mastered" ? "bg-green-500" :
                          cmd.status === "practicing" ? "bg-yellow-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${cmd.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Recent Sessions */}
                  {cmd.sessions.length > 0 && (
                    <div className="mb-3 flex gap-1">
                      {cmd.sessions.slice(-7).map((session, i) => (
                        <div
                          key={i}
                          className="flex-1 h-2 rounded-full"
                          style={{
                            backgroundColor: `hsl(${(session.rating - 1) * 30}, 70%, 50%)`,
                          }}
                          title={`${session.date}: ${session.rating}점`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Add Session Button */}
                  <button
                    onClick={() => setShowSessionForm(cmd)}
                    className="w-full py-2.5 rounded-xl bg-purple-100 text-purple-700 font-medium hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400"
                  >
                    + 훈련 기록 추가
                  </button>
                </div>
              ))}
            </div>

            {/* Add Command Button */}
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 font-medium hover:border-purple-400 hover:text-purple-500 dark:border-gray-600 dark:text-gray-400"
            >
              + 새 훈련 추가
            </button>
          </>
        )}

        {activeTab === "behaviors" && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🧠</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              행동 교정 트래킹
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              문제 행동을 기록하고 개선 과정을 추적하세요
            </p>
            <div className="space-y-2 max-w-sm mx-auto text-left">
              {["짖음/울음", "분리불안", "공격성", "배변 문제", "파괴 행동"].map(issue => (
                <div
                  key={issue}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700"
                >
                  <span className="text-gray-700 dark:text-gray-300">{issue}</span>
                  <span className="text-sm text-gray-400">곧 출시</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Command Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">새 훈련 추가</h2>

              <form onSubmit={handleAddCommand} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    훈련 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="예: 앉아, 기다려"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    카테고리
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat.value })}
                        className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${
                          form.category === cat.value
                            ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    메모
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="훈련 팁이나 주의사항"
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-lg border border-gray-300 font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-lg bg-purple-500 font-medium text-white hover:bg-purple-600"
                  >
                    추가
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Session Modal */}
        {showSessionForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                훈련 기록 추가
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{showSessionForm.name}</p>

              <form onSubmit={handleAddSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    훈련 시간 (분)
                  </label>
                  <input
                    type="number"
                    value={sessionForm.duration}
                    onChange={(e) => setSessionForm({ ...sessionForm, duration: e.target.value })}
                    min="1"
                    max="120"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    오늘의 성과
                  </label>
                  <div className="flex justify-center gap-2">
                    {([1, 2, 3, 4, 5] as const).map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setSessionForm({ ...sessionForm, rating })}
                        className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                          sessionForm.rating >= rating
                            ? "bg-yellow-100 scale-110"
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        {sessionForm.rating >= rating ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {sessionForm.rating === 1 && "다음엔 더 잘할 수 있어요"}
                    {sessionForm.rating === 2 && "조금씩 나아지고 있어요"}
                    {sessionForm.rating === 3 && "괜찮은 훈련이었어요"}
                    {sessionForm.rating === 4 && "정말 잘했어요!"}
                    {sessionForm.rating === 5 && "완벽해요! 🎉"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    메모
                  </label>
                  <textarea
                    value={sessionForm.notes}
                    onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                    placeholder="오늘 훈련에 대한 메모"
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSessionForm(null)}
                    className="flex-1 py-3 rounded-lg border border-gray-300 font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-lg bg-purple-500 font-medium text-white hover:bg-purple-600"
                  >
                    기록
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">🐾 훈련 팁</h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
            <li>• 짧고 자주 훈련하세요 (5-10분씩, 하루 여러 번)</li>
            <li>• 성공할 때마다 즉시 보상을 주세요</li>
            <li>• 인내심을 갖고 일관성 있게 진행하세요</li>
            <li>• 훈련 후에는 충분한 휴식과 놀이 시간을 주세요</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

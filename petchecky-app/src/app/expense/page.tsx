"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

interface Expense {
  id: string;
  petId: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
}

interface Budget {
  petId: string;
  monthlyBudget: number;
  categories: { [key: string]: number };
}

const EXPENSE_CATEGORIES = [
  { id: "food", icon: "🍖", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  { id: "medical", icon: "🏥", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  { id: "grooming", icon: "✂️", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  { id: "supplies", icon: "🛒", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: "toys", icon: "🎾", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { id: "training", icon: "🎓", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  { id: "insurance", icon: "🛡️", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { id: "other", icon: "📦", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
];

export default function ExpensePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [newExpense, setNewExpense] = useState({
    category: "food",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [newBudget, setNewBudget] = useState({
    monthlyBudget: "",
  });

  useEffect(() => {
    const storedPets = localStorage.getItem("pets");
    if (storedPets) {
      const parsedPets = JSON.parse(storedPets);
      setPets(parsedPets);
      if (parsedPets.length > 0) {
        setSelectedPetId(parsedPets[0].id);
      }
    }

    const storedExpenses = localStorage.getItem("petExpenses");
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }

    const storedBudgets = localStorage.getItem("petBudgets");
    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    }
  }, []);

  const petExpenses = expenses.filter((e) => e.petId === selectedPetId);
  const petBudget = budgets.find((b) => b.petId === selectedPetId);

  // Filter expenses by month
  const monthExpenses = petExpenses.filter((e) => e.date.startsWith(selectedMonth));

  // Filter by category
  const filteredExpenses = filterCategory === "all"
    ? monthExpenses
    : monthExpenses.filter((e) => e.category === filterCategory);

  // Calculate totals
  const totalMonthExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => ({
    ...cat,
    total: monthExpenses.filter((e) => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0),
  }));

  const budgetRemaining = petBudget ? petBudget.monthlyBudget - totalMonthExpense : null;
  const budgetPercentage = petBudget ? (totalMonthExpense / petBudget.monthlyBudget) * 100 : 0;

  const getCategoryInfo = (categoryId: string) => {
    return EXPENSE_CATEGORIES.find((c) => c.id === categoryId) || EXPENSE_CATEGORIES[7];
  };

  const handleAddExpense = () => {
    if (!newExpense.amount || !selectedPetId) return;

    const expense: Expense = {
      id: Date.now().toString(),
      petId: selectedPetId,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: newExpense.date,
      createdAt: new Date().toISOString(),
    };

    const updatedExpenses = [...expenses, expense];
    setExpenses(updatedExpenses);
    localStorage.setItem("petExpenses", JSON.stringify(updatedExpenses));

    setNewExpense({
      category: "food",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAddModal(false);
  };

  const handleSetBudget = () => {
    if (!newBudget.monthlyBudget || !selectedPetId) return;

    const budget: Budget = {
      petId: selectedPetId,
      monthlyBudget: parseFloat(newBudget.monthlyBudget),
      categories: {},
    };

    const existingIndex = budgets.findIndex((b) => b.petId === selectedPetId);
    let updatedBudgets;
    if (existingIndex >= 0) {
      updatedBudgets = [...budgets];
      updatedBudgets[existingIndex] = budget;
    } else {
      updatedBudgets = [...budgets, budget];
    }

    setBudgets(updatedBudgets);
    localStorage.setItem("petBudgets", JSON.stringify(updatedBudgets));

    setNewBudget({ monthlyBudget: "" });
    setShowBudgetModal(false);
  };

  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(updatedExpenses);
    localStorage.setItem("petExpenses", JSON.stringify(updatedExpenses));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  // Get month navigation options
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: date.toLocaleDateString("ko-KR", { year: "numeric", month: "long" }),
      });
    }
    return options;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {t.expense?.title || "비용 관리"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.expense?.subtitle || "반려동물 지출 내역을 관리하세요"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        {/* Pet Selector */}
        {pets.length > 1 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedPetId === pet.id
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <span>{pet.species === "dog" ? "🐕" : "🐈"}</span>
                <span>{pet.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Month Selector & Budget */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {getMonthOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (petBudget) {
                setNewBudget({ monthlyBudget: petBudget.monthlyBudget.toString() });
              }
              setShowBudgetModal(true);
            }}
            className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {t.expense?.setBudget || "예산 설정"}
          </button>
        </div>

        {/* Budget Overview */}
        {petBudget && (
          <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t.expense?.monthlyBudget || "월 예산"}
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {formatCurrency(petBudget.monthlyBudget)}
              </span>
            </div>
            <div className="mb-2 h-4 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className={`h-full transition-all ${
                  budgetPercentage > 100
                    ? "bg-red-500"
                    : budgetPercentage > 80
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t.expense?.spent || "지출"}: {formatCurrency(totalMonthExpense)}
              </span>
              <span
                className={`font-medium ${
                  budgetRemaining && budgetRemaining < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {budgetRemaining && budgetRemaining < 0
                  ? `${t.expense?.overBudget || "초과"}: ${formatCurrency(Math.abs(budgetRemaining))}`
                  : `${t.expense?.remaining || "남은 금액"}: ${formatCurrency(budgetRemaining || 0)}`}
              </span>
            </div>
          </div>
        )}

        {/* Category Summary */}
        <div className="mb-6 grid grid-cols-4 gap-2">
          {categoryTotals.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(filterCategory === cat.id ? "all" : cat.id)}
              className={`flex flex-col items-center rounded-xl p-3 transition-all ${
                filterCategory === cat.id
                  ? "ring-2 ring-blue-500"
                  : ""
              } ${cat.color}`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="mt-1 text-xs font-medium truncate w-full text-center">
                {t.expense?.categories?.[cat.id as keyof typeof t.expense.categories] || cat.id}
              </span>
              <span className="text-xs font-bold">{formatCurrency(cat.total)}</span>
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white shadow-lg">
          <p className="text-sm opacity-90">{t.expense?.totalExpense || "이번 달 총 지출"}</p>
          <p className="text-3xl font-bold">{formatCurrency(totalMonthExpense)}</p>
        </div>

        {/* Expense List */}
        <div className="mb-20 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">
              {t.expense?.expenseList || "지출 내역"}
            </h2>
            {filterCategory !== "all" && (
              <button
                onClick={() => setFilterCategory("all")}
                className="text-sm text-blue-500 hover:underline"
              >
                {t.expense?.showAll || "전체 보기"}
              </button>
            )}
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center dark:bg-gray-800">
              <p className="text-4xl mb-3">💰</p>
              <p className="text-gray-500 dark:text-gray-400">
                {t.expense?.noExpenses || "이번 달 지출 내역이 없습니다"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExpenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((expense) => {
                  const catInfo = getCategoryInfo(expense.category);
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800"
                    >
                      <div className={`rounded-full p-2 ${catInfo.color}`}>
                        <span className="text-xl">{catInfo.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                          {expense.description || (t.expense?.categories?.[expense.category as keyof typeof t.expense.categories] || expense.category)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(expense.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 active:scale-95"
        >
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </main>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-6 dark:bg-gray-800 sm:rounded-3xl">
            <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">
              {t.expense?.addExpense || "지출 추가"}
            </h2>

            {/* Category Selection */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.expense?.category || "카테고리"}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setNewExpense({ ...newExpense, category: cat.id })}
                    className={`flex flex-col items-center rounded-xl p-3 transition-all ${
                      newExpense.category === cat.id
                        ? "ring-2 ring-blue-500"
                        : ""
                    } ${cat.color}`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="mt-1 text-xs font-medium">
                      {t.expense?.categories?.[cat.id as keyof typeof t.expense.categories] || cat.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.expense?.amount || "금액"} (₩)
              </label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="0"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg font-bold dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.expense?.description || "메모"} ({t.expense?.optional || "선택"})
              </label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder={t.expense?.descriptionPlaceholder || "지출 내용을 입력하세요"}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Date */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.expense?.date || "날짜"}
              </label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t.common?.cancel || "취소"}
              </button>
              <button
                onClick={handleAddExpense}
                disabled={!newExpense.amount}
                className="flex-1 rounded-xl bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {t.common?.save || "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-6 dark:bg-gray-800 sm:rounded-3xl">
            <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">
              {t.expense?.setBudget || "월 예산 설정"}
            </h2>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.expense?.monthlyBudget || "월 예산"} (₩)
              </label>
              <input
                type="number"
                value={newBudget.monthlyBudget}
                onChange={(e) => setNewBudget({ ...newBudget, monthlyBudget: e.target.value })}
                placeholder="300000"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg font-bold dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t.common?.cancel || "취소"}
              </button>
              <button
                onClick={handleSetBudget}
                disabled={!newBudget.monthlyBudget}
                className="flex-1 rounded-xl bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {t.common?.save || "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

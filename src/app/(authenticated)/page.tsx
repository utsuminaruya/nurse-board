"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  getDaysInMonth,
} from "date-fns";
import { ja } from "date-fns/locale";
import { STATUS_MAP, formatCurrency, calculateJobIncome, cn } from "@/lib/utils";
import type { JobWithRelations } from "@/types";

interface Company {
  id: string;
  companyName: string;
  color: string;
}

interface Category {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<JobWithRelations[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickAdding, setQuickAdding] = useState(false);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const dayOfMonth = today.getDate();
  const daysInMonth = getDaysInMonth(today);

  // Quick add state
  const [quickDate, setQuickDate] = useState(format(today, "yyyy-MM-dd"));
  const [quickStart, setQuickStart] = useState("09:00");
  const [quickEnd, setQuickEnd] = useState("17:00");
  const [quickRate, setQuickRate] = useState(1800);
  const [quickTransport, setQuickTransport] = useState(0);
  const [quickCompanyId, setQuickCompanyId] = useState("");

  // Target (editable)
  const [targetIncome, setTargetIncome] = useState(350000);
  const [editingTarget, setEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState("350000");

  useEffect(() => {
    Promise.all([
      fetch(`/api/jobs?year=${year}&month=${month}`).then((r) => r.json()),
      fetch("/api/companies").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([jobsData, companiesData, categoriesData]) => {
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      if (Array.isArray(companiesData) && companiesData.length > 0) {
        setQuickCompanyId(companiesData[0].id);
      }
      setLoading(false);
    });
  }, [year, month]);

  const calcIncome = (j: JobWithRelations) =>
    calculateJobIncome(
      j.hourlyRate,
      j.startTime,
      j.endTime,
      j.transportationFee,
      j.otherAllowances
    );

  const confirmedJobs = jobs.filter((j) => j.status === "confirmed");
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const appliedJobs = jobs.filter((j) => j.status === "applied");
  const offeredJobs = jobs.filter((j) => j.status === "offered");

  const confirmedIncome = confirmedJobs.reduce((s, j) => s + calcIncome(j), 0);
  const completedIncome = completedJobs.reduce((s, j) => s + calcIncome(j), 0);
  const appliedIncome = appliedJobs.reduce((s, j) => s + calcIncome(j), 0);
  const offeredIncome = offeredJobs.reduce((s, j) => s + calcIncome(j), 0);

  const earnedIncome = confirmedIncome + completedIncome;
  const potentialIncome = earnedIncome + appliedIncome + offeredIncome;
  const progress = Math.min((earnedIncome / targetIncome) * 100, 100);
  const remaining = Math.max(targetIncome - earnedIncome, 0);

  // Quick add preview
  const quickPreview = calculateJobIncome(
    quickRate,
    quickStart,
    quickEnd,
    quickTransport,
    0
  );
  const [sh, sm] = quickStart.split(":").map(Number);
  const [eh, em] = quickEnd.split(":").map(Number);
  let quickHours = eh - sh + (em - sm) / 60;
  if (quickHours <= 0) quickHours += 24;

  const handleQuickAdd = async () => {
    if (!quickCompanyId || !categories.length) return;
    setQuickAdding(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "シフト",
          dispatchCompanyId: quickCompanyId,
          jobCategoryId: categories[0].id,
          date: new Date(quickDate + "T00:00:00").toISOString(),
          startTime: quickStart,
          endTime: quickEnd,
          hourlyRate: quickRate,
          transportationFee: quickTransport,
          status: "confirmed",
          priority: "medium",
        }),
      });
      if (res.ok) {
        const newJob = await res.json();
        setJobs((prev) => [...prev, newJob]);
        const d = new Date(quickDate + "T00:00:00");
        d.setDate(d.getDate() + 1);
        setQuickDate(format(d, "yyyy-MM-dd"));
      }
    } finally {
      setQuickAdding(false);
    }
  };

  // Progress ring
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Motivation message
  const pace = dayOfMonth > 0 ? (earnedIncome / dayOfMonth) * daysInMonth : 0;
  const getMotivation = () => {
    if (progress >= 100)
      return { emoji: "🎉", msg: "目標達成！すごい！", color: "text-yellow-300" };
    if (progress >= 80)
      return { emoji: "💪", msg: `あと ${formatCurrency(remaining)} で達成！`, color: "text-green-300" };
    if (pace >= targetIncome)
      return { emoji: "✨", msg: "このペースなら今月達成できます！", color: "text-blue-200" };
    if (progress >= 50)
      return { emoji: "🏃", msg: `折り返し通過！残り ${formatCurrency(remaining)}`, color: "text-blue-200" };
    return { emoji: "📊", msg: `今月あと ${formatCurrency(remaining)} 必要`, color: "text-blue-200" };
  };
  const motivation = getMotivation();

  // Weekly schedule
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* ── Hero: Income Ring ── */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-start gap-4">
          {/* Left: numbers */}
          <div className="flex-1 min-w-0">
            <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">
              {year}年{month}月 確定収入
            </p>
            <p className="text-4xl font-black mt-1 tabular-nums leading-none">
              {formatCurrency(earnedIncome)}
            </p>
            {potentialIncome > earnedIncome && (
              <p className="text-blue-300 text-sm mt-1">
                最大見込み{" "}
                <span className="text-white font-bold">
                  {formatCurrency(potentialIncome)}
                </span>
              </p>
            )}
            <p className={cn("text-sm mt-3 font-medium", motivation.color)}>
              {motivation.emoji} {motivation.msg}
            </p>
          </div>

          {/* Right: ring */}
          <div className="shrink-0">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="10"
              />
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke="white"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
              <text
                x="60" y="56"
                textAnchor="middle"
                fill="white"
                fontSize="20"
                fontWeight="900"
              >
                {Math.round(progress)}%
              </text>
              <text
                x="60" y="70"
                textAnchor="middle"
                fill="rgba(255,255,255,0.6)"
                fontSize="9"
              >
                目標達成率
              </text>
            </svg>
          </div>
        </div>

        {/* Target row */}
        <div className="mt-3 bg-white/10 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-300">今月の目標</p>
            {editingTarget ? (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-white text-sm">¥</span>
                <input
                  type="number"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setTargetIncome(Number(tempTarget));
                      setEditingTarget(false);
                    }
                    if (e.key === "Escape") setEditingTarget(false);
                  }}
                  className="bg-white/20 text-white w-28 rounded px-2 py-0.5 text-sm"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setTargetIncome(Number(tempTarget));
                    setEditingTarget(false);
                  }}
                  className="text-white text-xs bg-white/20 px-2 py-1 rounded ml-1"
                >
                  決定
                </button>
              </div>
            ) : (
              <p className="text-white font-bold">{formatCurrency(targetIncome)}</p>
            )}
          </div>
          <button
            onClick={() => {
              setTempTarget(String(targetIncome));
              setEditingTarget(!editingTarget);
            }}
            className="text-xs text-blue-300 hover:text-white underline"
          >
            {editingTarget ? "キャンセル" : "変更"}
          </button>
        </div>
      </div>

      {/* ── Quick Add ── */}
      {companies.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">⚡</span>
            クイック追加
            <span className="text-xs font-normal text-gray-400 ml-1">
              日時・時給を入れるだけ
            </span>
          </h2>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>
              <label className="text-xs text-gray-500">日付</label>
              <input
                type="date"
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                className="w-full mt-0.5 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">勤務時間</label>
              <div className="flex items-center gap-1 mt-0.5">
                <input
                  type="time"
                  value={quickStart}
                  onChange={(e) => setQuickStart(e.target.value)}
                  className="flex-1 min-w-0 border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <span className="text-gray-400 text-xs shrink-0">〜</span>
                <input
                  type="time"
                  value={quickEnd}
                  onChange={(e) => setQuickEnd(e.target.value)}
                  className="flex-1 min-w-0 border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">時給（円）</label>
              <input
                type="number"
                value={quickRate}
                onChange={(e) => setQuickRate(Number(e.target.value))}
                step={50}
                className="w-full mt-0.5 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">派遣会社</label>
              <select
                value={quickCompanyId}
                onChange={(e) => setQuickCompanyId(e.target.value)}
                className="w-full mt-0.5 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview bar */}
          <div className="mt-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-center">
                <p className="text-xs text-gray-400">勤務時間</p>
                <p className="font-bold text-gray-700 tabular-nums">
                  {quickHours.toFixed(1)}h
                </p>
              </div>
              <span className="text-gray-300 text-lg">→</span>
              <div className="text-center">
                <p className="text-xs text-gray-400">この日の収入</p>
                <p className="text-2xl font-black text-green-600 tabular-nums">
                  {formatCurrency(quickPreview)}
                </p>
              </div>
              <span className="text-gray-300 text-lg">→</span>
              <div className="text-center">
                <p className="text-xs text-gray-400">追加後の月収</p>
                <p className="font-bold text-blue-600 tabular-nums">
                  {formatCurrency(earnedIncome + quickPreview)}
                </p>
              </div>
            </div>
            <button
              onClick={handleQuickAdd}
              disabled={quickAdding}
              className="bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 shadow-sm shrink-0"
            >
              {quickAdding ? "追加中..." : "+ 追加する"}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-amber-800 text-sm">
            まず派遣会社を登録すると、ここからすぐにシフトを追加できます！
          </p>
          <Link
            href="/companies/new"
            className="mt-2 inline-block text-sm font-bold text-amber-700 underline"
          >
            派遣会社を登録する →
          </Link>
        </div>
      )}

      {/* ── Pipeline ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-bold text-gray-800 mb-3">収入パイプライン</h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              label: "提案済",
              count: offeredJobs.length,
              income: offeredIncome,
              dot: "bg-yellow-400",
              card: "bg-yellow-50 border-yellow-100",
              text: "text-yellow-600",
            },
            {
              label: "応募済",
              count: appliedJobs.length,
              income: appliedIncome,
              dot: "bg-blue-400",
              card: "bg-blue-50 border-blue-100",
              text: "text-blue-600",
            },
            {
              label: "確定",
              count: confirmedJobs.length,
              income: confirmedIncome,
              dot: "bg-green-400",
              card: "bg-green-50 border-green-100",
              text: "text-green-600",
            },
            {
              label: "完了",
              count: completedJobs.length,
              income: completedIncome,
              dot: "bg-gray-400",
              card: "bg-gray-50 border-gray-100",
              text: "text-gray-600",
            },
          ].map((s) => (
            <div key={s.label} className={cn("border rounded-xl p-3 text-center", s.card)}>
              <div className={cn("w-2 h-2 rounded-full mx-auto mb-1.5", s.dot)} />
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={cn("text-2xl font-black", s.text)}>{s.count}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                {formatCurrency(s.income)}
              </p>
            </div>
          ))}
        </div>
        {potentialIncome > earnedIncome && (
          <p className="text-center text-xs text-gray-400 mt-3">
            全案件成立した場合の最大収入：
            <span className="font-bold text-gray-600 ml-1">
              {formatCurrency(potentialIncome)}
            </span>
          </p>
        )}
      </div>

      {/* ── Pending Alerts ── */}
      {offeredJobs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h2 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
            <span>⚠️</span> 対応が必要な案件（{offeredJobs.length}件）
          </h2>
          <div className="space-y-2">
            {offeredJobs.slice(0, 3).map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="flex items-center justify-between bg-white rounded-xl p-3 hover:shadow-sm transition-shadow"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{job.title}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(job.date), "M/d(E)", { locale: ja })}{" "}
                    {job.startTime}〜{job.endTime} · {job.dispatchCompany.companyName}
                  </p>
                </div>
                <span className="text-sm font-bold text-green-600 shrink-0 ml-2">
                  {formatCurrency(calcIncome(job))}
                </span>
              </Link>
            ))}
            {offeredJobs.length > 3 && (
              <Link
                href="/jobs"
                className="block text-center text-xs text-amber-700 hover:underline pt-1"
              >
                他 {offeredJobs.length - 3} 件を確認する →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Weekly Schedule ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-bold text-gray-800 mb-3">今週のスケジュール</h2>
        <div className="space-y-0.5">
          {weekDays.map((day) => {
            const dayJobs = jobs.filter((j) => isSameDay(new Date(j.date), day));
            const dayIncome = dayJobs
              .filter((j) => j.status === "confirmed" || j.status === "completed")
              .reduce((s, j) => s + calcIncome(j), 0);
            const isNow = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex gap-3 p-2 rounded-xl",
                  isNow && "bg-blue-50 ring-1 ring-blue-200"
                )}
              >
                <div
                  className={cn(
                    "w-14 shrink-0 text-center",
                    isNow ? "text-blue-600 font-bold" : "text-gray-500"
                  )}
                >
                  <p className="text-xs">{format(day, "E", { locale: ja })}</p>
                  <p className="text-lg font-bold leading-tight">
                    {format(day, "d")}
                  </p>
                  {dayIncome > 0 && (
                    <p className="text-xs text-green-600 font-medium">
                      {formatCurrency(dayIncome)}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  {dayJobs.length === 0 ? (
                    <p className="text-sm text-gray-300 leading-loose">休み</p>
                  ) : (
                    dayJobs.map((job) => {
                      const s = STATUS_MAP[job.status];
                      return (
                        <Link
                          key={job.id}
                          href={`/jobs/${job.id}`}
                          className="flex items-center gap-2 text-sm hover:text-blue-600 mb-0.5"
                        >
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded-md text-xs font-medium shrink-0",
                              s.bgColor,
                              s.color
                            )}
                          >
                            {s.label}
                          </span>
                          <span className="truncate">{job.title}</span>
                          {job.startTime && (
                            <span className="text-xs text-gray-400 shrink-0">
                              {job.startTime}〜
                            </span>
                          )}
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

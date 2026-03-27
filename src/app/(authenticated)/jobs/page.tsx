"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { STATUS_MAP, PRIORITY_MAP, formatCurrency, calculateJobIncome, cn } from "@/lib/utils";
import type { JobWithRelations } from "@/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobWithRelations[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/jobs?${params}`);
      if (res.ok) setJobs(await res.json());
      setLoading(false);
    }
    fetchJobs();
  }, [statusFilter]);

  async function handleDelete(id: string) {
    if (!confirm("この案件を削除しますか？")) return;
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    setJobs(jobs.filter((j) => j.id !== id));
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold">案件管理</h1>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">すべてのステータス</option>
            <option value="offered">提案済み</option>
            <option value="applied">応募済み</option>
            <option value="confirmed">確定</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
            <option value="declined">辞退</option>
          </select>
          <Link
            href="/jobs/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            ＋ 新規登録
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">読み込み中...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-3">案件がありません</p>
          <Link href="/jobs/new" className="text-blue-600 hover:underline text-sm">
            最初の案件を登録する
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => {
            const statusInfo = STATUS_MAP[job.status];
            const priorityInfo = PRIORITY_MAP[job.priority];
            const income = calculateJobIncome(job.hourlyRate, job.startTime, job.endTime, job.transportationFee, job.otherAllowances);
            return (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusInfo.bgColor, statusInfo.color)}>
                        {statusInfo.label}
                      </span>
                      <span className={cn("text-xs font-medium", priorityInfo.color)}>
                        {priorityInfo.label}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: job.dispatchCompany.color }} />
                        {job.dispatchCompany.companyName}
                      </span>
                    </div>
                    <Link href={`/jobs/${job.id}`} className="font-medium text-gray-900 hover:text-blue-600 block truncate">
                      {job.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                      <span>{format(new Date(job.date), "M/d(E)", { locale: ja })}</span>
                      {job.startTime && <span>{job.startTime}-{job.endTime}</span>}
                      <span>{job.jobCategory.name}</span>
                      {job.facilityName && <span>{job.facilityName}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{formatCurrency(income)}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(job.hourlyRate)}/h</p>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="text-xs text-red-500 hover:text-red-700 mt-1"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

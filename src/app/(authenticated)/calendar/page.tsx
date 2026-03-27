"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import MonthView from "@/components/calendar/MonthView";
import JobDetailModal from "@/components/calendar/JobDetailModal";
import type { JobWithRelations } from "@/types";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jobs, setJobs] = useState<JobWithRelations[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobWithRelations | null>(null);
  const [filterCompanyId, setFilterCompanyId] = useState<string>("");
  const [companies, setCompanies] = useState<any[]>([]);

  const fetchJobs = useCallback(async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    let url = `/api/jobs?year=${year}&month=${month}`;
    if (filterCompanyId) url += `&companyId=${filterCompanyId}`;
    const res = await fetch(url);
    if (res.ok) setJobs(await res.json());
  }, [currentDate, filterCompanyId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetch("/api/companies").then(r => r.json()).then(setCompanies).catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ◀
          </button>
          <h1 className="text-xl font-bold">
            {format(currentDate, "yyyy年M月", { locale: ja })}
          </h1>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ▶
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-sm text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
          >
            今月
          </button>
        </div>

        <select
          value={filterCompanyId}
          onChange={(e) => setFilterCompanyId(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
        >
          <option value="">すべての派遣会社</option>
          {companies.map((c: any) => (
            <option key={c.id} value={c.id}>{c.companyName}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400 inline-block" /> 提案済み</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-400 inline-block" /> 応募済み</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400 inline-block" /> 確定</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-400 inline-block" /> 完了</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> キャンセル</span>
      </div>

      <MonthView
        currentDate={currentDate}
        jobs={jobs}
        onJobClick={setSelectedJob}
      />

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={fetchJobs}
        />
      )}
    </div>
  );
}

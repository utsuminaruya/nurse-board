"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import type { JobWithRelations } from "@/types";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [job, setJob] = useState<JobWithRelations | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/jobs/${params.id}`).then((r) => r.json()),
      fetch("/api/companies").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([j, c, cat]) => {
      setJob(j);
      setCompanies(c);
      setCategories(cat);
      setLoading(false);
    });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    const data = {
      title: fd.get("title") as string,
      dispatchCompanyId: fd.get("dispatchCompanyId") as string,
      jobCategoryId: fd.get("jobCategoryId") as string,
      date: fd.get("date") as string,
      startTime: fd.get("startTime") as string,
      endTime: fd.get("endTime") as string,
      hourlyRate: Number(fd.get("hourlyRate")) || 0,
      transportationFee: Number(fd.get("transportationFee")) || 0,
      otherAllowances: Number(fd.get("otherAllowances")) || 0,
      facilityName: fd.get("facilityName") as string,
      address: fd.get("address") as string,
      status: fd.get("status") as string,
      priority: fd.get("priority") as string,
      notes: fd.get("notes") as string,
      description: fd.get("description") as string,
    };

    try {
      const res = await fetch(`/api/jobs/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "更新に失敗しました");
        setSaving(false);
        return;
      }

      router.push("/jobs");
    } catch {
      setError("エラーが発生しました");
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">読み込み中...</div>;
  if (!job) return <div className="text-center py-12 text-gray-500">案件が見つかりません</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">案件編集</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
            <input name="title" required defaultValue={job.title} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">派遣会社 *</label>
            <select name="dispatchCompanyId" required defaultValue={job.dispatchCompanyId} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {companies.map((c: any) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
            <select name="jobCategoryId" required defaultValue={job.jobCategoryId} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日付 *</label>
            <input name="date" type="date" required defaultValue={format(new Date(job.date), "yyyy-MM-dd")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始時刻</label>
              <input name="startTime" type="time" defaultValue={job.startTime} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終了時刻</label>
              <input name="endTime" type="time" defaultValue={job.endTime} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">時給（円）</label>
            <input name="hourlyRate" type="number" defaultValue={job.hourlyRate} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">交通費（円）</label>
            <input name="transportationFee" type="number" defaultValue={job.transportationFee} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">その他手当（円）</label>
            <input name="otherAllowances" type="number" defaultValue={job.otherAllowances} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select name="status" defaultValue={job.status} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="offered">提案済み</option>
              <option value="applied">応募済み</option>
              <option value="confirmed">確定</option>
              <option value="completed">完了</option>
              <option value="cancelled">キャンセル</option>
              <option value="declined">辞退</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
            <select name="priority" defaultValue={job.priority} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">施設名</label>
            <input name="facilityName" defaultValue={job.facilityName} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
            <input name="address" defaultValue={job.address} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea name="description" rows={2} defaultValue={job.description} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea name="notes" rows={2} defaultValue={job.notes} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? "保存中..." : "保存する"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}

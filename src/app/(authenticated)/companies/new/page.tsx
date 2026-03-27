"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

export default function NewCompanyPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const data = {
      companyName: fd.get("companyName") as string,
      contactPerson: fd.get("contactPerson") as string,
      phone: fd.get("phone") as string,
      email: fd.get("email") as string,
      lineId: fd.get("lineId") as string,
      communicationChannel: fd.get("communicationChannel") as string,
      notes: fd.get("notes") as string,
      color: selectedColor,
    };

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "作成に失敗しました");
        setLoading(false);
        return;
      }

      router.push("/companies");
    } catch {
      setError("エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">派遣会社登録</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">会社名 *</label>
          <input name="companyName" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="例: メディカルスタッフ株式会社" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">担当者名</label>
          <input name="contactPerson" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
          <input name="phone" type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <input name="email" type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LINE ID</label>
          <input name="lineId" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">連絡手段</label>
          <select name="communicationChannel" defaultValue="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="email">メール</option>
            <option value="line">LINE</option>
            <option value="app">アプリ</option>
            <option value="phone">電話</option>
            <option value="fax">FAX</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">カレンダー表示色</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === color ? "border-gray-800 scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
          <textarea name="notes" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? "登録中..." : "登録する"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface CompanyWithCount {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  lineId: string;
  communicationChannel: string;
  notes: string;
  color: string;
  _count: { jobs: number };
}

const CHANNEL_LABELS: Record<string, string> = {
  email: "メール",
  line: "LINE",
  app: "アプリ",
  phone: "電話",
  fax: "FAX",
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("この派遣会社を削除しますか？関連する案件も削除されます。")) return;
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    setCompanies(companies.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">派遣会社管理</h1>
        <Link
          href="/companies/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          ＋ 新規登録
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">読み込み中...</div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-3">派遣会社が登録されていません</p>
          <Link href="/companies/new" className="text-blue-600 hover:underline text-sm">
            最初の派遣会社を登録する
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {companies.map((company) => (
            <div key={company.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-4 h-4 rounded-full inline-block shrink-0" style={{ backgroundColor: company.color }} />
                  <h3 className="font-bold text-gray-900">{company.companyName}</h3>
                </div>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>

              <div className="space-y-1.5 text-sm text-gray-600">
                {company.contactPerson && (
                  <p>担当: {company.contactPerson}</p>
                )}
                {company.phone && <p>TEL: {company.phone}</p>}
                {company.email && <p>Email: {company.email}</p>}
                {company.lineId && <p>LINE: {company.lineId}</p>}
                <p>連絡手段: {CHANNEL_LABELS[company.communicationChannel] || company.communicationChannel}</p>
                <p className="text-blue-600 font-medium">案件数: {company._count.jobs}件</p>
              </div>

              {company.notes && (
                <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded p-2">{company.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

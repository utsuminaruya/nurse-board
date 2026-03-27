"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { STATUS_MAP, PRIORITY_MAP, formatCurrency, calculateJobIncome, cn } from "@/lib/utils";
import type { JobWithRelations, JobStatus } from "@/types";

interface JobDetailModalProps {
  job: JobWithRelations;
  onClose: () => void;
  onUpdate: () => void;
}

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: "offered", label: "提案済み" },
  { value: "applied", label: "応募済み" },
  { value: "confirmed", label: "確定" },
  { value: "completed", label: "完了" },
  { value: "cancelled", label: "キャンセル" },
  { value: "declined", label: "辞退" },
];

export default function JobDetailModal({ job, onClose, onUpdate }: JobDetailModalProps) {
  const [status, setStatus] = useState(job.status);
  const [updating, setUpdating] = useState(false);

  const statusInfo = STATUS_MAP[job.status];
  const priorityInfo = PRIORITY_MAP[job.priority];
  const income = calculateJobIncome(
    job.hourlyRate,
    job.startTime,
    job.endTime,
    job.transportationFee,
    job.otherAllowances
  );

  async function handleStatusChange(newStatus: string) {
    setUpdating(true);
    try {
      await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      onUpdate();
    } catch {
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-t-2xl md:rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-2xl md:rounded-t-xl">
          <h2 className="font-bold text-lg">{job.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusInfo.bgColor, statusInfo.color)}>
              {statusInfo.label}
            </span>
            <span className={cn("text-xs font-medium", priorityInfo.color)}>
              優先度: {priorityInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">日付</span>
              <p className="font-medium">{format(new Date(job.date), "yyyy年M月d日(E)", { locale: ja })}</p>
            </div>
            <div>
              <span className="text-gray-500">時間</span>
              <p className="font-medium">{job.startTime} - {job.endTime}</p>
            </div>
            <div>
              <span className="text-gray-500">派遣会社</span>
              <p className="font-medium flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: job.dispatchCompany.color }} />
                {job.dispatchCompany.companyName}
              </p>
            </div>
            <div>
              <span className="text-gray-500">カテゴリ</span>
              <p className="font-medium">{job.jobCategory.name}</p>
            </div>
            {job.facilityName && (
              <div className="col-span-2">
                <span className="text-gray-500">施設名</span>
                <p className="font-medium">{job.facilityName}</p>
              </div>
            )}
            {job.address && (
              <div className="col-span-2">
                <span className="text-gray-500">住所</span>
                <p className="font-medium">{job.address}</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-600">時給</span>
                <p className="font-bold text-blue-800">{formatCurrency(job.hourlyRate)}</p>
              </div>
              <div>
                <span className="text-blue-600">見込み収入</span>
                <p className="font-bold text-blue-800">{formatCurrency(income)}</p>
              </div>
              {job.transportationFee > 0 && (
                <div>
                  <span className="text-blue-600">交通費</span>
                  <p className="font-medium text-blue-800">{formatCurrency(job.transportationFee)}</p>
                </div>
              )}
              {job.otherAllowances > 0 && (
                <div>
                  <span className="text-blue-600">その他手当</span>
                  <p className="font-medium text-blue-800">{formatCurrency(job.otherAllowances)}</p>
                </div>
              )}
            </div>
          </div>

          {job.notes && (
            <div>
              <span className="text-sm text-gray-500">メモ</span>
              <p className="text-sm mt-1">{job.notes}</p>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-500 mb-1">ステータス変更</label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={updating || status === opt.value}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                    status === opt.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <a
              href={`/jobs/${job.id}`}
              className="flex-1 text-center bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              詳細・編集
            </a>
            <button
              onClick={onClose}
              className="flex-1 text-center border border-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

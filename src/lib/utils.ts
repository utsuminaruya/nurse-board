export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function calculateJobIncome(
  hourlyRate: number,
  startTime: string,
  endTime: string,
  transportationFee: number = 0,
  otherAllowances: number = 0
): number {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  let hours = endH - startH + (endM - startM) / 60;
  if (hours < 0) hours += 24;
  return Math.round(hourlyRate * hours + transportationFee + otherAllowances);
}

export const STATUS_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  offered: { label: "提案済み", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  applied: { label: "応募済み", color: "text-blue-700", bgColor: "bg-blue-100" },
  confirmed: { label: "確定", color: "text-green-700", bgColor: "bg-green-100" },
  completed: { label: "完了", color: "text-gray-700", bgColor: "bg-gray-100" },
  cancelled: { label: "キャンセル", color: "text-red-700", bgColor: "bg-red-100" },
  declined: { label: "辞退", color: "text-gray-500", bgColor: "bg-gray-50" },
};

export const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  high: { label: "高", color: "text-red-600" },
  medium: { label: "中", color: "text-yellow-600" },
  low: { label: "低", color: "text-gray-500" },
};

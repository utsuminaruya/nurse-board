"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "ダッシュボード", href: "/", icon: "📊" },
  { name: "カレンダー", href: "/calendar", icon: "📅" },
  { name: "案件管理", href: "/jobs", icon: "💼" },
  { name: "派遣会社", href: "/companies", icon: "🏢" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🩺</span>
            <span className="text-xl font-bold text-blue-600">NurseBoard</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

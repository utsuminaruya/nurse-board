"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "ホーム", href: "/", icon: "📊" },
  { name: "カレンダー", href: "/calendar", icon: "📅" },
  { name: "案件", href: "/jobs", icon: "💼" },
  { name: "会社", href: "/companies", icon: "🏢" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around">
        {navigation.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-3 text-xs",
                isActive ? "text-blue-600" : "text-gray-500"
              )}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

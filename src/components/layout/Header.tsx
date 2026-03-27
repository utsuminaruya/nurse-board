"use client";

import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="md:hidden flex items-center gap-2">
        <span className="text-2xl">🩺</span>
        <span className="text-lg font-bold text-blue-600">NurseBoard</span>
      </div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        {session?.user && (
          <>
            <span className="text-sm text-gray-600 hidden sm:inline">
              {session.user.name}
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              ログアウト
            </button>
          </>
        )}
      </div>
    </header>
  );
}

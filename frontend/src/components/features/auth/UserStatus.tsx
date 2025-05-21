"use client";

import { useAuth } from "@/store/AuthContext";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export function UserStatus() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
      >
        <UserCircleIcon className="h-6 w-6" />
        <span>Login</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <UserCircleIcon className="h-6 w-6 text-neutral-600 dark:text-neutral-300" />
        <span className="text-neutral-900 dark:text-white">
          {user.username}
        </span>
      </div>
      <button
        onClick={logout}
        className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
      >
        Sign out
      </button>
    </div>
  );
}

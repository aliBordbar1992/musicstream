"use client";

import Link from "next/link";
import UserImage from "@/components/ui/UserImage";
import { useAuth } from "@/store/AuthContext";

export function UserStatus() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/login"
          className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400"
        >
          Register
        </Link>
      </div>
    );
  }

  const displayName = user?.name || user?.username || "Guest";

  return (
    <div className="flex items-center space-x-4">
      <Link
        href="/profile"
        className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400"
      >
        <UserImage src={user?.profile_picture} alt={displayName} size="lg" />
        <span className="font-medium">{displayName}</span>
      </Link>
      <button
        onClick={logout}
        className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400"
      >
        Logout
      </button>
    </div>
  );
}

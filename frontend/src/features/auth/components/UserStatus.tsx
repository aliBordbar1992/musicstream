"use client";

import Link from "next/link";
import UserImage from "@/components/ui/UserImage";
import { User } from "@/types/domain";

export interface UserStatusProps {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => void;
}

export function UserStatus({ isAuthenticated, user, logout }: UserStatusProps) {
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
        <UserImage src={user?.profile_picture} alt={displayName} size="md" />
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

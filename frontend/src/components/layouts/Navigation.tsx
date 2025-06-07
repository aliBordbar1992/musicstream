"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  MusicalNoteIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { UserStatus } from "@/features/auth/components/UserStatus";
import { useAuth } from "@/features/auth/AuthContext";
import { useCurrentUser } from "@/features/auth/useCurrentUser";

export default function Navigation() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { logout } = useAuth();
  const { isAuthenticated, user } = useCurrentUser();
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <Link
            href="/"
            className="text-xl font-bold text-neutral-900 dark:text-white"
          >
            MuSync
          </Link>

          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className={`flex items-center space-x-2 ${
                isActive("/")
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-neutral-600 dark:text-neutral-300"
              } hover:text-primary-600 dark:hover:text-primary-400`}
            >
              <HomeIcon className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link
              href="/music"
              className={`flex items-center space-x-2 ${
                isActive("/music")
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-neutral-600 dark:text-neutral-300"
              } hover:text-primary-600 dark:hover:text-primary-400`}
            >
              <MusicalNoteIcon className="h-5 w-5" />
              <span>Music</span>
            </Link>
            <Link
              href="/playlists"
              className={`flex items-center space-x-2 ${
                isActive("/playlists")
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-neutral-600 dark:text-neutral-300"
              } hover:text-primary-600 dark:hover:text-primary-400`}
            >
              <QueueListIcon className="h-5 w-5" />
              <span>Playlists</span>
            </Link>
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
            )}
            <UserStatus
              isAuthenticated={isAuthenticated}
              user={user}
              logout={logout}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { useState } from "react";
import SecurityWarning from "@/features/auth/components/SecurityWarning";
import LoginForm from "@/features/auth/components/LoginForm";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import Link from "next/link";
import { useAuthController } from "@/features/auth/useAuthController";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [isWarningAccepted, setIsWarningAccepted] = useState(false);
  const { login } = useAuthController();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  return (
    <LayoutContent>
      <div className="max-w-md mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
        <div className="mb-8 space-y-6 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
          <SecurityWarning onAccept={setIsWarningAccepted} />
          <LoginForm
            isDisabled={!isWarningAccepted}
            formClassName="space-y-6"
            onLogin={(username, password) =>
              login(username, password, redirect ?? null)
            }
          />
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-400 hover:text-indigo-500"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </LayoutContent>
  );
}

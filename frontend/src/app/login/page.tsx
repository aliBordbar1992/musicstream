"use client";

import { useState } from "react";
import SecurityWarning from "@/features/auth/login/components/SecurityWarning";
import LoginForm from "@/features/auth/login/components/LoginForm";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import Link from "next/link";
import { useAuthController } from "@/features/auth/useAuthController";

export default function LoginPage() {
  const [isWarningAccepted, setIsWarningAccepted] = useState(false);
  const { login } = useAuthController();

  return (
    <LayoutContent>
      <div className="max-w-md mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
        <div className="mb-8 space-y-6 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
          <SecurityWarning onAccept={setIsWarningAccepted} />
          <LoginForm
            isDisabled={!isWarningAccepted}
            formClassName="space-y-6"
            onLogin={(username, password) => login(username, password, null)}
          />
          <div className="text-sm text-center">
            <Link
              href="/register"
              className="font-medium text-indigo-400 hover:text-indigo-500"
            >
              Don&apos;t have an account? Register
            </Link>
          </div>
        </div>
      </div>
    </LayoutContent>
  );
}

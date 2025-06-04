"use client";

import Link from "next/link";
import SecurityWarning from "@/features/auth/components/SecurityWarning";
import { useState } from "react";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import { useAuthController } from "@/features/auth/useAuthController";
import RegisterForm from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  const [isWarningAccepted, setIsWarningAccepted] = useState(false);
  const { register } = useAuthController();
  return (
    <LayoutContent>
      <div className="max-w-md mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Register</h1>
        <div className="mb-8 space-y-6 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
          <SecurityWarning onAccept={setIsWarningAccepted} />
          <RegisterForm
            isDisabled={!isWarningAccepted}
            formClassName="space-y-6"
            onRegister={register}
          />

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-400 hover:text-indigo-500"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </LayoutContent>
  );
}

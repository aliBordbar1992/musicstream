"use client";

import { useAuth } from "@/store/AuthContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SecurityWarning from "@/components/features/auth/SecurityWarning";
import { useState } from "react";
import { LayoutContent } from "@/components/layouts/LayoutContent";

const schema = yup
  .object({
    username: yup
      .string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters"),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: yup
      .string()
      .required("Please confirm your password")
      .oneOf([yup.ref("password")], "Passwords must match"),
  })
  .required();

type RegisterFormData = yup.InferType<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [isWarningAccepted, setIsWarningAccepted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (!isWarningAccepted) return;

    try {
      await registerUser(data.username, data.password);
      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch {
      toast.error("Registration failed. Username may already be taken.");
    }
  };

  return (
    <LayoutContent>
      <div className="max-w-md mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Register</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-8 space-y-6 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm"
        >
          <SecurityWarning onAccept={setIsWarningAccepted} />

          <Input
            id="username"
            label="Username"
            type="text"
            {...register("username")}
            error={errors.username?.message}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
          />

          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            disabled={!isWarningAccepted}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Login here
          </Link>
        </p>
      </div>
    </LayoutContent>
  );
}

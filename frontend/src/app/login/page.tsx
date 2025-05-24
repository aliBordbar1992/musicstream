"use client";

import { useState } from "react";
import { useAuth } from "@/store/AuthContext";
import Link from "next/link";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password);
    } catch {
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutContent>
      <div className="max-w-md mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Login</h1>

        <form
          className="mb-8 space-y-6 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <Input
              id="username"
              name="username"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              id="password"
              name="password"
              required
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <Button
            type="submit"
            isLoading={isLoading}
            className={`w-full ${isLoading ? "" : "py-4"}`}
          >
            {isLoading ? "" : "Sign in"}
          </Button>
          <div className="text-sm text-center">
            <Link
              href="/register"
              className="font-medium text-indigo-400 hover:text-indigo-500"
            >
              Don&apos;t have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </LayoutContent>
  );
}

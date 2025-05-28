"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { auth } from "@/lib/api";
import { User } from "@/types/domain";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => auth.getCurrentUser(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const login = useCallback(
    async (username: string, password: string) => {
      const { token } = await auth.login(username, password);
      Cookies.set("token", token);
      // Invalidate and refetch current user
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/");
    },
    [router, queryClient]
  );

  const logout = useCallback(() => {
    Cookies.remove("token");
    queryClient.setQueryData(["currentUser"], null);
    router.push("/login");
  }, [router, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

"use client";

import React, { createContext, useContext } from "react";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { useAuthController } from "@/features/auth/useAuthController";
import { User } from "@/types/domain";

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string,
    redirect: string | null
  ) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  //TODO: remove gradually
  const authState = useAuthStore();
  const controller = useAuthController();
  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        ...controller,
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

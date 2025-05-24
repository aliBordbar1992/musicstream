"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth } from "@/lib/api";
import Cookies from "js-cookie";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { User } from "@/types/domain";
import { AuthContextType } from "@/types/context";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleUnauthorized = useCallback(() => {
    console.log("handleUnauthorized", pathname);
    if (pathname !== "/login") {
      Cookies.remove("token");
      setUser(null);
      const currentPath =
        pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : "");
      console.log("Redirecting to login with path:", currentPath);
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      setLoading(false);
    }
  }, [pathname, searchParams, router]);

  useEffect(() => {
    console.log("useEffect", pathname);
    const token = Cookies.get("token");

    // If we're on the login page and have a redirect parameter, don't check auth
    if (pathname === "/login" && searchParams.has("redirect")) {
      setLoading(false);
      return;
    }

    if (!token) {
      handleUnauthorized();
      return;
    }

    auth
      .getCurrentUser()
      .then((user) => {
        setUser(user);
        setLoading(false);
      })
      .catch(() => {
        handleUnauthorized();
      });
  }, [pathname, searchParams, handleUnauthorized]);

  const login = async (username: string, password: string) => {
    const { token } = await auth.login(username, password);
    Cookies.set("token", token, { expires: 7 }); // Token expires in 7 days

    // Fetch user data after successful login
    const userData = await auth.getCurrentUser();
    setUser(userData);

    // Get redirect path from URL or default to home
    const redirectPath = searchParams.get("redirect");
    console.log("Login successful, redirecting to:", redirectPath);
    if (redirectPath) {
      router.push(decodeURIComponent(redirectPath));
    } else {
      router.push("/");
    }
  };

  const register = async (username: string, password: string) => {
    await auth.register(username, password);
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, handleUnauthorized }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

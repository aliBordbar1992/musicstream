import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AuthService } from "@/features/auth/AuthService";
import { useAuthStore } from "@/features/auth/useAuthStore";
export function useAuthController() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  const login = async (
    username: string,
    password: string,
    redirect: string | null
  ) => {
    await AuthService.login(username, password);
    const user = await AuthService.getCurrentUser();
    setUser(user);
    await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    router.push(redirect || "/profile");
  };

  const register = async (username: string, password: string) => {
    await AuthService.register(username, password);
    await AuthService.login(username, password);
    const user = await AuthService.getCurrentUser();
    setUser(user);
    await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    router.push("/profile");
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    await queryClient.removeQueries({ queryKey: ["currentUser"] });
    router.push("/");
  };

  return { login, register, logout };
}

import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@/features/auth/AuthService";

export function useCurrentUser() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => AuthService.getCurrentUser(),
    staleTime: 1000 * 60 * 5,
  });

  return { isAuthenticated: !!user, user: user || null };
}

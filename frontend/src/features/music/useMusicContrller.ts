import { music } from "@/lib/api";
import { Music } from "@/types/domain";
import { useQuery } from "@tanstack/react-query";
export function useMusicController() {}

export class MusicService {
  static async getUserMusic(): Promise<Music[]> {
    const response = await music.getUserMusic();
    console.log("response", response);
    return response || [];
  }
}

export function useUserMusic() {
  return useQuery({
    queryKey: ["userMusic"],
    queryFn: MusicService.getUserMusic,
    staleTime: 1000 * 60 * 5,
  });
}

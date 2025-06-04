import { auth } from "@/lib/api";
import { User } from "@/types/domain";
import Cookies from "js-cookie";
export class AuthService {
  static async login(username: string, password: string): Promise<void> {
    const { token } = await auth.login(username, password);
    Cookies.set("token", token);
  }

  static async register(username: string, password: string): Promise<void> {
    await auth.register(username, password);
  }

  static async logout(): Promise<void> {
    Cookies.remove("token");
  }

  static async getCurrentUser(): Promise<User> {
    return auth.getCurrentUser();
  }
}

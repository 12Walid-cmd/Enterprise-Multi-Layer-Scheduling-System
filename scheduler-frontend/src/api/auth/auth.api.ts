import { http } from "../http";
import type { AuthTokens, AuthUser } from "../../types/auth";

export const AuthAPI = {
  login: async (email: string, password: string): Promise<AuthTokens> => {
    const res = await http.post("/auth/login", { email, password });
    return res.data;
  },

  register: async (data: any): Promise<AuthTokens> => {
    const res = await http.post("/auth/register", data);
    return res.data;
  },

  me: async (): Promise<AuthUser> => {
    const res = await http.get("/auth/me");
    return res.data;
  },
};
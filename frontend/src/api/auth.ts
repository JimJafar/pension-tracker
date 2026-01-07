import client from "./client";
import type {
  LoginCredentials,
  AuthResponse,
  SessionResponse,
} from "../types/auth";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await client.post("/auth/logout");
  },

  checkSession: async (): Promise<SessionResponse> => {
    const response = await client.get<SessionResponse>("/auth/session");
    return response.data;
  },
};

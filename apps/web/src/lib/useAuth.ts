import { useState } from "react";
import type { AuthUser, AuthResponse } from "@stars-factory/shared";
import { apiClient } from "./apiClient";

const TOKEN_KEY = "token";
const USER_KEY = "user";

function loadFromStorage(): { token: string | null; user: AuthUser | null } {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);
  const user = raw ? (JSON.parse(raw) as AuthUser) : null;
  return { token, user };
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => loadFromStorage().token);
  const [user, setUser] = useState<AuthUser | null>(() => loadFromStorage().user);

  function persist(data: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function login(email: string, password: string) {
    const data = await apiClient.post<AuthResponse>("/auth/login", { email, password });
    persist(data);
  }

  async function register(email: string, password: string, name?: string) {
    const data = await apiClient.post<AuthResponse>("/auth/register", { email, password, name });
    persist(data);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  return {
    user,
    token,
    isAuthenticated: token !== null,
    login,
    register,
    logout,
  };
}

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../server";
import { useAuth } from "@/lib/useAuth";

const mockAuthResponse = {
  token: "test-token-123",
  user: { id: "user-1", email: "test@example.com", name: "Test User", createdAt: new Date().toISOString() },
};

beforeEach(() => {
  localStorage.clear();
});

describe("useAuth", () => {
  it("démarre avec user et token null si localStorage vide", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("login stocke le token et l'utilisateur", async () => {
    server.use(
      http.post("http://localhost:3001/auth/login", () =>
        HttpResponse.json(mockAuthResponse)
      )
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("test@example.com", "password123");
    });

    expect(result.current.token).toBe("test-token-123");
    expect(result.current.user?.email).toBe("test@example.com");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("login persiste le token dans localStorage", async () => {
    server.use(
      http.post("http://localhost:3001/auth/login", () =>
        HttpResponse.json(mockAuthResponse)
      )
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("test@example.com", "password123");
    });

    expect(localStorage.getItem("token")).toBe("test-token-123");
    expect(JSON.parse(localStorage.getItem("user")!).email).toBe("test@example.com");
  });

  it("logout vide le state et localStorage", async () => {
    server.use(
      http.post("http://localhost:3001/auth/login", () =>
        HttpResponse.json(mockAuthResponse)
      )
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("test@example.com", "password123");
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("initialise depuis localStorage si token présent", () => {
    localStorage.setItem("token", "existing-token");
    localStorage.setItem("user", JSON.stringify(mockAuthResponse.user));

    const { result } = renderHook(() => useAuth());

    expect(result.current.token).toBe("existing-token");
    expect(result.current.user?.email).toBe("test@example.com");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("register stocke le token et l'utilisateur", async () => {
    server.use(
      http.post("http://localhost:3001/auth/register", () =>
        HttpResponse.json(mockAuthResponse, { status: 201 })
      )
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register("new@example.com", "password123", "New User");
    });

    expect(result.current.token).toBe("test-token-123");
    expect(result.current.isAuthenticated).toBe(true);
  });
});

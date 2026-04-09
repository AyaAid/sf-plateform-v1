import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../server";
import { LoginPage } from "@/pages/LoginPage";
import { AuthProvider } from "@/context/AuthContext";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLoginPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  it("affiche le formulaire de connexion", () => {
    renderLoginPage();
    expect(screen.getByPlaceholderText("boss@exemple.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
  });

  it("redirige vers /app après un login réussi", async () => {
    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText("boss@exemple.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/app", { replace: true });
    });
  });

  it("affiche un message d'erreur si le login échoue", async () => {
    server.use(
      http.post("http://localhost:3001/auth/login", () =>
        HttpResponse.json({ error: "Invalid credentials" }, { status: 401 })
      )
    );

    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText("boss@exemple.com"), "bad@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/connexion impossible/i)).toBeInTheDocument();
    });
  });

  it("désactive le bouton et affiche '...' pendant le chargement", async () => {
    // Handler qui ne répond jamais → garde le loading indéfiniment
    server.use(
      http.post("http://localhost:3001/auth/login", () => new Promise(() => {}))
    );

    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText("boss@exemple.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    const btn = screen.getByRole("button", { name: "..." });
    expect(btn).toBeDisabled();
  });
});

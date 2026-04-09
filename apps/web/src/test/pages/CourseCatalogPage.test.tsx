import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../server";
import { CourseCatalogPage } from "@/pages/CourseCatalogPage/CourseCatalogPage";

const mockCourses = [
  {
    id: "course-1",
    slug: "microgravity",
    title: "Microgravity 101",
    description: "Découvrir les bases de la microgravité",
    level: "Beginner",
    isPremium: false,
    createdAt: new Date().toISOString(),
    _count: { capsules: 1 },
  },
  {
    id: "course-2",
    slug: "advanced-physics",
    title: "Advanced Physics",
    description: "Physique avancée pour experts",
    level: "Advanced",
    isPremium: true,
    createdAt: new Date().toISOString(),
    _count: { capsules: 3 },
  },
];

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <CourseCatalogPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("CourseCatalogPage", () => {
  it("affiche les cours retournés par l'API", async () => {
    server.use(
      http.get("http://localhost:3001/courses", () => HttpResponse.json(mockCourses))
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Microgravity 101")).toBeInTheDocument();
      expect(screen.getByText("Advanced Physics")).toBeInTheDocument();
    });
  });

  it("affiche un message de chargement initialement", () => {
    renderPage();
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it("affiche un message d'erreur si l'API échoue", async () => {
    server.use(
      http.get("http://localhost:3001/courses", () =>
        HttpResponse.json({ error: "Server error" }, { status: 500 })
      )
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/impossible de charger/i)).toBeInTheDocument();
    });
  });

  it("filtre les cours par recherche textuelle", async () => {
    server.use(
      http.get("http://localhost:3001/courses", () => HttpResponse.json(mockCourses))
    );

    renderPage();

    await waitFor(() => screen.getByText("Microgravity 101"));

    await userEvent.type(screen.getByPlaceholderText(/search courses/i), "Advanced");

    expect(screen.getByText("Advanced Physics")).toBeInTheDocument();
    expect(screen.queryByText("Microgravity 101")).not.toBeInTheDocument();
  });

  it("filtre les cours par niveau", async () => {
    server.use(
      http.get("http://localhost:3001/courses", () => HttpResponse.json(mockCourses))
    );

    renderPage();

    await waitFor(() => screen.getByText("Microgravity 101"));

    // Le Select est un dropdown custom : clic sur le bouton toggle, puis sur l'option
    await userEvent.click(screen.getByRole("button", { name: /all levels/i }));
    await userEvent.click(screen.getByRole("button", { name: "Beginner" }));

    expect(screen.getByText("Microgravity 101")).toBeInTheDocument();
    expect(screen.queryByText("Advanced Physics")).not.toBeInTheDocument();
  });

  it("affiche 'no course matches' quand aucun résultat", async () => {
    server.use(
      http.get("http://localhost:3001/courses", () => HttpResponse.json(mockCourses))
    );

    renderPage();

    await waitFor(() => screen.getByText("Microgravity 101"));

    await userEvent.type(screen.getByPlaceholderText(/search courses/i), "xyzabc");

    expect(screen.getByText(/no course matches/i)).toBeInTheDocument();
  });
});

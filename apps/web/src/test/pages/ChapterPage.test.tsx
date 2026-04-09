import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../server";
import { ChapterPage } from "@/pages/ChapterPage/ChapterPage";

const mockChapterData = {
  chapter: {
    id: "ch-1",
    title: "Introduction à la microgravité",
    sortOrder: 1,
    estMin: 10,
    mdPath: "courses/microgravity/01.md",
    moduleId: "mod-1",
  },
  markdown: "# Introduction\n\nContenu du **chapitre**.",
};

function renderPage(courseId = "course-1", chapterId = "ch-1") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={[`/app/courses/${courseId}/chapters/${chapterId}`]}>
      <QueryClientProvider client={qc}>
        <Routes>
          <Route
            path="/app/courses/:courseId/chapters/:chapterId"
            element={<ChapterPage />}
          />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("ChapterPage", () => {
  it("affiche le titre du chapitre", async () => {
    server.use(
      http.get("http://localhost:3001/chapters/:id", () =>
        HttpResponse.json(mockChapterData)
      )
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Introduction à la microgravité")).toBeInTheDocument();
    });
  });

  it("rend le contenu markdown", async () => {
    server.use(
      http.get("http://localhost:3001/chapters/:id", () =>
        HttpResponse.json(mockChapterData)
      )
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Introduction" })).toBeInTheDocument();
    });
  });

  it("affiche l'état de chargement initialement", () => {
    renderPage();
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it("affiche un message d'erreur si l'API échoue", async () => {
    server.use(
      http.get("http://localhost:3001/chapters/:id", () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 })
      )
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/introuvable/i)).toBeInTheDocument();
    });
  });

  it("le bouton 'Marquer comme terminé' appelle PUT /progress", async () => {
    server.use(
      http.get("http://localhost:3001/chapters/:id", () =>
        HttpResponse.json(mockChapterData)
      )
    );

    let progressCalled = false;
    server.use(
      http.put("http://localhost:3001/progress", () => {
        progressCalled = true;
        return HttpResponse.json({
          chapterId: "ch-1",
          status: "COMPLETED",
          score: null,
          updatedAt: new Date().toISOString(),
        });
      })
    );

    renderPage();

    await waitFor(() => screen.getByText("Introduction à la microgravité"));

    await userEvent.click(screen.getByRole("button", { name: /marquer comme terminé/i }));

    await waitFor(() => {
      expect(progressCalled).toBe(true);
    });
  });
});

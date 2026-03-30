import { http, HttpResponse } from "msw";

const BASE = "http://localhost:3001";

export const handlers = [
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({
      token: "test-token",
      user: { id: "user-1", email: "test@example.com", name: "Test", createdAt: new Date().toISOString() },
    })
  ),

  http.post(`${BASE}/auth/register`, () =>
    HttpResponse.json(
      {
        token: "test-token",
        user: { id: "user-1", email: "test@example.com", name: "Test", createdAt: new Date().toISOString() },
      },
      { status: 201 }
    )
  ),

  http.get(`${BASE}/courses`, () =>
    HttpResponse.json([
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
    ])
  ),

  http.get(`${BASE}/courses/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      slug: "microgravity",
      title: "Microgravity 101",
      description: "Découvrir les bases de la microgravité",
      level: "Beginner",
      isPremium: false,
      createdAt: new Date().toISOString(),
      capsules: [],
    })
  ),

  http.get(`${BASE}/chapters/:id`, ({ params }) =>
    HttpResponse.json({
      chapter: { id: params.id, title: "Bienvenue", sortOrder: 1, estMin: 10, mdPath: "courses/microgravity/01-welcome.md", moduleId: "mod-1" },
      markdown: "# Bienvenue\n\nContenu du chapitre.",
    })
  ),

  http.get(`${BASE}/progress`, () => HttpResponse.json([])),

  http.put(`${BASE}/progress`, () =>
    HttpResponse.json({
      chapterId: "ch-1",
      status: "COMPLETED",
      score: null,
      updatedAt: new Date().toISOString(),
    })
  ),
];

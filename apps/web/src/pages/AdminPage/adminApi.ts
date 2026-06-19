import type { ContentBlock, ModuleFrontmatter } from "@stars-factory/shared";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function json<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options.headers as Record<string, string>) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return data as T;
}

async function formData<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return data as T;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type AdminChapter = {
  id: string;
  title: string;
  sortOrder: number;
  estMin: number | null;
  isPublished: boolean;
  mdPath: string;
};

export type AdminModule = {
  id: string;
  title: string;
  sortOrder: number;
  isLocked: boolean;
  chapters: AdminChapter[];
};

export type AdminCapsule = {
  id: string;
  title: string;
  sortOrder: number;
  modules: AdminModule[];
};

export type AdminCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: string | null;
  isPremium: boolean;
  createdAt: string;
  capsules: AdminCapsule[];
};

export type ValidationError = { line: number | null; message: string };

export type ValidateResult =
  | { valid: true; errors: []; frontmatter: ModuleFrontmatter; blocks: ContentBlock[] }
  | { valid: false; errors: ValidationError[] };

// ── API calls ─────────────────────────────────────────────────────────────────

export const adminApi = {
  getCourses: () => json<AdminCourse[]>("/admin/courses"),

  createCourse: (data: { title: string; slug: string; description?: string; level?: string; isPremium?: boolean }) =>
    json<AdminCourse>("/admin/courses", { method: "POST", body: JSON.stringify(data) }),

  createCapsule: (courseId: string, data: { title: string }) =>
    json<AdminCapsule>(`/admin/courses/${courseId}/capsules`, { method: "POST", body: JSON.stringify(data) }),

  createModule: (capsuleId: string, data: { title: string; isLocked?: boolean }) =>
    json<AdminModule>(`/admin/capsules/${capsuleId}/modules`, { method: "POST", body: JSON.stringify(data) }),

  validateChapter: (moduleId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return formData<ValidateResult>(`/admin/modules/${moduleId}/chapters/validate`, fd);
  },

  uploadChapter: (moduleId: string, file: File, publish: boolean) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("publish", String(publish));
    return formData<AdminChapter>(`/admin/modules/${moduleId}/chapters`, fd);
  },

  setPublished: (chapterId: string, isPublished: boolean) =>
    json<AdminChapter>(`/admin/chapters/${chapterId}`, {
      method: "PATCH",
      body: JSON.stringify({ isPublished }),
    }),

  deleteChapter: (chapterId: string) =>
    json<{ ok: boolean }>(`/admin/chapters/${chapterId}`, { method: "DELETE" }),

  deleteModule: (moduleId: string) =>
    json<{ ok: boolean }>(`/admin/modules/${moduleId}`, { method: "DELETE" }),

  deleteCapsule: (capsuleId: string) =>
    json<{ ok: boolean }>(`/admin/capsules/${capsuleId}`, { method: "DELETE" }),
};

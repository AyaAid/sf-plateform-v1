import React from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "./adminApi";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AdminNewCoursePage() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    title: "",
    slug: "",
    description: "",
    level: "Beginner",
    isPremium: false,
  });
  const [slugEdited, setSlugEdited] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleTitleChange(title: string) {
    setForm((f) => ({ ...f, title, slug: slugEdited ? f.slug : slugify(title) }));
  }

  function handleSlugChange(slug: string) {
    setSlugEdited(true);
    setForm((f) => ({ ...f, slug }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const course = await adminApi.createCourse({
        title: form.title,
        slug: form.slug,
        description: form.description || undefined,
        level: form.level,
        isPremium: form.isPremium,
      });
      navigate(`/admin/courses/${course.id}`);
    } catch (err: unknown) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 8 }}>Nouveau cours</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 32 }}>
        Les capsules et modules se créent ensuite depuis la page du cours.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Field label="Titre *">
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ex: Environnement spatial & survie"
            required
            style={inputStyle}
          />
        </Field>

        <Field label="Slug (URL) *" hint={`/courses/${form.slug || "…"}`}>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="Ex: space-env"
            required
            style={inputStyle}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description courte du cours…"
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Field>

        <Field label="Niveau">
          <select
            value={form.level}
            onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
            style={inputStyle}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </Field>

        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.isPremium}
            onChange={(e) => setForm((f) => ({ ...f, isPremium: e.target.checked }))}
            style={{ width: 16, height: 16, accentColor: "rgb(139,92,246)" }}
          />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Cours premium</span>
        </label>

        {error && (
          <p style={{ color: "rgb(252,165,165)", fontSize: 13, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !form.title || !form.slug}
          style={{
            padding: "12px 24px",
            borderRadius: 10,
            border: "none",
            background: loading || !form.title || !form.slug ? "rgba(139,92,246,0.3)" : "rgb(139,92,246)",
            color: "white",
            fontWeight: 700,
            fontSize: 15,
            cursor: loading || !form.title || !form.slug ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Création…" : "Créer le cours"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{label}</label>
        {hint && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(108,92,231,0.3)",
  background: "rgba(255,255,255,0.04)",
  color: "white",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

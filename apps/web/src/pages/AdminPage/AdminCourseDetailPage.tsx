import React from "react";
import { createPortal } from "react-dom";
import { useParams, Link } from "react-router-dom";
import { Plus, Upload, Lock, CheckCircle, Clock, Eye, EyeOff, X, Trash2 } from "lucide-react";
import { adminApi, type AdminCourse, type AdminCapsule, type AdminModule, type AdminChapter } from "./adminApi";
import { BlockRenderer } from "@/pages/ChapterPage/blocks/BlockRenderer";
import type { ContentBlock } from "@stars-factory/shared";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// ── Styles ────────────────────────────────────────────────────────────────────

const deleteButtonStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "5px 7px", borderRadius: 6,
  border: "1px solid rgba(239,68,68,0.2)", background: "transparent",
  color: "rgba(239,68,68,0.5)", cursor: "pointer",
};

const ghostButtonStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, marginTop: 16, padding: "8px 14px",
  borderRadius: 8, border: "1px dashed rgba(139,92,246,0.3)", background: "transparent",
  color: "rgba(139,92,246,0.7)", fontSize: 13, cursor: "pointer",
};

const inlineInputStyle: React.CSSProperties = {
  padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(108,92,231,0.3)",
  background: "rgba(255,255,255,0.04)", color: "white", fontSize: 14, outline: "none",
};

const inlineSubmitStyle: React.CSSProperties = {
  padding: "8px 14px", borderRadius: 8, border: "none",
  background: "rgb(139,92,246)", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer",
};

const inlineCancelStyle: React.CSSProperties = {
  padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer",
};

// ── Preview modal ─────────────────────────────────────────────────────────────

function PreviewModal({ chapterId, title, onClose }: { chapterId: string; title: string; onClose: () => void }) {
  const [blocks, setBlocks] = React.useState<ContentBlock[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/chapters/${chapterId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => setBlocks(data.blocks))
      .catch(() => setError("Impossible de charger le chapitre"));
  }, [chapterId]);

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(860px, 92vw)", height: "min(90vh, 900px)", display: "flex", flexDirection: "column", borderRadius: 20, border: "1px solid rgba(108,92,231,0.3)", background: "rgba(13,15,26,0.97)", position: "relative" }}
      >
        {/* Header fixe */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 32px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Prévisualisation</p>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "white", margin: 0 }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 6, cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex" }}>
            <X size={16} />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {!blocks && !error && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Chargement…</p>}
          {error && <p style={{ color: "rgb(252,165,165)", fontSize: 14 }}>{error}</p>}
          {blocks && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} onAnswered={() => {}} alreadyAnswered={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = React.useState<AdminCourse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [publishingAll, setPublishingAll] = React.useState(false);

  async function refresh() {
    if (!courseId) return;
    try {
      const all = await adminApi.getCourses();
      const found = all.find((c) => c.id === courseId) ?? null;
      setCourse(found);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { refresh(); }, [courseId]);

  async function publishAllCourse() {
    if (!course) return;
    setPublishingAll(true);
    const allDrafts = course.capsules
      .flatMap((cap) => cap.modules.flatMap((mod) => mod.chapters))
      .filter((ch) => !ch.isPublished);
    try {
      await Promise.all(allDrafts.map((ch) => adminApi.setPublished(ch.id, true)));
      refresh();
    } finally {
      setPublishingAll(false);
    }
  }

  if (loading) return <p style={{ color: "rgba(255,255,255,0.5)" }}>Chargement…</p>;
  if (error || !course) return <p style={{ color: "rgb(252,165,165)" }}>{error ?? "Cours introuvable"}</p>;

  const totalDrafts = course.capsules
    .flatMap((cap) => cap.modules.flatMap((mod) => mod.chapters))
    .filter((ch) => !ch.isPublished).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link to="/admin" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Tableau de bord</Link>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginTop: 8 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "white", margin: "0 0 4px" }}>{course.title}</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", margin: 0 }}>/{course.slug}</p>
          </div>
          {totalDrafts > 0 && (
            <button
              onClick={publishAllCourse}
              disabled={publishingAll}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(52,211,153,0.35)", background: "rgba(16,185,129,0.1)", color: "rgb(52,211,153)", fontSize: 13, fontWeight: 700, cursor: publishingAll ? "not-allowed" : "pointer", opacity: publishingAll ? 0.6 : 1, flexShrink: 0 }}
            >
              <Eye size={14} />
              {publishingAll ? "Publication…" : `Tout publier (${totalDrafts})`}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {course.capsules.map((capsule) => (
          <CapsuleCard key={capsule.id} capsule={capsule} courseId={course.id} onRefresh={refresh} />
        ))}
      </div>

      <AddCapsuleForm courseId={course.id} onCreated={refresh} />
    </div>
  );
}

// ── Capsule ───────────────────────────────────────────────────────────────────

function CapsuleCard({ capsule, courseId, onRefresh }: { capsule: AdminCapsule; courseId: string; onRefresh: () => void }) {
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    const label = capsule.modules.flatMap((m) => m.chapters).length;
    const msg = label > 0
      ? `Supprimer la capsule "${capsule.title}" et ses ${label} chapitre(s) ? Cette action est irréversible.`
      : `Supprimer la capsule "${capsule.title}" ?`;
    if (!window.confirm(msg)) return;
    setDeleting(true);
    try {
      await adminApi.deleteCapsule(capsule.id);
      onRefresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ borderRadius: 16, border: "1px solid rgba(108,92,231,0.2)", background: "rgba(26,31,51,0.6)", backdropFilter: "blur(12px)", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "rgb(167,139,250)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
          {capsule.title}
        </p>
        <button onClick={handleDelete} disabled={deleting} style={deleteButtonStyle} title="Supprimer la capsule">
          <Trash2 size={13} />
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {capsule.modules.map((mod) => (
          <ModuleCard key={mod.id} mod={mod} courseId={courseId} onRefresh={onRefresh} />
        ))}
      </div>
      <AddModuleForm capsuleId={capsule.id} onCreated={onRefresh} />
    </div>
  );
}

// ── Module ────────────────────────────────────────────────────────────────────

function ModuleCard({ mod, courseId, onRefresh }: { mod: AdminModule; courseId: string; onRefresh: () => void }) {
  const [toggling, setToggling] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<AdminChapter | null>(null);
  const [deletingModule, setDeletingModule] = React.useState(false);

  async function toggleChapter(ch: AdminChapter) {
    setToggling(ch.id);
    try {
      await adminApi.setPublished(ch.id, !ch.isPublished);
      onRefresh();
    } finally {
      setToggling(null);
    }
  }

  async function deleteChapter(ch: AdminChapter) {
    if (!window.confirm(`Supprimer le chapitre "${ch.title}" ? Cette action est irréversible.`)) return;
    setToggling(ch.id);
    try {
      await adminApi.deleteChapter(ch.id);
      onRefresh();
    } finally {
      setToggling(null);
    }
  }

  async function handleDeleteModule() {
    const msg = mod.chapters.length > 0
      ? `Supprimer le module "${mod.title}" et ses ${mod.chapters.length} chapitre(s) ? Cette action est irréversible.`
      : `Supprimer le module "${mod.title}" ?`;
    if (!window.confirm(msg)) return;
    setDeletingModule(true);
    try {
      await adminApi.deleteModule(mod.id);
      onRefresh();
    } finally {
      setDeletingModule(false);
    }
  }

  return (
    <>
      {preview && (
        <PreviewModal chapterId={preview.id} title={preview.title} onClose={() => setPreview(null)} />
      )}
      <div style={{ marginLeft: 8, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: mod.chapters.length > 0 ? 10 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {mod.isLocked && <Lock size={12} style={{ color: "rgba(255,255,255,0.3)" }} />}
            <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{mod.title}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link
              to={`/admin/courses/${courseId}/upload?moduleId=${mod.id}`}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(139,92,246,0.25)", background: "transparent", color: "rgba(167,139,250,0.7)", fontSize: 12, fontWeight: 500, textDecoration: "none" }}
            >
              <Upload size={11} />
              Ajouter un chapitre
            </Link>
            <button onClick={handleDeleteModule} disabled={deletingModule} style={deleteButtonStyle} title="Supprimer le module">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {mod.chapters.length === 0 && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: 0 }}>Aucun chapitre</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {mod.chapters.map((ch) => (
            <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              {ch.isPublished
                ? <CheckCircle size={13} style={{ color: "rgb(52,211,153)", flexShrink: 0 }} />
                : <Clock size={13} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />}
              <span style={{ flex: 1, color: ch.isPublished ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)" }}>
                {ch.title}
              </span>
              {ch.estMin && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>{ch.estMin} min</span>}

              <button
                onClick={() => setPreview(ch)}
                title="Prévisualiser"
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer" }}
              >
                <Eye size={11} /> Voir
              </button>

              <button
                onClick={() => toggleChapter(ch)}
                disabled={toggling !== null}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "4px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  cursor: toggling ? "not-allowed" : "pointer",
                  opacity: toggling === ch.id ? 0.5 : 1,
                  border: ch.isPublished ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(52,211,153,0.3)",
                  background: ch.isPublished ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.08)",
                  color: ch.isPublished ? "rgb(252,165,165)" : "rgb(52,211,153)",
                }}
              >
                {ch.isPublished ? <><EyeOff size={11} /> Dépublier</> : <><Eye size={11} /> Publier</>}
              </button>

              <button
                onClick={() => deleteChapter(ch)}
                disabled={toggling !== null}
                style={{ ...deleteButtonStyle, opacity: toggling === ch.id ? 0.5 : 1 }}
                title="Supprimer le chapitre"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Forms ─────────────────────────────────────────────────────────────────────

function AddCapsuleForm({ courseId, onCreated }: { courseId: string; onCreated: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.createCapsule(courseId, { title });
      setTitle(""); setOpen(false); onCreated();
    } finally { setLoading(false); }
  }

  if (!open) return <button onClick={() => setOpen(true)} style={ghostButtonStyle}><Plus size={14} /> Ajouter une capsule</button>;
  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginTop: 16 }}>
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la capsule" required style={{ ...inlineInputStyle, flex: 1 }} />
      <button type="submit" disabled={loading} style={inlineSubmitStyle}>{loading ? "…" : "Ajouter"}</button>
      <button type="button" onClick={() => setOpen(false)} style={inlineCancelStyle}>Annuler</button>
    </form>
  );
}

function AddModuleForm({ capsuleId, onCreated }: { capsuleId: string; onCreated: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.createModule(capsuleId, { title });
      setTitle(""); setOpen(false); onCreated();
    } finally { setLoading(false); }
  }

  if (!open) return <button onClick={() => setOpen(true)} style={{ ...ghostButtonStyle, marginTop: 8, fontSize: 12 }}><Plus size={12} /> Ajouter un module</button>;
  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du module" required style={{ ...inlineInputStyle, flex: 1, fontSize: 13 }} />
      <button type="submit" disabled={loading} style={inlineSubmitStyle}>{loading ? "…" : "Ajouter"}</button>
      <button type="button" onClick={() => setOpen(false)} style={inlineCancelStyle}>Annuler</button>
    </form>
  );
}


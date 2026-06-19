import React from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { Upload, CheckCircle, XCircle, FileText, Eye, Send, Save } from "lucide-react";
import { adminApi, type ValidateResult, type AdminCourse } from "./adminApi";
import { BlockRenderer } from "@/pages/ChapterPage/blocks/BlockRenderer";
import type { ContentBlock } from "@stars-factory/shared";

type Step = "upload" | "valid" | "error";

export function AdminUploadPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedModuleId = searchParams.get("moduleId") ?? "";

  const [course, setCourse] = React.useState<AdminCourse | null>(null);
  const [moduleId, setModuleId] = React.useState(preselectedModuleId);
  const [file, setFile] = React.useState<File | null>(null);
  const [step, setStep] = React.useState<Step>("upload");
  const [result, setResult] = React.useState<ValidateResult | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [validating, setValidating] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [loadingCourse, setLoadingCourse] = React.useState(true);

  React.useEffect(() => {
    adminApi.getCourses().then((courses) => {
      const found = courses.find((c) => c.id === courseId) ?? null;
      setCourse(found);
    }).finally(() => setLoadingCourse(false));
  }, [courseId]);

  const allModules = course?.capsules.flatMap((cap) =>
    cap.modules.map((mod) => ({ ...mod, capsuleTitle: cap.title }))
  ) ?? [];

  async function handleFile(f: File) {
    if (!f.name.endsWith(".md")) return;
    setFile(f);
    setResult(null);
    setStep("upload");

    if (!moduleId) return;
    setValidating(true);
    try {
      const res = await adminApi.validateChapter(moduleId, f);
      setResult(res);
      setStep(res.valid ? "valid" : "error");
    } catch (e: unknown) {
      setResult({ valid: false, errors: [{ line: null, message: (e as Error).message }] });
      setStep("error");
    } finally {
      setValidating(false);
    }
  }

  async function handleUpload(publish: boolean) {
    if (!file || !moduleId || step !== "valid") return;
    setUploading(true);
    try {
      await adminApi.uploadChapter(moduleId, file, publish);
      navigate(`/admin/courses/${courseId}`);
    } catch (e: unknown) {
      alert((e as Error).message);
      setUploading(false);
    }
  }

  if (loadingCourse) return <p style={{ color: "rgba(255,255,255,0.5)" }}>Chargement…</p>;
  if (!course) return <p style={{ color: "rgb(252,165,165)" }}>Cours introuvable</p>;

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <Link to={`/admin/courses/${courseId}`} style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
          ← {course.title}
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "white", margin: "8px 0 4px" }}>Uploader un chapitre</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Le fichier sera validé immédiatement après sélection.
        </p>
      </div>

      {/* Module selector */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>
          Module de destination *
        </label>
        <select
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(108,92,231,0.3)", background: "rgba(255,255,255,0.04)", color: moduleId ? "white" : "rgba(255,255,255,0.3)", fontSize: 14, outline: "none" }}
        >
          <option value="">Sélectionner un module…</option>
          {allModules.map((mod) => (
            <option key={mod.id} value={mod.id}>{mod.capsuleTitle} › {mod.title}</option>
          ))}
        </select>
      </div>

      {/* Drop zone */}
      <div
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => document.getElementById("md-file-input")?.click()}
        style={{
          borderRadius: 16,
          border: `2px dashed ${dragging ? "rgba(139,92,246,0.7)" : "rgba(108,92,231,0.3)"}`,
          background: dragging ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.02)",
          padding: "40px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.15s",
          marginBottom: 24,
        }}
      >
        <input
          id="md-file-input"
          type="file"
          accept=".md"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {file ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <FileText size={20} style={{ color: "rgb(167,139,250)" }} />
            <span style={{ color: "white", fontWeight: 600 }}>{file.name}</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>({Math.round(file.size / 1024)} Ko)</span>
          </div>
        ) : (
          <>
            <Upload size={32} style={{ color: "rgba(139,92,246,0.5)", margin: "0 auto 12px" }} />
            <p style={{ color: "rgba(255,255,255,0.5)", margin: 0 }}>Glisse ton fichier <strong style={{ color: "white" }}>.md</strong> ici ou clique pour choisir</p>
          </>
        )}
      </div>

      {/* Validation state */}
      {validating && (
        <StatusBanner color="rgba(139,92,246,0.2)" border="rgba(139,92,246,0.3)" icon={<span style={{ fontSize: 16 }}>⏳</span>}>
          Validation en cours…
        </StatusBanner>
      )}

      {!validating && result && !result.valid && (
        <div style={{ borderRadius: 14, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", padding: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <XCircle size={18} style={{ color: "rgb(252,165,165)" }} />
            <span style={{ fontWeight: 700, color: "rgb(252,165,165)" }}>{result.errors.length} erreur{result.errors.length > 1 ? "s" : ""} détectée{result.errors.length > 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.errors.map((err, i) => (
              <div key={i} style={{ display: "flex", gap: 10, fontSize: 13 }}>
                {err.line && <span style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace", flexShrink: 0 }}>ligne {err.line}</span>}
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{err.message}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 12, marginBottom: 0 }}>
            Corrige le fichier, re-sélectionne-le et la validation relancera automatiquement.
          </p>
        </div>
      )}

      {!validating && result?.valid && (
        <>
          <StatusBanner color="rgba(16,185,129,0.1)" border="rgba(16,185,129,0.3)" icon={<CheckCircle size={18} style={{ color: "rgb(52,211,153)" }} />}>
            <span style={{ color: "rgb(52,211,153)", fontWeight: 700 }}>Format valide</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginLeft: 8 }}>
              {result.blocks.length} blocs · {result.frontmatter.duration_minutes} min
            </span>
          </StatusBanner>

          {/* Preview */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Eye size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Prévisualisation
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {result.blocks.map((block: ContentBlock) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  onAnswered={() => {}}
                  alreadyAnswered={false}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24 }}>
            <button
              onClick={() => handleUpload(true)}
              disabled={uploading}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, border: "none", background: uploading ? "rgba(139,92,246,0.4)" : "rgb(139,92,246)", color: "white", fontWeight: 700, fontSize: 15, cursor: uploading ? "not-allowed" : "pointer" }}
            >
              <Send size={16} />
              {uploading ? "Publication…" : "Publier"}
            </button>
            <button
              onClick={() => handleUpload(false)}
              disabled={uploading}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 15, cursor: uploading ? "not-allowed" : "pointer" }}
            >
              <Save size={16} />
              Sauvegarder en brouillon
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StatusBanner({ children, color, border, icon }: { children: React.ReactNode; color: string; border: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: color, border: `1px solid ${border}`, marginBottom: 24 }}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, Lock, CheckCircle, Clock, Plus } from "lucide-react";
import { adminApi, type AdminCourse } from "./adminApi";

export function AdminDashboardPage() {
  const [courses, setCourses] = React.useState<AdminCourse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    adminApi.getCourses()
      .then(setCourses)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "rgba(255,255,255,0.5)" }}>Chargement…</p>;
  if (error) return <p style={{ color: "rgb(252,165,165)" }}>{error}</p>;

  const totalChapters = courses.flatMap((c) => c.capsules.flatMap((cap) => cap.modules.flatMap((m) => m.chapters))).length;
  const publishedChapters = courses.flatMap((c) => c.capsules.flatMap((cap) => cap.modules.flatMap((m) => m.chapters.filter((ch) => ch.isPublished)))).length;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "white", margin: 0 }}>Dashboard admin</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", marginTop: 4, fontSize: 14 }}>
          {courses.length} cours · {publishedChapters}/{totalChapters} chapitres publiés
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {courses.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.3)" }}>
            <BookOpen size={40} style={{ margin: "0 auto 12px" }} />
            <p>Aucun cours. <Link to="/admin/courses/new" style={{ color: "rgb(167,139,250)" }}>Créer le premier</Link></p>
          </div>
        )}
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <Link
        to="/admin/courses/new"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginTop: 24,
          padding: "10px 20px",
          borderRadius: 10,
          background: "rgba(139,92,246,0.2)",
          border: "1px solid rgba(139,92,246,0.4)",
          color: "rgb(167,139,250)",
          fontWeight: 600,
          fontSize: 14,
          textDecoration: "none",
        }}
      >
        <Plus size={16} />
        Nouveau cours
      </Link>
    </div>
  );
}

function CourseCard({ course }: { course: AdminCourse }) {
  const [expanded, setExpanded] = React.useState(false);
  const chapters = course.capsules.flatMap((cap) => cap.modules.flatMap((m) => m.chapters));
  const published = chapters.filter((ch) => ch.isPublished).length;

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(108,92,231,0.2)",
        background: "rgba(26,31,51,0.6)",
        backdropFilter: "blur(12px)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "white" }}>{course.title}</span>
            {course.level && (
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(139,92,246,0.2)", color: "rgb(167,139,250)", border: "1px solid rgba(139,92,246,0.3)" }}>
                {course.level}
              </span>
            )}
            {course.isPremium && (
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(251,191,36,0.15)", color: "rgb(251,191,36)", border: "1px solid rgba(251,191,36,0.3)" }}>
                Premium
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "4px 0 0", fontFamily: "monospace" }}>/{course.slug}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            {published}/{chapters.length} publiés
          </span>
          <ChevronRight
            size={16}
            style={{ color: "rgba(255,255,255,0.4)", transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
          />
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px 20px" }}>
          <Link
            to={`/admin/courses/${course.id}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 13, color: "rgb(167,139,250)", textDecoration: "none" }}
          >
            Gérer ce cours <ChevronRight size={14} />
          </Link>

          {course.capsules.map((capsule) => (
            <div key={capsule.id} style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>
                {capsule.title}
              </p>
              {capsule.modules.map((mod) => (
                <div key={mod.id} style={{ marginLeft: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    {mod.isLocked && <Lock size={11} style={{ color: "rgba(255,255,255,0.3)" }} />}
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{mod.title}</span>
                  </div>
                  <div style={{ marginLeft: 16, display: "flex", flexDirection: "column", gap: 2 }}>
                    {mod.chapters.map((ch) => (
                      <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                        {ch.isPublished
                          ? <CheckCircle size={12} style={{ color: "rgb(52,211,153)" }} />
                          : <Clock size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
                        }
                        <span style={{ color: ch.isPublished ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)" }}>
                          {ch.title}
                        </span>
                        {ch.estMin && <span style={{ color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>{ch.estMin} min</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

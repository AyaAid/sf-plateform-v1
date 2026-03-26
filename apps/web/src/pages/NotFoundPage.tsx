import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/Button";

export function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center p-8">
      <div
        className="w-full max-w-xl rounded-3xl border border-white/10 p-8"
        style={{
          background: "rgba(26, 31, 51, 0.6)",
          backdropFilter: "blur(12px)",
          boxShadow:
            "0 4px 16px rgba(0, 0, 0, 0.5), 0 0 25px rgba(108, 92, 231, 0.15)",
        }}
      >
        <div className="relative mb-6">
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-cyan-400 via-violet-500 to-transparent opacity-50" />
          <div>
            <h1 className="text-2xl font-semibold text-white">Page introuvable</h1>
            <p className="text-white/70">Cette route n’existe pas.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button>
            <Link to="/">Go Home</Link>
          </Button>
          <Button variant="secondary">
            <Link to="/app">Go Dashboard</Link>
          </Button>
          <Button variant="ghost">
            <Link to="/app/courses">Course Catalog</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
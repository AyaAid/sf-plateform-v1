import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { HudFrame } from "@/shared/ui/HudFrame";
import { useAuthContext } from "@/context/AuthContext";

export function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/app", { replace: true });
    } catch {
      setError("Connexion impossible. Vérifie tes identifiants.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-dvh items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0D0F1A 0%, #1A1F33 50%, #0D0F1A 100%)", color: "#E8ECFF" }}
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div style={{ position: "absolute", left: -160, top: -160, width: 520, height: 520, borderRadius: 9999, background: "rgba(108,92,231,0.15)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", right: -160, top: 80, width: 520, height: 520, borderRadius: 9999, background: "rgba(76,201,240,0.12)", filter: "blur(60px)" }} />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <img
              src="/Stars%20Factory_Revision-01.jpg"
              alt="Stars Factory"
              className="h-12 w-12 rounded-xl object-cover"
            />
            <h1 className="text-2xl font-semibold tracking-tight text-white">Stars Factory</h1>
          </div>
          <p className="text-sm text-white/50">Connecte-toi pour continuer</p>
        </div>

        <HudFrame hover={false} className="p-7">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                type="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Mot de passe</label>
              <div className="relative">
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Se connecter
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-white/40">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-primary hover:text-primary/80 transition-colors">
              Créer un compte
            </Link>
          </p>
        </HudFrame>
      </div>
    </div>
  );
}

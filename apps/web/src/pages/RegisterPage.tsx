import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { HudFrame } from "@/shared/ui/HudFrame";
import { useAuthContext } from "@/context/AuthContext";

type StrengthLevel = { label: string; color: string; width: string };

function getStrength(pwd: string): StrengthLevel {
  if (!pwd) return { label: "", color: "bg-white/10", width: "w-0" };

  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { label: "Très faible", color: "bg-red-500", width: "w-1/5" };
  if (score === 2) return { label: "Faible", color: "bg-orange-500", width: "w-2/5" };
  if (score === 3) return { label: "Moyen", color: "bg-yellow-500", width: "w-3/5" };
  if (score === 4) return { label: "Fort", color: "bg-emerald-500", width: "w-4/5" };
  return { label: "Très fort", color: "bg-emerald-400", width: "w-full" };
}

export function RegisterPage() {
  const { register } = useAuthContext();
  const navigate = useNavigate();

  const [prenom, setPrenom] = React.useState("");
  const [nom, setNom] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const strength = getStrength(password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(email, password, `${prenom} ${nom}`.trim());
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-dvh items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(135deg, #0D0F1A 0%, #1A1F33 50%, #0D0F1A 100%)", color: "#E8ECFF" }}
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div style={{ position: "absolute", left: -160, top: -160, width: 520, height: 520, borderRadius: 9999, background: "rgba(108,92,231,0.15)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", right: -160, top: 80, width: 520, height: 520, borderRadius: 9999, background: "rgba(76,201,240,0.12)", filter: "blur(60px)" }} />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 p-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Stars Factory</h1>
          <p className="mt-1 text-sm text-white/50">Crée ton compte pour commencer</p>
        </div>

        <HudFrame hover={false} className="p-7">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Prénom + Nom côte à côte */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">Prénom</label>
                <Input
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Prénom"
                  type="text"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">Nom</label>
                <Input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Nom"
                  type="text"
                  required
                />
              </div>
            </div>

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

            {/* Mot de passe + jauge */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Mot de passe</label>
              <div className="relative">
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
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

              {/* Jauge de complexité */}
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">Complexité</span>
                    <span className={`font-medium ${strength.color.replace("bg-", "text-")}`}>
                      {strength.label}
                    </span>
                  </div>
                  <ul className="space-y-0.5 pt-0.5 text-xs text-white/30">
                    <li className={password.length >= 8 ? "text-emerald-400" : ""}>
                      {password.length >= 8 ? "✓" : "○"} 8 caractères minimum
                    </li>
                    <li className={/[A-Z]/.test(password) ? "text-emerald-400" : ""}>
                      {/[A-Z]/.test(password) ? "✓" : "○"} Une majuscule
                    </li>
                    <li className={/[0-9]/.test(password) ? "text-emerald-400" : ""}>
                      {/[0-9]/.test(password) ? "✓" : "○"} Un chiffre
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-400" : ""}>
                      {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"} Un caractère spécial
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Confirmer le mot de passe</label>
              <div className="relative">
                <Input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  type={showConfirm ? "text" : "password"}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Créer mon compte
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-white/40">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 transition-colors">
              Se connecter
            </Link>
          </p>
        </HudFrame>
      </div>
    </div>
  );
}

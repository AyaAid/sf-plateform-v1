import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { useAuthContext } from "@/context/AuthContext";

export function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
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
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Connexion</h1>
        <p className="text-sm text-neutral-300">
          Branche ton backend ensuite (token, cookie, etc.).
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-neutral-300">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="boss@exemple.com"
            type="email"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-neutral-300">Mot de passe</label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Se connecter
        </Button>
      </form>
    </div>
  );
}

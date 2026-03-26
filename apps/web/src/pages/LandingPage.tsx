import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/Button";

export function LandingPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Ready for backend integration
          </div>

          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Une base front clean, pas un export Figma brouillon.
          </h1>

          <p className="max-w-2xl text-sm leading-6 text-neutral-300">
            Pages = vrais écrans. Features = logique métier. UI = mini composants
            maison, uniquement quand nécessaire. Parfait pour brancher un backend
            ensuite.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button>
            <Link to="/login">
              Se connecter
            </Link>
            </Button>
            <Button variant="secondary">
            <Link to="/app">
              Aller au dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Pages propres",
            desc: "Tout le raisonnement reste dans pages, pas des wrappers vides.",
          },
          {
            title: "Prêt backend",
            desc: "On ajoute /features plus tard : api, hooks, types, etc.",
          },
          {
            title: "UI minimal",
            desc: "Seulement les petits composants dont on a besoin, pas une librairie énorme.",
          },
        ].map((x) => (
          <div
            key={x.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="text-sm font-semibold">{x.title}</div>
            <div className="mt-2 text-sm leading-6 text-neutral-300">
              {x.desc}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
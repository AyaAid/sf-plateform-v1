import React from "react";
import { X, Target, Zap, Clock, Flame, Check } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import type { Goals } from "@/hooks/useGoals";

type GoalType = keyof Goals;

type GoalOption = {
  id: GoalType;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  glow: string;
  presets: { label: string; value: number }[];
  unit: string;
};

const GOALS: GoalOption[] = [
  {
    id: "daily",
    label: "Temps quotidien",
    desc: "Minutes d'apprentissage par jour",
    icon: Clock,
    color: "rgba(139,92,246,1)",
    glow: "rgba(139,92,246,0.5)",
    presets: [
      { label: "15 min", value: 15 },
      { label: "30 min", value: 30 },
      { label: "45 min", value: 45 },
      { label: "1 h",    value: 60 },
      { label: "2 h",    value: 120 },
    ],
    unit: "min / jour",
  },
  {
    id: "weekly",
    label: "Capsules / semaine",
    desc: "Chapitres à terminer chaque semaine",
    icon: Target,
    color: "rgba(34,211,238,1)",
    glow: "rgba(34,211,238,0.5)",
    presets: [
      { label: "3",  value: 3  },
      { label: "5",  value: 5  },
      { label: "10", value: 10 },
      { label: "15", value: 15 },
      { label: "20", value: 20 },
    ],
    unit: "capsules / sem.",
  },
  {
    id: "streak",
    label: "Streak cible",
    desc: "Jours consécutifs d'apprentissage",
    icon: Flame,
    color: "rgba(251,146,60,1)",
    glow: "rgba(251,146,60,0.5)",
    presets: [
      { label: "7 j",  value: 7  },
      { label: "14 j", value: 14 },
      { label: "21 j", value: 21 },
      { label: "30 j", value: 30 },
      { label: "60 j", value: 60 },
    ],
    unit: "jours",
  },
];

type Props = {
  initialGoals: Goals;
  onSave: (goals: Goals) => void;
  onClose: () => void;
};

export function GoalModal({ initialGoals, onSave, onClose }: Props) {
  const [activeGoal, setActiveGoal] = React.useState<GoalType>("daily");
  const [selected, setSelected] = React.useState<Goals>({ ...initialGoals });
  const [saved, setSaved] = React.useState(false);

  const goal = GOALS.find((g) => g.id === activeGoal)!;

  function handleSave() {
    onSave(selected);
    setSaved(true);
    setTimeout(onClose, 900);
  }

  function onBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,9,18,0.75)", backdropFilter: "blur(16px)" }}
      onClick={onBackdrop}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div style={{ position: "absolute", left: "15%", top: "10%", width: 400, height: 400, borderRadius: 9999, background: "rgba(139,92,246,0.12)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", right: "10%", bottom: "15%", width: 350, height: 350, borderRadius: 9999, background: "rgba(34,211,238,0.10)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", left: "50%", bottom: "5%", width: 300, height: 300, borderRadius: 9999, background: "rgba(251,146,60,0.08)", filter: "blur(80px)" }} />
      </div>

      {/* Panel */}
      <div
        className="relative w-full max-w-lg rounded-3xl p-7"
        style={{
          background: "rgba(13,15,26,0.92)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 0 60px rgba(139,92,246,0.15), 0 32px 80px rgba(0,0,0,0.6)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-2xl"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 16px rgba(139,92,246,0.3)" }}
            >
              <Zap className="size-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Mes objectifs</h2>
              <p className="text-xs text-white/40">Choisis un cap et tiens-le</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/40 transition hover:bg-white/[0.07] hover:text-white/70"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Goal type tabs */}
        <div className="mb-6 flex gap-2">
          {GOALS.map((g) => {
            const Icon = g.icon;
            const isActive = g.id === activeGoal;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setActiveGoal(g.id)}
                className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl px-3 py-3 text-xs font-medium transition"
                style={
                  isActive
                    ? {
                        background: "rgba(255,255,255,0.06)",
                        border: `1px solid ${g.glow}`,
                        boxShadow: `0 0 16px ${g.glow}`,
                        color: g.color,
                      }
                    : {
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.4)",
                      }
                }
              >
                <Icon className="size-4" />
                {g.label}
              </button>
            );
          })}
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-white/50">{goal.desc}</p>

        {/* Presets */}
        <div className="mb-6 grid grid-cols-5 gap-2">
          {goal.presets.map((p) => {
            const isSelected = selected[activeGoal] === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setSelected((s) => ({ ...s, [activeGoal]: p.value }))}
                className="rounded-2xl py-3 text-sm font-semibold transition"
                style={
                  isSelected
                    ? {
                        background: `linear-gradient(135deg, ${goal.color}33, ${goal.color}22)`,
                        border: `1.5px solid ${goal.color}`,
                        boxShadow: `0 0 18px ${goal.glow}`,
                        color: "#fff",
                      }
                    : {
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.5)",
                      }
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div
          className="mb-6 flex items-center justify-between rounded-2xl px-5 py-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <span className="text-sm text-white/50">Objectif sélectionné</span>
          <span className="text-lg font-bold" style={{ color: goal.color }}>
            {selected[activeGoal]} {goal.unit}
          </span>
        </div>

        {/* Save */}
        <Button
          className="w-full rounded-2xl py-3 text-sm font-semibold"
          onClick={handleSave}
          style={
            saved
              ? { background: "rgba(16,185,129,0.8)", boxShadow: "0 0 20px rgba(16,185,129,0.4)" }
              : {}
          }
        >
          {saved ? (
            <><Check className="mr-2 size-4" />Objectif enregistré !</>
          ) : (
            <><Zap className="mr-2 size-4" />Valider l'objectif</>
          )}
        </Button>
      </div>
    </div>
  );
}

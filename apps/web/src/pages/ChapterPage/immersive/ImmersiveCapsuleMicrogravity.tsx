import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  Droplets,
  Heart,
  Shield,
  Wind,
  Lock,
  CheckCircle2,
  Trophy,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { SpaceScene } from "./SpaceScene";
import { Button } from "@/shared/ui/Button";

type Screen = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Choice = "exercise" | "nothing" | "drink" | "belt";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function useTelemetry() {
  const [altKm, setAltKm] = React.useState(408.0);
  const [velKms, setVelKms] = React.useState(7.66);
  const [gravG, setGravG] = React.useState(0.0);

  const [hr, setHr] = React.useState(78);
  const [fluidsL, setFluidsL] = React.useState(0.8);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setAltKm((v) => clamp(v + (Math.random() - 0.5) * 0.08, 407.7, 408.4));
      setVelKms((v) => clamp(v + (Math.random() - 0.5) * 0.01, 7.62, 7.71));
      setGravG((v) => clamp(v + (Math.random() - 0.5) * 0.003, 0.0, 0.02));
      setHr((v) => Math.round(clamp(v + (Math.random() - 0.5) * 2.0, 70, 96)));
      setFluidsL((v) => clamp(v + (Math.random() - 0.5) * 0.02, 0.6, 1.6));
    }, 650);

    return () => window.clearInterval(id);
  }, []);

  return { altKm, velKms, gravG, hr, fluidsL };
}

function Pill({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "yellow";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
      : tone === "yellow"
      ? "border-amber-400/25 bg-amber-400/10 text-amber-200"
      : "border-sky-400/25 bg-sky-400/10 text-sky-200";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs tracking-[0.14em] ${toneClass}`}
      style={{ backdropFilter: "blur(10px)" }}
    >
      {children}
    </div>
  );
}

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[22px] border border-white/10 bg-white/[0.03] ${className}`}
      style={{
        backdropFilter: "blur(14px)",
        boxShadow:
          "0 18px 70px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.04)",
      }}
    >
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <div className="text-xs tracking-[0.18em] text-white/55">{label.toUpperCase()}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-3 h-1.5 w-14 rounded-full bg-white/10">
        <div
          className="h-1.5 w-9 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(108,92,231,0.95), rgba(76,201,240,0.75))",
            boxShadow: "0 0 14px rgba(108,92,231,0.18)",
          }}
        />
      </div>
    </div>
  );
}

function useAnimatedNumber(target: number, speed = 0.14) {
  const [v, setV] = React.useState(target);
  React.useEffect(() => {
    let raf = 0;
    const tick = () => {
      setV((prev) => prev + (target - prev) * speed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, speed]);
  return v;
}

function ProgressBar({
  value,
  onPulse,
}: {
  value: number;
  onPulse?: () => void;
}) {
  const v = useAnimatedNumber(value);

  return (
    <button
      type="button"
      onClick={onPulse}
      className="w-full"
      aria-label="progress"
      title="Click to boost the scene"
    >
      <div className="h-2 w-full rounded-full bg-white/10">
        <div
          className="h-2 rounded-full transition-[filter] duration-300 hover:brightness-125"
          style={{
            width: `${clamp(v, 0, 100)}%`,
            background: "linear-gradient(90deg, rgba(108,92,231,0.95), rgba(76,201,240,0.85))",
            boxShadow: "0 0 18px rgba(108,92,231,0.25)",
          }}
        />
      </div>
    </button>
  );
}

function ChoiceCard({
  icon,
  title,
  subtitle,
  tag,
  tagTone,
  topBorder,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tag?: string;
  tagTone?: "blue" | "green" | "yellow";
  topBorder: "blue" | "purple" | "red" | "yellow";
  onClick: () => void;
}) {
  const border =
    topBorder === "blue"
      ? "rgba(76,201,240,0.55)"
      : topBorder === "purple"
      ? "rgba(108,92,231,0.55)"
      : topBorder === "red"
      ? "rgba(255,120,120,0.50)"
      : "rgba(255,210,80,0.55)";

  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-[22px] border border-white/10 bg-white/[0.03] p-7 text-left transition hover:-translate-y-1 hover:border-white/15"
      style={{ backdropFilter: "blur(14px)", boxShadow: "0 14px 60px rgba(0,0,0,0.45)" }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-[22px]"
        style={{ background: `linear-gradient(90deg, ${border}, transparent)` }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-5">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            {icon}
          </div>

          <div>
            <div className="text-xl font-semibold text-white">{title}</div>
            <div className="mt-2 text-sm leading-6 text-white/55">{subtitle}</div>
          </div>
        </div>

        {tag && (
          <div className="shrink-0">
            <Pill tone={tagTone ?? "blue"}>{tag}</Pill>
          </div>
        )}
      </div>
    </button>
  );
}

function XPRing({ xp, max = 100 }: { xp: number; max?: number }) {
  const pct = clamp((xp / max) * 100, 0, 100);
  return (
    <div className="relative h-44 w-44">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(rgba(76,201,240,0.95) 0deg, rgba(108,92,231,0.95) " +
            `${(pct / 100) * 360}deg, rgba(255,255,255,0.10) ${(pct / 100) * 360}deg)`,
          filter: "drop-shadow(0 0 18px rgba(108,92,231,0.22))",
        }}
      />
      <div className="absolute inset-[10px] rounded-full border border-white/10 bg-black/40" style={{ backdropFilter: "blur(10px)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-5xl font-semibold text-white">+{xp}</div>
        <div className="mt-1 text-xs tracking-[0.18em] text-sky-200">XP EARNED</div>
      </div>
    </div>
  );
}

function usePulse(durationMs = 520) {
  const [pulse, setPulse] = React.useState(0);
  const trigger = React.useCallback(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = clamp((now - start) / durationMs, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setPulse(1 - eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [durationMs]);

  return { pulse, trigger };
}

function MiniNavButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10",
        "bg-black/20 text-white/55 transition",
        "hover:bg-black/30 hover:text-white/80",
        "disabled:opacity-25 disabled:hover:bg-black/20 disabled:hover:text-white/55",
      ].join(" ")}
      style={{ backdropFilter: "blur(10px)" }}
    >
      {icon}
    </button>
  );
}

function TelemetryPill({ alt, vel, hr }: { alt: string; vel: string; hr: string }) {
  return (
    <div
      className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-white/70"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <span className="text-white/55">ALT</span> <span className="text-white">{alt}</span>
      <span className="h-4 w-px bg-white/10" />
      <span className="text-white/55">VEL</span> <span className="text-white">{vel}</span>
      <span className="h-4 w-px bg-white/10" />
      <span className="text-white/55">HR</span> <span className="text-white">{hr}</span>
    </div>
  );
}

export function ImmersiveCapsuleMicrogravity() {
  const navigate = useNavigate();
  const [screen, setScreen] = React.useState<Screen>(1);
  const t = useTelemetry();

  const [choice, setChoice] = React.useState<Choice | null>(null);
  const { pulse, trigger } = usePulse(520);

  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const progress = React.useMemo(() => {
    const map: Record<Screen, number> = { 1: 0, 2: 12, 3: 30, 4: 55, 5: 72, 6: 90, 7: 100 };
    return map[screen] ?? 0;
  }, [screen]);

  const next = () => {
    trigger();
    setScreen((s) => (Math.min(7, s + 1) as Screen));
  };
  const back = () => {
    trigger();
    setScreen((s) => (Math.max(1, s - 1) as Screen));
  };

  const onChoose = (c: Choice) => {
    trigger();
    setChoice(c);
    setScreen(6);
  };

  const onExit = () => {
    trigger();
    if (window.history.length > 1) navigate(-1);
    else navigate("/app/catalog");
  };

  const feedback = React.useMemo(() => {
    if (!choice) return null;
    const map: Record<
      Choice,
      { pillTone: "green" | "yellow"; pillLabel: string; title: string; subtitle: string; bullets: string[] }
    > = {
      exercise: {
        pillTone: "green",
        pillLabel: "MISSION SUCCESS",
        title: "Exercise Protocol",
        subtitle:
          "Best option. Resistance exercise helps counter fluid shifts and maintains muscle tone in microgravity.",
        bullets: ["Improved circulation", "Reduced facial congestion", "Maintained muscle strength"],
      },
      nothing: {
        pillTone: "yellow",
        pillLabel: "MISSION RISK",
        title: "Do Nothing",
        subtitle:
          "Passive option. Some symptoms may stabilize, but you're letting the risk evolve without action.",
        bullets: ["Monitoring required", "Risk of prolonged congestion", "No active countermeasure"],
      },
      drink: {
        pillTone: "yellow",
        pillLabel: "MISSION RISK",
        title: "Drink Fast",
        subtitle:
          "Hydration helps, but in microgravity fluid shifts can worsen congestion if used alone.",
        bullets: ["Hydration +", "May increase congestion", "Should be paired with active countermeasure"],
      },
      belt: {
        pillTone: "yellow",
        pillLabel: "MISSION RISK",
        title: "Adjust Fluid Shift Belt",
        subtitle:
          "Can help, but depends on correct setup and context. Not the best first move on its own.",
        bullets: ["May reduce upper-body pressure", "Variable effect", "Best combined with exercise"],
      },
    };
    return map[choice];
  }, [choice]);

  const stats = React.useMemo(
    () => ({
      alt: `${t.altKm.toFixed(1)}km`,
      vel: `${t.velKms.toFixed(2)}km/s`,
      hr: `${t.hr}bpm`,
    }),
    [t.altKm, t.velKms, t.hr]
  );

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0">
        <SpaceScene
          className="h-full w-full"
          progress01={progress / 100}
          pulse={pulse}
          onUserPulse={trigger}
        />

        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            background:
              "radial-gradient(circle at 30% 20%, rgba(108,92,231,0.18), transparent 55%)," +
              "radial-gradient(circle at 70% 30%, rgba(76,201,240,0.12), transparent 60%)," +
              "linear-gradient(to bottom, rgba(0,0,0,0.48), rgba(0,0,0,0.70))",
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-20 space-grid" />
      </div>

      <div className="fixed left-0 right-0 top-0 z-[80] px-4 pt-4">
        <div className="mx-auto w-full max-w-[1200px]">
          <div
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-3"
            style={{ backdropFilter: "blur(12px)" }}
          >
            <button
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/75 hover:bg-black/40"
              style={{ backdropFilter: "blur(10px)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Exit
            </button>

            <div className="flex justify-center">
              <TelemetryPill alt={stats.alt} vel={stats.vel} hr={stats.hr} />
            </div>

            <div className="hidden md:flex items-center justify-end">
              <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[10px] tracking-[0.24em] text-white/50">
                IMMERSIVE
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center px-6 pb-10 pt-28 md:pt-24">
        <div className="w-full max-w-[1200px]">
          <GlassPanel className="relative overflow-hidden px-8 py-12 md:px-14 md:py-14">
            <div className="pointer-events-none absolute inset-0 rounded-[22px] shadow-[inset_0_0_220px_rgba(0,0,0,0.65)]" />

            {screen === 1 && (
              <div className="mx-auto max-w-4xl text-center">
                <Pill>
                  <span className="h-2 w-2 rounded-full bg-sky-300" />
                  MISSION BRIEFING
                </Pill>

                <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                  Arrival to Low Earth Orbit
                </h1>

                <p className="mt-4 text-base text-white/65 md:text-lg">
                  Your body is about to experience microgravity.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                  <StatCard label="Altitude" value={`${t.altKm.toFixed(0)} km`} />
                  <StatCard label="Velocity" value={`${t.velKms.toFixed(2)} km/s`} />
                  <StatCard label="Gravity" value={`${t.gravG.toFixed(2)} g`} />
                </div>

                <div className="mt-10 flex justify-center">
                  <Button
                    className="h-12 w-56 rounded-2xl"
                    onClick={next}
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(108,92,231,0.95), rgba(76,201,240,0.85))",
                      boxShadow:
                        "0 10px 30px rgba(0,0,0,0.45), 0 0 25px rgba(108,92,231,0.20)",
                    }}
                  >
                    Start Mission
                  </Button>
                </div>

              </div>
            )}

            {screen === 2 && (
              <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <div className="text-center text-xs tracking-[0.18em] text-sky-200/90">
                    CAPSULE OVERVIEW
                  </div>

                  <h2 className="mt-10 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                    Human Adaptation <br /> to Microgravity
                  </h2>

                  <p className="mt-6 max-w-xl text-base leading-7 text-white/60">
                    Learn how the human body adapts to the absence of gravity and the physiological challenges
                    astronauts face.
                  </p>

                  <div className="mt-10 flex items-center gap-10">
                    {["01", "02", "03", "04", "05"].map((n, i) => {
                      const active = i === 0;
                      return (
                        <div key={n} className="flex flex-col items-center">
                          <div
                            className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/10"
                            style={{
                              background: active ? "rgba(76,201,240,0.12)" : "rgba(255,255,255,0.03)",
                              boxShadow: active ? "0 0 30px rgba(76,201,240,0.18)" : "none",
                            }}
                          >
                            <div
                              className="absolute inset-[-10px] rounded-full border border-white/10"
                              style={{ opacity: active ? 0.7 : 0.25 }}
                            />
                            {active ? (
                              <div
                                className="flex h-14 w-14 items-center justify-center rounded-full"
                                style={{
                                  background:
                                    "linear-gradient(135deg, rgba(108,92,231,0.95), rgba(76,201,240,0.85))",
                                }}
                              >
                                <span className="text-lg font-semibold text-white">★</span>
                              </div>
                            ) : (
                              <Lock className="h-8 w-8 text-white/35" />
                            )}
                          </div>
                          <div className="mt-3 text-sm text-white/55">
                            {active ? "Module 01" : `Module ${n}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-10 max-w-xl">
                    <GlassPanel className="p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(108,92,231,0.95), rgba(76,201,240,0.85))",
                          }}
                        >
                          <span className="text-xl text-white">☆</span>
                        </div>
                        <div>
                          <div className="text-base font-semibold text-white">Module 1 Unlocked</div>
                          <div className="mt-1 text-sm text-white/55">Start your training</div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <Button
                          className="h-11 w-full rounded-2xl"
                          onClick={next}
                          style={{
                            background:
                              "linear-gradient(90deg, rgba(108,92,231,0.95), rgba(76,201,240,0.85))",
                          }}
                        >
                          Continue
                        </Button>
                      </div>
                    </GlassPanel>
                  </div>
                </div>

                <div className="flex items-start justify-center">
                  <GlassPanel className="w-full max-w-md p-6">
                    <div className="flex items-center justify-between text-xs tracking-[0.18em] text-white/55">
                      <span>PROGRESS</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="mt-4">
                      <ProgressBar value={progress} onPulse={trigger} />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                      <span className="text-sky-200">{Math.round((progress / 100) * 5)} / 5 modules</span>
                      <span>~120 min</span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white/65">
                        <div className="text-xs tracking-[0.18em]">HR</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{t.hr}</div>
                        <div className="mt-1 text-xs text-white/45">bpm</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white/65">
                        <div className="text-xs tracking-[0.18em]">FLUIDS</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{t.fluidsL.toFixed(1)}</div>
                        <div className="mt-1 text-xs text-white/45">L</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button variant="secondary" className="w-full rounded-2xl" onClick={back}>
                        Back
                      </Button>
                    </div>
                  </GlassPanel>
                </div>
              </div>
            )}

            {screen === 3 && (
              <div>
                <div className="text-center text-xs tracking-[0.18em] text-sky-200/90">MODULES</div>

                <div className="mt-8">
                  <h2 className="text-4xl font-semibold tracking-tight text-white">Training Path</h2>
                  <p className="mt-2 text-sm text-white/55">5 modules to master human adaptation</p>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-2">
                  <GlassPanel className="p-7">
                    <div className="flex items-start gap-5">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(108,92,231,0.95), rgba(76,201,240,0.85))",
                        }}
                      >
                        <span className="text-lg font-semibold text-white">01</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-semibold text-white">Cardiovascular System</div>
                        <div className="mt-2 text-sm text-white/55">
                          Understand how the heart and circulation change in microgravity
                        </div>
                        <div className="mt-4 text-sm text-white/55">⏱ 25 min</div>
                      </div>
                      <div className="h-7 w-7 rounded-full border border-white/15" />
                    </div>

                    <div className="mt-6">
                      <Button
                        className="h-11 w-full rounded-2xl"
                        onClick={next}
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(108,92,231,0.95), rgba(76,201,240,0.85))",
                        }}
                      >
                        Open
                      </Button>
                    </div>
                  </GlassPanel>

                  {[
                    { title: "Muscular System", desc: "Muscle adaptation and atrophy in microgravity", dur: "20 min" },
                    { title: "Skeletal System", desc: "Bone demineralization and fracture risk", dur: "22 min" },
                    { title: "Body Fluids", desc: "Fluid shift and facial swelling", dur: "18 min" },
                    { title: "Vestibular System", desc: "Spatial orientation and space motion sickness", dur: "30 min" },
                  ].map((m) => (
                    <GlassPanel key={m.title} className="p-7 opacity-60">
                      <div className="flex items-start gap-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
                          <Lock className="h-6 w-6 text-white/40" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xl font-semibold text-white">{m.title}</div>
                          <div className="mt-2 text-sm text-white/50">{m.desc}</div>
                          <div className="mt-4 text-sm text-white/45">⏱ {m.dur}</div>
                        </div>
                        <Pill tone="blue">LOCKED</Pill>
                      </div>
                    </GlassPanel>
                  ))}
                </div>
              </div>
            )}

            {screen === 4 && (
              <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
                <div>
                  <h2 className="mt-6 text-5xl font-semibold tracking-tight text-white">
                    Physiological <br /> Changes
                  </h2>

                  <div className="mt-8 max-w-xl">
                    <GlassPanel className="p-6">
                      <p className="text-sm leading-7 text-white/60">
                        During the first hours in microgravity, the human body undergoes immediate and surprising changes.
                      </p>
                      <p className="mt-4 text-sm leading-7 text-white/45">
                        Body fluids shift toward the upper body, creating congestion. The heart pumps differently, muscles
                        lose constant load, and the vestibular system loses its normal reference frames.
                      </p>
                      <div className="mt-6 flex items-center gap-4">
                        <div className="h-2 flex-1 rounded-full bg-white/10">
                          <div
                            className="h-2 w-[30%] rounded-full"
                            style={{
                              background:
                                "linear-gradient(90deg, rgba(108,92,231,0.95), rgba(76,201,240,0.85))",
                            }}
                          />
                        </div>
                        <div className="text-sm text-white/55">Phase 1/3</div>
                      </div>
                    </GlassPanel>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <GlassPanel className="p-6">
                    <div className="flex items-center gap-3 text-white">
                      <Heart className="h-5 w-5 text-sky-300" />
                      <div className="text-base font-semibold">Heart Rate</div>
                    </div>
                    <div className="mt-3 text-3xl font-semibold text-white">-10%</div>
                  </GlassPanel>

                  <GlassPanel className="p-6">
                    <div className="flex items-center gap-3 text-white">
                      <Droplets className="h-5 w-5 text-violet-300" />
                      <div className="text-base font-semibold">Body Fluids</div>
                    </div>
                    <div className="mt-3 text-3xl font-semibold text-white">↑ 2L</div>
                  </GlassPanel>

                  <GlassPanel className="p-6">
                    <div className="flex items-center gap-3 text-white">
                      <Activity className="h-5 w-5 text-sky-300" />
                      <div className="text-base font-semibold">Muscle Strength</div>
                    </div>
                    <div className="mt-3 text-3xl font-semibold text-white">-20%</div>
                    <div className="mt-4 h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 w-[62%] rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(76,201,240,0.85), rgba(108,92,231,0.95))",
                        }}
                      />
                    </div>
                  </GlassPanel>

                  <Button
                    className="h-12 rounded-2xl"
                    onClick={next}
                    style={{
                      background: "linear-gradient(90deg, rgba(108,92,231,0.95), rgba(76,201,240,0.85))",
                      boxShadow: "0 14px 50px rgba(0,0,0,0.45)",
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {screen === 5 && (
              <div>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Pill tone="yellow">INTERACTIVE SCENARIO</Pill>
                    <h2 className="mt-6 text-5xl font-semibold tracking-tight text-white">
                      First Symptom in Orbit
                    </h2>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
                      After 2 hours in microgravity, you feel facial congestion and mild disorientation. Your body fluids
                      are shifting upward.
                    </p>
                  </div>

                  <GlassPanel className="w-full max-w-xl p-6">
                    <div className="flex items-center justify-between text-sm text-white/65">
                      <div>Physiological Status</div>
                      <div className="flex items-center gap-2 text-amber-200">
                        <span className="h-2 w-2 rounded-full bg-amber-300" />
                        Minor Alert
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/10">
                      <div className="h-2 w-[46%] rounded-full bg-amber-300" />
                    </div>
                  </GlassPanel>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-2">
                  <ChoiceCard
                    icon={<Activity className="h-6 w-6 text-sky-200" />}
                    title="Exercise Protocol"
                    subtitle="Perform resistance exercise for 20 minutes"
                    tag="RECOMMENDED"
                    tagTone="blue"
                    topBorder="blue"
                    onClick={() => onChoose("exercise")}
                  />
                  <ChoiceCard
                    icon={<Shield className="h-6 w-6 text-rose-200" />}
                    title="Do Nothing"
                    subtitle="Wait and observe natural evolution"
                    topBorder="red"
                    onClick={() => onChoose("nothing")}
                  />
                  <ChoiceCard
                    icon={<Droplets className="h-6 w-6 text-violet-200" />}
                    title="Drink Fast"
                    subtitle="Drink 500ml of water in 5 minutes"
                    topBorder="purple"
                    onClick={() => onChoose("drink")}
                  />
                  <ChoiceCard
                    icon={<Wind className="h-6 w-6 text-amber-200" />}
                    title="Adjust Fluid Belt"
                    subtitle="Tighten the compression belt"
                    topBorder="yellow"
                    onClick={() => onChoose("belt")}
                  />
                </div>

                <div className="mt-10 flex items-center justify-between">
                  <Button variant="secondary" className="rounded-2xl" onClick={back}>
                    Back
                  </Button>
                  <div className="text-sm text-white/55">+50 XP potential</div>
                </div>
              </div>
            )}

            {screen === 6 && (
              <div className="mx-auto max-w-5xl">
                <div className="text-center">
                  <Pill tone={feedback?.pillTone ?? "green"}>
                    <CheckCircle2 className="h-4 w-4" />
                    {feedback?.pillLabel ?? "MISSION SUCCESS"}
                  </Pill>

                  <h2 className="mt-7 text-6xl font-semibold tracking-tight text-white">
                    {feedback?.pillTone === "green" ? "Great Choice!" : "Risky Choice!"}
                  </h2>
                  <div className="mt-3 text-base text-white/55">Outcome of your decision</div>
                </div>

                <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
                  <div className="flex flex-col items-center gap-6">
                    <XPRing xp={50} max={100} />

                    <div className="grid w-full grid-cols-3 gap-4">
                      <GlassPanel className="p-5 text-center">
                        <TrendingUp className="mx-auto h-5 w-5 text-sky-200" />
                        <div className="mt-3 text-2xl font-semibold text-white">+50</div>
                        <div className="mt-1 text-xs tracking-[0.18em] text-white/45">XP</div>
                      </GlassPanel>
                      <GlassPanel className="p-5 text-center">
                        <Trophy className="mx-auto h-5 w-5 text-violet-200" />
                        <div className="mt-3 text-2xl font-semibold text-white">1/5</div>
                        <div className="mt-1 text-xs tracking-[0.18em] text-white/45">Modules</div>
                      </GlassPanel>
                      <GlassPanel className="p-5 text-center">
                        <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-200" />
                        <div className="mt-3 text-2xl font-semibold text-white">100%</div>
                        <div className="mt-1 text-xs tracking-[0.18em] text-white/45">Accuracy</div>
                      </GlassPanel>
                    </div>
                  </div>

                  <GlassPanel className="p-7">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15">
                        <CheckCircle2 className="h-6 w-6 text-emerald-200" />
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-white">{feedback?.title ?? "Result"}</div>
                        <p className="mt-2 text-sm leading-7 text-white/60">{feedback?.subtitle ?? ""}</p>

                        {!!feedback?.bullets?.length && (
                          <ul className="mt-5 space-y-2 text-sm text-emerald-200/90">
                            {feedback.bullets.map((b) => (
                              <li key={b}>• {b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="mt-8">
                      <Button
                        className="h-12 w-full rounded-2xl"
                        onClick={next}
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(108,92,231,0.95), rgba(76,201,240,0.85))",
                        }}
                      >
                        Next Module
                      </Button>
                    </div>
                  </GlassPanel>
                </div>
              </div>
            )}

            {screen === 7 && (
              <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                <div className="text-center lg:text-left">
                  <Pill tone="yellow">
                    <Trophy className="h-4 w-4" />
                    CAPSULE COMPLETE
                  </Pill>

                  <h2 className="mt-8 text-6xl font-semibold tracking-tight text-white">Congratulations!</h2>
                  <div className="mt-3 text-base text-white/55">You completed the training</div>

                  <div className="mt-10 flex justify-center lg:justify-start">
                    <div className="relative">
                      <div
                        className="h-64 w-64 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle at 30% 30%, rgba(255,210,80,0.45), rgba(255,210,80,0.08) 55%, transparent 70%)",
                        }}
                      />
                      <div
                        className="absolute inset-6 flex items-center justify-center rounded-full border border-amber-300/35 bg-black/40"
                        style={{
                          boxShadow: "0 0 80px rgba(255,210,80,0.12)",
                          backdropFilter: "blur(12px)",
                        }}
                      >
                        <div className="text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10">
                            <Trophy className="h-7 w-7 text-amber-200" />
                          </div>
                          <div className="mt-6 text-xs tracking-[0.24em] text-amber-200/90">EXPERT</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <GlassPanel className="p-7">
                    <div className="text-xl font-semibold text-white">Skills Unlocked</div>
                    <ul className="mt-5 space-y-3 text-sm text-white/65">
                      <li className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-sky-300" />
                        Cardiovascular adaptation in microgravity
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-violet-300" />
                        Body fluid management
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-sky-300" />
                        Space exercise protocols
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-violet-300" />
                        Response to microgravity symptoms
                      </li>
                    </ul>
                  </GlassPanel>

                  <GlassPanel className="p-7">
                    <div className="text-sm text-white/60">Total XP Earned</div>
                    <div className="mt-2 text-4xl font-semibold text-white">250 XP</div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <Button
                        className="h-12 rounded-2xl"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(108,92,231,0.95), rgba(76,201,240,0.85))",
                        }}
                        onClick={() => navigate("/app/catalog")}
                      >
                        Next Capsule →
                      </Button>

                      <Button variant="secondary" className="h-12 rounded-2xl" onClick={() => setScreen(1)}>
                        Replay
                      </Button>
                    </div>
                  </GlassPanel>
                </div>
              </div>
            )}

            <div className="mt-10 flex items-center justify-between">
              <MiniNavButton
                label="Prev"
                icon={<ChevronLeft className="h-4 w-4" />}
                onClick={back}
                disabled={screen === 1}
              />

              <MiniNavButton
                label="Next"
                icon={<ChevronRight className="h-4 w-4" />}
                onClick={next}
                disabled={screen === 7}
              />
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
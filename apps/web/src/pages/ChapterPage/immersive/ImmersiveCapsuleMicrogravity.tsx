import * as React from "react";
import { useNavigate } from "react-router-dom";
import { SpaceScene } from "./SpaceScene";
import type { Stage, Choice } from "./SpaceScene";

// ── Constants ─────────────────────────────────────────────────────────────────

const SAS_CORRECT: Choice = "medical";
const FLUID_CORRECT: Choice = "exercise";

const CHOICE_META: Record<Choice, { label: string; sub: string; color: string; border: string }> = {
  exercise: { label: "ARED", sub: "Résistance 45 min", color: "#7c6cf0", border: "rgba(124,108,240,0.45)" },
  medical:  { label: "KIT MÉDICAL", sub: "Traitement médicamenteux", color: "#00dd77", border: "rgba(0,221,119,0.4)" },
  comms:    { label: "MISSION CONTROL", sub: "Consultation sol", color: "#4CC9F0", border: "rgba(76,201,240,0.4)" },
};

const INSPECTION_DATA: Record<Choice, { title: string; subtitle: string; facts: string[]; note: string; noteColor: string }> = {
  exercise: {
    title: "ARED — Advanced Resistive Exercise Device",
    subtitle: "Contre-mesure active principale",
    facts: [
      "Génère jusqu'à 272 kg de résistance simulée par système à vide — sans masse réelle",
      "Cible les muscles posturaux, membres inférieurs et système cardiovasculaire",
      "Prescrit 6 jours sur 7 sur les missions longues (ISS) — plusieurs heures par semaine",
      "Sans exercice résistif, la perte osseuse atteint 1 à 2% par mois dans les zones portantes",
      "Contre-mesure indispensable au déconditionnement musculo-squelettique chronique",
    ],
    note: "Indiqué à partir du Jour 4-5, lorsque la phase d'adaptation neurovestibulaire initiale est stabilisée.",
    noteColor: "#7c6cf0",
  },
  medical: {
    title: "KIT MÉDICAL — Traitement pharmacologique",
    subtitle: "Antiémétiques · Corticostéroïdes · Analgésiques",
    facts: [
      "Antiémétiques (Promethazine, Scopolamine) pour les nausées du Syndrome d'Adaptation Spatiale",
      "Corticostéroïdes et anti-inflammatoires pour les symptômes aigus de redistribution des fluides",
      "Tout protocole médicamenteux est validé par le médecin de mission control avant administration",
      "Traitement symptomatique uniquement — ne corrige pas le déconditionnement structurel",
      "Complémentaire à l'exercice, jamais substitutif sur le long terme",
    ],
    note: "Efficace pour le SAS (Jours 1-3). Insuffisant seul comme contre-mesure au déconditionnement prolongé.",
    noteColor: "#00dd77",
  },
  comms: {
    title: "COMMS — Mission Control Houston",
    subtitle: "Support médical · Télémédecine temps réel",
    facts: [
      "Lien direct avec les médecins de vol NASA/ESA — disponible 24h/24 en orbite basse",
      "Délai de transmission : ~240 ms aller-retour — communications en quasi-temps réel",
      "Accès aux données biométriques de l'équipage et historique médical embarqué",
      "Indispensable pour les décisions hors protocole ou les urgences complexes",
      "L'autonomie décisionnelle de l'équipage reste critique — les délais comptent en urgence",
    ],
    note: "Ressource précieuse pour le suivi, mais chaque astronaute doit être capable d'appliquer les protocoles de base sans délai.",
    noteColor: "#4CC9F0",
  },
};

// ── Telemetry ─────────────────────────────────────────────────────────────────

function useTelemetry(crisis: boolean) {
  const [hr, setHr] = React.useState(76);
  const [o2, setO2] = React.useState(98.4);
  React.useEffect(() => {
    const id = setInterval(() => {
      if (crisis) {
        setHr(v => Math.min(118, v + Math.random() * 2.8));
        setO2(v => Math.max(91, v - Math.random() * 0.35));
      } else {
        setHr(76 + Math.sin(Date.now() * 0.001) * 3 + (Math.random() - 0.5));
        setO2(98.4 + Math.sin(Date.now() * 0.0007) * 0.3);
      }
    }, 700);
    return () => clearInterval(id);
  }, [crisis]);
  return { hr: Math.round(hr), o2: o2.toFixed(1) };
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function TopBar({ onExit, hr, o2, crisis }: { onExit: () => void; hr: number; o2: string; crisis: boolean }) {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", pointerEvents: "auto" }}>
      <button onClick={onExit} style={{ padding: "7px 14px", borderRadius: 10, background: "rgba(5,10,22,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)", fontSize: 12, cursor: "pointer", letterSpacing: "0.06em" }}>
        ← QUITTER
      </button>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "7px 18px", borderRadius: 32, background: "rgba(5,10,22,0.72)", backdropFilter: "blur(12px)", border: `1px solid ${crisis ? "rgba(255,80,20,0.4)" : "rgba(255,255,255,0.1)"}`, fontSize: 11, letterSpacing: "0.1em" }}>
        <span style={{ color: "rgba(255,255,255,0.35)" }}>HR</span>
        <span style={{ color: crisis ? "#ff7755" : "white", fontWeight: 700 }}>{hr}<span style={{ fontWeight: 400, opacity: 0.55 }}>bpm</span></span>
        <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.12)" }} />
        <span style={{ color: "rgba(255,255,255,0.35)" }}>SpO₂</span>
        <span style={{ color: crisis ? "#ff9966" : "white", fontWeight: 700 }}>{o2}<span style={{ fontWeight: 400, opacity: 0.55 }}>%</span></span>
        <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", background: crisis ? "rgba(255,60,20,0.15)" : "rgba(76,201,240,0.1)", color: crisis ? "#ff7755" : "#4CC9F0", border: `1px solid ${crisis ? "rgba(255,60,20,0.25)" : "rgba(76,201,240,0.18)"}` }}>
          {crisis ? "ALERTE" : "NOMINAL"}
        </span>
      </div>
      <div style={{ padding: "6px 14px", borderRadius: 10, background: "rgba(5,10,22,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: "rgba(108,92,231,0.7)" }}>
        IMMERSIF
      </div>
    </div>
  );
}

// ── Briefing ──────────────────────────────────────────────────────────────────

function BriefingOverlay({ progress, onEnter }: { progress: number; onEnter: () => void }) {
  const lines = [
    { t: 0.0,  size: 11, spacing: "0.22em", color: "rgba(76,201,240,0.8)",  text: "MODULE UNITY · ISS · JOUR 14 · 09:42 UTC" },
    { t: 0.22, size: 16, spacing: "0.02em", color: "rgba(255,255,255,0.8)", text: "Vous vous réveillez dans le module. Aucun bruit. Aucun poids." },
    { t: 0.50, size: 15, spacing: "0.02em", color: "rgba(255,255,255,0.7)", text: "14 jours en orbite. Votre corps s'est adapté à la microgravité — mais cette adaptation a un coût physiologique que vous devez maintenant gérer." },
    { t: 0.76, size: 15, spacing: "0.02em", color: "rgba(255,255,255,0.7)", text: "Alexandre, votre coéquipier, a besoin de vous. Votre maîtrise de la physiologie spatiale va être testée — deux fois, dans des contextes différents." },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {lines.map(({ t, size, spacing, color, text }, i) => (
        <p key={i} style={{ maxWidth: 560, textAlign: "center", margin: "9px 24px", fontSize: size, letterSpacing: spacing, lineHeight: 1.7, color, fontWeight: i === 0 ? 600 : 400, transition: "opacity 0.8s ease, transform 0.8s ease", opacity: progress >= t ? 1 : 0, transform: `translateY(${progress >= t ? 0 : 14}px)` }}>
          {text}
        </p>
      ))}
      <div style={{ position: "absolute", bottom: 52, transition: "opacity 0.6s", opacity: progress >= 0.94 ? 1 : 0, pointerEvents: progress >= 0.94 ? "auto" : "none" }}>
        <button onClick={onEnter} style={{ padding: "13px 40px", borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg, rgba(108,92,231,0.9), rgba(76,201,240,0.8))", color: "white", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", boxShadow: "0 8px 32px rgba(108,92,231,0.4)" }}>
          ENTRER DANS LE MODULE
        </button>
      </div>
      <div style={{ position: "absolute", bottom: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: progress >= 0.94 ? 0 : 0.45, transition: "opacity 0.4s", pointerEvents: "none" }}>
        <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.3)" }} />
        <span style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)" }}>SCROLL</span>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 2, width: "100%", background: "rgba(255,255,255,0.05)" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: "linear-gradient(90deg, rgba(108,92,231,0.8), rgba(76,201,240,0.8))", transition: "width 0.15s" }} />
      </div>
    </div>
  );
}

// ── Inspection panel ──────────────────────────────────────────────────────────

function InspectionPanel({ target, onClose }: { target: Choice; onClose: () => void }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setVisible(true), 120); return () => clearTimeout(t); }, []);
  const data = INSPECTION_DATA[target];
  const meta = CHOICE_META[target];

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "flex-end" }}>
      <div style={{
        margin: "0 auto 24px", width: "100%", maxWidth: 660, padding: "0 20px", pointerEvents: "auto",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)",
      }}>
        <div style={{ padding: "22px 24px", borderRadius: 20, background: "rgba(5,10,22,0.94)", backdropFilter: "blur(18px)", border: `1px solid ${meta.border}`, boxShadow: "0 -8px 40px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: meta.color, boxShadow: `0 0 10px ${meta.color}`, display: "inline-block" }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: meta.color }}>{meta.sub.toUpperCase()}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "white", margin: 0 }}>{data.title}</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", margin: "3px 0 0", letterSpacing: "0.06em" }}>{data.subtitle}</p>
            </div>
            <button onClick={onClose} style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)", fontSize: 12, cursor: "pointer", flexShrink: 0, marginLeft: 16 }}>
              ✕ Fermer
            </button>
          </div>

          <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
            {data.facts.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                <span style={{ color: meta.color, flexShrink: 0, marginTop: 1, opacity: 0.8 }}>›</span>{f}
              </li>
            ))}
          </ul>

          <div style={{ padding: "10px 14px", borderRadius: 10, background: `${meta.color}0d`, border: `1px solid ${meta.color}22` }}>
            <span style={{ fontSize: 12, color: data.noteColor, lineHeight: 1.5, fontStyle: "italic" }}>
              <strong style={{ fontStyle: "normal" }}>Note clinique :</strong> {data.note}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Exploration ───────────────────────────────────────────────────────────────

function ExplorationOverlay({
  visited, inspecting, onReady,
}: { visited: Set<Choice>; inspecting: Choice | null; onReady: () => void }) {
  const all: Choice[] = ["exercise", "medical", "comms"];
  const allVisited = all.every(c => visited.has(c));
  const [showHint, setShowHint] = React.useState(true);
  React.useEffect(() => { const t = setTimeout(() => setShowHint(false), 5000); return () => clearTimeout(t); }, []);

  if (inspecting) return null;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* Object labels */}
      {[
        { id: "exercise" as Choice, label: "ARED", sub: "Résistance", style: { left: "10%", top: "55%" } },
        { id: "medical" as Choice,  label: "KIT MÉDICAL", sub: "Pharmacologie", style: { right: "10%", top: "53%" } },
        { id: "comms" as Choice,    label: "COMMS", sub: "Mission Control", style: { left: "50%", transform: "translateX(-50%)", bottom: "27%" } },
      ].map(({ id, label, sub, style }) => {
        const isVisited = visited.has(id);
        return (
          <div key={id} style={{ position: "absolute", ...style, transition: "opacity 0.5s", opacity: showHint ? 0.7 : 0.35, pointerEvents: "none" }}>
            <div style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(5,10,22,0.65)", backdropFilter: "blur(8px)", border: `1px solid ${isVisited ? CHOICE_META[id].border : "rgba(255,255,255,0.07)"}`, textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: isVisited ? CHOICE_META[id].color : "rgba(255,255,255,0.5)" }}>{label}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{sub}</div>
            </div>
          </div>
        );
      })}

      {/* Bottom progress bar */}
      <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", margin: 0, opacity: showHint ? 0.9 : 0.5, transition: "opacity 0.8s" }}>
          GLISSEZ POUR REGARDER · CLIQUEZ SUR LES ÉQUIPEMENTS POUR LES INSPECTER
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {all.map(id => {
            const isVisited = visited.has(id);
            return (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: isVisited ? CHOICE_META[id].color : "rgba(255,255,255,0.15)", boxShadow: isVisited ? `0 0 8px ${CHOICE_META[id].color}` : "none", transition: "all 0.3s" }} />
                <span style={{ fontSize: 10, color: isVisited ? CHOICE_META[id].color : "rgba(255,255,255,0.3)", letterSpacing: "0.08em", transition: "color 0.3s" }}>
                  {CHOICE_META[id].label}
                </span>
              </div>
            );
          })}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>
            {visited.size}/3 inspectés
          </span>
        </div>

        {allVisited && (
          <div style={{ pointerEvents: "auto" }}>
            <button onClick={onReady} style={{ padding: "10px 28px", borderRadius: 12, background: "rgba(76,201,240,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(76,201,240,0.35)", color: "#4CC9F0", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", cursor: "pointer", animation: "fadeIn 0.5s ease" }}>
              MODULE MAÎTRISÉ — COMMENCER LA MISSION →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Crisis ────────────────────────────────────────────────────────────────────

function CrisisOverlay({ title, text, accent }: { title: string; text: string; accent: string }) {
  const [v, setV] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setV(true), 300); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ marginTop: 84, padding: "10px 28px", borderRadius: 10, background: `rgba(${accent}, 0.18)`, backdropFilter: "blur(10px)", border: `1px solid rgba(${accent}, 0.45)`, display: "flex", alignItems: "center", gap: 12, transition: "opacity 0.5s", opacity: v ? 1 : 0 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: `rgb(${accent})`, boxShadow: `0 0 10px rgb(${accent})`, display: "inline-block" }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: `rgb(${accent})` }}>{title}</span>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: `rgb(${accent})`, boxShadow: `0 0 10px rgb(${accent})`, display: "inline-block" }} />
      </div>
      <p style={{ marginTop: 20, maxWidth: 520, textAlign: "center", fontSize: 15, color: "rgba(255,255,255,0.78)", lineHeight: 1.75, padding: "0 24px", transition: "opacity 0.8s", transitionDelay: "0.5s", opacity: v ? 1 : 0 }}>
        {text}
      </p>
    </div>
  );
}

// ── Decision ──────────────────────────────────────────────────────────────────

function DecisionOverlay({ title, context, hoveredId, descriptions, onChoose }: {
  title: string; context: string; hoveredId: Choice | null;
  descriptions: Record<Choice, string>; onChoose: (c: Choice) => void;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ paddingTop: 90, textAlign: "center" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,210,100,0.88)", fontWeight: 700, margin: 0 }}>SÉLECTIONNEZ LE PROTOCOLE</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: 5, maxWidth: 520, margin: "6px auto 0" }}>{title}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4, maxWidth: 480, margin: "4px auto 0", lineHeight: 1.5 }}>{context}</p>
      </div>
      <div style={{ padding: "0 18px 22px", display: "flex", gap: 10, pointerEvents: "auto" }}>
        {(["exercise", "medical", "comms"] as Choice[]).map((id) => {
          const m = CHOICE_META[id];
          const active = hoveredId === id;
          return (
            <button key={id} onClick={() => onChoose(id)} style={{ flex: 1, padding: "15px 13px", borderRadius: 14, cursor: "pointer", background: active ? "rgba(5,10,22,0.92)" : "rgba(5,10,22,0.58)", backdropFilter: "blur(12px)", border: `1px solid ${active ? m.border : "rgba(255,255,255,0.07)"}`, textAlign: "left", transition: "all 0.18s", transform: active ? "translateY(-3px)" : "none", boxShadow: active ? `0 8px 28px rgba(0,0,0,0.5)` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: active ? m.color : "rgba(255,255,255,0.42)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, boxShadow: active ? `0 0 8px ${m.color}` : "none", flexShrink: 0 }} />
                {m.label}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginBottom: 7 }}>{m.sub}</div>
              <div style={{ fontSize: 12, color: active ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.28)", lineHeight: 1.5, transition: "color 0.18s" }}>{descriptions[id]}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Outcome ───────────────────────────────────────────────────────────────────

function OutcomeOverlay({ good, title, bullets, onContinue }: { good: boolean; title: string; bullets: string[]; onContinue: () => void }) {
  const [v, setV] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setV(true), 1100); return () => clearTimeout(t); }, []);
  const accent = good ? "#4CC9F0" : "#ffbb44";
  const bg = good ? "rgba(76,201,240,0.07)" : "rgba(255,180,0,0.07)";
  const border = good ? "rgba(76,201,240,0.22)" : "rgba(255,180,0,0.22)";
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "flex-end", transition: "opacity 0.8s", opacity: v ? 1 : 0 }}>
      <div style={{ margin: "0 auto 26px", maxWidth: 580, width: "100%", padding: "0 18px", pointerEvents: "auto" }}>
        <div style={{ padding: "20px 22px", borderRadius: 18, background: "rgba(5,10,22,0.92)", backdropFilter: "blur(16px)", border: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ padding: "3px 11px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", background: bg, color: accent, border: `1px solid ${border}` }}>{good ? "PROTOCOLE ADAPTÉ" : "PROTOCOLE SOUS-OPTIMAL"}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{title}</span>
          </div>
          <ul style={{ margin: "0 0 16px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
                <span style={{ color: accent, flexShrink: 0, marginTop: 1 }}>›</span>{b}
              </li>
            ))}
          </ul>
          <button onClick={onContinue} style={{ padding: "10px 22px", borderRadius: 10, cursor: "pointer", background: bg, color: accent, fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", border: `1px solid ${border}` }}>
            CONTINUER →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Debrief ───────────────────────────────────────────────────────────────────

function DebriefOverlay({ sasChoice, fluidChoice, onExit, onReplay }: { sasChoice: Choice | null; fluidChoice: Choice | null; onExit: () => void; onReplay: () => void }) {
  const sasGood = sasChoice === SAS_CORRECT;
  const fluidGood = fluidChoice === FLUID_CORRECT;
  const xp = (sasGood ? 100 : 40) + (fluidGood ? 100 : 40);

  const decisions = [
    { label: "Scénario 1 — Syndrome d'Adaptation Spatiale (Jour 2)", choice: sasChoice, good: sasGood, correct: SAS_CORRECT,
      lesson: sasGood
        ? "Correct : le SAS nécessite repos et antiémétique. L'exercice à ce stade aggraverait la désorientation neurovestibulaire."
        : `Incorrect : la réponse attendue était ${CHOICE_META[SAS_CORRECT].label}. L'exercice en phase de SAS stimule un système vestibulaire déjà déréglé.` },
    { label: "Scénario 2 — Déconditionnement musculo-squelettique (Jour 14)", choice: fluidChoice, good: fluidGood, correct: FLUID_CORRECT,
      lesson: fluidGood
        ? "Correct : l'ARED est la contre-mesure principale. La charge mécanique simulée limite la perte musculaire et osseuse."
        : `Incorrect : la réponse attendue était ${CHOICE_META[FLUID_CORRECT].label}. Le traitement symptomatique ne corrige pas le déconditionnement structurel.` },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, pointerEvents: "auto" }}>
      <div style={{ width: "100%", maxWidth: 680, padding: "28px 32px", borderRadius: 24, background: "rgba(5,10,22,0.93)", backdropFilter: "blur(18px)", border: "1px solid rgba(108,92,231,0.28)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", overflowY: "auto", maxHeight: "90vh" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.22em", color: "rgba(108,92,231,0.8)", fontWeight: 700, margin: "0 0 8px" }}>MISSION COMPLÉTÉE — PHYSIOLOGIE SPATIALE</p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "white", margin: 0 }}>Bilan de mission</h2>
        </div>

        {/* XP */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <div style={{ width: 92, height: 92, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `conic-gradient(rgba(76,201,240,0.9) 0deg, rgba(108,92,231,0.9) ${(xp / 200) * 360}deg, rgba(255,255,255,0.06) ${(xp / 200) * 360}deg)`, boxShadow: "0 0 24px rgba(108,92,231,0.15)" }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(5,10,22,0.93)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: "white" }}>+{xp}</span>
              <span style={{ fontSize: 9, color: "rgba(76,201,240,0.8)", letterSpacing: "0.12em" }}>XP</span>
            </div>
          </div>
        </div>

        {/* Decision recap */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {decisions.map(({ label, choice, good, lesson }, i) => (
            <div key={i} style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${good ? "rgba(76,201,240,0.18)" : "rgba(255,180,0,0.18)"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 700, letterSpacing: "0.1em", background: good ? "rgba(76,201,240,0.1)" : "rgba(255,180,0,0.1)", color: good ? "#4CC9F0" : "#ffbb44", border: `1px solid ${good ? "rgba(76,201,240,0.2)" : "rgba(255,180,0,0.2)"}` }}>
                  {good ? "✓ CORRECT" : "✗ INCORRECT"}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>{label}</span>
              </div>
              {choice && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Votre choix : <span style={{ color: good ? "#4CC9F0" : "#ffbb44" }}>{CHOICE_META[choice].label}</span></div>}
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, margin: 0 }}>{lesson}</p>
            </div>
          ))}
        </div>

        {/* Key insight */}
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(108,92,231,0.06)", border: "1px solid rgba(108,92,231,0.16)", marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: "rgba(167,139,250,0.85)", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "rgb(167,139,250)" }}>Leçon clé :</strong> Mêmes équipements, mêmes symptômes apparents — mais deux contextes physiologiques distincts demandent des réponses opposées. Le SAS (adaptation neurovestibulaire) et le déconditionnement (perte de charge mécanique) ne se traitent pas de la même façon.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onExit} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg, rgba(108,92,231,0.85), rgba(76,201,240,0.75))", color: "white", fontWeight: 700, fontSize: 14, boxShadow: "0 6px 20px rgba(108,92,231,0.28)" }}>CONTINUER →</button>
          <button onClick={onReplay} style={{ flex: 0.4, padding: "12px 0", borderRadius: 12, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.42)", border: "1px solid rgba(255,255,255,0.1)", fontWeight: 600, fontSize: 14 }}>Rejouer</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function ImmersiveCapsuleMicrogravity() {
  const navigate = useNavigate();
  const [stage, setStage] = React.useState<Stage>("briefing");
  const [sasChoice, setSasChoice] = React.useState<Choice | null>(null);
  const [fluidChoice, setFluidChoice] = React.useState<Choice | null>(null);
  const [briefingProgress, setBriefingProgress] = React.useState(0);
  const [hoveredId, setHoveredId] = React.useState<Choice | null>(null);
  const [outcomeGood, setOutcomeGood] = React.useState<boolean | null>(null);
  const [visitedObjects, setVisitedObjects] = React.useState<Set<Choice>>(new Set());
  const [inspecting, setInspecting] = React.useState<Choice | null>(null);

  const isCrisis = ["sas_crisis", "sas_decision", "fluid_crisis", "fluid_decision"].includes(stage);
  const { hr, o2 } = useTelemetry(isCrisis);

  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    if (stage !== "briefing") return;
    e.preventDefault();
    setBriefingProgress(p => Math.max(0, Math.min(1, p + (e.deltaY > 0 ? 0.038 : -0.038))));
  }, [stage]);

  React.useEffect(() => {
    if (stage === "sas_crisis") {
      const t = setTimeout(() => setStage("sas_decision"), 5500);
      return () => clearTimeout(t);
    }
    if (stage === "fluid_crisis") {
      const t = setTimeout(() => setStage("fluid_decision"), 5000);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const handleInteract = React.useCallback((choice: Choice) => {
    if (stage === "exploration") {
      setInspecting(choice);
      setVisitedObjects(prev => new Set([...prev, choice]));
      return;
    }
    if (stage === "sas_decision") {
      const good = choice === SAS_CORRECT;
      setSasChoice(choice);
      setOutcomeGood(good);
      setStage("sas_outcome");
    } else if (stage === "fluid_decision") {
      const good = choice === FLUID_CORRECT;
      setFluidChoice(choice);
      setOutcomeGood(good);
      setStage("fluid_outcome");
    }
  }, [stage]);

  const closeInspection = React.useCallback(() => {
    setInspecting(null);
  }, []);

  const handleExit = React.useCallback(() => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/app/catalog");
  }, [navigate]);

  const handleReplay = React.useCallback(() => {
    setSasChoice(null);
    setFluidChoice(null);
    setOutcomeGood(null);
    setBriefingProgress(0);
    setVisitedObjects(new Set());
    setInspecting(null);
    setStage("briefing");
  }, []);

  const currentChoice = stage === "sas_outcome" ? sasChoice : stage === "fluid_outcome" ? fluidChoice : null;

  return (
    <div className="fixed inset-0 z-[60]" onWheel={handleWheel} style={{ overflow: "hidden" }}>
      <SpaceScene
        stage={stage}
        choice={currentChoice}
        briefingProgress={briefingProgress}
        onInteract={handleInteract}
        onHoverChange={setHoveredId}
        outcomeGood={outcomeGood}
        zoomTarget={inspecting}
        className="absolute inset-0"
      />

      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(0,0,0,0.50) 100%)", zIndex: 1 }} />

      <div className="absolute inset-0" style={{ zIndex: 10, pointerEvents: "none" }}>
        <TopBar onExit={handleExit} hr={hr} o2={o2} crisis={isCrisis} />

        {stage === "briefing" && <BriefingOverlay progress={briefingProgress} onEnter={() => setStage("exploration")} />}

        {stage === "exploration" && (
          <>
            <ExplorationOverlay visited={visitedObjects} inspecting={inspecting} onReady={() => setStage("sas_crisis")} />
            {inspecting && <InspectionPanel target={inspecting} onClose={closeInspection} />}
          </>
        )}

        {stage === "sas_crisis" && (
          <CrisisOverlay accent="255,140,30" title="ALERTE MÉDICALE — SYNDROME D'ADAPTATION SPATIALE"
            text="Jour 2. Alexandre signale des nausées persistantes, une désorientation progressive et une incapacité à maintenir une trajectoire précise lors des manipulations. Son cerveau tente de réconcilier des repères sensoriels contradictoires — le système neurovestibulaire est en phase d'adaptation."
          />
        )}

        {stage === "sas_decision" && (
          <DecisionOverlay
            title="Jour 2 — Syndrome d'Adaptation Spatiale actif"
            context="Alexandre présente les symptômes classiques d'une adaptation neurovestibulaire. Les informations visuelles, proprioceptives et vestibulaires ne correspondent plus aux schémas terrestres."
            hoveredId={hoveredId} onChoose={handleInteract}
            descriptions={{
              exercise: "Initier un protocole ARED résistif de 30 minutes pour contrecarrer le déconditionnement précoce.",
              medical:  "Administrer un antiémétique (Promethazine) et prescrire un repos encadré de 12 à 24h.",
              comms:    "Transmettre les données biométriques à mission control et demander des directives médicales.",
            }}
          />
        )}

        {stage === "sas_outcome" && sasChoice && (
          <OutcomeOverlay
            good={sasChoice === SAS_CORRECT}
            title={sasChoice === SAS_CORRECT ? "Adaptation neurovestibulaire préservée" : "Protocole inadapté au contexte SAS"}
            bullets={sasChoice === SAS_CORRECT
              ? ["L'antiémétique réduit les nausées sans surcharger le système vestibulaire en cours de recalibrage", "Le repos permet au cerveau de réorganiser ses référentiels sensoriels sans stimulus perturbateur", "Alexandre récupère progressivement — opérationnel pour les activités physiques dès le Jour 4"]
              : sasChoice === "exercise"
              ? ["L'effort physique stimule davantage un système vestibulaire déjà en phase d'adaptation — les nausées s'aggravent", "Le SAS ne répond pas aux mêmes protocoles que le déconditionnement — les deux pathologies sont distinctes", "Alexandre présente une aggravation des symptômes sur les 8 heures suivantes"]
              : ["Mission control confirme le protocole médicamenteux — celui que vous pouviez appliquer immédiatement", "45 minutes de délai de transmission dans une situation nécessitant une réponse rapide", "L'autonomie décisionnelle de l'équipage est une ressource critique — chaque protocole standard doit être maîtrisé"]
            }
            onContinue={() => { setOutcomeGood(null); setStage("fluid_crisis"); }}
          />
        )}

        {stage === "fluid_crisis" && (
          <CrisisOverlay accent="255,60,20" title="ALERTE CRITIQUE — DÉCONDITIONNEMENT PHYSIOLOGIQUE ACTIF"
            text="Jour 14. Bilan médical d'Alexandre : perte musculaire mesurée à 6% sur les membres inférieurs, densité osseuse en déclin dans les zones portantes, redistribution des fluides vers le thorax et la tête, légère dérive cardiovasculaire à l'ECG. Ce n'est pas une crise aiguë — c'est l'effet cumulatif de 14 jours sans charge mécanique suffisante."
          />
        )}

        {stage === "fluid_decision" && (
          <DecisionOverlay
            title="Jour 14 — Le contexte physiologique a changé"
            context="Alexandre ne souffre plus de SAS. Il s'agit maintenant d'un déconditionnement musculo-squelettique progressif — mécanisme opposé, protocole différent."
            hoveredId={hoveredId} onChoose={handleInteract}
            descriptions={{
              exercise: "Protocole ARED 45 min — résistance ciblant les muscles porteurs, les membres inférieurs et le système cardiovasculaire.",
              medical:  "Corticostéroïde anti-inflammatoire et décongestif nasal pour traiter la congestion liée aux fluides.",
              comms:    "Transmettre les données biométriques à mission control pour réévaluation du programme d'exercice.",
            }}
          />
        )}

        {stage === "fluid_outcome" && fluidChoice && (
          <OutcomeOverlay
            good={fluidChoice === FLUID_CORRECT}
            title={fluidChoice === FLUID_CORRECT ? "Contre-mesure active engagée" : "Cause structurelle non traitée"}
            bullets={fluidChoice === FLUID_CORRECT
              ? ["L'exercice résistif ARED stimule les muscles porteurs et freine la perte de masse musculaire", "La charge mécanique simulée envoie un signal osseux — la densité se stabilise progressivement", "L'activité cardiovasculaire maintient la capacité aérobie et prépare au retour en gravité"]
              : fluidChoice === "medical"
              ? ["Le traitement réduit temporairement la congestion mais ne traite pas la perte musculaire ni osseuse", "Sans charge mécanique régulière, le déconditionnement structurel continue à progresser", "La médication est un complément — jamais une contre-mesure primaire au déconditionnement"]
              : ["Mission control recommande le protocole ARED — que vous pouviez initier immédiatement", "30 minutes de délai sur une situation de déconditionnement progressif — chaque session compte", "Sur les missions longues, retarder l'exercice aggrave les effets — la prescription doit être autonome"]
            }
            onContinue={() => setStage("debrief")}
          />
        )}

        {stage === "debrief" && (
          <DebriefOverlay sasChoice={sasChoice} fluidChoice={fluidChoice} onExit={handleExit} onReplay={handleReplay} />
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

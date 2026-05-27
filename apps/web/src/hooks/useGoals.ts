import { useState } from "react";

export type Goals = {
  daily: number;   // minutes / jour
  weekly: number;  // capsules / semaine
  streak: number;  // jours consécutifs
};

const DEFAULT_GOALS: Goals = { daily: 30, weekly: 5, streak: 14 };
const STORAGE_KEY = "sf_goals";

export function useGoals() {
  const [goals, setGoals] = useState<Goals>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Goals) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  function saveGoals(newGoals: Goals) {
    setGoals(newGoals);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals));
  }

  return { goals, saveGoals };
}

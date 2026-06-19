import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { UserGoals } from "@stars-factory/shared";

export type Goals = UserGoals;

const DEFAULT_GOALS: Goals = { daily: 30, weekly: 5, streak: 14 };

export function useGoals() {
  const queryClient = useQueryClient();

  const { data: goals = DEFAULT_GOALS } = useQuery({
    queryKey: ["goals"],
    queryFn: () => apiClient.get<Goals>("/goals"),
  });

  async function saveGoals(newGoals: Goals) {
    await apiClient.put("/goals", newGoals);
    queryClient.setQueryData(["goals"], newGoals);
  }

  return { goals, saveGoals };
}

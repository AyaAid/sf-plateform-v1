import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ActivityRecord } from "@stars-factory/shared";

export function useActivity(limit = 10) {
  return useQuery({
    queryKey: ["activity", limit],
    queryFn: () => apiClient.get<ActivityRecord[]>(`/activity?limit=${limit}`),
  });
}

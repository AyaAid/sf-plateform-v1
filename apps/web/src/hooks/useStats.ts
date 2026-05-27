import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { UserStats } from "@stars-factory/shared";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => apiClient.get<UserStats>("/stats"),
  });
}

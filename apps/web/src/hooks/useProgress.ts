import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ProgressRecord } from "@stars-factory/shared";

export function useProgress() {
  return useQuery({
    queryKey: ["progress"],
    queryFn: () => apiClient.get<ProgressRecord[]>("/progress"),
  });
}

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { BlockProgressRecord } from "@stars-factory/shared";

export function useBlockProgress(chapterId: string | undefined) {
  return useQuery({
    queryKey: ["block-progress", chapterId],
    queryFn: () => apiClient.get<BlockProgressRecord[]>(`/block-progress/${chapterId}`),
    enabled: !!chapterId,
  });
}

export function useMarkBlockAnswered() {
  return useMutation({
    mutationFn: ({ chapterId, blockId }: { chapterId: string; blockId: string }) =>
      apiClient.post("/block-progress", { chapterId, blockId }),
  });
}

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ChapterWithBlocks } from "@stars-factory/shared";

export function useChapter(chapterId: string | undefined) {
  return useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: () => apiClient.get<ChapterWithBlocks>(`/chapters/${chapterId}`),
    enabled: !!chapterId,
  });
}

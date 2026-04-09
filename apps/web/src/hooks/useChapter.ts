import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ChapterWithMarkdown } from "@stars-factory/shared";

export function useChapter(chapterId: string | undefined) {
  return useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: () => apiClient.get<ChapterWithMarkdown>(`/chapters/${chapterId}`),
    enabled: !!chapterId,
  });
}

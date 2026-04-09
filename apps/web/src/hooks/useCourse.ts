import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { CourseDetail } from "@stars-factory/shared";

export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => apiClient.get<CourseDetail>(`/courses/${courseId}`),
    enabled: !!courseId,
  });
}

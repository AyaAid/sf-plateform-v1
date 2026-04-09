import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { CourseSummary } from "@stars-factory/shared";

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => apiClient.get<CourseSummary[]>("/courses"),
  });
}

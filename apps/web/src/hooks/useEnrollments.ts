import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { EnrollmentSummary } from "@stars-factory/shared";

export function useEnrollments() {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: () => apiClient.get<EnrollmentSummary[]>("/enrollments"),
  });
}

export function useEnroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => apiClient.post(`/enrollments/${courseId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}

export function useUnenroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => apiClient.delete(`/enrollments/${courseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}

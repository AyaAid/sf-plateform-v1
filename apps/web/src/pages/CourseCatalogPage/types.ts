export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type Course = {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  duration: string;
  lessons: number;
  rating: number;
  enrolled: number;
  colorClass: string;
};
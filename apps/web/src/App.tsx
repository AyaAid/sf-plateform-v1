import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { CourseCatalogPage } from "@/pages/CourseCatalogPage/CourseCatalogPage";
import { ProfilePage } from "@/pages/ProfilePage/ProfilePage";
import { MyLearningPage } from "@/pages/MyLearningPage/MyLearningPage";
import { CoursePage } from "@/pages/CoursePage/CoursePage";
import { ChapterPage } from "@/pages/ChapterPage/ChapterPage";
import { ImmersiveCapsuleMicrogravity } from "@/pages/ChapterPage/immersive/ImmersiveCapsuleMicrogravity";



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />

      <Route path="/app" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="catalog" element={<CourseCatalogPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="learning" element={<MyLearningPage />} />
        <Route path="courses/:courseId" element={<CoursePage />} />
        <Route path="courses/:courseId/chapters/:chapterId" element={<ChapterPage />} />
        <Route path="courses/:courseId/chapters/:chapterId/immersive" element={<ImmersiveCapsuleMicrogravity />} />
      </Route>

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
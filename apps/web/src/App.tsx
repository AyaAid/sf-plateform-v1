import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { PrivateRoute } from "@/components/PrivateRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { CourseCatalogPage } from "@/pages/CourseCatalogPage/CourseCatalogPage";
import { ProfilePage } from "@/pages/ProfilePage/ProfilePage";
import { MyLearningPage } from "@/pages/MyLearningPage/MyLearningPage";
import { CoursePage } from "@/pages/CoursePage/CoursePage";
import { ChapterPage } from "@/pages/ChapterPage/ChapterPage";
import { ImmersiveCapsuleMicrogravity } from "@/pages/ChapterPage/immersive/ImmersiveCapsuleMicrogravity";
import { RecapPage } from "@/pages/RecapPage/RecapPage";
import { AdminLayout } from "@/pages/AdminPage/AdminLayout";
import { AdminDashboardPage } from "@/pages/AdminPage/AdminDashboardPage";
import { AdminNewCoursePage } from "@/pages/AdminPage/AdminNewCoursePage";
import { AdminCourseDetailPage } from "@/pages/AdminPage/AdminCourseDetailPage";
import { AdminUploadPage } from "@/pages/AdminPage/AdminUploadPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<PrivateRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="catalog" element={<CourseCatalogPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="learning" element={<MyLearningPage />} />
          <Route path="courses/:courseId" element={<CoursePage />} />
          <Route path="courses/:courseId/chapters/:chapterId" element={<ChapterPage />} />
          <Route path="courses/:courseId/chapters/:chapterId/immersive" element={<ImmersiveCapsuleMicrogravity />} />
          <Route path="courses/:courseId/chapters/:chapterId/recap" element={<RecapPage />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="courses/new" element={<AdminNewCoursePage />} />
          <Route path="courses/:courseId" element={<AdminCourseDetailPage />} />
          <Route path="courses/:courseId/upload" element={<AdminUploadPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
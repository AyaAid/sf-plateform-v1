import { Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen">
      {/* plus tard: sidebar/topbar */}
      <Outlet />
    </div>
  );
}
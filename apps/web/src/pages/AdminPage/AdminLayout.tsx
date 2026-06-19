import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { Shield, LogOut, BookOpen, LayoutDashboard, ArrowLeft } from "lucide-react";

export function AdminLayout() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        color: "#E8ECFF",
        background: "linear-gradient(135deg, #0D0F1A 0%, #1A1F33 50%, #0D0F1A 100%)",
      }}
    >
      <div
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: -1 }}
      >
        <div style={{ position: "absolute", left: -160, top: -160, width: 520, height: 520, borderRadius: 9999, background: "rgba(108,92,231,0.15)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", right: -160, top: 80, width: 520, height: 520, borderRadius: 9999, background: "rgba(76,201,240,0.12)", filter: "blur(60px)" }} />
      </div>

      <header
        style={{
          borderBottom: "1px solid rgba(108,92,231,0.2)",
          background: "rgba(13,15,26,0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 16 }}>
            <Shield size={18} style={{ color: "rgb(139,92,246)" }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: "white" }}>Admin</span>
          </div>

          <nav style={{ display: "flex", gap: 4, flex: 1 }}>
            <AdminNavLink to="/admin" end icon={<LayoutDashboard size={15} />} label="Tableau de bord" />
            <AdminNavLink to="/admin/courses/new" icon={<BookOpen size={15} />} label="Nouveau cours" />
          </nav>

          <button
            onClick={() => navigate("/app")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 13 }}
          >
            <ArrowLeft size={14} />
            Tableau de bord
          </button>

          <button
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 13 }}
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <Outlet />
      </main>
    </div>
  );
}

function AdminNavLink({ to, icon, label, end }: { to: string; icon: React.ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        textDecoration: "none",
        color: isActive ? "rgb(167,139,250)" : "rgba(255,255,255,0.6)",
        background: isActive ? "rgba(139,92,246,0.15)" : "transparent",
        border: isActive ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
        transition: "all 0.15s",
      })}
    >
      {icon}
      {label}
    </NavLink>
  );
}

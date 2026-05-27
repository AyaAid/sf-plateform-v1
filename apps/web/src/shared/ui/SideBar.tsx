import { NavLink } from "react-router-dom";
import { cn } from "@/shared/cn";
import {
  Home,
  BookOpen,
  GraduationCap,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  glowColor: string;
};

const navItems: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: Home, iconColor: "text-violet-400", glowColor: "rgba(139,92,246,0.6)" },
  { to: "/app/catalog", label: "Course Catalog", icon: BookOpen, iconColor: "text-cyan-400", glowColor: "rgba(34,211,238,0.6)" },
  { to: "/app/learning", label: "My Learning", icon: GraduationCap, iconColor: "text-pink-400", glowColor: "rgba(244,114,182,0.6)" },
];

function getInitials(name: string | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="relative h-dvh w-[260px] shrink-0">
      {/* Background */}
      <div className="absolute inset-0 rounded-3xl border border-white/10 bg-[rgba(13,15,26,0.80)] backdrop-blur-xl" />

      {/* Vertical accent line */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-violet-500/40 via-cyan-500/20 to-pink-500/20 opacity-70" />
      </div>

      <div className="relative flex h-full flex-col gap-2 p-3">

        {/* ── Profile ── */}
        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-2xl p-3 transition",
              "border border-white/[0.07] hover:border-white/10",
              "hover:bg-white/[0.04]",
              isActive && "bg-white/[0.06] border-white/10"
            )
          }
        >
          {/* Avatar */}
          <div
            className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.7), rgba(6,182,212,0.7))",
              boxShadow: "0 0 16px rgba(139,92,246,0.35)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {getInitials(user?.name ?? undefined)}
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#0D0F1A] bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-foreground">
              {user?.name ?? "Utilisateur"}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {user?.email ?? ""}
            </div>
          </div>
        </NavLink>

        {/* Divider */}
        <div className="mx-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* ── Navigation ── */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/app"}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                    "text-muted-foreground hover:text-foreground",
                    isActive
                      ? "bg-white/[0.06] text-foreground"
                      : "hover:bg-white/[0.03]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-xl transition"
                      style={
                        isActive
                          ? {
                              background: "rgba(255,255,255,0.06)",
                              boxShadow: `0 0 12px ${item.glowColor}`,
                              border: "1px solid rgba(255,255,255,0.10)",
                            }
                          : {
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.05)",
                            }
                      }
                    >
                      <Icon
                        className={cn(
                          "size-4 transition",
                          isActive ? item.iconColor : "text-foreground/40"
                        )}
                      />
                    </div>

                    <span className="font-medium">{item.label}</span>

                    {isActive && (
                      <span
                        className="ml-auto size-1.5 rounded-full"
                        style={{
                          background: item.glowColor,
                          boxShadow: `0 0 6px ${item.glowColor}`,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* ── Brand + Logout ── */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-3 text-violet-400" />
            <span className="font-medium tracking-wide">Stars Factory</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex size-8 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-muted-foreground transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
            aria-label="Se déconnecter"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
}

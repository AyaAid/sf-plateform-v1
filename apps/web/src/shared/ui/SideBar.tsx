import { NavLink } from "react-router-dom";
import { cn } from "@/shared/cn";
import { Home, BookOpen, GraduationCap } from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: Home },
  { to: "/app/catalog", label: "Course Catalog", icon: BookOpen },
  { to: "/app/learning", label: "My Learning", icon: GraduationCap },
];

function Brand() {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_20px_rgba(76,201,240,0.12)]">
        <div className="size-8 rounded-xl bg-gradient-to-br from-secondary to-primary" />
      </div>

      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-wide">Stars Factory</div>
        <div className="text-xs text-muted-foreground">⚡ Spatial Education</div>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <nav className="px-3 py-2">
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  "border border-transparent",
                  "text-muted-foreground hover:text-foreground",
                  "hover:bg-white/[0.04]",
                  isActive &&
                    "text-foreground border-white/10 bg-white/[0.06] shadow-[0_0_18px_rgba(108,92,231,0.18)]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "size-5 opacity-80",
                      isActive ? "text-primary opacity-100" : "text-foreground/70"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>

                  <span
                    className={cn(
                      "ml-auto size-2 rounded-full",
                      isActive ? "bg-secondary shadow-[0_0_10px_rgba(76,201,240,0.6)]" : "bg-transparent"
                    )}
                  />

                  <span
                    className={cn(
                      "pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition",
                      "bg-[radial-gradient(circle_at_20%_50%,rgba(108,92,231,0.18),transparent_55%)]",
                      isActive ? "opacity-100" : "group-hover:opacity-70"
                    )}
                  />
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function UserCard() {
  return (
    <div className="px-3 pb-3">
      <NavLink
        to="/app/profile"
        className={({ isActive }) =>
          cn(
            "block rounded-2xl transition",
            "border border-white/10 bg-white/[0.04]",
            "hover:bg-white/[0.06]",
            isActive &&
              "bg-white/[0.08] shadow-[0_0_20px_rgba(108,92,231,0.25)]"
          )
        }
      >
        <div className="flex items-center gap-3 p-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-[0_0_18px_rgba(108,92,231,0.18)]" />

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">Tom Cruise</div>
            <div className="truncate text-xs text-muted-foreground">
              Student • Level 12
            </div>
          </div>

          <div className="ml-auto size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.45)]" />
        </div>
      </NavLink>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="relative h-dvh w-[288px] shrink-0">
      <div className="absolute inset-0 rounded-3xl border border-white/10 bg-[rgba(13,15,26,0.75)] backdrop-blur-xl" />

      <div className="pointer-events-none absolute inset-0 rounded-3xl">
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-primary/40 via-secondary/20 to-transparent opacity-60" />
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-primary/20 to-secondary/30 opacity-40" />
      </div>

      <div className="relative flex h-full flex-col">
        <Brand />
        <div className="px-4">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <Nav />

        <div className="mt-auto">
          <UserCard />
        </div>
      </div>
    </aside>
  );
}
import * as React from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/shared/cn";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

export function FigmaShell({ children, className }: Props) {
  return (
    <div className={cn("min-h-screen text-white", className)}>
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0B1020]" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_10%,rgba(108,92,231,0.20),transparent_60%),radial-gradient(900px_500px_at_80%_30%,rgba(76,201,240,0.12),transparent_60%),radial-gradient(1000px_800px_at_50%_90%,rgba(255,255,255,0.04),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="relative">
        {children}
        <Outlet />
      </div>
    </div>
  );
}
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/shared/ui/SideBar";

export function AppLayout() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        color: "#E8ECFF",
        background:
          "linear-gradient(135deg, #0D0F1A 0%, #1A1F33 50%, #0D0F1A 100%)",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -160,
            top: -160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(108,92,231,0.15)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -160,
            top: 80,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(76,201,240,0.12)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div style={{ padding: 16, minHeight: "100dvh" }}>
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            gap: 24,
          }}
        >
          <Sidebar />
          <main style={{ flex: 1 }}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-50">
      <main className="mx-auto flex min-h-dvh w-full max-w-md items-center px-4 py-10">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
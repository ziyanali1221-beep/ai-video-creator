import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Studio from "./pages/Studio";

export type AppPage = "dashboard" | "studio" | "templates";

export interface StudioParams {
  projectId?: bigint;
}

export default function App() {
  const [page, setPage] = useState<AppPage>("dashboard");
  const [studioParams, setStudioParams] = useState<StudioParams>({});

  const navigateTo = (target: AppPage, params?: StudioParams) => {
    setPage(target);
    if (params) setStudioParams(params);
    else setStudioParams({});
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar currentPage={page} onNavigate={navigateTo} />

      <main className="flex-1 overflow-auto scrollbar-thin">
        {page === "dashboard" && <Dashboard onNavigate={navigateTo} />}
        {page === "studio" && (
          <Studio projectId={studioParams.projectId} onNavigate={navigateTo} />
        )}
        {page === "templates" && (
          <Dashboard onNavigate={navigateTo} showTemplates />
        )}
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.16 0.022 275)",
            border: "1px solid oklch(0.26 0.025 275)",
            color: "oklch(0.97 0.005 285)",
          },
        }}
      />
    </div>
  );
}

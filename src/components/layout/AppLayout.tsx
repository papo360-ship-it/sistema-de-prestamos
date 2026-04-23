import { Outlet } from "react-router-dom";
import { DataProvider } from "@/context/DataContext";
import { useData } from "@/context/DataContext";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppLayout() {
  return (
    <DataProvider>
      <AppLayoutContent />
    </DataProvider>
  );
}

function AppLayoutContent() {
  const { error, loading, usingSupabase } = useData();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),linear-gradient(180deg,#f8fafc,#eef2f7)]">
      <Sidebar />
      <main className="px-4 pb-10 pt-20 lg:ml-72 lg:px-8 lg:pt-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
            Modo: {usingSupabase ? "Supabase conectado" : "Demo local"}
          </span>
          {loading ? <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Sincronizando datos...</span> : null}
        </div>
        {error ? <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-danger">{error}</div> : null}
        <Outlet />
      </main>
    </div>
  );
}

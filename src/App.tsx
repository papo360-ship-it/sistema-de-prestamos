import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { ClientsPage } from "@/pages/clients/ClientsPage";
import { ClientFormPage } from "@/pages/clients/ClientFormPage";
import { ClientDetailPage } from "@/pages/clients/ClientDetailPage";
import { CollectionsPage } from "@/pages/collections/CollectionsPage";
import { PaymentPage } from "@/pages/collections/PaymentPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoansPage } from "@/pages/loans/LoansPage";
import { LoanFormPage } from "@/pages/loans/LoanFormPage";
import { LoanDetailPage } from "@/pages/loans/LoanDetailPage";
import { LoginPage } from "@/pages/LoginPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SimulatorPage } from "@/pages/SimulatorPage";
import { UsersPage } from "@/pages/UsersPage";
import type { Role } from "@/types";

function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50 font-bold text-navy-900">Cargando...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="clientes" element={<ClientsPage />} />
        <Route path="clientes/nuevo" element={<ClientFormPage />} />
        <Route path="clientes/:id/editar" element={<ClientFormPage />} />
        <Route path="clientes/:id" element={<ClientDetailPage />} />
        <Route path="prestamos" element={<LoansPage />} />
        <Route path="prestamos/nuevo" element={<LoanFormPage />} />
        <Route path="prestamos/:id" element={<LoanDetailPage />} />
        <Route path="simulador" element={<SimulatorPage />} />
        <Route path="cobros" element={<CollectionsPage />} />
        <Route path="cobros/registrar" element={<PaymentPage />} />
        <Route path="cobros/registrar/:installmentId" element={<PaymentPage />} />
        <Route path="reportes" element={<ReportsPage />} />
        <Route
          path="configuracion"
          element={
            <RequireAuth roles={["admin"]}>
              <SettingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="usuarios"
          element={
            <RequireAuth roles={["admin"]}>
              <UsersPage />
            </RequireAuth>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Banknote, CalendarCheck, CircleDollarSign, PiggyBank, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { useData } from "@/context/DataContext";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { currency } from "@/lib/utils";

export function DashboardPage() {
  const { data } = useData();
  const summary = useFinancialSummary();
  const chartData = [
    { name: "Capital", valor: data.settings.initialCapital },
    { name: "Prestado", valor: summary.totalLoaned },
    { name: "Recaudado", valor: summary.totalCollected },
    { name: "Ganancia", valor: summary.expectedProfit }
  ];

  return (
    <>
      <PageHeader title="Panel financiero" description="Resumen operativo del negocio, cartera activa, cobros y alertas de mora." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Capital inicial" value={currency(data.settings.initialCapital, data.settings.currency)} icon={PiggyBank} />
        <StatCard label="Total prestado" value={currency(summary.totalLoaned, data.settings.currency)} icon={Banknote} />
        <StatCard label="Total recaudado" value={currency(summary.totalCollected, data.settings.currency)} icon={CircleDollarSign} tone="green" />
        <StatCard label="Disponible para prestar" value={currency(summary.availableCapital, data.settings.currency)} icon={CalendarCheck} tone="blue" />
        <StatCard label="Clientes registrados" value={summary.clientsCount} icon={Users} tone="slate" />
        <StatCard label="Prestamos activos" value={summary.activeLoansCount} icon={Banknote} />
        <StatCard label="Cuotas pendientes" value={summary.pendingInstallmentsCount} icon={CalendarCheck} tone="slate" />
        <StatCard label="Cuotas vencidas" value={summary.overdueInstallmentsCount} icon={AlertTriangle} tone="red" helper={`${summary.overdueClientsCount} clientes en mora`} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="card p-6">
          <h3 className="text-xl font-black text-ink">Balance visual</h3>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${Number(value) / 1000000}M`} />
                <Tooltip formatter={(value) => currency(Number(value), data.settings.currency)} />
                <Bar dataKey="valor" fill="#123a82" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-xl font-black text-ink">Cobranza del dia</h3>
          <p className="mt-4 text-4xl font-black text-success">{currency(summary.todayCollected, data.settings.currency)}</p>
          <div className="mt-6 rounded-3xl bg-navy-950 p-5 text-white">
            <p className="text-sm text-blue-100">Avance de recuperacion</p>
            <p className="mt-2 text-5xl font-black">{summary.collectionRate}%</p>
          </div>
          <div className="mt-4 rounded-3xl bg-red-50 p-5">
            <p className="text-sm font-bold text-red-700">Mora acumulada estimada</p>
            <p className="mt-1 text-2xl font-black text-danger">{currency(summary.accumulatedLateFees, data.settings.currency)}</p>
          </div>
        </div>
      </div>
    </>
  );
}

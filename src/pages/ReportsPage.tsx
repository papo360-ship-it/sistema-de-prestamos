import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Field, Input } from "@/components/ui/Field";
import { PageHeader } from "@/components/layout/PageHeader";
import { useData } from "@/context/DataContext";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { currency, shortDate } from "@/lib/utils";
import type { Payment } from "@/types";

export function ReportsPage() {
  const { data } = useData();
  const summary = useFinancialSummary();
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const payments = useMemo(
    () => data.payments.filter((payment) => payment.paidAt >= from && payment.paidAt <= to),
    [data.payments, from, to]
  );
  const collected = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const overdueClients = data.clients.filter((client) => client.status === "moroso");

  const columns: ColumnDef<Payment>[] = [
    { accessorKey: "paidAt", header: "Fecha", cell: ({ row }) => shortDate(row.original.paidAt) },
    { header: "Cliente", cell: ({ row }) => data.clients.find((client) => client.id === row.original.clientId)?.fullName ?? "Sin cliente" },
    { accessorKey: "amount", header: "Valor", cell: ({ row }) => currency(row.original.amount, data.settings.currency) },
    { accessorKey: "method", header: "Metodo" },
    { accessorKey: "type", header: "Tipo", cell: ({ row }) => row.original.type.replace("_", " ") }
  ];

  return (
    <>
      <PageHeader title="Reportes" description="Consulta cobros, ganancias, cartera activa, clientes morosos y balance general por rango de fechas." />
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr]">
        <div className="card p-5"><p className="text-sm text-slate-500">Cobrado en rango</p><p className="text-2xl font-black">{currency(collected, data.settings.currency)}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Cobros del mes</p><p className="text-2xl font-black">{currency(summary.monthCollected, data.settings.currency)}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Ganancia proyectada</p><p className="text-2xl font-black">{currency(summary.expectedProfit, data.settings.currency)}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Clientes morosos</p><p className="text-2xl font-black text-danger">{overdueClients.length}</p></div>
      </div>
      <div className="card mb-6 grid gap-4 p-5 md:grid-cols-2">
        <Field label="Desde">
          <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </Field>
        <Field label="Hasta">
          <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </Field>
      </div>
      <DataTable data={payments} columns={columns} searchPlaceholder="Buscar historial de pagos..." />
    </>
  );
}

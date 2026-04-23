import type { ColumnDef } from "@tanstack/react-table";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useData } from "@/context/DataContext";
import { currency, shortDate } from "@/lib/utils";
import type { Installment, Payment } from "@/types";

export function LoanDetailPage() {
  const { id } = useParams();
  const { data } = useData();
  const loan = data.loans.find((item) => item.id === id);
  if (!loan) return <EmptyState title="Prestamo no encontrado" description="El prestamo solicitado no existe." />;

  const client = data.clients.find((item) => item.id === loan.clientId);
  const installments = data.installments.filter((item) => item.loanId === loan.id).sort((a, b) => a.number - b.number);
  const payments = data.payments.filter((item) => item.loanId === loan.id);

  const installmentColumns: ColumnDef<Installment>[] = [
    { accessorKey: "number", header: "#" },
    { accessorKey: "dueDate", header: "Vence", cell: ({ row }) => shortDate(row.original.dueDate) },
    { accessorKey: "amount", header: "Valor", cell: ({ row }) => currency(row.original.amount, data.settings.currency) },
    { accessorKey: "paidAmount", header: "Pagado", cell: ({ row }) => currency(row.original.paidAmount, data.settings.currency) },
    { accessorKey: "balance", header: "Saldo", cell: ({ row }) => currency(row.original.balance + row.original.lateFee, data.settings.currency) },
    { accessorKey: "status", header: "Estado", cell: ({ row }) => <Badge value={row.original.status} /> },
    { id: "actions", header: "Cobrar", cell: ({ row }) => row.original.status !== "pagada" ? <Link to={`/cobros/registrar/${row.original.id}`}><Button variant="success">Registrar</Button></Link> : null }
  ];

  const paymentColumns: ColumnDef<Payment>[] = [
    { accessorKey: "paidAt", header: "Fecha", cell: ({ row }) => shortDate(row.original.paidAt) },
    { accessorKey: "amount", header: "Valor", cell: ({ row }) => currency(row.original.amount, data.settings.currency) },
    { accessorKey: "method", header: "Metodo" },
    { accessorKey: "notes", header: "Observacion" }
  ];

  return (
    <>
      <PageHeader title={`Prestamo de ${client?.fullName ?? "cliente"}`} description={`${currency(loan.amount, data.settings.currency)} prestados - saldo ${currency(loan.balance, data.settings.currency)}`} />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric label="Total a pagar" value={currency(loan.totalToPay, data.settings.currency)} />
        <Metric label="Cuota" value={currency(loan.installmentValue, data.settings.currency)} />
        <Metric label="Ganancia" value={currency(loan.profit, data.settings.currency)} />
        <div className="card p-5"><p className="text-sm text-slate-500">Estado</p><div className="mt-2"><Badge value={loan.status} /></div></div>
      </div>
      <section className="mb-6">
        <h3 className="mb-3 text-xl font-black">Cronograma de cuotas</h3>
        <DataTable data={installments} columns={installmentColumns} />
      </section>
      <section>
        <h3 className="mb-3 text-xl font-black">Pagos registrados</h3>
        <DataTable data={payments} columns={paymentColumns} />
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="card p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
}

import type { ColumnDef } from "@tanstack/react-table";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useData } from "@/context/DataContext";
import { currency, shortDate } from "@/lib/utils";
import type { Loan, Payment } from "@/types";

export function ClientDetailPage() {
  const { id } = useParams();
  const { data } = useData();
  const client = data.clients.find((item) => item.id === id);

  if (!client) return <EmptyState title="Cliente no encontrado" description="El cliente solicitado no existe o fue eliminado." />;

  const loans = data.loans.filter((loan) => loan.clientId === client.id);
  const payments = data.payments.filter((payment) => payment.clientId === client.id);

  const loanColumns: ColumnDef<Loan>[] = [
    { accessorKey: "amount", header: "Monto", cell: ({ row }) => currency(row.original.amount, data.settings.currency) },
    { accessorKey: "totalToPay", header: "Total", cell: ({ row }) => currency(row.original.totalToPay, data.settings.currency) },
    { accessorKey: "balance", header: "Saldo", cell: ({ row }) => currency(row.original.balance, data.settings.currency) },
    { accessorKey: "status", header: "Estado", cell: ({ row }) => <Badge value={row.original.status} /> },
    { id: "actions", header: "Detalle", cell: ({ row }) => <Link to={`/prestamos/${row.original.id}`}><Button variant="secondary">Ver</Button></Link> }
  ];

  const paymentColumns: ColumnDef<Payment>[] = [
    { accessorKey: "paidAt", header: "Fecha", cell: ({ row }) => shortDate(row.original.paidAt) },
    { accessorKey: "amount", header: "Valor", cell: ({ row }) => currency(row.original.amount, data.settings.currency) },
    { accessorKey: "method", header: "Metodo" },
    { accessorKey: "type", header: "Tipo", cell: ({ row }) => row.original.type.replace("_", " ") }
  ];

  return (
    <>
      <PageHeader title={client.fullName} description={`${client.documentId} - ${client.phone}`} actions={<Link to={`/clientes/${client.id}/editar`}><Button variant="secondary">Editar</Button></Link>} />
      <div className="mb-6 grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="card p-6">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-navy-50 text-3xl font-black text-navy-700">
            {client.photoUrl ? <img src={client.photoUrl} alt={client.fullName} className="h-full w-full rounded-3xl object-cover" /> : client.fullName[0]}
          </div>
          <Badge value={client.status} />
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p><strong>Direccion:</strong> {client.address}</p>
            <p><strong>Barrio/Ciudad:</strong> {client.city}</p>
            <p><strong>Referencia:</strong> {client.personalReference}</p>
            <p><strong>Notas:</strong> {client.notes || "Sin observaciones"}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-5"><p className="text-sm text-slate-500">Prestamos</p><p className="text-3xl font-black">{loans.length}</p></div>
          <div className="card p-5"><p className="text-sm text-slate-500">Saldo actual</p><p className="text-3xl font-black">{currency(loans.reduce((s, l) => s + l.balance, 0), data.settings.currency)}</p></div>
          <div className="card p-5"><p className="text-sm text-slate-500">Pagos</p><p className="text-3xl font-black">{payments.length}</p></div>
        </div>
      </div>
      <div className="space-y-6">
        <section>
          <h3 className="mb-3 text-xl font-black">Historial de prestamos</h3>
          <DataTable data={loans} columns={loanColumns} />
        </section>
        <section>
          <h3 className="mb-3 text-xl font-black">Historial de pagos</h3>
          <DataTable data={payments} columns={paymentColumns} />
        </section>
      </div>
    </>
  );
}

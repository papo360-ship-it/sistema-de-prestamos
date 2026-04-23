import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { currency, shortDate } from "@/lib/utils";
import type { Installment } from "@/types";

export function CollectionsPage() {
  const { data } = useData();
  const { user } = useAuth();
  const visibleClientIds = new Set(
    user?.role === "collector" ? data.clients.filter((client) => !client.assignedTo || client.assignedTo === user.id).map((client) => client.id) : data.clients.map((client) => client.id)
  );
  const installments = data.installments
    .filter((item) => visibleClientIds.has(item.clientId) && item.status !== "pagada")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const columns: ColumnDef<Installment>[] = [
    { header: "Cliente", cell: ({ row }) => data.clients.find((client) => client.id === row.original.clientId)?.fullName ?? "Sin cliente" },
    { accessorKey: "number", header: "Cuota" },
    { accessorKey: "dueDate", header: "Vence", cell: ({ row }) => shortDate(row.original.dueDate) },
    { accessorKey: "amount", header: "Valor cuota", cell: ({ row }) => currency(row.original.amount, data.settings.currency) },
    { accessorKey: "paidAmount", header: "Pagado", cell: ({ row }) => currency(row.original.paidAmount, data.settings.currency) },
    { accessorKey: "balance", header: "Saldo + mora", cell: ({ row }) => currency(row.original.balance + row.original.lateFee, data.settings.currency) },
    { accessorKey: "status", header: "Estado", cell: ({ row }) => <Badge value={row.original.status} /> },
    { id: "actions", header: "Acciones", cell: ({ row }) => <Link to={`/cobros/registrar/${row.original.id}`}><Button variant="success"><CreditCard className="h-4 w-4" /> Cobrar</Button></Link> }
  ];

  return (
    <>
      <PageHeader title="Cuotas y cobros" description="Registra pagos completos, parciales o abonos a capital sobre cuotas pendientes y vencidas." />
      <DataTable data={installments} columns={columns} searchPlaceholder="Buscar por cliente, cuota o estado..." />
    </>
  );
}

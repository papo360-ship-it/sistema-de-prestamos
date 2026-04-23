import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { currency, shortDate } from "@/lib/utils";
import type { Loan } from "@/types";

export function LoansPage() {
  const { data } = useData();
  const { user } = useAuth();
  const visibleClientIds = new Set(
    user?.role === "collector" ? data.clients.filter((client) => !client.assignedTo || client.assignedTo === user.id).map((client) => client.id) : data.clients.map((client) => client.id)
  );
  const loans = data.loans.filter((loan) => visibleClientIds.has(loan.clientId));

  const columns: ColumnDef<Loan>[] = [
    { header: "Cliente", cell: ({ row }) => data.clients.find((client) => client.id === row.original.clientId)?.fullName ?? "Sin cliente" },
    { accessorKey: "amount", header: "Monto", cell: ({ row }) => currency(row.original.amount, data.settings.currency) },
    { accessorKey: "totalToPay", header: "Total", cell: ({ row }) => currency(row.original.totalToPay, data.settings.currency) },
    { accessorKey: "balance", header: "Saldo", cell: ({ row }) => currency(row.original.balance, data.settings.currency) },
    { accessorKey: "frequency", header: "Frecuencia" },
    { accessorKey: "startDate", header: "Inicio", cell: ({ row }) => shortDate(row.original.startDate) },
    { accessorKey: "status", header: "Estado", cell: ({ row }) => <Badge value={row.original.status} /> },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link to={`/prestamos/${row.original.id}`}><Button variant="secondary"><Eye className="h-4 w-4" /> Ver</Button></Link>
          {user?.role === "admin" ? <Link to={`/prestamos/${row.original.id}/editar`}><Button variant="secondary"><Edit className="h-4 w-4" /> Editar</Button></Link> : null}
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Prestamos"
        description="Controla cartera activa, saldo, cuotas y estado de cada credito."
        actions={user?.role === "admin" ? <Link to="/prestamos/nuevo"><Button><Plus className="h-4 w-4" /> Crear prestamo</Button></Link> : null}
      />
      <DataTable data={loans} columns={columns} searchPlaceholder="Buscar prestamos..." />
    </>
  );
}

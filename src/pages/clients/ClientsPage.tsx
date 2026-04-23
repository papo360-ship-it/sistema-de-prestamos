import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import type { Client } from "@/types";

export function ClientsPage() {
  const { data, removeClient } = useData();
  const { user } = useAuth();
  const clients = user?.role === "collector" ? data.clients.filter((client) => !client.assignedTo || client.assignedTo === user.id) : data.clients;

  const columns: ColumnDef<Client>[] = [
    { accessorKey: "fullName", header: "Cliente" },
    { accessorKey: "documentId", header: "Cedula" },
    { accessorKey: "phone", header: "Telefono" },
    { accessorKey: "city", header: "Barrio/Ciudad" },
    { accessorKey: "status", header: "Estado", cell: ({ row }) => <Badge value={row.original.status} /> },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link to={`/clientes/${row.original.id}`}>
            <Button variant="secondary" className="px-3"><Eye className="h-4 w-4" /></Button>
          </Link>
          <Link to={`/clientes/${row.original.id}/editar`}>
            <Button variant="secondary" className="px-3"><Edit className="h-4 w-4" /></Button>
          </Link>
          {user?.role === "admin" ? (
            <Button variant="danger" className="px-3" onClick={() => removeClient(row.original.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Administra informacion, referencias, estado de cartera e historial."
        actions={<Link to="/clientes/nuevo"><Button><Plus className="h-4 w-4" /> Nuevo cliente</Button></Link>}
      />
      <DataTable data={clients} columns={columns} searchPlaceholder="Buscar por nombre, cedula, telefono o ciudad..." />
    </>
  );
}

import type { ColumnDef } from "@tanstack/react-table";
import { FormEvent, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Field, Input, Select } from "@/components/ui/Field";
import { PageHeader } from "@/components/layout/PageHeader";
import { useData } from "@/context/DataContext";
import type { Profile, Role } from "@/types";

export function UsersPage() {
  const { data, addProfile } = useData();
  const [form, setForm] = useState({ fullName: "", email: "", role: "collector" as Role, active: true });

  const columns: ColumnDef<Profile>[] = [
    { accessorKey: "fullName", header: "Nombre" },
    { accessorKey: "email", header: "Correo" },
    { accessorKey: "role", header: "Rol", cell: ({ row }) => <Badge value={row.original.role} /> },
    { accessorKey: "active", header: "Estado", cell: ({ row }) => row.original.active ? "Activo" : "Inactivo" }
  ];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.fullName || !form.email) return;
    await addProfile(form);
    setForm({ fullName: "", email: "", role: "collector", active: true });
  };

  return (
    <>
      <PageHeader title="Usuarios" description="Crea usuarios operativos y define permisos por rol." />
      <form onSubmit={handleSubmit} className="card mb-6 grid gap-4 p-6 md:grid-cols-4">
        <Field label="Nombre">
          <Input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
        </Field>
        <Field label="Correo">
          <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </Field>
        <Field label="Rol">
          <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })}>
            <option value="collector">Cobrador</option>
            <option value="admin">Administrador</option>
          </Select>
        </Field>
        <div className="flex items-end">
          <Button type="submit" className="w-full">Crear usuario</Button>
        </div>
      </form>
      <DataTable data={data.profiles} columns={columns} searchPlaceholder="Buscar usuarios..." />
    </>
  );
}

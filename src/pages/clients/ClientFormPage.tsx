import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import type { ClientStatus } from "@/types";

export function ClientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, addClient, editClient } = useData();
  const { user } = useAuth();
  const existing = useMemo(() => data.clients.find((client) => client.id === id), [data.clients, id]);
  const [form, setForm] = useState({
    photoUrl: existing?.photoUrl ?? "",
    fullName: existing?.fullName ?? "",
    documentId: existing?.documentId ?? "",
    phone: existing?.phone ?? "",
    address: existing?.address ?? "",
    city: existing?.city ?? "",
    personalReference: existing?.personalReference ?? "",
    notes: existing?.notes ?? "",
    status: (existing?.status ?? "activo") as ClientStatus,
    assignedTo: existing?.assignedTo ?? user?.id ?? ""
  });
  const [error, setError] = useState("");

  const set = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.fullName || !form.documentId || !form.phone) {
      setError("Nombre, cedula y telefono son obligatorios.");
      return;
    }

    if (existing) {
      await editClient(existing.id, form);
      navigate(`/clientes/${existing.id}`);
    } else {
      await addClient(form);
      navigate("/clientes");
    }
  };

  return (
    <>
      <PageHeader title={existing ? "Editar cliente" : "Crear cliente"} description="Registra datos completos para evaluar y hacer seguimiento a la cartera." />
      <form onSubmit={handleSubmit} className="card grid gap-4 p-6 md:grid-cols-2">
        <Field label="URL de foto">
          <Input value={form.photoUrl} onChange={(event) => set("photoUrl", event.target.value)} placeholder="https://..." />
        </Field>
        <Field label="Nombre completo">
          <Input value={form.fullName} onChange={(event) => set("fullName", event.target.value)} />
        </Field>
        <Field label="Cedula">
          <Input value={form.documentId} onChange={(event) => set("documentId", event.target.value)} />
        </Field>
        <Field label="Telefono">
          <Input value={form.phone} onChange={(event) => set("phone", event.target.value)} />
        </Field>
        <Field label="Direccion">
          <Input value={form.address} onChange={(event) => set("address", event.target.value)} />
        </Field>
        <Field label="Barrio o ciudad">
          <Input value={form.city} onChange={(event) => set("city", event.target.value)} />
        </Field>
        <Field label="Referencia personal">
          <Input value={form.personalReference} onChange={(event) => set("personalReference", event.target.value)} />
        </Field>
        <Field label="Estado del cliente">
          <Select value={form.status} onChange={(event) => set("status", event.target.value)}>
            <option value="activo">Activo</option>
            <option value="al_dia">Al dia</option>
            <option value="moroso">Moroso</option>
            <option value="bloqueado">Bloqueado</option>
          </Select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Observaciones">
            <Textarea value={form.notes} onChange={(event) => set("notes", event.target.value)} />
          </Field>
        </div>
        {error ? <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-danger md:col-span-2">{error}</div> : null}
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit">Guardar cliente</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </>
  );
}

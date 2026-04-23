import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { calculateLoan, getNextDueDate } from "@/lib/loanMath";
import { currency, shortDate } from "@/lib/utils";
import type { Frequency } from "@/types";

export function LoanFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, addLoan } = useData();
  const [form, setForm] = useState({
    clientId: data.clients[0]?.id ?? "",
    amount: 500000,
    interestRate: data.settings.defaultInterestRate,
    installmentsCount: 20,
    frequency: "diaria" as Frequency,
    startDate: new Date().toISOString().slice(0, 10),
    notes: ""
  });
  const [error, setError] = useState("");
  const calc = useMemo(() => calculateLoan(Number(form.amount), Number(form.interestRate), Number(form.installmentsCount)), [form.amount, form.interestRate, form.installmentsCount]);
  const finalDate = shortDate(getNextDueDate(form.startDate, form.frequency, Number(form.installmentsCount) - 1));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.clientId || form.amount <= 0 || form.installmentsCount <= 0) {
      setError("Selecciona cliente, monto y numero de cuotas validos.");
      return;
    }
    await addLoan(form, user!.id);
    navigate("/prestamos");
  };

  return (
    <>
      <PageHeader title="Crear prestamo" description="Calcula automaticamente total a pagar, cuota, ganancia y cronograma." />
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card grid gap-4 p-6 md:grid-cols-2">
          <Field label="Cliente">
            <Select value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })}>
              {data.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}
            </Select>
          </Field>
          <Field label="Monto prestado">
            <Input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })} />
          </Field>
          <Field label="Interes (%)">
            <Input type="number" value={form.interestRate} onChange={(event) => setForm({ ...form, interestRate: Number(event.target.value) })} />
          </Field>
          <Field label="Numero de cuotas">
            <Input type="number" value={form.installmentsCount} onChange={(event) => setForm({ ...form, installmentsCount: Number(event.target.value) })} />
          </Field>
          <Field label="Frecuencia">
            <Select value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value as Frequency })}>
              <option value="diaria">Diaria</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </Select>
          </Field>
          <Field label="Fecha de inicio">
            <Input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Observaciones">
              <Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </Field>
          </div>
          {error ? <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-danger md:col-span-2">{error}</div> : null}
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">Crear prestamo</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
          </div>
        </div>
        <aside className="card h-fit p-6">
          <h3 className="text-xl font-black">Simulacion</h3>
          <div className="mt-5 space-y-4">
            <Metric label="Total a pagar" value={currency(calc.totalToPay, data.settings.currency)} />
            <Metric label="Valor por cuota" value={currency(calc.installmentValue, data.settings.currency)} />
            <Metric label="Ganancia esperada" value={currency(calc.profit, data.settings.currency)} positive />
            <Metric label="Fecha final estimada" value={finalDate} />
          </div>
        </aside>
      </form>
    </>
  );
}

function Metric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${positive ? "text-success" : "text-ink"}`}>{value}</p>
    </div>
  );
}

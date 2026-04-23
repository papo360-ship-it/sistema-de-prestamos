import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { calculateLoan, getNextDueDate } from "@/lib/loanMath";
import { currency, shortDate } from "@/lib/utils";
import type { Frequency, LoanStatus } from "@/types";

export function LoanFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { data, addLoan, editLoan } = useData();
  const existing = data.loans.find((loan) => loan.id === id);
  const defaultAmount = existing?.amount ?? 500000;
  const defaultInterest = existing?.interestRate ?? data.settings.defaultInterestRate;
  const defaultInstallments = existing?.installmentsCount ?? 20;
  const defaultTotal = calculateLoan(defaultAmount, defaultInterest, defaultInstallments).totalToPay;
  const [form, setForm] = useState({
    clientId: existing?.clientId ?? data.clients[0]?.id ?? "",
    amount: defaultAmount,
    interestRate: defaultInterest,
    installmentsCount: defaultInstallments,
    frequency: (existing?.frequency ?? "diaria") as Frequency,
    startDate: existing?.startDate ?? new Date().toISOString().slice(0, 10),
    currentBalance: existing?.balance ?? defaultTotal,
    status: (existing?.status ?? "activo") as LoanStatus,
    notes: existing?.notes ?? ""
  });
  const [error, setError] = useState("");
  const calc = useMemo(() => calculateLoan(Number(form.amount), Number(form.interestRate), Number(form.installmentsCount)), [form.amount, form.interestRate, form.installmentsCount]);
  const finalDate = shortDate(getNextDueDate(form.startDate, form.frequency, Number(form.installmentsCount) - 1));
  const currentBalance = form.currentBalance;
  const paidAmount = Math.max(0, calc.totalToPay - currentBalance);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.clientId || form.amount <= 0 || form.installmentsCount <= 0) {
      setError("Selecciona cliente, monto y numero de cuotas validos.");
      return;
    }
    const payload = { ...form, currentBalance: Math.max(0, Math.min(currentBalance, calc.totalToPay)) };
    if (existing) {
      await editLoan(existing.id, payload, user!.id);
      navigate(`/prestamos/${existing.id}`);
      return;
    }

    await addLoan(payload, user!.id);
    navigate("/prestamos");
  };

  return (
    <>
      <PageHeader
        title={existing ? "Editar prestamo" : "Crear prestamo"}
        description="Para clientes o prestamos viejos, registra el saldo actual y el sistema ajusta cuotas pagadas, parciales y pendientes."
      />
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card grid gap-4 p-6 md:grid-cols-2">
          <Field label="Cliente">
            <Select value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })}>
              {data.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}
            </Select>
          </Field>
          <Field label="Monto prestado">
            <Input type="number" value={form.amount} onChange={(event) => {
              const amount = Number(event.target.value);
              const nextTotal = calculateLoan(amount, form.interestRate, form.installmentsCount).totalToPay;
              setForm({ ...form, amount, currentBalance: existing ? form.currentBalance : nextTotal });
            }} />
          </Field>
          <Field label="Interes (%)">
            <Input type="number" value={form.interestRate} onChange={(event) => {
              const interestRate = Number(event.target.value);
              const nextTotal = calculateLoan(form.amount, interestRate, form.installmentsCount).totalToPay;
              setForm({ ...form, interestRate, currentBalance: existing ? form.currentBalance : nextTotal });
            }} />
          </Field>
          <Field label="Numero de cuotas">
            <Input type="number" value={form.installmentsCount} onChange={(event) => {
              const installmentsCount = Number(event.target.value);
              const nextTotal = calculateLoan(form.amount, form.interestRate, installmentsCount).totalToPay;
              setForm({ ...form, installmentsCount, currentBalance: existing ? form.currentBalance : nextTotal });
            }} />
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
          <Field label="Saldo actual que debe">
            <Input type="number" value={currentBalance} onChange={(event) => setForm({ ...form, currentBalance: Number(event.target.value) })} />
          </Field>
          <Field label="Estado del prestamo">
            <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as LoanStatus })}>
              <option value="activo">Activo</option>
              <option value="vencido">Vencido</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </Field>
          <div className="rounded-3xl bg-blue-50 p-4 text-sm font-semibold text-blue-800 md:col-span-2">
            Si estas migrando un prestamo viejo, escribe aqui cuanto debe hoy. El sistema tomara la diferencia como ya pagada y recalculara el cronograma.
            <button
              type="button"
              className="ml-2 font-black underline"
              onClick={() => setForm({ ...form, currentBalance: calc.totalToPay })}
            >
              Usar total completo
            </button>
          </div>
          <div className="md:col-span-2">
            <Field label="Observaciones">
              <Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </Field>
          </div>
          {error ? <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-danger md:col-span-2">{error}</div> : null}
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">{existing ? "Guardar cambios" : "Crear prestamo"}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
          </div>
        </div>
        <aside className="card h-fit p-6">
          <h3 className="text-xl font-black">Simulacion</h3>
          <div className="mt-5 space-y-4">
            <Metric label="Total a pagar" value={currency(calc.totalToPay, data.settings.currency)} />
            <Metric label="Valor por cuota" value={currency(calc.installmentValue, data.settings.currency)} />
            <Metric label="Ganancia esperada" value={currency(calc.profit, data.settings.currency)} positive />
            <Metric label="Ya pagado/migrado" value={currency(paidAmount, data.settings.currency)} positive />
            <Metric label="Saldo actual" value={currency(currentBalance, data.settings.currency)} />
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

import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { currency } from "@/lib/utils";
import type { PaymentMethod, PaymentType } from "@/types";

export function PaymentPage() {
  const { installmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, addPayment } = useData();
  const installment = data.installments.find((item) => item.id === installmentId);
  const defaultLoan = installment ? data.loans.find((loan) => loan.id === installment.loanId) : data.loans.find((loan) => loan.balance > 0);
  const [form, setForm] = useState({
    loanId: defaultLoan?.id ?? "",
    clientId: installment?.clientId ?? defaultLoan?.clientId ?? "",
    installmentId: installment?.id ?? "",
    amount: installment ? installment.balance + installment.lateFee : 0,
    type: "cuota_completa" as PaymentType,
    method: "efectivo" as PaymentMethod,
    paidAt: new Date().toISOString().slice(0, 10),
    notes: ""
  });
  const [error, setError] = useState("");
  const client = useMemo(() => data.clients.find((item) => item.id === form.clientId), [data.clients, form.clientId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.loanId || !form.clientId || form.amount <= 0) {
      setError("Selecciona prestamo, cliente y valor de pago valido.");
      return;
    }
    await addPayment(form, user!.id);
    navigate("/cobros");
  };

  return (
    <>
      <PageHeader title="Registrar pago" description={client ? `Cobro para ${client.fullName}` : "Registra un pago completo, parcial o abono a capital."} />
      <form onSubmit={handleSubmit} className="card grid gap-4 p-6 md:grid-cols-2">
        <Field label="Prestamo">
          <Select
            value={form.loanId}
            onChange={(event) => {
              const loan = data.loans.find((item) => item.id === event.target.value);
              setForm({ ...form, loanId: event.target.value, clientId: loan?.clientId ?? "" });
            }}
          >
            {data.loans.filter((loan) => loan.balance > 0).map((loan) => (
              <option key={loan.id} value={loan.id}>
                {data.clients.find((client) => client.id === loan.clientId)?.fullName} - saldo {currency(loan.balance, data.settings.currency)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tipo de pago">
          <Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as PaymentType })}>
            <option value="cuota_completa">Pago completo</option>
            <option value="pago_parcial">Pago parcial</option>
            <option value="abono_capital">Abono a capital</option>
          </Select>
        </Field>
        <Field label="Valor">
          <Input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })} />
        </Field>
        <Field label="Metodo de pago">
          <Select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value as PaymentMethod })}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="otro">Otro</option>
          </Select>
        </Field>
        <Field label="Fecha de pago">
          <Input type="date" value={form.paidAt} onChange={(event) => setForm({ ...form, paidAt: event.target.value })} />
        </Field>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Saldo seleccionado</p>
          <p className="mt-1 text-2xl font-black text-ink">
            {currency((installment?.balance ?? defaultLoan?.balance ?? 0) + (installment?.lateFee ?? 0), data.settings.currency)}
          </p>
        </div>
        <div className="md:col-span-2">
          <Field label="Observacion">
            <Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </Field>
        </div>
        {error ? <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-danger md:col-span-2">{error}</div> : null}
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" variant="success">Guardar pago</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </>
  );
}

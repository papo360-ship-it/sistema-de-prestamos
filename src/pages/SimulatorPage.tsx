import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/ui/Field";
import { useData } from "@/context/DataContext";
import { buildSchedule, calculateLoan } from "@/lib/loanMath";
import { currency, shortDate } from "@/lib/utils";
import type { Frequency } from "@/types";

export function SimulatorPage() {
  const { data } = useData();
  const [amount, setAmount] = useState(800000);
  const [interest, setInterest] = useState(data.settings.defaultInterestRate);
  const [installments, setInstallments] = useState(16);
  const [frequency, setFrequency] = useState<Frequency>("diaria");
  const calc = useMemo(() => calculateLoan(amount, interest, installments), [amount, interest, installments]);
  const schedule = useMemo(() => buildSchedule({
    loanId: "sim",
    clientId: "sim",
    startDate: new Date().toISOString().slice(0, 10),
    frequency,
    installmentsCount: installments,
    installmentValue: calc.installmentValue,
    totalToPay: calc.totalToPay
  }), [calc.installmentValue, calc.totalToPay, frequency, installments]);

  return (
    <>
      <PageHeader title="Simulador de prestamo" description="Proyecta cuotas, ganancia esperada y calendario antes de crear un credito real." />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="card h-fit space-y-4 p-6">
          <Field label="Capital">
            <Input type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
          </Field>
          <Field label="Interes (%)">
            <Input type="number" value={interest} onChange={(event) => setInterest(Number(event.target.value))} />
          </Field>
          <Field label="Cuotas">
            <Input type="number" value={installments} onChange={(event) => setInstallments(Number(event.target.value))} />
          </Field>
          <Field label="Frecuencia">
            <Select value={frequency} onChange={(event) => setFrequency(event.target.value as Frequency)}>
              <option value="diaria">Diaria</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </Select>
          </Field>
        </div>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Total a pagar" value={currency(calc.totalToPay, data.settings.currency)} />
            <Metric label="Cuota estimada" value={currency(calc.installmentValue, data.settings.currency)} />
            <Metric label="Ganancia esperada" value={currency(calc.profit, data.settings.currency)} />
          </div>
          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 p-5"><h3 className="text-xl font-black">Calendario estimado</h3></div>
            <div className="grid gap-2 p-5 md:grid-cols-2 xl:grid-cols-4">
              {schedule.slice(0, 24).map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-3 text-sm">
                  <p className="font-black">Cuota {item.number}</p>
                  <p className="text-slate-500">{shortDate(item.dueDate)}</p>
                  <p className="font-bold text-navy-700">{currency(item.amount, data.settings.currency)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="card p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
}

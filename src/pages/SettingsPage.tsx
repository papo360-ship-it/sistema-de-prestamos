import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import type { LateFeeType } from "@/types";

export function SettingsPage() {
  const { user } = useAuth();
  const { data, saveSettings, restoreSeed } = useData();
  const [settings, setSettings] = useState(data.settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await saveSettings(settings, user!.id);
    setSaved(true);
  };

  return (
    <>
      <PageHeader title="Configuracion" description="Define parametros globales del negocio: capital, interes, moneda, logo y reglas de mora." />
      <form onSubmit={handleSubmit} className="card grid gap-4 p-6 md:grid-cols-2">
        <Field label="Nombre del negocio">
          <Input value={settings.businessName} onChange={(event) => setSettings({ ...settings, businessName: event.target.value })} />
        </Field>
        <Field label="Logo URL">
          <Input value={settings.logoUrl ?? ""} onChange={(event) => setSettings({ ...settings, logoUrl: event.target.value })} />
        </Field>
        <Field label="Interes por defecto (%)">
          <Input type="number" value={settings.defaultInterestRate} onChange={(event) => setSettings({ ...settings, defaultInterestRate: Number(event.target.value) })} />
        </Field>
        <Field label="Moneda">
          <Select value={settings.currency} onChange={(event) => setSettings({ ...settings, currency: event.target.value })}>
            <option value="COP">COP</option>
            <option value="USD">USD</option>
            <option value="DOP">DOP</option>
            <option value="MXN">MXN</option>
          </Select>
        </Field>
        <Field label="Capital inicial">
          <Input type="number" value={settings.initialCapital} onChange={(event) => setSettings({ ...settings, initialCapital: Number(event.target.value) })} />
        </Field>
        <Field label="Mora activa">
          <Select value={settings.lateFeeEnabled ? "si" : "no"} onChange={(event) => setSettings({ ...settings, lateFeeEnabled: event.target.value === "si" })}>
            <option value="si">Si</option>
            <option value="no">No</option>
          </Select>
        </Field>
        <Field label="Tipo de mora">
          <Select value={settings.lateFeeType} onChange={(event) => setSettings({ ...settings, lateFeeType: event.target.value as LateFeeType })}>
            <option value="fija">Fija diaria</option>
            <option value="porcentual">Porcentual diaria</option>
          </Select>
        </Field>
        <Field label="Mora fija diaria">
          <Input type="number" value={settings.dailyLateFee} onChange={(event) => setSettings({ ...settings, dailyLateFee: Number(event.target.value) })} />
        </Field>
        <Field label="Mora porcentual diaria (%)">
          <Input type="number" value={settings.lateFeePercentage} onChange={(event) => setSettings({ ...settings, lateFeePercentage: Number(event.target.value) })} />
        </Field>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button type="submit">Guardar configuracion</Button>
          <Button type="button" variant="secondary" onClick={restoreSeed}>Restaurar datos demo</Button>
        </div>
        {saved ? <div className="rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-success md:col-span-2">Configuracion guardada correctamente.</div> : null}
      </form>
    </>
  );
}

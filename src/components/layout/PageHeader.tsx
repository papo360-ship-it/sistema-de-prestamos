import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-navy-500">Sistema de Prestamos</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-ink md:text-4xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

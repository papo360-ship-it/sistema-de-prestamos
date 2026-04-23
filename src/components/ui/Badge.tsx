import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  activo: "bg-blue-50 text-blue-700",
  al_dia: "bg-emerald-50 text-emerald-700",
  moroso: "bg-red-50 text-red-700",
  bloqueado: "bg-slate-100 text-slate-700",
  finalizado: "bg-emerald-50 text-emerald-700",
  vencido: "bg-red-50 text-red-700",
  pendiente: "bg-amber-50 text-amber-700",
  parcial: "bg-sky-50 text-sky-700",
  pagada: "bg-emerald-50 text-emerald-700",
  admin: "bg-navy-50 text-navy-700",
  collector: "bg-slate-100 text-slate-700"
};

export function Badge({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize", styles[value] ?? styles.activo, className)}>
      {value.replace("_", " ")}
    </span>
  );
}

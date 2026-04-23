import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "blue",
  helper
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "blue" | "green" | "red" | "slate";
  helper?: string;
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700"
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black text-ink">{value}</p>
          {helper ? <p className="mt-1 text-xs font-semibold text-slate-400">{helper}</p> : null}
        </div>
        <div className={cn("rounded-2xl p-3", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

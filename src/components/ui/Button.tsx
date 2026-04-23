import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";

const variants: Record<Variant, string> = {
  primary: "bg-navy-900 text-white hover:bg-navy-700",
  secondary: "border border-slate-200 bg-white text-ink hover:bg-slate-50",
  danger: "bg-danger text-white hover:bg-red-700",
  ghost: "text-slate-600 hover:bg-slate-100",
  success: "bg-success text-white hover:bg-emerald-700"
};

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

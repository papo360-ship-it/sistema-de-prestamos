import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(value: number, currencyCode = "COP") {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);
}

export function shortDate(date: string | Date) {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(date));
}

export function uid(_prefix = "id") {
  return crypto.randomUUID();
}

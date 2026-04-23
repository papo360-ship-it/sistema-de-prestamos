import { addDays, addMonths, differenceInCalendarDays, formatISO, isBefore, parseISO } from "date-fns";
import type { Frequency, Installment, Settings } from "@/types";
import { uid } from "@/lib/utils";

export function getNextDueDate(startDate: string, frequency: Frequency, index: number) {
  const date = parseISO(startDate);

  if (frequency === "diaria") return addDays(date, index);
  if (frequency === "semanal") return addDays(date, index * 7);
  if (frequency === "quincenal") return addDays(date, index * 15);
  return addMonths(date, index);
}

export function calculateLoan(amount: number, interestRate: number, installmentsCount: number) {
  const profit = amount * (interestRate / 100);
  const totalToPay = amount + profit;
  const installmentValue = Math.ceil(totalToPay / installmentsCount);

  return { profit, totalToPay, installmentValue };
}

export function buildSchedule(params: {
  loanId: string;
  clientId: string;
  startDate: string;
  frequency: Frequency;
  installmentsCount: number;
  installmentValue: number;
  totalToPay: number;
}): Installment[] {
  const installments: Installment[] = [];
  let remaining = params.totalToPay;

  for (let i = 1; i <= params.installmentsCount; i += 1) {
    const amount = i === params.installmentsCount ? remaining : params.installmentValue;
    installments.push({
      id: uid("cuota"),
      loanId: params.loanId,
      clientId: params.clientId,
      number: i,
      dueDate: formatISO(getNextDueDate(params.startDate, params.frequency, i - 1), { representation: "date" }),
      amount,
      paidAmount: 0,
      balance: amount,
      lateFee: 0,
      status: "pendiente"
    });
    remaining -= amount;
  }

  return installments;
}

export function calculateLateFee(installment: Installment, settings: Settings, today = new Date()) {
  if (!settings.lateFeeEnabled || installment.status === "pagada") return 0;
  const dueDate = parseISO(installment.dueDate);
  if (!isBefore(dueDate, today)) return 0;

  const lateDays = Math.max(0, differenceInCalendarDays(today, dueDate));
  if (settings.lateFeeType === "porcentual") {
    return Math.round(installment.balance * (settings.lateFeePercentage / 100) * lateDays);
  }

  return settings.dailyLateFee * lateDays;
}

export function refreshInstallmentStatus(installment: Installment, settings: Settings, today = new Date()): Installment {
  const lateFee = calculateLateFee(installment, settings, today);
  if (installment.balance <= 0) return { ...installment, lateFee: 0, status: "pagada" };
  if (installment.paidAmount > 0) return { ...installment, lateFee, status: "parcial" };
  if (lateFee > 0) return { ...installment, lateFee, status: "vencida" };
  return { ...installment, lateFee, status: "pendiente" };
}

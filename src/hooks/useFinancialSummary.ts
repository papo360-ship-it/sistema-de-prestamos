import { isSameDay, isSameMonth, parseISO } from "date-fns";
import { useMemo } from "react";
import { calculateLateFee } from "@/lib/loanMath";
import { useData } from "@/context/DataContext";

export function useFinancialSummary() {
  const { data } = useData();

  return useMemo(() => {
    const totalLoaned = data.loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalCollected = data.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const expectedProfit = data.loans.reduce((sum, loan) => sum + loan.profit, 0);
    const activeLoans = data.loans.filter((loan) => loan.status === "activo" || loan.status === "vencido");
    const pendingInstallments = data.installments.filter((item) => item.status === "pendiente" || item.status === "parcial");
    const overdueInstallments = data.installments.filter((item) => item.status === "vencida");
    const todayPayments = data.payments.filter((payment) => isSameDay(parseISO(payment.paidAt), new Date()));
    const monthPayments = data.payments.filter((payment) => isSameMonth(parseISO(payment.paidAt), new Date()));
    const overdueClients = new Set(overdueInstallments.map((item) => item.clientId));
    const accumulatedLateFees = data.installments.reduce(
      (sum, installment) => sum + calculateLateFee(installment, data.settings),
      0
    );

    return {
      totalLoaned,
      totalCollected,
      expectedProfit,
      availableCapital: data.settings.initialCapital + totalCollected - totalLoaned,
      clientsCount: data.clients.length,
      activeLoansCount: activeLoans.length,
      pendingInstallmentsCount: pendingInstallments.length,
      overdueInstallmentsCount: overdueInstallments.length,
      todayCollected: todayPayments.reduce((sum, payment) => sum + payment.amount, 0),
      monthCollected: monthPayments.reduce((sum, payment) => sum + payment.amount, 0),
      overdueClientsCount: overdueClients.size,
      accumulatedLateFees,
      collectionRate: totalLoaned > 0 ? Math.round((totalCollected / (totalLoaned + expectedProfit)) * 100) : 0
    };
  }, [data]);
}

import { formatISO } from "date-fns";
import { initialData } from "@/data/mockData";
import { buildSchedule, calculateLoan, getNextDueDate, refreshInstallmentStatus } from "@/lib/loanMath";
import { uid } from "@/lib/utils";
import type {
  AppData,
  Client,
  Installment,
  Loan,
  Payment,
  PaymentMethod,
  PaymentType,
  Profile,
  Settings
} from "@/types";

const STORAGE_KEY = "sistema-prestamos-data";

export function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return normalizeData(initialData);

  try {
    return normalizeData(JSON.parse(raw) as AppData);
  } catch {
    return normalizeData(initialData);
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData() {
  saveData(initialData);
  return initialData;
}

export function normalizeData(data: AppData): AppData {
  const installments = data.installments.map((installment) =>
    refreshInstallmentStatus(installment, data.settings)
  );

  const overdueClientIds = new Set(
    installments.filter((installment) => installment.status === "vencida").map((installment) => installment.clientId)
  );

  const clients = data.clients.map((client) => ({
    ...client,
    status: client.status === "bloqueado" ? client.status : overdueClientIds.has(client.id) ? "moroso" : client.status
  }));

  return { ...data, installments, clients };
}

export function createClient(data: AppData, input: Omit<Client, "id" | "createdAt" | "updatedAt">): AppData {
  const now = new Date().toISOString();
  const client: Client = {
    ...input,
    id: uid("cli"),
    createdAt: now,
    updatedAt: now
  };

  return { ...data, clients: [client, ...data.clients] };
}

export function updateClient(data: AppData, clientId: string, input: Partial<Client>): AppData {
  return {
    ...data,
    clients: data.clients.map((client) =>
      client.id === clientId ? { ...client, ...input, updatedAt: new Date().toISOString() } : client
    )
  };
}

export function deleteClient(data: AppData, clientId: string): AppData {
  return {
    ...data,
    clients: data.clients.filter((client) => client.id !== clientId),
    loans: data.loans.filter((loan) => loan.clientId !== clientId),
    installments: data.installments.filter((installment) => installment.clientId !== clientId),
    payments: data.payments.filter((payment) => payment.clientId !== clientId)
  };
}

export function createLoan(
  data: AppData,
  input: Pick<Loan, "clientId" | "amount" | "interestRate" | "installmentsCount" | "frequency" | "startDate" | "notes">,
  userId: string
): AppData {
  const loanId = uid("pre");
  const calc = calculateLoan(input.amount, input.interestRate, input.installmentsCount);
  const endDate = formatISO(getNextDueDate(input.startDate, input.frequency, input.installmentsCount - 1), {
    representation: "date"
  });

  const loan: Loan = {
    id: loanId,
    clientId: input.clientId,
    amount: input.amount,
    interestRate: input.interestRate,
    installmentsCount: input.installmentsCount,
    frequency: input.frequency,
    startDate: input.startDate,
    endDate,
    totalToPay: calc.totalToPay,
    installmentValue: calc.installmentValue,
    balance: calc.totalToPay,
    principalBalance: input.amount,
    profit: calc.profit,
    notes: input.notes,
    status: "activo",
    createdBy: userId,
    createdAt: new Date().toISOString()
  };

  const schedule = buildSchedule({
    loanId,
    clientId: input.clientId,
    startDate: input.startDate,
    frequency: input.frequency,
    installmentsCount: input.installmentsCount,
    installmentValue: calc.installmentValue,
    totalToPay: calc.totalToPay
  });

  return normalizeData({
    ...data,
    loans: [loan, ...data.loans],
    installments: [...schedule, ...data.installments],
    movements: [
      {
        id: uid("mov"),
        type: "prestamo_creado",
        description: `Prestamo creado por ${calc.totalToPay}`,
        amount: input.amount,
        userId,
        createdAt: new Date().toISOString()
      },
      ...data.movements
    ]
  });
}

export function registerPayment(
  data: AppData,
  input: {
    loanId: string;
    clientId: string;
    installmentId?: string;
    amount: number;
    type: PaymentType;
    method: PaymentMethod;
    paidAt: string;
    notes?: string;
  },
  userId: string
): AppData {
  let remainingPayment = input.amount;
  const loanInstallments = data.installments
    .filter((item) => item.loanId === input.loanId)
    .sort((a, b) => a.number - b.number);

  const selectedInstallments = input.type === "abono_capital"
    ? []
    : input.installmentId
      ? loanInstallments.filter((item) => item.id === input.installmentId)
      : loanInstallments.filter((item) => item.balance > 0);

  const updatedInstallments = data.installments.map((installment) => {
    const shouldPay = selectedInstallments.some((item) => item.id === installment.id);
    if (!shouldPay || remainingPayment <= 0) return installment;

    const paymentForInstallment = Math.min(installment.balance, remainingPayment);
    remainingPayment -= paymentForInstallment;

    return refreshInstallmentStatus(
      {
        ...installment,
        paidAmount: installment.paidAmount + paymentForInstallment,
        balance: installment.balance - paymentForInstallment
      },
      data.settings
    );
  });

  const updatedLoans = data.loans.map((loan) => {
    if (loan.id !== input.loanId) return loan;
    const nextBalance = Math.max(0, loan.balance - input.amount);
    const nextPrincipal = input.type === "abono_capital"
      ? Math.max(0, loan.principalBalance - input.amount)
      : Math.max(0, loan.principalBalance - input.amount * (loan.amount / loan.totalToPay));

    return {
      ...loan,
      balance: nextBalance,
      principalBalance: nextPrincipal,
      status: nextBalance <= 0 ? "finalizado" : loan.status
    };
  });

  const payment: Payment = {
    id: uid("pag"),
    ...input,
    registeredBy: userId,
    createdAt: new Date().toISOString()
  };

  return normalizeData({
    ...data,
    loans: updatedLoans,
    installments: updatedInstallments,
    payments: [payment, ...data.payments],
    movements: [
      {
        id: uid("mov"),
        type: "pago_registrado",
        description: "Pago registrado",
        amount: input.amount,
        userId,
        createdAt: new Date().toISOString()
      },
      ...data.movements
    ]
  });
}

export function updateSettings(data: AppData, settings: Settings, userId: string): AppData {
  return normalizeData({
    ...data,
    settings,
    movements: [
      {
        id: uid("mov"),
        type: "configuracion",
        description: "Configuracion actualizada",
        userId,
        createdAt: new Date().toISOString()
      },
      ...data.movements
    ]
  });
}

export function createProfile(data: AppData, input: Omit<Profile, "id" | "createdAt">): AppData {
  return {
    ...data,
    profiles: [{ ...input, id: uid("usr"), createdAt: new Date().toISOString() }, ...data.profiles]
  };
}

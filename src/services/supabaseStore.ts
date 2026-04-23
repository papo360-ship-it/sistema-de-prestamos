import { formatISO } from "date-fns";
import { buildSchedule, calculateLoan, getNextDueDate, refreshInstallmentStatus } from "@/lib/loanMath";
import { supabase } from "@/lib/supabase";
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

type Row = Record<string, unknown>;

function requireSupabase() {
  if (!supabase) throw new Error("Supabase no esta configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.");
  return supabase;
}

function clean<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function toProfile(row: Row): Profile {
  return {
    id: String(row.id),
    fullName: String(row.full_name),
    email: String(row.email),
    role: row.role as Profile["role"],
    active: Boolean(row.active),
    createdAt: String(row.created_at)
  };
}

function toClient(row: Row): Client {
  return {
    id: String(row.id),
    photoUrl: row.photo_url ? String(row.photo_url) : undefined,
    fullName: String(row.full_name),
    documentId: String(row.document_id),
    phone: String(row.phone),
    address: String(row.address),
    city: String(row.city),
    personalReference: String(row.personal_reference),
    notes: row.notes ? String(row.notes) : undefined,
    status: row.status as Client["status"],
    assignedTo: row.assigned_to ? String(row.assigned_to) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function fromClient(input: Partial<Client>) {
  return clean({
    photo_url: input.photoUrl || null,
    full_name: input.fullName,
    document_id: input.documentId,
    phone: input.phone,
    address: input.address,
    city: input.city,
    personal_reference: input.personalReference,
    notes: input.notes || null,
    status: input.status,
    assigned_to: input.assignedTo || null
  });
}

function toLoan(row: Row): Loan {
  return {
    id: String(row.id),
    clientId: String(row.client_id),
    amount: Number(row.amount),
    interestRate: Number(row.interest_rate),
    installmentsCount: Number(row.installments_count),
    frequency: row.frequency as Loan["frequency"],
    startDate: String(row.start_date),
    endDate: String(row.end_date),
    totalToPay: Number(row.total_to_pay),
    installmentValue: Number(row.installment_value),
    balance: Number(row.balance),
    principalBalance: Number(row.principal_balance),
    profit: Number(row.profit),
    notes: row.notes ? String(row.notes) : undefined,
    status: row.status as Loan["status"],
    createdBy: row.created_by ? String(row.created_by) : "",
    createdAt: String(row.created_at)
  };
}

function fromLoan(input: Loan) {
  return {
    id: input.id,
    client_id: input.clientId,
    amount: input.amount,
    interest_rate: input.interestRate,
    installments_count: input.installmentsCount,
    frequency: input.frequency,
    start_date: input.startDate,
    end_date: input.endDate,
    total_to_pay: input.totalToPay,
    installment_value: input.installmentValue,
    balance: input.balance,
    principal_balance: input.principalBalance,
    profit: input.profit,
    notes: input.notes || null,
    status: input.status,
    created_by: input.createdBy
  };
}

function toInstallment(row: Row): Installment {
  return {
    id: String(row.id),
    loanId: String(row.loan_id),
    clientId: String(row.client_id),
    number: Number(row.number),
    dueDate: String(row.due_date),
    amount: Number(row.amount),
    paidAmount: Number(row.paid_amount),
    balance: Number(row.balance),
    lateFee: Number(row.late_fee),
    status: row.status as Installment["status"]
  };
}

function fromInstallment(input: Installment) {
  return {
    id: input.id,
    loan_id: input.loanId,
    client_id: input.clientId,
    number: input.number,
    due_date: input.dueDate,
    amount: input.amount,
    paid_amount: input.paidAmount,
    balance: input.balance,
    late_fee: input.lateFee,
    status: input.status
  };
}

function toPayment(row: Row): Payment {
  return {
    id: String(row.id),
    loanId: String(row.loan_id),
    clientId: String(row.client_id),
    installmentId: row.installment_id ? String(row.installment_id) : undefined,
    amount: Number(row.amount),
    type: row.type as Payment["type"],
    method: row.method as Payment["method"],
    paidAt: String(row.paid_at),
    notes: row.notes ? String(row.notes) : undefined,
    registeredBy: row.registered_by ? String(row.registered_by) : "",
    createdAt: String(row.created_at)
  };
}

function fromPayment(input: Payment) {
  return {
    id: input.id,
    loan_id: input.loanId,
    client_id: input.clientId,
    installment_id: input.installmentId || null,
    amount: input.amount,
    type: input.type,
    method: input.method,
    paid_at: input.paidAt,
    notes: input.notes || null,
    registered_by: input.registeredBy
  };
}

function toSettings(row: Row): Settings {
  return {
    id: String(row.id),
    businessName: String(row.business_name),
    logoUrl: row.logo_url ? String(row.logo_url) : undefined,
    defaultInterestRate: Number(row.default_interest_rate),
    lateFeeEnabled: Boolean(row.late_fee_enabled),
    lateFeeType: row.late_fee_type as Settings["lateFeeType"],
    dailyLateFee: Number(row.daily_late_fee),
    lateFeePercentage: Number(row.late_fee_percentage),
    currency: String(row.currency),
    initialCapital: Number(row.initial_capital)
  };
}

function fromSettings(input: Settings) {
  return {
    business_name: input.businessName,
    logo_url: input.logoUrl || null,
    default_interest_rate: input.defaultInterestRate,
    late_fee_enabled: input.lateFeeEnabled,
    late_fee_type: input.lateFeeType,
    daily_late_fee: input.dailyLateFee,
    late_fee_percentage: input.lateFeePercentage,
    currency: input.currency,
    initial_capital: input.initialCapital,
    updated_at: new Date().toISOString()
  };
}

export async function fetchProfile(userId: string): Promise<Profile> {
  const client = requireSupabase();
  const { data, error } = await client.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return toProfile(data as Row);
}

export async function fetchAppData(): Promise<AppData> {
  const client = requireSupabase();
  const [profiles, clients, loans, installments, payments, settings, movements] = await Promise.all([
    client.from("profiles").select("*").order("created_at", { ascending: false }),
    client.from("clientes").select("*").order("created_at", { ascending: false }),
    client.from("prestamos").select("*").order("created_at", { ascending: false }),
    client.from("cuotas").select("*").order("due_date", { ascending: true }),
    client.from("pagos").select("*").order("created_at", { ascending: false }),
    client.from("configuracion").select("*").limit(1).single(),
    client.from("historial_movimientos").select("*").order("created_at", { ascending: false })
  ]);

  const firstError = [profiles, clients, loans, installments, payments, settings, movements].find((result) => result.error)?.error;
  if (firstError) throw firstError;

  if (!settings.data) {
    throw new Error("No existe configuracion inicial. Ejecuta supabase/schema.sql en Supabase.");
  }

  const appData: AppData = {
    profiles: (profiles.data ?? []).map((row) => toProfile(row as Row)),
    clients: (clients.data ?? []).map((row) => toClient(row as Row)),
    loans: (loans.data ?? []).map((row) => toLoan(row as Row)),
    installments: (installments.data ?? []).map((row) => toInstallment(row as Row)),
    payments: (payments.data ?? []).map((row) => toPayment(row as Row)),
    settings: toSettings(settings.data as Row),
    movements: (movements.data ?? []).map((row) => ({
      id: String(row.id),
      type: String(row.type) as AppData["movements"][number]["type"],
      description: String(row.description),
      amount: row.amount ? Number(row.amount) : undefined,
      userId: row.user_id ? String(row.user_id) : "",
      createdAt: String(row.created_at)
    }))
  };

  return {
    ...appData,
    installments: appData.installments.map((installment) => refreshInstallmentStatus(installment, appData.settings))
  };
}

export async function createClientRemote(input: Omit<Client, "id" | "createdAt" | "updatedAt">) {
  const client = requireSupabase();
  const { error } = await client.from("clientes").insert(fromClient(input));
  if (error) throw error;
}

export async function updateClientRemote(clientId: string, input: Partial<Client>) {
  const client = requireSupabase();
  const { error } = await client.from("clientes").update(fromClient(input)).eq("id", clientId);
  if (error) throw error;
}

export async function deleteClientRemote(clientId: string) {
  const client = requireSupabase();
  const { error } = await client.from("clientes").delete().eq("id", clientId);
  if (error) throw error;
}

export async function createLoanRemote(
  input: Pick<Loan, "clientId" | "amount" | "interestRate" | "installmentsCount" | "frequency" | "startDate" | "notes">,
  userId: string
) {
  const client = requireSupabase();
  const loanId = uid("pre");
  const calc = calculateLoan(input.amount, input.interestRate, input.installmentsCount);
  const endDate = formatISO(getNextDueDate(input.startDate, input.frequency, input.installmentsCount - 1), { representation: "date" });
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

  const { error: loanError } = await client.from("prestamos").insert(fromLoan(loan));
  if (loanError) throw loanError;
  const { error: scheduleError } = await client.from("cuotas").insert(schedule.map(fromInstallment));
  if (scheduleError) throw scheduleError;
  await client.from("historial_movimientos").insert({
    type: "prestamo_creado",
    description: `Prestamo creado por ${calc.totalToPay}`,
    amount: input.amount,
    user_id: userId
  });
}

export async function registerPaymentRemote(
  currentData: AppData,
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
) {
  const client = requireSupabase();
  let remainingPayment = input.amount;
  const loanInstallments = currentData.installments
    .filter((item) => item.loanId === input.loanId)
    .sort((a, b) => a.number - b.number);
  const selectedInstallments = input.type === "abono_capital"
    ? []
    : input.installmentId
      ? loanInstallments.filter((item) => item.id === input.installmentId)
      : loanInstallments.filter((item) => item.balance > 0);

  const updatedInstallments = selectedInstallments.flatMap((installment) => {
    if (remainingPayment <= 0) return [];
    const paymentForInstallment = Math.min(installment.balance, remainingPayment);
    remainingPayment -= paymentForInstallment;
    return refreshInstallmentStatus({
      ...installment,
      paidAmount: installment.paidAmount + paymentForInstallment,
      balance: installment.balance - paymentForInstallment
    }, currentData.settings);
  });

  const loan = currentData.loans.find((item) => item.id === input.loanId);
  if (!loan) throw new Error("Prestamo no encontrado.");
  const nextBalance = Math.max(0, loan.balance - input.amount);
  const nextPrincipal = input.type === "abono_capital"
    ? Math.max(0, loan.principalBalance - input.amount)
    : Math.max(0, loan.principalBalance - input.amount * (loan.amount / loan.totalToPay));

  const payment: Payment = {
    id: uid("pag"),
    ...input,
    registeredBy: userId,
    createdAt: new Date().toISOString()
  };

  const { error: paymentError } = await client.from("pagos").insert(fromPayment(payment));
  if (paymentError) throw paymentError;

  if (updatedInstallments.length) {
    const { error } = await client.from("cuotas").upsert(updatedInstallments.map(fromInstallment));
    if (error) throw error;
  }

  const { error: loanError } = await client
    .from("prestamos")
    .update({
      balance: nextBalance,
      principal_balance: nextPrincipal,
      status: nextBalance <= 0 ? "finalizado" : loan.status
    })
    .eq("id", loan.id);
  if (loanError) throw loanError;

  await client.from("historial_movimientos").insert({
    type: "pago_registrado",
    description: "Pago registrado",
    amount: input.amount,
    user_id: userId
  });
}

export async function updateSettingsRemote(settings: Settings, userId: string) {
  const client = requireSupabase();
  const { error } = await client.from("configuracion").update(fromSettings(settings)).eq("id", settings.id);
  if (error) throw error;
  await client.from("historial_movimientos").insert({
    type: "configuracion",
    description: "Configuracion actualizada",
    user_id: userId
  });
}

export async function createProfileRemote(input: Omit<Profile, "id" | "createdAt">) {
  throw new Error(
    `Para crear ${input.email}, primero crea el usuario en Supabase Auth y luego inserta su perfil con el UUID real en la tabla profiles.`
  );
}

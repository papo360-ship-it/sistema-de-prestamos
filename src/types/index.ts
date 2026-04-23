export type Role = "admin" | "collector";

export type ClientStatus = "activo" | "al_dia" | "moroso" | "bloqueado";
export type LoanStatus = "activo" | "finalizado" | "vencido" | "cancelado";
export type InstallmentStatus = "pagada" | "pendiente" | "parcial" | "vencida";
export type PaymentType = "cuota_completa" | "pago_parcial" | "abono_capital";
export type PaymentMethod = "efectivo" | "transferencia" | "tarjeta" | "otro";
export type Frequency = "diaria" | "semanal" | "quincenal" | "mensual";
export type LateFeeType = "fija" | "porcentual";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  photoUrl?: string;
  fullName: string;
  documentId: string;
  phone: string;
  address: string;
  city: string;
  personalReference: string;
  notes?: string;
  status: ClientStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  clientId: string;
  amount: number;
  interestRate: number;
  installmentsCount: number;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  totalToPay: number;
  installmentValue: number;
  balance: number;
  principalBalance: number;
  profit: number;
  notes?: string;
  status: LoanStatus;
  createdBy: string;
  createdAt: string;
}

export interface Installment {
  id: string;
  loanId: string;
  clientId: string;
  number: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  balance: number;
  lateFee: number;
  status: InstallmentStatus;
}

export interface Payment {
  id: string;
  loanId: string;
  clientId: string;
  installmentId?: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  paidAt: string;
  notes?: string;
  registeredBy: string;
  createdAt: string;
}

export interface Settings {
  id: string;
  businessName: string;
  logoUrl?: string;
  defaultInterestRate: number;
  lateFeeEnabled: boolean;
  lateFeeType: LateFeeType;
  dailyLateFee: number;
  lateFeePercentage: number;
  currency: string;
  initialCapital: number;
}

export interface Movement {
  id: string;
  type: "prestamo_creado" | "pago_registrado" | "cliente_actualizado" | "configuracion";
  description: string;
  amount?: number;
  userId: string;
  createdAt: string;
}

export interface AppData {
  profiles: Profile[];
  clients: Client[];
  loans: Loan[];
  installments: Installment[];
  payments: Payment[];
  settings: Settings;
  movements: Movement[];
}

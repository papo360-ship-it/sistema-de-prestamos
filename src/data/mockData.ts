import { addDays, formatISO } from "date-fns";
import type { AppData } from "@/types";
import { buildSchedule, calculateLoan } from "@/lib/loanMath";

const today = new Date();
const adminId = "usr_admin";
const collectorId = "usr_collector";

const loanOneCalc = calculateLoan(1000000, 20, 24);
const loanTwoCalc = calculateLoan(650000, 18, 12);

export const initialData: AppData = {
  profiles: [
    {
      id: adminId,
      fullName: "Administrador Principal",
      email: "admin@prestamos.com",
      role: "admin",
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: collectorId,
      fullName: "Cobrador Ruta Norte",
      email: "cobrador@prestamos.com",
      role: "collector",
      active: true,
      createdAt: new Date().toISOString()
    }
  ],
  clients: [
    {
      id: "cli_ana",
      fullName: "Ana Maria Gomez",
      documentId: "1020304050",
      phone: "3005550101",
      address: "Calle 18 # 22-14",
      city: "Barrio Centro",
      personalReference: "Luis Gomez - 3005550199",
      notes: "Cliente puntual, negocio de comidas.",
      status: "al_dia",
      assignedTo: collectorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "cli_carlos",
      fullName: "Carlos Andres Ruiz",
      documentId: "79888777",
      phone: "3105550202",
      address: "Carrera 7 # 10-50",
      city: "San Jose",
      personalReference: "Marta Ruiz - 3105550222",
      notes: "Tiene una cuota atrasada.",
      status: "moroso",
      assignedTo: collectorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "cli_luisa",
      fullName: "Luisa Fernanda Perez",
      documentId: "1122334455",
      phone: "3155550333",
      address: "Manzana 4 Casa 18",
      city: "Villa Norte",
      personalReference: "Pedro Perez - 3155550344",
      notes: "Solicita prestamos semanales.",
      status: "activo",
      assignedTo: collectorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  loans: [
    {
      id: "pre_ana_1",
      clientId: "cli_ana",
      amount: 1000000,
      interestRate: 20,
      installmentsCount: 24,
      frequency: "diaria",
      startDate: formatISO(addDays(today, -5), { representation: "date" }),
      endDate: formatISO(addDays(today, 18), { representation: "date" }),
      totalToPay: loanOneCalc.totalToPay,
      installmentValue: loanOneCalc.installmentValue,
      balance: loanOneCalc.totalToPay - 150000,
      principalBalance: 875000,
      profit: loanOneCalc.profit,
      notes: "Prestamo diario para capital de trabajo.",
      status: "activo",
      createdBy: adminId,
      createdAt: new Date().toISOString()
    },
    {
      id: "pre_carlos_1",
      clientId: "cli_carlos",
      amount: 650000,
      interestRate: 18,
      installmentsCount: 12,
      frequency: "semanal",
      startDate: formatISO(addDays(today, -35), { representation: "date" }),
      endDate: formatISO(addDays(today, 42), { representation: "date" }),
      totalToPay: loanTwoCalc.totalToPay,
      installmentValue: loanTwoCalc.installmentValue,
      balance: loanTwoCalc.totalToPay - 191750,
      principalBalance: 490000,
      profit: loanTwoCalc.profit,
      notes: "Prestamo semanal.",
      status: "vencido",
      createdBy: adminId,
      createdAt: new Date().toISOString()
    }
  ],
  installments: [
    ...buildSchedule({
      loanId: "pre_ana_1",
      clientId: "cli_ana",
      startDate: formatISO(addDays(today, -5), { representation: "date" }),
      frequency: "diaria",
      installmentsCount: 24,
      installmentValue: loanOneCalc.installmentValue,
      totalToPay: loanOneCalc.totalToPay
    }).map((item, index) =>
      index < 3
        ? { ...item, paidAmount: item.amount, balance: 0, status: "pagada" as const }
        : item
    ),
    ...buildSchedule({
      loanId: "pre_carlos_1",
      clientId: "cli_carlos",
      startDate: formatISO(addDays(today, -35), { representation: "date" }),
      frequency: "semanal",
      installmentsCount: 12,
      installmentValue: loanTwoCalc.installmentValue,
      totalToPay: loanTwoCalc.totalToPay
    }).map((item, index) =>
      index < 3
        ? { ...item, paidAmount: item.amount, balance: 0, status: "pagada" as const }
        : index === 3
          ? { ...item, paidAmount: 10000, balance: item.amount - 10000, status: "parcial" as const }
          : item
    )
  ],
  payments: [
    {
      id: "pag_1",
      loanId: "pre_ana_1",
      clientId: "cli_ana",
      amount: 150000,
      type: "cuota_completa",
      method: "efectivo",
      paidAt: formatISO(addDays(today, -1), { representation: "date" }),
      notes: "Pago de tres cuotas.",
      registeredBy: collectorId,
      createdAt: new Date().toISOString()
    },
    {
      id: "pag_2",
      loanId: "pre_carlos_1",
      clientId: "cli_carlos",
      amount: 191750,
      type: "pago_parcial",
      method: "transferencia",
      paidAt: formatISO(addDays(today, -7), { representation: "date" }),
      notes: "Pago parcial acumulado.",
      registeredBy: collectorId,
      createdAt: new Date().toISOString()
    }
  ],
  settings: {
    id: "cfg_main",
    businessName: "Sistema de Prestamos",
    defaultInterestRate: 20,
    lateFeeEnabled: true,
    lateFeeType: "fija",
    dailyLateFee: 3000,
    lateFeePercentage: 1,
    currency: "COP",
    initialCapital: 10000000
  },
  movements: []
};

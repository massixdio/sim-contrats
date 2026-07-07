export type Role = "ADMIN" | "AGENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  birthDate?: string | null;
  notes?: string | null;
  createdAt: string;
  _count?: { contracts: number };
  contracts?: Contract[];
}

export interface Insurer {
  id: string;
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  createdAt: string;
  _count?: { contracts: number };
  contracts?: Contract[];
}

export type ContractType = "AUTO" | "HABITATION" | "SANTE" | "VIE" | "RESPONSABILITE_CIVILE" | "AUTRE";
export type ContractStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";
export type PaymentFrequency = "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONE_TIME";
export type PaymentStatus = "PENDING" | "PAID" | "LATE" | "CANCELLED";

export interface Payment {
  id: string;
  contractId: string;
  amount: string;
  dueDate: string;
  paidDate?: string | null;
  status: PaymentStatus;
  contract?: Contract;
}

export interface Contract {
  id: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  premiumAmount: string;
  paymentFrequency: PaymentFrequency;
  notes?: string | null;
  clientId: string;
  insurerId: string;
  client?: Client;
  insurer?: Insurer;
  payments?: Payment[];
  createdAt: string;
}

export interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  totalClients: number;
  totalInsurers: number;
  pendingPayments: number;
  latePayments: number;
  contractsByType: { type: ContractType; count: number }[];
  totalRevenueCollected: string | number;
}

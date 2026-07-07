import { api } from "./client";
import { Contract, ContractStatus, ContractType } from "@/types";

export interface ContractInput {
  contractNumber: string;
  type: ContractType;
  status?: ContractStatus;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  paymentFrequency: Contract["paymentFrequency"];
  notes?: string;
  clientId: string;
  insurerId: string;
}

export interface ContractFilters {
  search?: string;
  status?: ContractStatus;
  type?: ContractType;
  clientId?: string;
  insurerId?: string;
}

export function listContracts(filters: ContractFilters = {}) {
  return api.get<Contract[]>("/contracts", { params: filters }).then((res) => res.data);
}

export function getContract(id: string) {
  return api.get<Contract>(`/contracts/${id}`).then((res) => res.data);
}

export function createContract(input: ContractInput) {
  return api.post<Contract>("/contracts", input).then((res) => res.data);
}

export function updateContract(id: string, input: Partial<ContractInput>) {
  return api.put<Contract>(`/contracts/${id}`, input).then((res) => res.data);
}

export function deleteContract(id: string) {
  return api.delete(`/contracts/${id}`);
}

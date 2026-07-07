import { api } from "./client";
import { Insurer } from "@/types";

export type InsurerInput = Omit<Insurer, "id" | "createdAt" | "_count" | "contracts">;

export function listInsurers(search?: string) {
  return api.get<Insurer[]>("/insurers", { params: { search } }).then((res) => res.data);
}

export function getInsurer(id: string) {
  return api.get<Insurer>(`/insurers/${id}`).then((res) => res.data);
}

export function createInsurer(input: Partial<InsurerInput>) {
  return api.post<Insurer>("/insurers", input).then((res) => res.data);
}

export function updateInsurer(id: string, input: Partial<InsurerInput>) {
  return api.put<Insurer>(`/insurers/${id}`, input).then((res) => res.data);
}

export function deleteInsurer(id: string) {
  return api.delete(`/insurers/${id}`);
}

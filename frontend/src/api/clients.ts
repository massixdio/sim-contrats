import { api } from "./client";
import { Client } from "@/types";

export type ClientInput = Omit<Client, "id" | "createdAt" | "_count" | "contracts">;

export function listClients(search?: string) {
  return api.get<Client[]>("/clients", { params: { search } }).then((res) => res.data);
}

export function getClient(id: string) {
  return api.get<Client>(`/clients/${id}`).then((res) => res.data);
}

export function createClient(input: Partial<ClientInput>) {
  return api.post<Client>("/clients", input).then((res) => res.data);
}

export function updateClient(id: string, input: Partial<ClientInput>) {
  return api.put<Client>(`/clients/${id}`, input).then((res) => res.data);
}

export function deleteClient(id: string) {
  return api.delete(`/clients/${id}`);
}

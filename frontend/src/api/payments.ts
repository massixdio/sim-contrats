import { api } from "./client";
import { Payment, PaymentStatus } from "@/types";

export function listPayments(filters: { status?: PaymentStatus; contractId?: string } = {}) {
  return api.get<Payment[]>("/payments", { params: filters }).then((res) => res.data);
}

export function updatePayment(id: string, input: Partial<Pick<Payment, "status" | "paidDate" | "amount" | "dueDate">>) {
  return api.put<Payment>(`/payments/${id}`, input).then((res) => res.data);
}

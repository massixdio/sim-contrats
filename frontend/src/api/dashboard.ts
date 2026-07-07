import { api } from "./client";
import { DashboardStats, Payment } from "@/types";

export function getDashboardStats() {
  return api.get<DashboardStats>("/dashboard/stats").then((res) => res.data);
}

export function getUpcomingPayments() {
  return api.get<Payment[]>("/dashboard/upcoming-payments").then((res) => res.data);
}

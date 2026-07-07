import { z } from "zod";

export const updatePaymentSchema = z.object({
  status: z.enum(["PENDING", "PAID", "LATE", "CANCELLED"]).optional(),
  paidDate: z.coerce.date().optional().nullable(),
  amount: z.coerce.number().positive().optional(),
  dueDate: z.coerce.date().optional(),
});

export const listPaymentsQuerySchema = z.object({
  status: z.enum(["PENDING", "PAID", "LATE", "CANCELLED"]).optional(),
  contractId: z.string().uuid().optional(),
  dueBefore: z.coerce.date().optional(),
});

export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;

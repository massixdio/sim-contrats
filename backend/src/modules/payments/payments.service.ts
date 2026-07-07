import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { UpdatePaymentInput, ListPaymentsQuery } from "./payments.schema";

export async function listPayments(query: ListPaymentsQuery) {
  const where: Prisma.PaymentWhereInput = {
    status: query.status,
    contractId: query.contractId,
    dueDate: query.dueBefore ? { lte: query.dueBefore } : undefined,
  };

  return prisma.payment.findMany({
    where,
    include: {
      contract: { include: { client: true, insurer: true } },
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function getPayment(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { contract: { include: { client: true, insurer: true } } },
  });
  if (!payment) throw ApiError.notFound("Paiement introuvable");
  return payment;
}

export async function updatePayment(id: string, input: UpdatePaymentInput) {
  await getPayment(id);

  const data: Prisma.PaymentUpdateInput = { ...input };
  if (input.status === "PAID" && !input.paidDate) {
    data.paidDate = new Date();
  }

  return prisma.payment.update({
    where: { id },
    data,
    include: { contract: { include: { client: true, insurer: true } } },
  });
}

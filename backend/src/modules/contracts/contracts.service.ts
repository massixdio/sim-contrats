import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { CreateContractInput, UpdateContractInput, ListContractsQuery } from "./contracts.schema";
import { buildPaymentSchedule } from "./paymentSchedule";

const contractInclude = {
  client: true,
  insurer: true,
  payments: { orderBy: { dueDate: Prisma.SortOrder.asc } },
} satisfies Prisma.ContractInclude;

export async function listContracts(query: ListContractsQuery) {
  const where: Prisma.ContractWhereInput = {
    status: query.status,
    type: query.type,
    clientId: query.clientId,
    insurerId: query.insurerId,
    contractNumber: query.search ? { contains: query.search, mode: "insensitive" } : undefined,
  };

  return prisma.contract.findMany({
    where,
    include: contractInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getContract(id: string) {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { ...contractInclude, documents: true },
  });
  if (!contract) throw ApiError.notFound("Contrat introuvable");
  return contract;
}

export async function createContract(input: CreateContractInput, userId?: string) {
  const [client, insurer] = await Promise.all([
    prisma.client.findUnique({ where: { id: input.clientId } }),
    prisma.insurer.findUnique({ where: { id: input.insurerId } }),
  ]);
  if (!client) throw ApiError.badRequest("Client introuvable");
  if (!insurer) throw ApiError.badRequest("Compagnie d'assurance introuvable");

  const schedule = buildPaymentSchedule(input.startDate, input.endDate, input.premiumAmount, input.paymentFrequency);

  return prisma.contract.create({
    data: {
      contractNumber: input.contractNumber,
      type: input.type,
      status: input.status ?? "ACTIVE",
      startDate: input.startDate,
      endDate: input.endDate,
      premiumAmount: input.premiumAmount,
      paymentFrequency: input.paymentFrequency,
      notes: input.notes,
      clientId: input.clientId,
      insurerId: input.insurerId,
      createdById: userId,
      payments: {
        create: schedule.map((entry) => ({ amount: entry.amount, dueDate: entry.dueDate })),
      },
    },
    include: contractInclude,
  });
}

export async function updateContract(id: string, input: UpdateContractInput) {
  await getContract(id);
  return prisma.contract.update({
    where: { id },
    data: input,
    include: contractInclude,
  });
}

export async function deleteContract(id: string) {
  await getContract(id);
  await prisma.contract.delete({ where: { id } });
}

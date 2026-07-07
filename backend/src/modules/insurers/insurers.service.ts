import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { CreateInsurerInput, UpdateInsurerInput } from "./insurers.schema";

export async function listInsurers(search?: string) {
  return prisma.insurer.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { contracts: true } } },
  });
}

export async function getInsurer(id: string) {
  const insurer = await prisma.insurer.findUnique({
    where: { id },
    include: {
      contracts: {
        include: { client: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!insurer) throw ApiError.notFound("Compagnie d'assurance introuvable");
  return insurer;
}

export async function createInsurer(input: CreateInsurerInput) {
  return prisma.insurer.create({
    data: { ...input, contactEmail: input.contactEmail || undefined },
  });
}

export async function updateInsurer(id: string, input: UpdateInsurerInput) {
  await getInsurer(id);
  return prisma.insurer.update({
    where: { id },
    data: { ...input, contactEmail: input.contactEmail || undefined },
  });
}

export async function deleteInsurer(id: string) {
  await getInsurer(id);
  await prisma.insurer.delete({ where: { id } });
}

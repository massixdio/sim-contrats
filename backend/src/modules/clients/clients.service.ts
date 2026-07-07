import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { CreateClientInput, UpdateClientInput } from "./clients.schema";

export async function listClients(search?: string) {
  return prisma.client.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { contracts: true } } },
  });
}

export async function getClient(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      contracts: {
        include: { insurer: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!client) throw ApiError.notFound("Client introuvable");
  return client;
}

export async function createClient(input: CreateClientInput) {
  return prisma.client.create({
    data: { ...input, email: input.email || undefined },
  });
}

export async function updateClient(id: string, input: UpdateClientInput) {
  await getClient(id);
  return prisma.client.update({
    where: { id },
    data: { ...input, email: input.email || undefined },
  });
}

export async function deleteClient(id: string) {
  await getClient(id);
  await prisma.client.delete({ where: { id } });
}

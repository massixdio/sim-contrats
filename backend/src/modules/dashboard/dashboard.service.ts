import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    totalContracts,
    activeContracts,
    expiringContracts,
    totalClients,
    totalInsurers,
    pendingPayments,
    latePayments,
    contractsByType,
    revenueAgg,
  ] = await Promise.all([
    prisma.contract.count(),
    prisma.contract.count({ where: { status: "ACTIVE" } }),
    prisma.contract.count({
      where: { status: "ACTIVE", endDate: { gte: now, lte: in30Days } },
    }),
    prisma.client.count(),
    prisma.insurer.count(),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "LATE" } }),
    prisma.contract.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
  ]);

  return {
    totalContracts,
    activeContracts,
    expiringContracts,
    totalClients,
    totalInsurers,
    pendingPayments,
    latePayments,
    contractsByType: contractsByType.map((item) => ({ type: item.type, count: item._count._all })),
    totalRevenueCollected: revenueAgg._sum.amount ?? 0,
  };
}

export async function getUpcomingPayments(limit = 10) {
  return prisma.payment.findMany({
    where: { status: { in: ["PENDING", "LATE"] } },
    orderBy: { dueDate: "asc" },
    take: limit,
    include: { contract: { include: { client: true, insurer: true } } },
  });
}

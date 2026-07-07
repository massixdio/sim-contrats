import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@insurance.local" },
    update: {},
    create: {
      name: "Admin Principal",
      email: "admin@insurance.local",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  const insurerA = await prisma.insurer.upsert({
    where: { name: "AssurPlus" },
    update: {},
    create: { name: "AssurPlus", contactEmail: "contact@assurplus.fr", contactPhone: "0102030405" },
  });

  const insurerB = await prisma.insurer.upsert({
    where: { name: "SecureVie" },
    update: {},
    create: { name: "SecureVie", contactEmail: "contact@securevie.fr", contactPhone: "0607080910" },
  });

  const client = await prisma.client.create({
    data: {
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@example.com",
      phone: "0611223344",
      address: "12 rue de la Paix, Paris",
    },
  });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  await prisma.contract.create({
    data: {
      contractNumber: "CTR-2026-0001",
      type: "AUTO",
      status: "ACTIVE",
      startDate,
      endDate,
      premiumAmount: 1200,
      paymentFrequency: "MONTHLY",
      clientId: client.id,
      insurerId: insurerA.id,
      createdById: admin.id,
      payments: {
        create: Array.from({ length: 12 }, (_, i) => {
          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + i);
          return { amount: 100, dueDate };
        }),
      },
    },
  });

  await prisma.contract.create({
    data: {
      contractNumber: "CTR-2026-0002",
      type: "VIE",
      status: "ACTIVE",
      startDate,
      endDate,
      premiumAmount: 600,
      paymentFrequency: "YEARLY",
      clientId: client.id,
      insurerId: insurerB.id,
      createdById: admin.id,
      payments: {
        create: [{ amount: 600, dueDate: startDate }],
      },
    },
  });

  console.log("Seed terminé. Compte admin: admin@insurance.local / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

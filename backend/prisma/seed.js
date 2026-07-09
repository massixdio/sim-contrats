const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@insurance.local" },
    update: {},
    create: {
      name: "Admin Principal",
      email: "admin@insurance.local",
      password: passwordHash,
      role: "ADMIN",
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

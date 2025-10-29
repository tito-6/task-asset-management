import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      whatsappApiKey: true,
      role: true
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

listUsers().finally(() => prisma.$disconnect());

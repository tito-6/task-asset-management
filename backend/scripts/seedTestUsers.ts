import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get or create company
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({ data: { name: "Demo Company" } });
  }

  const password = "TestPassword123!";
  const hashed = await bcrypt.hash(password, 12);

  const users = [
    {
      name: "Hakan Bozkurt",
      email: "hakan.bozkurt@innogy.com.tr",
      phone: "+905414518737",
      role: "manager" as const
    },
    {
      name: "Ahmet Elhalit",
      email: "ahmet.elhalit@innogy.com.tr",
      phone: "+905525242866",
      role: "employee" as const
    },
    {
      name: "Ugur Unal",
      email: "ugur.unal@innogy.com.tr",
      phone: "+905324458679",
      role: "employee" as const
    }
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        passwordHash: hashed,
        phone: userData.phone,
        role: userData.role,
        companyId: company.id
      },
      create: {
        name: userData.name,
        email: userData.email,
        passwordHash: hashed,
        phone: userData.phone,
        role: userData.role,
        companyId: company.id
      }
    });

    // eslint-disable-next-line no-console
    console.log("Seeded user:", {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role
    });
  }

  // eslint-disable-next-line no-console
  console.log("\nAll users seeded. Password for all: TestPassword123!");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

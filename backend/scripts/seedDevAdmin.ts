import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEV_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.DEV_ADMIN_PASSWORD ?? "Admin12345!";
  const phone = process.env.DEV_ADMIN_PHONE ?? "+10000000000";
  const companyName = process.env.DEV_COMPANY_NAME ?? "Demo Company";

  // Ensure a company exists
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({ data: { name: companyName } });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Admin User",
      passwordHash: hashed,
      phone,
      role: "admin",
      companyId: company.id
    },
    create: {
      name: "Admin User",
      email,
      passwordHash: hashed,
      phone,
      role: "admin",
      companyId: company.id
    }
  });

  // eslint-disable-next-line no-console
  console.log("Seeded admin:", { email, password, company: company.name, userId: user.id });
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

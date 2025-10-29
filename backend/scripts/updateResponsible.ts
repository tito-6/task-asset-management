import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find Ahmet Elhalit
  const ahmet = await prisma.user.findUnique({
    where: { email: 'ahmet.elhalit@innogy.com.tr' }
  });

  if (!ahmet) {
    console.log('Ahmet Elhalit not found. Creating user...');
    // Get the first company ID (or you can specify)
    const company = await prisma.company.findFirst();
    if (!company) {
      console.error('No company found!');
      return;
    }

    const newUser = await prisma.user.create({
      data: {
        name: 'Ahmet Elhalit',
        email: 'ahmet.elhalit@innogy.com.tr',
        phone: '+905525242866',
        passwordHash: '$2a$10$dummy', // This should be properly hashed
        companyId: company.id,
        role: 'manager'
      }
    });
    console.log(`Created user: ${newUser.name}`);

    // Update all assets
    const result = await prisma.asset.updateMany({
      where: {
        responsibleUser: {
          name: {
            contains: 'Murat Akgün'
          }
        }
      },
      data: {
        responsibleUserId: newUser.id
      }
    });
    console.log(`Updated ${result.count} assets to Ahmet Elhalit`);
  } else {
    console.log(`Found user: ${ahmet.name}`);
    
    // Update all assets from Murat Akgün to Ahmet Elhalit
    const result = await prisma.asset.updateMany({
      where: {
        responsibleUser: {
          name: {
            contains: 'Murat Akgün'
          }
        }
      },
      data: {
        responsibleUserId: ahmet.id
      }
    });
    console.log(`Updated ${result.count} assets from Murat Akgün to Ahmet Elhalit`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

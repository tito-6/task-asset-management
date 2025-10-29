import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  try {
    // Delete old NET Insaat assets (with different brand names)
    const result = await prisma.asset.deleteMany({
      where: {
        brand: {
          in: ['NET Insaat', 'netidm.com']
        }
      }
    });

    console.log(`✓ Deleted ${result.count} old NET Insaat assets`);

    // Show remaining NET İnşaat assets
    const remaining = await prisma.asset.findMany({
      where: {
        brand: 'NET İnşaat'
      },
      include: {
        responsibleUser: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    });

    console.log(`\n✅ Remaining NET İnşaat assets: ${remaining.length}`);
    remaining.forEach((asset: any, index: number) => {
      console.log(`\n${index + 1}. ${asset.type} - ${asset.url}`);
      console.log(`   Username: ${asset.username}`);
      console.log(`   Status: ${asset.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates();

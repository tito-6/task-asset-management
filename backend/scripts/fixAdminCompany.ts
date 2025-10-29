import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixAdmin() {
  try {
    // Get admin user
    const admin = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
      include: { company: true }
    });
    
    if (!admin) {
      console.log("❌ Admin user not found");
      return;
    }
    
    console.log(`Admin current company: ${admin.company.name} (ID: ${admin.companyId})`);
    
    // Get İNNO company
    const innoCompany = await prisma.company.findUnique({
      where: { name: "İNNO Gayrimenkul" }
    });
    
    if (!innoCompany) {
      console.log("❌ İNNO Gayrimenkul company not found");
      return;
    }
    
    console.log(`İNNO company ID: ${innoCompany.id}`);
    
    // Check assets count per company
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { assets: true }
        }
      }
    });
    
    console.log("\nAssets per company:");
    for (const company of companies) {
      console.log(`  ${company.name}: ${company._count.assets} assets`);
    }
    
    // Update admin to İNNO company
    await prisma.user.update({
      where: { id: admin.id },
      data: { companyId: innoCompany.id }
    });
    
    console.log(`\n✅ Updated admin to İNNO Gayrimenkul company`);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdmin();

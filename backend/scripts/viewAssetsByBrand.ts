import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function viewAssets() {
  console.log("📊 Assets organized by Brand:\n");
  
  const assets = await prisma.asset.findMany({
    include: {
      responsibleUser: {
        select: {
          name: true,
          email: true,
          phone: true
        }
      },
      company: {
        select: {
          name: true
        }
      }
    },
    orderBy: [
      { brand: "asc" },
      { type: "asc" }
    ]
  });
  
  // Group by brand
  const assetsByBrand: Record<string, typeof assets> = {};
  
  assets.forEach(asset => {
    const brand = asset.brand || "No Brand";
    if (!assetsByBrand[brand]) {
      assetsByBrand[brand] = [];
    }
    assetsByBrand[brand].push(asset);
  });
  
  // Display
  Object.entries(assetsByBrand).forEach(([brand, brandAssets]) => {
    console.log(`\n🏢 ${brand}`);
    console.log(`${"=".repeat(brand.length + 3)}`);
    
    brandAssets.forEach(asset => {
      console.log(`\n  📌 ${asset.url}`);
      console.log(`     Type: ${asset.type}`);
      console.log(`     Username: ${asset.username}`);
      console.log(`     Status: ${asset.status}`);
      console.log(`     Responsible: ${asset.responsibleUser?.name || "N/A"} (${asset.responsibleUser?.phone || "N/A"})`);
      console.log(`     2FA: ${asset.twoFactorStatus}`);
      console.log(`     Priority: ${asset.priority}`);
    });
  });
  
  console.log(`\n\n📈 Summary:`);
  console.log(`   Total Assets: ${assets.length}`);
  console.log(`   Total Brands: ${Object.keys(assetsByBrand).length}`);
  console.log(`   Active: ${assets.filter(a => a.status === "Aktif").length}`);
  console.log(`   Inactive: ${assets.filter(a => a.status === "YOK").length}`);
}

viewAssets().finally(() => prisma.$disconnect());

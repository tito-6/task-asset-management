import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const prisma = new PrismaClient();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "CbTnQfOPzNH4r+7usjdTnn/Z20qxUayUQrsWRCYjq8I=";

function encryptPassword(password: string) {
  const key = Buffer.from(ENCRYPTION_KEY, "base64");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  
  return {
    encrypted: encrypted,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

async function importAssets() {
  console.log("Starting asset import with brands...");
  
  // Get existing users
  const users = await prisma.user.findMany({
    include: { company: true }
  });
  
  console.log(`Found ${users.length} users in database`);
  
  // Get INNO company (assume it's the main one)
  const innoCompany = await prisma.company.findFirst({
    where: { name: { contains: "INNO" } }
  }) || await prisma.company.findFirst();
  
  if (!innoCompany) {
    console.error("No company found in database!");
    return;
  }
  
  console.log(`Using company: ${innoCompany.name} (ID: ${innoCompany.id})`);
  
  // Find Ahmet as default responsible
  const ahmetUser = users.find((u: any) => u.email.includes("ahmet")) || users[0];
  const muratUser = users.find((u: any) => u.email.includes("murat") || u.phone.includes("531519"));
  const enesUser = users.find((u: any) => u.email.includes("enes") || u.phone.includes("532722"));
  
  console.log(`Default responsible: ${ahmetUser.name}`);
  
  let assetsCreated = 0;
  let assetsUpdated = 0;
  let assetsSkipped = 0;
  
  // Assets data - manually extracted from CSV
  const assetsData = [
    // INNO Gayrimenkul - Model Sanayi Merkezi
    { platform: "TikTok", brand: "Model Sanayi Merkezi", type: "SosyalMedya", url: "https://www.tiktok.com/@modelsanayimerkezi?lang=en", username: "modelsanayimerkezi@gmail.com", password: "sanayimerkezi25-", responsible: muratUser, phone: "5315192238", status: "Aktif", twoFactor: "SMS" },
    { platform: "Instagram", brand: "Model Sanayi Merkezi", type: "SosyalMedya", url: "https://www.instagram.com/modelsanayimerkezi/", username: "modelsanayimerkezi", password: "Msm2025@!*", responsible: muratUser, phone: "5315192238", status: "Aktif", twoFactor: "Yok" },
    { platform: "X (Twitter)", brand: "Model Sanayi Merkezi", type: "SosyalMedya", url: "https://twitter.com/modelsanayi", username: "modelsanayi", password: "SFvJgdtxx9j7E5Z", responsible: muratUser, status: "Aktif", twoFactor: "Yok" },
    
    // INNO Gayrimenkul - Model Kuyum Merkezi
    { platform: "TikTok", brand: "Model Kuyum Merkezi", type: "SosyalMedya", url: "https://www.tiktok.com/@modelkuyummerkezi?lang=en", username: "modelkuyummerkezi@gmail.com", password: "kuyumerkezi25-", responsible: muratUser, phone: "5315192238", status: "Aktif", twoFactor: "SMS" },
    { platform: "Instagram", brand: "Model Kuyum Merkezi", type: "SosyalMedya", url: "https://www.instagram.com/modelkuyummerkezi/", username: "modelkuyummerkezi", password: "mkm2023!@", responsible: muratUser, phone: "5315192238", status: "Aktif", twoFactor: "Yok" },
    
    // INNO Gayrimenkul - General
    { platform: "Facebook", brand: "FB inno admin", type: "SosyalMedya", url: "https://facebook.com", username: "melihakalayci@gmail.com", password: "FacebookYeni1", responsible: ahmetUser, phone: "5525242866", status: "Aktif", twoFactor: "Yok" },
    { platform: "Zapier", brand: "Zapier inno", type: "Entegrasyon", url: "https://zapier.com/app/home", username: "info@innogy.com.tr", password: "LevelUp2025@@", responsible: enesUser, phone: "5327229713", status: "Aktif", twoFactor: "Yok" },
    { platform: "Google Hesabi", brand: "marketing@innogy.com.tr", type: "Reklam", url: "https://www.google.com/search?q=İNNO+Gayrimenkul", username: "marketing@innogy.com.tr", password: "FnQSYpV3Lf!!", responsible: ahmetUser, phone: "5525242866", status: "Aktif", twoFactor: "Yok" },
    { platform: "Google Isletme Profili", brand: "marketing@innogy.com.tr", type: "Analitik", url: "https://www.google.com/search?q=İNNO+Gayrimenkul", username: "marketing@innogy.com.tr", password: "FnQSYpV3Lf!!", responsible: ahmetUser, phone: "5525242866", status: "Aktif", twoFactor: "Yok" },
    { platform: "Meta Business Portfolio", brand: "FB inno admin", type: "Reklam", url: "https://facebook.com", username: "melihakalayci@gmail.com", password: "FacebookYeni1", responsible: ahmetUser, phone: "5525242866", status: "Aktif", twoFactor: "Yok" },
    { platform: "Meta Reklam Hesabi", brand: "FB inno admin", type: "Reklam", url: "https://facebook.com", username: "melihakalayci@gmail.com", password: "FacebookYeni1", responsible: ahmetUser, phone: "5525242866", status: "Aktif", twoFactor: "Yok" },
    { platform: "Google Reklam Hesabi", brand: "marketing@innogy.com.tr", type: "Reklam", url: "https://www.google.com/search?q=İNNO+Gayrimenkul", username: "marketing@innogy.com.tr", password: "FnQSYpV3Lf!!", responsible: ahmetUser, status: "Aktif", twoFactor: "Yok" },
    { platform: "Web Sitesi", brand: "inno.com.tr", type: "WebSitesi", url: "https://innogy.com.tr/", username: "innogy", password: "Innogy@@2025..", responsible: enesUser && ahmetUser ? enesUser : ahmetUser, phone: "5327229713", status: "Aktif", twoFactor: "Yok" },
    { platform: "Landing Page", brand: "Model Sanayi Merkezi", type: "WebSitesi", url: "https://innogy.com.tr/projects/model-sanayi-merkezi", username: "innogy", password: "InnoGY2024**..!", responsible: ahmetUser, status: "Aktif", twoFactor: "Yok" },
    { platform: "Landing Page", brand: "Model Kuyum Merkezi", type: "WebSitesi", url: "https://innogy.com.tr/projects/model-kuyum-merkezi", username: "innogy", password: "InnoGY2024**..!", responsible: ahmetUser, status: "Aktif", twoFactor: "Yok" },
    
    // NET Insaat
    { platform: "Instagram", brand: "NET Insaat", type: "SosyalMedya", url: "https://www.instagram.com/netinsaat_/", username: "netinsaat_", password: "ins2020idm#", responsible: ahmetUser, phone: "5525242866", status: "Aktif", twoFactor: "Yok" },
    { platform: "Facebook", brand: "NET Insaat", type: "SosyalMedya", url: "https://www.facebook.com/profile.php?id=100066692731221", username: "Net Insaat Danismanlik Muhendislik A.S.", password: "YOK", responsible: ahmetUser, status: "Aktif", twoFactor: "Yok" },
    { platform: "Web Sitesi", brand: "netidm.com", type: "WebSitesi", url: "https://netidm.com/", username: "netidm", password: "NetIDM2024", responsible: ahmetUser, status: "Aktif", twoFactor: "Yok" },
    
    // SOM Prefabrik
    { platform: "TikTok", brand: "SOM Prefabrik", type: "SosyalMedya", url: "https://www.tiktok.com/@somprefabrik", username: "info@somprefabrik.com", password: "Ol830314", responsible: ahmetUser, status: "Aktif", twoFactor: "Yok" },
    { platform: "LinkedIn", brand: "SOM Prefabrik", type: "SosyalMedya", url: "https://tr.linkedin.com/company/somprefabrik", username: "somprefabrik", password: "SomLinkedIn2024", responsible: ahmetUser, status: "Aktif", twoFactor: "Yok" },
    { platform: "Web Sitesi", brand: "somprefabrik.com", type: "WebSitesi", url: "https://www.somprefabrik.com/", username: "somprefabrik12", password: "9fmC$99e2", responsible: ahmetUser, status: "Aktif", twoFactor: "Yok" },
    
    // Bio Rota
    { platform: "Web Sitesi", brand: "biorota.com", type: "WebSitesi", url: "https://biorota.com/", username: "biorota", password: "BioRota2024!", responsible: ahmetUser, status: "Aktif", twoFactor: "Yok" },
  ];
  
  for (const asset of assetsData) {
    if (!asset.password || asset.password === "YOK" || !asset.username) {
      assetsSkipped++;
      continue;
    }
    
    const { encrypted, iv, tag } = encryptPassword(asset.password);
    
    try {
      // Check if asset already exists
      const existing = await prisma.asset.findFirst({
        where: {
          companyId: innoCompany.id,
          brand: asset.brand,
          username: asset.username
        }
      });
      
      if (existing) {
        // Update existing
        await prisma.asset.update({
          where: { id: existing.id },
          data: {
            type: asset.type as any,
            url: asset.url,
            passwordEncrypted: encrypted,
            passwordIv: iv,
            passwordTag: tag,
            responsibleUserId: asset.responsible?.id || ahmetUser.id,
            email: asset.username,
            status: asset.status as any,
            twoFactorStatus: asset.twoFactor as any,
            priority: "Medium",
          },
        });
        assetsUpdated++;
        console.log(`✓ Updated: ${asset.platform} - ${asset.brand}`);
      } else {
        // Create new
        await prisma.asset.create({
          data: {
            companyId: innoCompany.id,
            brand: asset.brand,
            type: asset.type as any,
            url: asset.url,
            username: asset.username,
            passwordEncrypted: encrypted,
            passwordIv: iv,
            passwordTag: tag,
            responsibleUserId: asset.responsible?.id || ahmetUser.id,
            email: asset.username,
            status: asset.status as any,
            twoFactorStatus: asset.twoFactor as any,
            priority: "Medium",
          },
        });
        assetsCreated++;
        console.log(`✓ Created: ${asset.platform} - ${asset.brand}`);
      }
    } catch (error: any) {
      console.log(`✗ Error: ${asset.platform} - ${asset.brand}: ${error.message}`);
      assetsSkipped++;
    }
  }
  
  console.log(`\n✅ Import complete:`);
  console.log(`   Created: ${assetsCreated}`);
  console.log(`   Updated: ${assetsUpdated}`);
  console.log(`   Skipped: ${assetsSkipped}`);
  console.log(`   Total: ${assetsCreated + assetsUpdated}`);
}

importAssets()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

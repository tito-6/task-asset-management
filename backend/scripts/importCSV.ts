import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const prisma = new PrismaClient();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "pVPB8oHq9qcu3z8BbX8bdz4iN98VD102F28mYIZx5Cs=";

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

async function seedAssets() {
  console.log("Starting CSV import...");
  
  const csvPath = path.join(process.cwd(), "..", "Dijital Assetler.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n");
  
  // Find or create companies
  const innoCompany = await prisma.company.upsert({
    where: { name: "İNNO Gayrimenkul" },
    update: {},
    create: { name: "İNNO Gayrimenkul" },
  });
  
  const netCompany = await prisma.company.upsert({
    where: { name: "NET İnşaat" },
    update: {},
    create: { name: "NET İnşaat" },
  });
  
  const somCompany = await prisma.company.upsert({
    where: { name: "SOM Prefabrik" },
    update: {},
    create: { name: "SOM Prefabrik" },
  });
  
  const bioCompany = await prisma.company.upsert({
    where: { name: "Bio Rota" },
    update: {},
    create: { name: "Bio Rota" },
  });
  
  // Find or create users
  const muratUser = await prisma.user.upsert({
    where: { email: "murat.akgun@innogy.com.tr" },
    update: {},
    create: {
      name: "Murat Akgün",
      email: "murat.akgun@innogy.com.tr",
      phone: "5315192238",
      passwordHash: "$2b$10$dummyhash",
      role: "manager",
      companyId: innoCompany.id,
    },
  });
  
  const ahmetUser = await prisma.user.upsert({
    where: { email: "ahmet.elhalit@innogy.com.tr" },
    update: {},
    create: {
      name: "Ahmet Elhalit",
      email: "ahmet.elhalit@innogy.com.tr",
      phone: "5525242866",
      passwordHash: "$2b$10$dummyhash",
      role: "manager",
      companyId: innoCompany.id,
    },
  });
  
  const enesUser = await prisma.user.upsert({
    where: { email: "enes.sari@innogy.com.tr" },
    update: {},
    create: {
      name: "Enes Sarı",
      email: "enes.sari@innogy.com.tr",
      phone: "5327229713",
      passwordHash: "$2b$10$dummyhash",
      role: "employee",
      companyId: innoCompany.id,
    },
  });
  
  let assetsCreated = 0;
  
  // Clear existing assets
  await prisma.asset.deleteMany({});
  console.log("Cleared existing assets");
  
  // Skip header rows (0 = title, 1 = column headers)
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.split(",").every(c => !c.trim())) continue;
    
    const cols = parseCSVLine(line);
    const platformName = cols[0]?.trim(); // First column is the platform name (TikTok, Instagram, etc)
    
    if (!platformName) continue;
    
    // Process each company column set (4 companies per row)
    const companies = [
      { company: innoCompany, user: ahmetUser, startCol: 1, name: "İNNO Gayrimenkul" },
      { company: netCompany, user: ahmetUser, startCol: 13, name: "NET İnşaat" },
      { company: somCompany, user: ahmetUser, startCol: 25, name: "SOM Prefabrik" },
      { company: bioCompany, user: ahmetUser, startCol: 37, name: "Bio Rota" },
    ];
    
    for (const { company, user, startCol, name: companyName } of companies) {
      const profileName = cols[startCol]?.trim(); // Brand/profile within platform
      const typeStr = cols[startCol + 1]?.trim();
      const url = cols[startCol + 2]?.trim();
      const username = cols[startCol + 3]?.trim();
      const password = cols[startCol + 4]?.trim();
      const responsibleName = cols[startCol + 5]?.trim();
      const phone = cols[startCol + 6]?.trim();
      const statusStr = cols[startCol + 7]?.trim();
      const email = cols[startCol + 8]?.trim();
      const twoFactorStr = cols[startCol + 9]?.trim();
      
      // Skip if no username or password (means this company doesn't have this platform)
      if (!username || !password) continue;
      
      // Use profile name if exists, otherwise use platform name
      const assetName = profileName || platformName;
      
      // Map type
      let assetType = "SosyalMedya";
      if (typeStr?.includes("Web Sitesi")) assetType = "WebSitesi";
      else if (typeStr?.includes("Reklam")) assetType = "Reklam";
      else if (typeStr?.includes("Analitik")) assetType = "Analitik";
      else if (typeStr?.includes("Entegrasyon")) assetType = "Entegrasyon";
      else if (typeStr?.includes("Emlak")) assetType = "Emlak";
      
      // Map status
      const status = statusStr?.includes("Aktif") ? "Aktif" : "YOK";
      
      // Map 2FA
      let twoFactor = "Yok";
      if (twoFactorStr?.includes("SMS")) twoFactor = "SMS";
      else if (twoFactorStr?.includes("Authenticator")) twoFactor = "AuthenticatorApp";
      
      // Encrypt password
      const { encrypted, iv, tag } = encryptPassword(password);
      
      // Select responsible user
      let responsibleUser = user;
      if (responsibleName?.includes("Murat")) responsibleUser = muratUser;
      else if (responsibleName?.includes("Enes")) responsibleUser = enesUser;
      
      try {
        await prisma.asset.create({
          data: {
            companyId: company.id,
            type: assetType as any,
            url: url || `https://${platformName.toLowerCase()}.com`,
            username: username,
            passwordEncrypted: encrypted,
            passwordIv: iv,
            passwordTag: tag,
            responsibleUserId: responsibleUser.id,
            email: email || username,
            status: status as any,
            twoFactorStatus: twoFactor as any,
            priority: "Medium",
          },
        });
        assetsCreated++;
        console.log(`✓ ${platformName} - ${assetName} (${companyName})`);
      } catch (error: any) {
        console.log(`✗ Skipped: ${platformName} - ${assetName} (${companyName}): ${error.message}`);
      }
    }
  }
  
  console.log(`\n✅ Created ${assetsCreated} assets from CSV`);
}

seedAssets()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

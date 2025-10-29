import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateWhatsAppKeys() {
  console.log("Updating WhatsApp API keys for test users...");

  // Update Hakan's API key
  const hakan = await prisma.user.update({
    where: { email: "hakan.bozkurt@innogy.com.tr" },
    data: { whatsappApiKey: "9364922" }
  });
  console.log(`✅ Updated Hakan (ID: ${hakan.id}) with API key: 9364922`);

  // Update Ahmet's API key
  const ahmet = await prisma.user.update({
    where: { email: "ahmet.elhalit@innogy.com.tr" },
    data: { whatsappApiKey: "9250107" }
  });
  console.log(`✅ Updated Ahmet (ID: ${ahmet.id}) with API key: 9250107`);

  console.log("✅ WhatsApp API keys updated successfully!");
}

updateWhatsAppKeys()
  .catch((error) => {
    console.error("❌ Error updating WhatsApp keys:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

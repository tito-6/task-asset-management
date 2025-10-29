import { PrismaClient } from '@prisma/client';
import { decryptSecret } from '../src/utils/crypto.js';

const prisma = new PrismaClient();

async function checkPasswords() {
  try {
    const assets = await prisma.asset.findMany({
      select: {
        id: true,
        url: true,
        username: true,
        passwordEncrypted: true,
        passwordIv: true,
        passwordTag: true
      }
    });

    console.log(`\nChecking ${assets.length} assets...\n`);

    for (const asset of assets) {
      console.log(`\nAsset ID ${asset.id}: ${asset.url}`);
      console.log(`  Username: ${asset.username}`);
      console.log(`  Encrypted: ${asset.passwordEncrypted.substring(0, 20)}...`);
      console.log(`  IV: ${asset.passwordIv}`);
      console.log(`  Tag: ${asset.passwordTag}`);
      console.log(`  Tag length: ${Buffer.from(asset.passwordTag, 'base64').length} bytes`);
      
      try {
        const decrypted = decryptSecret({
          cipherText: asset.passwordEncrypted,
          iv: asset.passwordIv,
          tag: asset.passwordTag
        });
        
        if (decrypted === "[Encrypted - Cannot Decrypt]") {
          console.log(`  ❌ FAILED to decrypt`);
        } else {
          console.log(`  ✅ Successfully decrypted: ${decrypted}`);
        }
      } catch (error) {
        console.log(`  ❌ ERROR: ${error}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPasswords();

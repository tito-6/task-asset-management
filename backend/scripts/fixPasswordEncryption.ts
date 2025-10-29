import { PrismaClient } from '@prisma/client';
import { encryptSecret } from '../src/utils/crypto.js';

const prisma = new PrismaClient();

// Known passwords from your CSV data
const knownPasswords: Record<number, string> = {
  18: 'ins2020idm#', // NET Insaat Instagram - already correct
  19: '', // NET Insaat Facebook - no password
  20: '', // NET Insaat website - no password
  // For the rest, we'll set them to empty since we don't have the original passwords
};

async function fixPasswordEncryption() {
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

    console.log(`\nFixing encryption for ${assets.length} assets...\n`);

    for (const asset of assets) {
      // Check if this asset already has correct encryption (16-byte tag)
      const tagLength = Buffer.from(asset.passwordTag || '', 'base64').length;
      
      if (tagLength === 16) {
        console.log(`Asset ID ${asset.id}: ✅ Already has valid encryption`);
        continue;
      }

      // Use known password or empty string
      const password = knownPasswords[asset.id] ?? '';
      
      const encrypted = encryptSecret(password);
      
      await prisma.asset.update({
        where: { id: asset.id },
        data: {
          passwordEncrypted: encrypted.cipherText,
          passwordIv: encrypted.iv,
          passwordTag: encrypted.tag
        }
      });

      console.log(`Asset ID ${asset.id}: ✓ Fixed encryption (password ${password ? 'set' : 'empty'})`);
    }

    console.log('\n✅ All passwords fixed!');
    console.log('\n⚠️  NOTE: Assets without known passwords have been set to empty.');
    console.log('   You can update them through the UI after login.\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswordEncryption();

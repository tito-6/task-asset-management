import { PrismaClient } from '@prisma/client';
import { encryptSecret } from '../src/utils/crypto.js';

const prisma = new PrismaClient();

async function importNetInsaatAssets() {
  try {
    // Get Demo Company
    const company = await prisma.company.findFirst({
      where: { name: 'Demo Company' }
    });

    if (!company) {
      console.error('❌ Company not found');
      return;
    }

    // Get Ahmet Elhalit as responsible user
    const ahmet = await prisma.user.findFirst({
      where: { 
        companyId: company.id,
        name: 'Ahmet Elhalit'
      }
    });

    if (!ahmet) {
      console.error('❌ Ahmet Elhalit not found');
      return;
    }

    console.log(`✅ Found company: ${company.name} (ID: ${company.id})`);
    console.log(`✅ Found user: ${ahmet.name} (ID: ${ahmet.id})`);

    const netInsaatAssets = [
      {
        brand: 'NET İnşaat',
        type: 'SosyalMedya',
        platform: 'Instagram',
        url: 'https://www.instagram.com/netinsaat_/',
        username: 'netinsaat_',
        password: 'ins2020idm#',
        email: '',
        status: 'Aktif',
        twoFactorStatus: 'Yok',
        priority: 'Medium'
      },
      {
        brand: 'NET İnşaat',
        type: 'SosyalMedya',
        platform: 'Facebook',
        url: 'https://www.facebook.com/profile.php?id=100066692731221#',
        username: 'Net İnşaat Danışmanlık Mühendislik A.Ş.',
        password: '', // No password
        email: '',
        status: 'Aktif',
        twoFactorStatus: 'Yok',
        priority: 'Medium'
      },
      {
        brand: 'NET İnşaat',
        type: 'WebSitesi',
        platform: 'Website',
        url: 'https://netidm.com/',
        username: 'netidm',
        password: '',
        email: '',
        status: 'Aktif',
        twoFactorStatus: 'Yok',
        priority: 'High'
      }
    ];

    console.log('\n📦 Starting NET İnşaat asset import...\n');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const asset of netInsaatAssets) {
      // Check if asset already exists
      const existing = await prisma.asset.findFirst({
        where: {
          companyId: company.id,
          brand: asset.brand,
          url: asset.url
        }
      });

      const encryptedData = asset.password ? encryptSecret(asset.password) : { cipherText: '', iv: '', tag: '' };
      
      const assetData = {
        companyId: company.id,
        brand: asset.brand,
        type: asset.type,
        url: asset.url,
        username: asset.username,
        passwordEncrypted: encryptedData.cipherText,
        passwordIv: encryptedData.iv,
        passwordTag: encryptedData.tag,
        email: asset.email,
        status: asset.status,
        twoFactorStatus: asset.twoFactorStatus,
        priority: asset.priority,
        responsibleUserId: ahmet.id
      };

      if (existing) {
        // Update existing asset
        await prisma.asset.update({
          where: { id: existing.id },
          data: assetData
        });
        console.log(`✓ Updated: ${asset.platform} (${asset.brand})`);
        updated++;
      } else {
        // Create new asset
        await prisma.asset.create({
          data: assetData
        });
        console.log(`✓ Created: ${asset.platform} (${asset.brand})`);
        created++;
      }
    }

    // Delete old NET Insaat assets that are no longer in the list
    const oldAssets = await prisma.asset.findMany({
      where: {
        companyId: company.id,
        brand: {
          in: ['NET Insaat', 'netidm.com']
        }
      }
    });

    for (const oldAsset of oldAssets) {
      // Check if this asset is in our new list
      const stillExists = netInsaatAssets.some(a => a.url === oldAsset.url);
      if (!stillExists) {
        await prisma.asset.delete({
          where: { id: oldAsset.id }
        });
        console.log(`✗ Deleted old asset: ${oldAsset.type} (${oldAsset.brand})`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✓ Created: ${created}`);
    console.log(`✓ Updated: ${updated}`);
    console.log(`- Skipped: ${skipped}`);
    console.log(`📦 Total: ${created + updated + skipped}`);

    // Show all NET İnşaat assets
    console.log('\n📋 Current NET İnşaat assets:');
    const allNetAssets = await prisma.asset.findMany({
      where: {
        companyId: company.id,
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

    allNetAssets.forEach((asset: any, index: number) => {
      console.log(`\n${index + 1}. ${asset.type} - ${asset.url}`);
      console.log(`   Username: ${asset.username}`);
      console.log(`   Status: ${asset.status}`);
      console.log(`   Responsible: ${asset.responsibleUser?.name} (${asset.responsibleUser?.phone})`);
    });

  } catch (error) {
    console.error('❌ Error importing assets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importNetInsaatAssets();

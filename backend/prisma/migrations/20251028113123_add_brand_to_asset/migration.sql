-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_responsibleUserId_fkey";

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "brand" TEXT,
ALTER COLUMN "responsibleUserId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Asset_brand_idx" ON "Asset"("brand");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

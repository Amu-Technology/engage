/*
  Warnings:

  - You are about to drop the column `changedAt` on the `LeadStatusHistory` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `FamilyMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FamilyMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `LeadActivity` table without a default value. This is not possible if the table is not empty.
  - Made the column `typeId` on table `LeadActivity` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `organizationId` to the `LeadGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `LeadStatusHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LeadStatusHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `NotificationPreference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `NotificationPreference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `SnsAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SnsAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LeadActivity" DROP CONSTRAINT "LeadActivity_typeId_fkey";

-- AlterTable
ALTER TABLE "FamilyMember" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "LeadActivity" ADD COLUMN     "organizationId" INTEGER NOT NULL,
ALTER COLUMN "typeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "LeadGroup" ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "LeadStatusHistory" DROP COLUMN "changedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "NotificationPreference" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SnsAccount" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnsAccount" ADD CONSTRAINT "SnsAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadGroup" ADD CONSTRAINT "LeadGroup_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ActivityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadStatusHistory" ADD CONSTRAINT "LeadStatusHistory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

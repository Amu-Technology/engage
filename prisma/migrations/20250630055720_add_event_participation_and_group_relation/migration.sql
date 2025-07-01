/*
  Warnings:

  - You are about to drop the column `contactInfo` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `participationFee` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `LeadActivity` table. All the data in the column will be lost.
  - Made the column `description` on table `LeadActivity` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "LeadActivity" DROP CONSTRAINT "LeadActivity_groupId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "contactInfo",
DROP COLUMN "participationFee",
DROP COLUMN "requirements";

-- AlterTable
ALTER TABLE "LeadActivity" DROP COLUMN "groupId",
ALTER COLUMN "description" SET NOT NULL;

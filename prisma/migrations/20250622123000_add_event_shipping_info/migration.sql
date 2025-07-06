-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "contactInfo" TEXT,
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "participationFee" INTEGER,
ADD COLUMN     "requirements" TEXT;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
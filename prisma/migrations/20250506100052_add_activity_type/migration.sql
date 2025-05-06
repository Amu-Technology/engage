-- AlterTable
ALTER TABLE "LeadActivity" ADD COLUMN     "typeId" TEXT;

-- AlterTable
ALTER TABLE "NotificationPreference" ADD COLUMN     "emailAddress" TEXT,
ADD COLUMN     "intervalDays" INTEGER DEFAULT 7;

-- CreateTable
CREATE TABLE "ActivityType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActivityType" ADD CONSTRAINT "ActivityType_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ActivityType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

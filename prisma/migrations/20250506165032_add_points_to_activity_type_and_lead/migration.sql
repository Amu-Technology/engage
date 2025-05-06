-- AlterTable
ALTER TABLE "ActivityType" ADD COLUMN     "point" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "totalPoints" INTEGER NOT NULL DEFAULT 0;

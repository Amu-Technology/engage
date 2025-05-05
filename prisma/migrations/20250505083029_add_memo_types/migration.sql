-- CreateTable
CREATE TABLE "MemoType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemoType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Memo" ADD CONSTRAINT "Memo_type_fkey" FOREIGN KEY ("type") REFERENCES "MemoType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoType" ADD CONSTRAINT "MemoType_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

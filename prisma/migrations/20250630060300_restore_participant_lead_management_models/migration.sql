-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('EMAIL_EXACT', 'EMAIL_DOMAIN', 'NAME_EXACT', 'NAME_FUZZY', 'PHONE_EXACT', 'PHONE_NORMALIZED', 'ADDRESS_PARTIAL', 'PATTERN_ML', 'MANUAL');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PROPOSED', 'REVIEWING', 'APPROVED', 'MERGED', 'REJECTED', 'AUTO_MERGED');

-- CreateEnum
CREATE TYPE "CandidateStage" AS ENUM ('INITIAL', 'ENHANCED', 'VALIDATED', 'READY', 'CONVERTED');

-- CreateEnum
CREATE TYPE "MergeType" AS ENUM ('PARTICIPANT_TO_LEAD', 'PARTICIPANT_TO_EXISTING', 'LEAD_MERGE', 'DATA_ENHANCEMENT');

-- CreateEnum
CREATE TYPE "MergeHistoryStatus" AS ENUM ('EXECUTED', 'ROLLED_BACK', 'FAILED');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('FAMILY', 'COLLEAGUE', 'COMPANION', 'REFERRER', 'SAME_PERSON', 'FREQUENT_PAIR');

-- CreateEnum
CREATE TYPE "DetectionMethod" AS ENUM ('SAME_EMAIL', 'SAME_PHONE', 'SAME_ADDRESS', 'NAME_SIMILARITY', 'TEMPORAL_PATTERN', 'MANUAL_INPUT', 'ML_DETECTION');

-- CreateTable
CREATE TABLE "ParticipantLeadMatch" (
    "id" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "leadId" TEXT,
    "organizationId" INTEGER NOT NULL,
    "matchType" "MatchType" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "matchedFields" JSONB NOT NULL,
    "candidateData" JSONB,
    "status" "MatchStatus" NOT NULL DEFAULT 'PROPOSED',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "mergedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParticipantLeadMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadCandidate" (
    "id" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "stage" "CandidateStage" NOT NULL DEFAULT 'INITIAL',
    "completeness" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "extractedData" JSONB NOT NULL,
    "enhancedData" JSONB,
    "validatedData" JSONB,
    "duplicateChecks" JSONB,
    "duplicateScore" DOUBLE PRECISION,
    "readyForLead" BOOLEAN NOT NULL DEFAULT false,
    "blockers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MergeHistory" (
    "id" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "operationType" "MergeType" NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "mergedData" JSONB NOT NULL,
    "rollbackData" JSONB NOT NULL,
    "executedBy" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "MergeHistoryStatus" NOT NULL DEFAULT 'EXECUTED',
    "rollbackReason" TEXT,
    "rolledBackAt" TIMESTAMP(3),
    "rolledBackBy" TEXT,

    CONSTRAINT "MergeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantRelationship" (
    "id" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "primaryParticipationId" TEXT NOT NULL,
    "relatedParticipationId" TEXT NOT NULL,
    "relationshipType" "RelationshipType" NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "detectedBy" "DetectionMethod" NOT NULL,
    "evidence" JSONB NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "ParticipantRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParticipantLeadMatch_organizationId_status_idx" ON "ParticipantLeadMatch"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ParticipantLeadMatch_confidence_idx" ON "ParticipantLeadMatch"("confidence");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantLeadMatch_participationId_leadId_key" ON "ParticipantLeadMatch"("participationId", "leadId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadCandidate_participationId_key" ON "LeadCandidate"("participationId");

-- CreateIndex
CREATE INDEX "LeadCandidate_organizationId_stage_idx" ON "LeadCandidate"("organizationId", "stage");

-- CreateIndex
CREATE INDEX "LeadCandidate_readyForLead_idx" ON "LeadCandidate"("readyForLead");

-- CreateIndex
CREATE INDEX "LeadCandidate_completeness_idx" ON "LeadCandidate"("completeness");

-- CreateIndex
CREATE INDEX "MergeHistory_organizationId_executedAt_idx" ON "MergeHistory"("organizationId", "executedAt");

-- CreateIndex
CREATE INDEX "MergeHistory_sourceId_sourceType_idx" ON "MergeHistory"("sourceId", "sourceType");

-- CreateIndex
CREATE INDEX "MergeHistory_targetId_targetType_idx" ON "MergeHistory"("targetId", "targetType");

-- CreateIndex
CREATE INDEX "ParticipantRelationship_organizationId_relationshipType_idx" ON "ParticipantRelationship"("organizationId", "relationshipType");

-- CreateIndex
CREATE INDEX "ParticipantRelationship_strength_idx" ON "ParticipantRelationship"("strength");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantRelationship_primaryParticipationId_relatedParti_key" ON "ParticipantRelationship"("primaryParticipationId", "relatedParticipationId");

-- AddForeignKey
ALTER TABLE "ParticipantLeadMatch" ADD CONSTRAINT "ParticipantLeadMatch_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "EventParticipation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantLeadMatch" ADD CONSTRAINT "ParticipantLeadMatch_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantLeadMatch" ADD CONSTRAINT "ParticipantLeadMatch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadCandidate" ADD CONSTRAINT "LeadCandidate_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "EventParticipation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadCandidate" ADD CONSTRAINT "LeadCandidate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MergeHistory" ADD CONSTRAINT "MergeHistory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantRelationship" ADD CONSTRAINT "ParticipantRelationship_primaryParticipationId_fkey" FOREIGN KEY ("primaryParticipationId") REFERENCES "EventParticipation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantRelationship" ADD CONSTRAINT "ParticipantRelationship_relatedParticipationId_fkey" FOREIGN KEY ("relatedParticipationId") REFERENCES "EventParticipation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantRelationship" ADD CONSTRAINT "ParticipantRelationship_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

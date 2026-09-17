-- This migration also folds in schema changes that were added to schema.prisma
-- after the last migration but never migrated into dev.db (accountType on User,
-- externalRef on Transaction, and the TeamMember / PasswordResetToken /
-- InvestorProfileResult tables) — discovered while adding Promotion, since
-- migrate dev diffs the whole schema, not just the newest model.

-- AlterTable
ALTER TABLE "User" ADD COLUMN "accountType" TEXT NOT NULL DEFAULT 'Individual';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "externalRef" TEXT;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TEXT NOT NULL,
    "usedAt" TEXT,
    "createdAt" TEXT NOT NULL,
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvestorProfileResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "profileKey" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "completedAt" TEXT NOT NULL,
    CONSTRAINT "InvestorProfileResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleInTeam" TEXT NOT NULL,
    "since" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discountPct" REAL NOT NULL,
    "startsAt" TEXT NOT NULL,
    "endsAt" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

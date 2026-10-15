-- MyWallet — schema SQLite (idêntico ao dev.db, sem a tabela interna _prisma_migrations)
-- Gerado por prisma/database-first/export.mjs.
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS "Transaction";
DROP TABLE IF EXISTS "TeamMember";
DROP TABLE IF EXISTS "Promotion";
DROP TABLE IF EXISTS "PasswordResetToken";
DROP TABLE IF EXISTS "InvestorProfileResult";
DROP TABLE IF EXISTS "Goal";
DROP TABLE IF EXISTS "Asset";
DROP TABLE IF EXISTS "Wallet";
DROP TABLE IF EXISTS "Article";
DROP TABLE IF EXISTS "ActivityEntry";
DROP TABLE IF EXISTS "User";

CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "perms" TEXT NOT NULL,
    "since" TEXT NOT NULL,
    "lastAccess" TEXT NOT NULL
, "accountType" TEXT NOT NULL DEFAULT 'Individual');
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "ActivityEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "when" TEXT NOT NULL,
    CONSTRAINT "ActivityEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "read" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT
);

CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "tint" TEXT NOT NULL,
    "tintFg" TEXT NOT NULL,
    "created" TEXT NOT NULL
);

CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "qty" REAL NOT NULL,
    "avg" REAL NOT NULL,
    CONSTRAINT "Asset_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "target" REAL NOT NULL,
    "current" REAL NOT NULL,
    "due" TEXT NOT NULL
);

CREATE TABLE "InvestorProfileResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "profileKey" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "completedAt" TEXT NOT NULL,
    CONSTRAINT "InvestorProfileResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TEXT NOT NULL,
    "usedAt" TEXT,
    "createdAt" TEXT NOT NULL,
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

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

CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleInTeam" TEXT NOT NULL,
    "since" TEXT NOT NULL
);

CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "qty" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "total" REAL NOT NULL
, "externalRef" TEXT);

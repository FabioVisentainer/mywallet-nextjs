-- MyWallet — schema SQL Server 2016+ / Azure SQL
-- Gerado por prisma/database-first/export.mjs a partir do dev.db (Prisma/SQLite).
-- Não edite à mão: rode "npm run db:export" de novo após mudar o schema.prisma.

IF DB_ID(N'mywallet') IS NULL CREATE DATABASE [mywallet];
GO
USE [mywallet];
GO

DROP TABLE IF EXISTS [Transaction];
DROP TABLE IF EXISTS [TeamMember];
DROP TABLE IF EXISTS [Promotion];
DROP TABLE IF EXISTS [PasswordResetToken];
DROP TABLE IF EXISTS [InvestorProfileResult];
DROP TABLE IF EXISTS [Goal];
DROP TABLE IF EXISTS [Asset];
DROP TABLE IF EXISTS [Wallet];
DROP TABLE IF EXISTS [Article];
DROP TABLE IF EXISTS [ActivityEntry];
DROP TABLE IF EXISTS [User];
GO

CREATE TABLE [User] (
    [id] NVARCHAR(191) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [email] NVARCHAR(191) NOT NULL,
    [passwordHash] NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(255) NOT NULL,
    [status] NVARCHAR(255) NOT NULL,
    [perms] NVARCHAR(255) NOT NULL,
    [since] NVARCHAR(255) NOT NULL,
    [lastAccess] NVARCHAR(255) NOT NULL,
    [accountType] NVARCHAR(255) NOT NULL DEFAULT N'Individual',
    CONSTRAINT [User_pkey] PRIMARY KEY ([id])
);
CREATE UNIQUE INDEX [User_email_key] ON [User] ([email]);

CREATE TABLE [ActivityEntry] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [userId] NVARCHAR(191) NOT NULL,
    [text] NVARCHAR(255) NOT NULL,
    [when] NVARCHAR(255) NOT NULL,
    CONSTRAINT [ActivityEntry_pkey] PRIMARY KEY ([id])
);

CREATE TABLE [Article] (
    [id] NVARCHAR(191) NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [category] NVARCHAR(255) NOT NULL,
    [date] NVARCHAR(255) NOT NULL,
    [views] INT NOT NULL,
    [status] NVARCHAR(255) NOT NULL,
    [author] NVARCHAR(255) NOT NULL,
    [read] NVARCHAR(255) NOT NULL,
    [summary] NVARCHAR(MAX) NOT NULL,
    [body] NVARCHAR(MAX) NULL,
    CONSTRAINT [Article_pkey] PRIMARY KEY ([id])
);

CREATE TABLE [Wallet] (
    [id] NVARCHAR(191) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [kind] NVARCHAR(255) NOT NULL,
    [icon] NVARCHAR(255) NOT NULL,
    [tint] NVARCHAR(255) NOT NULL,
    [tintFg] NVARCHAR(255) NOT NULL,
    [created] NVARCHAR(255) NOT NULL,
    CONSTRAINT [Wallet_pkey] PRIMARY KEY ([id])
);

CREATE TABLE [Asset] (
    [id] NVARCHAR(191) NOT NULL,
    [walletId] NVARCHAR(191) NOT NULL,
    [ticker] NVARCHAR(255) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [type] NVARCHAR(255) NOT NULL,
    [qty] FLOAT NOT NULL,
    [avg] FLOAT NOT NULL,
    CONSTRAINT [Asset_pkey] PRIMARY KEY ([id])
);

CREATE TABLE [Goal] (
    [id] NVARCHAR(191) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [target] FLOAT NOT NULL,
    [current] FLOAT NOT NULL,
    [due] NVARCHAR(255) NOT NULL,
    CONSTRAINT [Goal_pkey] PRIMARY KEY ([id])
);

CREATE TABLE [InvestorProfileResult] (
    [id] NVARCHAR(191) NOT NULL,
    [userId] NVARCHAR(191) NOT NULL,
    [score] INT NOT NULL,
    [profileKey] NVARCHAR(255) NOT NULL,
    [answers] NVARCHAR(MAX) NOT NULL,
    [completedAt] NVARCHAR(255) NOT NULL,
    CONSTRAINT [InvestorProfileResult_pkey] PRIMARY KEY ([id])
);

CREATE TABLE [PasswordResetToken] (
    [id] NVARCHAR(191) NOT NULL,
    [userId] NVARCHAR(191) NOT NULL,
    [token] NVARCHAR(191) NOT NULL,
    [expiresAt] NVARCHAR(255) NOT NULL,
    [usedAt] NVARCHAR(255) NULL,
    [createdAt] NVARCHAR(255) NOT NULL,
    CONSTRAINT [PasswordResetToken_pkey] PRIMARY KEY ([id])
);
CREATE UNIQUE INDEX [PasswordResetToken_token_key] ON [PasswordResetToken] ([token]);

CREATE TABLE [Promotion] (
    [id] NVARCHAR(191) NOT NULL,
    [planName] NVARCHAR(255) NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX) NOT NULL,
    [discountPct] FLOAT NOT NULL,
    [startsAt] NVARCHAR(255) NOT NULL,
    [endsAt] NVARCHAR(255) NOT NULL,
    [active] BIT NOT NULL DEFAULT 1,
    [createdBy] NVARCHAR(255) NOT NULL,
    CONSTRAINT [Promotion_pkey] PRIMARY KEY ([id])
);

CREATE TABLE [TeamMember] (
    [id] NVARCHAR(191) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [email] NVARCHAR(255) NOT NULL,
    [roleInTeam] NVARCHAR(255) NOT NULL,
    [since] NVARCHAR(255) NOT NULL,
    CONSTRAINT [TeamMember_pkey] PRIMARY KEY ([id])
);

CREATE TABLE [Transaction] (
    [id] NVARCHAR(191) NOT NULL,
    [date] NVARCHAR(255) NOT NULL,
    [type] NVARCHAR(255) NOT NULL,
    [asset] NVARCHAR(255) NOT NULL,
    [wallet] NVARCHAR(255) NOT NULL,
    [qty] NVARCHAR(255) NOT NULL,
    [price] FLOAT NOT NULL,
    [total] FLOAT NOT NULL,
    [externalRef] NVARCHAR(255) NULL,
    CONSTRAINT [Transaction_pkey] PRIMARY KEY ([id])
);

ALTER TABLE [ActivityEntry] ADD CONSTRAINT [ActivityEntry_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [User] ([id]) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE [Asset] ADD CONSTRAINT [Asset_walletId_fkey] FOREIGN KEY ([walletId]) REFERENCES [Wallet] ([id]) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE [InvestorProfileResult] ADD CONSTRAINT [InvestorProfileResult_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [User] ([id]) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE [PasswordResetToken] ADD CONSTRAINT [PasswordResetToken_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [User] ([id]) ON DELETE CASCADE ON UPDATE CASCADE;

GO

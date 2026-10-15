-- MyWallet — schema MySQL 8+ / MariaDB 10.5+
-- Gerado por prisma/database-first/export.mjs a partir do dev.db (Prisma/SQLite).
-- Não edite à mão: rode "npm run db:export" de novo após mudar o schema.prisma.

SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS `mywallet` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mywallet`;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Transaction`;
DROP TABLE IF EXISTS `TeamMember`;
DROP TABLE IF EXISTS `Promotion`;
DROP TABLE IF EXISTS `PasswordResetToken`;
DROP TABLE IF EXISTS `InvestorProfileResult`;
DROP TABLE IF EXISTS `Goal`;
DROP TABLE IF EXISTS `Asset`;
DROP TABLE IF EXISTS `Wallet`;
DROP TABLE IF EXISTS `Article`;
DROP TABLE IF EXISTS `ActivityEntry`;
DROP TABLE IF EXISTS `User`;

CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL,
    `status` VARCHAR(255) NOT NULL,
    `perms` VARCHAR(255) NOT NULL,
    `since` VARCHAR(255) NOT NULL,
    `lastAccess` VARCHAR(255) NOT NULL,
    `accountType` VARCHAR(255) NOT NULL DEFAULT 'Individual',
    CONSTRAINT `User_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE UNIQUE INDEX `User_email_key` ON `User` (`email`);

CREATE TABLE `ActivityEntry` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(255) NOT NULL,
    `when` VARCHAR(255) NOT NULL,
    CONSTRAINT `ActivityEntry_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Article` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(255) NOT NULL,
    `date` VARCHAR(255) NOT NULL,
    `views` INT NOT NULL,
    `status` VARCHAR(255) NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `read` VARCHAR(255) NOT NULL,
    `summary` TEXT NOT NULL,
    `body` TEXT NULL,
    CONSTRAINT `Article_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Wallet` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `kind` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(255) NOT NULL,
    `tint` VARCHAR(255) NOT NULL,
    `tintFg` VARCHAR(255) NOT NULL,
    `created` VARCHAR(255) NOT NULL,
    CONSTRAINT `Wallet_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Asset` (
    `id` VARCHAR(191) NOT NULL,
    `walletId` VARCHAR(191) NOT NULL,
    `ticker` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `qty` DOUBLE NOT NULL,
    `avg` DOUBLE NOT NULL,
    CONSTRAINT `Asset_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Goal` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `target` DOUBLE NOT NULL,
    `current` DOUBLE NOT NULL,
    `due` VARCHAR(255) NOT NULL,
    CONSTRAINT `Goal_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `InvestorProfileResult` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `score` INT NOT NULL,
    `profileKey` VARCHAR(255) NOT NULL,
    `answers` TEXT NOT NULL,
    `completedAt` VARCHAR(255) NOT NULL,
    CONSTRAINT `InvestorProfileResult_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` VARCHAR(255) NOT NULL,
    `usedAt` VARCHAR(255) NULL,
    `createdAt` VARCHAR(255) NOT NULL,
    CONSTRAINT `PasswordResetToken_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE UNIQUE INDEX `PasswordResetToken_token_key` ON `PasswordResetToken` (`token`);

CREATE TABLE `Promotion` (
    `id` VARCHAR(191) NOT NULL,
    `planName` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `discountPct` DOUBLE NOT NULL,
    `startsAt` VARCHAR(255) NOT NULL,
    `endsAt` VARCHAR(255) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT 1,
    `createdBy` VARCHAR(255) NOT NULL,
    CONSTRAINT `Promotion_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `TeamMember` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `roleInTeam` VARCHAR(255) NOT NULL,
    `since` VARCHAR(255) NOT NULL,
    CONSTRAINT `TeamMember_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Transaction` (
    `id` VARCHAR(191) NOT NULL,
    `date` VARCHAR(255) NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `asset` VARCHAR(255) NOT NULL,
    `wallet` VARCHAR(255) NOT NULL,
    `qty` VARCHAR(255) NOT NULL,
    `price` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `externalRef` VARCHAR(255) NULL,
    CONSTRAINT `Transaction_pkey` PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `ActivityEntry` ADD CONSTRAINT `ActivityEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Asset` ADD CONSTRAINT `Asset_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `Wallet` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `InvestorProfileResult` ADD CONSTRAINT `InvestorProfileResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

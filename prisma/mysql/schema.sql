-- MyWallet — schema MySQL equivalente ao prisma/schema.prisma (SQLite)
-- Rode direto num client MySQL (mysql CLI, Workbench, TablePlus, etc.)
-- ou via: mysql -u <user> -p <database> < prisma/mysql/schema.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `ActivityEntry`;
DROP TABLE IF EXISTS `Asset`;
DROP TABLE IF EXISTS `Wallet`;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS `Goal`;
DROP TABLE IF EXISTS `Article`;
DROP TABLE IF EXISTS `Transaction`;

-- role: "Investor" | "Analyst" | "Administrator"
-- status: "Active" | "Suspended" | "Pending"
-- passwordHash: "<saltHex>:<derivedKeyHex>" (scrypt) — nunca senha em texto puro
CREATE TABLE `User` (
  `id`           VARCHAR(191) NOT NULL,
  `name`         VARCHAR(191) NOT NULL,
  `email`        VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `role`         VARCHAR(50)  NOT NULL,
  `status`       VARCHAR(50)  NOT NULL,
  `perms`        VARCHAR(255) NOT NULL,
  `since`        VARCHAR(50)  NOT NULL,
  `lastAccess`   VARCHAR(50)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ActivityEntry` (
  `id`     INT NOT NULL AUTO_INCREMENT,
  `userId` VARCHAR(191) NOT NULL,
  `text`   VARCHAR(500) NOT NULL,
  `when`   VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ActivityEntry_userId_idx` (`userId`),
  CONSTRAINT `ActivityEntry_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Wallet` (
  `id`      VARCHAR(191) NOT NULL,
  `name`    VARCHAR(191) NOT NULL,
  `kind`    VARCHAR(50)  NOT NULL,
  `icon`    VARCHAR(50)  NOT NULL,
  `tint`    VARCHAR(50)  NOT NULL,
  `tintFg`  VARCHAR(50)  NOT NULL,
  `created` VARCHAR(50)  NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- type: "Stock" | "Crypto" | "ETF" | "REIT"
-- preço atual NÃO fica aqui — é dado de mercado externo (mock em src/mocks/external/quotes.ts)
CREATE TABLE `Asset` (
  `id`       VARCHAR(191) NOT NULL,
  `walletId` VARCHAR(191) NOT NULL,
  `ticker`   VARCHAR(50)  NOT NULL,
  `name`     VARCHAR(191) NOT NULL,
  `type`     VARCHAR(50)  NOT NULL,
  `qty`      DOUBLE NOT NULL,
  `avg`      DOUBLE NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Asset_walletId_idx` (`walletId`),
  CONSTRAINT `Asset_walletId_fkey`
    FOREIGN KEY (`walletId`) REFERENCES `Wallet` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Goal` (
  `id`      VARCHAR(191) NOT NULL,
  `name`    VARCHAR(191) NOT NULL,
  `target`  DOUBLE NOT NULL,
  `current` DOUBLE NOT NULL,
  `due`     VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- status: "Published" | "Draft"
CREATE TABLE `Article` (
  `id`       VARCHAR(191) NOT NULL,
  `title`    VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date`     VARCHAR(50)  NOT NULL,
  `views`    INT NOT NULL,
  `status`   VARCHAR(50)  NOT NULL,
  `author`   VARCHAR(191) NOT NULL,
  `read`     VARCHAR(50)  NOT NULL,
  `summary`  TEXT NOT NULL,
  `body`     LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- type: "Buy" | "Sell" | "Swap" | "Deposit"
CREATE TABLE `Transaction` (
  `id`     VARCHAR(191) NOT NULL,
  `date`   VARCHAR(50)  NOT NULL,
  `type`   VARCHAR(50)  NOT NULL,
  `asset`  VARCHAR(191) NOT NULL,
  `wallet` VARCHAR(191) NOT NULL,
  `qty`    VARCHAR(50)  NOT NULL,
  `price`  DOUBLE NOT NULL,
  `total`  DOUBLE NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

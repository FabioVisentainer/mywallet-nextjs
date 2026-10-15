-- MyWallet — dados de demonstração (PostgreSQL 12+)
-- Rode DEPOIS do 01-schema.sql. Gerado por prisma/database-first/export.mjs.

SET client_encoding = 'UTF8';
BEGIN;

-- User (11)
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "status", "perms", "since", "lastAccess", "accountType") VALUES ('u1', 'Ana Souza', 'ana.souza@mywallet.io', 'ad540bff9839aac8d9cc290617b61a5d:afe0f116cb5ba0c5fe6cbf1ffe0439203e7af3139b5443cd902602f9b3cc3ee51aaf78ec6c7bcf33d3b0bcbc79826f9f0f17d211aa41aee03065ed45de49cbb1', 'Investor', 'Active', 'Wallets, goals, market data', 'Mar 2024', '2026-08-11', 'Individual');
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "status", "perms", "since", "lastAccess", "accountType") VALUES ('u2', 'Rafael Prado', 'rafael.prado@mywallet.io', 'faadb3ce4969c98414b086f3857d7f7c:3f87624defd85b48e19d47af64c024b9beb032151fcbabd4a8630d2a42b78d95f13904c9faf68f05068aeb58029f058e93ce1c14aa5a6b41a64dba8f68cb16cc', 'Analyst', 'Active', 'Publish news, market data', 'Sep 2023', '2026-08-11', 'Individual');
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "status", "perms", "since", "lastAccess", "accountType") VALUES ('u3', 'Marcos Lima', 'marcos.lima@mywallet.io', '148d14b426f5e2ff11dbedf5dbfcc57b:50568a8436c42728c4ce1678aafa9d229c9080d1cb67d2cf4d21e79cb554435f54b63b3050242c2373fa18769653629a106a871989826a4bf82c50bd45840839', 'Administrator', 'Active', 'Full system access', 'Jan 2023', '2026-08-10', 'Individual');
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "status", "perms", "since", "lastAccess", "accountType") VALUES ('u4', 'Beatriz Nunes', 'bia.nunes@gmail.com', '675844d661af93d9c40cb77947f8d633:d26150bf552b576896c871a0701a116cf41dbf1ceda543d830d979dadbd16ec5ba1d1f6a01492f2fa3d49a20ae91b0bb52e3a46bd37174a77aca4eabf0453af7', 'Investor', 'Active', 'Wallets, goals, market data', 'Nov 2025', '2026-08-09', 'Individual');
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "status", "perms", "since", "lastAccess", "accountType") VALUES ('u5', 'Caio Ferreira', 'caio.f@outlook.com', '0f21774c5761bd2569f920ea82c1afb7:571c8bec5c9a0d1b0ea5452db3dc6c8d024492bac43c4cdb4e14d21c2fe2dec614473bfd77680ef5acc384d6e34d4deb60c26da1ccff87dea61866c74e90843b', 'Investor', 'Suspended', 'Read only', 'Feb 2025', '2026-06-21', 'Individual');
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "status", "perms", "since", "lastAccess", "accountType") VALUES ('u6', 'Helena Rocha', 'helena.rocha@mywallet.io', '44ddfa4ff63010ab8b06aac4c7218fb9:9d5ad98c85f9219a163a08eba0a5d6b78205a9b7afabef8058b3256d3fcbc505958c450ac3158e0b158b4d45929c0c1036321f2fe422ed03123a4a3d638901d6', 'Analyst', 'Active', 'Publish news, market data', 'May 2024', '2026-08-07', 'Individual');
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "status", "perms", "since", "lastAccess", "accountType") VALUES ('u7', 'Diego Martins', 'diego.martins@gmail.com', 'a49a77f58e9c98c457fd273c26be1433:861afa3133f1867fdfdf0e98a874d893af5e4623fe651a33a216008214033cc109e0aa36eea7b04321c9cab9e4631474164b17ac7c251c8d400fa7bed52c559a', 'Investor', 'Pending', 'Awaiting email confirmation', 'Aug 2026', '—', 'Individual');
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "status", "perms", "since", "lastAccess", "accountType") VALUES ('u8', 'Larissa Alves', 'larissa.alves@uol.com.br', '9ccb47a30b4c3a46baa52e7f6be4ee49:4940595d26ea95793ea9eabfc4de795e2d85acf215ac048fbcd44d93d5b495096e9a659da9a81be2daa809f50d7f410d4c8552c63cf139107e263e1b2baf39ad', 'Investor', 'Active', 'Wallets, goals, market data', 'Jun 2025', '2026-08-11', 'Individual');
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "status", "perms", "since", "lastAccess", "accountType") VALUES ('u9', 'Carla Mendes', 'carla.mendes@mywallet.io', '0446b6a4650e1de458e70064c6f3e57b:11296fd53213ead32b1b1c46e66fdafd216b40681396926c9f656e71b5e34a1a52d02779a02ebf702125277b300d93b351b4cbc0c6ef2d594650833425967c91', 'Investor', 'Active', 'Wallets, goals, market data, institutional desk', 'Jan 2026', '2026-08-12', 'Institutional');
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "status", "perms", "since", "lastAccess", "accountType") VALUES ('u1790123962013', 'Teste', 'teste@teste.com', '45d3982c286a337bc92f4679e33557ec:9502987d75e17b60819b49971503251b3545bb5cddb709d8e9b2de1655a9a266c4a3d011a50062fe5902b619f73847e10e7a3b48ec7ed3b24ab36eb8e42dc5b2', 'Investor', 'Active', 'Wallets, goals, market data', 'Sep 2026', '2026-09-23', 'Individual');
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "status", "perms", "since", "lastAccess", "accountType") VALUES ('u1791330418178', 'Ana Souza', 'ana.souza@teste.com', '9eaec199f85b70b78d2d293fd7e732c4:2ce6412ee71576401caf01ac9647802978132dde5d84acd8a9d4aaa1fa39911b8cb7ea73f7233552518d398bfa063a3a90ee64807f808291c5b877cdd8fd12f3', 'Investor', 'Active', 'Wallets, goals, market data', 'Oct 2026', '2026-10-06', 'Individual');

-- ActivityEntry (24)
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (1, 'u1', 'Added PETR4 to Core Equity', '2026-08-11 09:40');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (2, 'u1', 'Signed in from São Paulo, BR', '2026-08-11 08:12');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (3, 'u1', 'Account created', '2024-03-02 10:05');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (4, 'u2', 'Published “Copom holds Selic at 9.25%”', '2026-08-10 09:12');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (5, 'u2', 'Signed in from São Paulo, BR', '2026-08-11 08:40');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (6, 'u2', 'Permission “Moderate news” denied by policy', '2026-07-30 16:02');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (7, 'u2', 'Account created', '2023-09-04 11:20');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (8, 'u3', 'Changed role for Helena Rocha to Analyst', '2026-08-10 14:55');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (9, 'u3', 'Signed in from Rio de Janeiro, BR', '2026-08-10 08:03');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (10, 'u3', 'Account created', '2023-01-15 09:00');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (11, 'u4', 'Signed in from Curitiba, BR', '2026-08-09 19:22');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (12, 'u4', 'Account created', '2025-11-03 12:40');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (13, 'u5', 'Account suspended by policy', '2026-06-21 10:00');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (14, 'u5', 'Account created', '2025-02-11 08:30');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (15, 'u6', 'Signed in from Belo Horizonte, BR', '2026-08-07 07:55');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (16, 'u6', 'Account created', '2024-05-20 13:10');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (17, 'u7', 'Account created — email confirmation pending', '2026-08-05 17:44');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (18, 'u8', 'Signed in from Fortaleza, BR', '2026-08-11 06:30');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (19, 'u8', 'Account created', '2025-06-18 09:15');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (20, 'u9', 'Added Diego Martins as Trader on the institutional desk', '2026-08-12 11:05');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (21, 'u9', 'Signed in from São Paulo, BR', '2026-08-12 08:50');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (22, 'u9', 'Account created — Institutional account', '2026-01-14 09:30');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (23, 'u1790123962013', 'Account created', '2026-09-23 21:39');
INSERT INTO "ActivityEntry" ("id", "userId", "text", "when") VALUES (24, 'u1791330418178', 'Account created', '2026-10-06 20:46');
SELECT setval(pg_get_serial_sequence('"ActivityEntry"', 'id'), COALESCE((SELECT MAX("id") FROM "ActivityEntry"), 0) + 1, false);

-- Article (5)
INSERT INTO "Article" ("id", "title", "category", "date", "views", "status", "author", "read", "summary", "body") VALUES ('n1', 'Copom holds Selic at 9.25% — three consequences for equity allocation', 'Macro', '2026-08-10', 4128, 'Published', 'Rafael Prado', '6 min read', 'The committee signalled a longer plateau. Duration-sensitive names and dividend payers react differently to that message.', NULL);
INSERT INTO "Article" ("id", "title", "category", "date", "views", "status", "author", "read", "summary", "body") VALUES ('n2', 'Bitcoin ETF inflows hit a nine-month high', 'Crypto', '2026-08-08', 3277, 'Published', 'Rafael Prado', '4 min read', 'Net creations of $1.8bn last week reversed the June outflow trend, concentrated in two issuers.', NULL);
INSERT INTO "Article" ("id", "title", "category", "date", "views", "status", "author", "read", "summary", "body") VALUES ('n3', 'Vale Q2: iron ore volumes beat, guidance unchanged', 'Equities', '2026-08-05', 2610, 'Published', 'Rafael Prado', '5 min read', 'Shipments came in 4% above consensus while unit cash cost held flat, keeping the dividend policy intact.', NULL);
INSERT INTO "Article" ("id", "title", "category", "date", "views", "status", "author", "read", "summary", "body") VALUES ('n4', 'Reading the yield curve before rebalancing', 'Markets', '2026-08-01', 1894, 'Published', 'Rafael Prado', '7 min read', 'A practical checklist for investors deciding between prefixed and inflation-linked exposure this quarter.', NULL);
INSERT INTO "Article" ("id", "title", "category", "date", "views", "status", "author", "read", "summary", "body") VALUES ('n5', 'Petrobras capex plan — first read', 'Equities', '—', 0, 'Draft', 'Rafael Prado', '3 min read', 'Draft notes on the five-year investment plan released after market close.', NULL);

-- Wallet (4)
INSERT INTO "Wallet" ("id", "name", "kind", "icon", "tint", "tintFg", "created") VALUES ('w1', 'Core Equity', 'Stocks', '▤', '#EEF4FF', '#2563EB', 'Mar 2024');
INSERT INTO "Wallet" ("id", "name", "kind", "icon", "tint", "tintFg", "created") VALUES ('w2', 'Crypto', 'Digital assets', '◈', '#F4F0FF', '#6938EF', 'Jul 2024');
INSERT INTO "Wallet" ("id", "name", "kind", "icon", "tint", "tintFg", "created") VALUES ('w3', 'Dividends', 'Income', '◉', '#ECFDF3', '#067647', 'Jan 2025');
INSERT INTO "Wallet" ("id", "name", "kind", "icon", "tint", "tintFg", "created") VALUES ('w1789514520626', 'Tste', 'Custom', '◆', '#FFF6ED', '#B54708', 'Aug 2026');

-- Asset (10)
INSERT INTO "Asset" ("id", "walletId", "ticker", "name", "type", "qty", "avg") VALUES ('a1', 'w1', 'PETR4', 'Petróleo Brasileiro PN', 'Stock', 1200, 6.12);
INSERT INTO "Asset" ("id", "walletId", "ticker", "name", "type", "qty", "avg") VALUES ('a2', 'w1', 'VALE3', 'Vale ON', 'Stock', 900, 10.85);
INSERT INTO "Asset" ("id", "walletId", "ticker", "name", "type", "qty", "avg") VALUES ('a3', 'w1', 'ITUB4', 'Itaú Unibanco PN', 'Stock', 2400, 5.94);
INSERT INTO "Asset" ("id", "walletId", "ticker", "name", "type", "qty", "avg") VALUES ('a4', 'w1', 'WEGE3', 'WEG ON', 'Stock', 1500, 9.2);
INSERT INTO "Asset" ("id", "walletId", "ticker", "name", "type", "qty", "avg") VALUES ('a5', 'w2', 'BTC', 'Bitcoin', 'Crypto', 0.42, 61240);
INSERT INTO "Asset" ("id", "walletId", "ticker", "name", "type", "qty", "avg") VALUES ('a6', 'w2', 'ETH', 'Ethereum', 'Crypto', 6.5, 2810);
INSERT INTO "Asset" ("id", "walletId", "ticker", "name", "type", "qty", "avg") VALUES ('a7', 'w2', 'SOL', 'Solana', 'Crypto', 48, 178.4);
INSERT INTO "Asset" ("id", "walletId", "ticker", "name", "type", "qty", "avg") VALUES ('a8', 'w3', 'BBAS3', 'Banco do Brasil ON', 'Stock', 1100, 4.86);
INSERT INTO "Asset" ("id", "walletId", "ticker", "name", "type", "qty", "avg") VALUES ('a9', 'w3', 'TAEE11', 'Taesa UNT', 'Stock', 700, 6.4);
INSERT INTO "Asset" ("id", "walletId", "ticker", "name", "type", "qty", "avg") VALUES ('a10', 'w3', 'CPLE6', 'Copel PNB', 'Stock', 1800, 1.92);

-- Goal (3)
INSERT INTO "Goal" ("id", "name", "target", "current", "due") VALUES ('g1', 'Emergency fund', 30000, 21400, 'Dec 2026');
INSERT INTO "Goal" ("id", "name", "target", "current", "due") VALUES ('g2', 'Apartment down payment', 120000, 43750, 'Jun 2029');
INSERT INTO "Goal" ("id", "name", "target", "current", "due") VALUES ('g3', 'Sabbatical year', 45000, 12900, 'Mar 2028');

-- InvestorProfileResult (2)
INSERT INTO "InvestorProfileResult" ("id", "userId", "score", "profileKey", "answers", "completedAt") VALUES ('ipr1790124043073', 'u1790123962013', 13, 'Conservative', '{"0":0,"1":1,"2":1,"3":1,"4":0,"5":0,"6":0,"7":0}', '2026-09-23T00:40:43.073Z');
INSERT INTO "InvestorProfileResult" ("id", "userId", "score", "profileKey", "answers", "completedAt") VALUES ('ipr1791330439357', 'u1791330418178', 100, 'Aggressive', '{"0":3,"1":3,"2":3,"3":3,"4":3,"5":3,"6":3,"7":3}', '2026-10-06T23:47:19.357Z');

-- PasswordResetToken (2)
INSERT INTO "PasswordResetToken" ("id", "userId", "token", "expiresAt", "usedAt", "createdAt") VALUES ('rst1790123183460', 'u1', 'prt1790123183460w17m3h', '2026-09-23T00:56:23.460Z', '2026-09-23T00:26:29.311Z', '2026-09-23T00:26:23.460Z');
INSERT INTO "PasswordResetToken" ("id", "userId", "token", "expiresAt", "usedAt", "createdAt") VALUES ('rst1790123194134', 'u1', 'prt1790123194134bl7fws', '2026-09-23T00:56:34.134Z', '2026-09-23T00:26:37.785Z', '2026-09-23T00:26:34.134Z');

-- Promotion (2)
INSERT INTO "Promotion" ("id", "planName", "title", "description", "discountPct", "startsAt", "endsAt", "active", "createdBy") VALUES ('promo1', 'Platinum', 'Black Friday — 30% off', '30% discount on the first 3 months of Platinum, offered to investors who haven''t upgraded yet.', 30, '2026-11-20', '2026-11-30', TRUE, 'u3');
INSERT INTO "Promotion" ("id", "planName", "title", "description", "discountPct", "startsAt", "endsAt", "active", "createdBy") VALUES ('promo2', 'Black', 'Upgrade anual com desconto', '15% de desconto para quem migrar do Platinum para o Black pagando o plano anual.', 15, '2026-09-01', '2026-09-30', TRUE, 'u3');

-- TeamMember (4)
INSERT INTO "TeamMember" ("id", "name", "email", "roleInTeam", "since") VALUES ('tm1', 'Diego Martins', 'diego.martins@vetorcapital.io', 'Trader', 'Feb 2026');
INSERT INTO "TeamMember" ("id", "name", "email", "roleInTeam", "since") VALUES ('tm2', 'Fernanda Costa', 'fernanda.costa@vetorcapital.io', 'Compliance', 'Feb 2026');
INSERT INTO "TeamMember" ("id", "name", "email", "roleInTeam", "since") VALUES ('tm3', 'Bruno Alencar', 'bruno.alencar@vetorcapital.io', 'Trader', 'Mar 2026');
INSERT INTO "TeamMember" ("id", "name", "email", "roleInTeam", "since") VALUES ('tm4', 'Julia Prado', 'julia.prado@vetorcapital.io', 'Viewer', 'Jun 2026');

-- Transaction (9)
INSERT INTO "Transaction" ("id", "date", "type", "asset", "wallet", "qty", "price", "total", "externalRef") VALUES ('t1', '2026-08-11', 'Buy', 'PETR4 · Petróleo Brasileiro', 'Core Equity', '200', 7.31, -1462, NULL);
INSERT INTO "Transaction" ("id", "date", "type", "asset", "wallet", "qty", "price", "total", "externalRef") VALUES ('t2', '2026-08-07', 'Swap', 'SOL → ETH', 'Crypto', '12.0000', 151.2, 0, NULL);
INSERT INTO "Transaction" ("id", "date", "type", "asset", "wallet", "qty", "price", "total", "externalRef") VALUES ('t3', '2026-08-02', 'Sell', 'WEGE3 · WEG ON', 'Core Equity', '300', 8.74, 2622, NULL);
INSERT INTO "Transaction" ("id", "date", "type", "asset", "wallet", "qty", "price", "total", "externalRef") VALUES ('t4', '2026-07-28', 'Deposit', 'Cash in', 'Crypto', '—', 0, 5000, NULL);
INSERT INTO "Transaction" ("id", "date", "type", "asset", "wallet", "qty", "price", "total", "externalRef") VALUES ('t5', '2026-07-21', 'Buy', 'BTC · Bitcoin', 'Crypto', '0.0600', 72410, -4344.6, NULL);
INSERT INTO "Transaction" ("id", "date", "type", "asset", "wallet", "qty", "price", "total", "externalRef") VALUES ('t6', '2026-07-14', 'Buy', 'ITUB4 · Itaú Unibanco', 'Core Equity', '400', 6.62, -2648, NULL);
INSERT INTO "Transaction" ("id", "date", "type", "asset", "wallet", "qty", "price", "total", "externalRef") VALUES ('t7', '2026-07-03', 'Swap', 'USDC → BTC', 'Crypto', '3,000.00', 1, 0, NULL);
INSERT INTO "Transaction" ("id", "date", "type", "asset", "wallet", "qty", "price", "total", "externalRef") VALUES ('t8', '2026-06-27', 'Sell', 'BBAS3 · Banco do Brasil', 'Dividends', '250', 4.63, 1157.5, NULL);
INSERT INTO "Transaction" ("id", "date", "type", "asset", "wallet", "qty", "price", "total", "externalRef") VALUES ('t9', '2026-06-19', 'Buy', 'TAEE11 · Taesa UNT', 'Dividends', '150', 6.28, -942, NULL);

COMMIT;

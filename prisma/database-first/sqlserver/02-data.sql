-- MyWallet — dados de demonstração (SQL Server 2016+ / Azure SQL)
-- Rode DEPOIS do 01-schema.sql. Gerado por prisma/database-first/export.mjs.

USE [mywallet];
GO
SET NOCOUNT ON;

-- User (11)
INSERT INTO [User] ([id], [name], [email], [passwordHash], [role], [status], [perms], [since], [lastAccess], [accountType]) VALUES (N'u1', N'Ana Souza', N'ana.souza@mywallet.io', N'ad540bff9839aac8d9cc290617b61a5d:afe0f116cb5ba0c5fe6cbf1ffe0439203e7af3139b5443cd902602f9b3cc3ee51aaf78ec6c7bcf33d3b0bcbc79826f9f0f17d211aa41aee03065ed45de49cbb1', N'Investor', N'Active', N'Wallets, goals, market data', N'Mar 2024', N'2026-08-11', N'Individual');
INSERT INTO [User] ([id], [name], [email], [passwordHash], [role], [status], [perms], [since], [lastAccess], [accountType]) VALUES (N'u2', N'Rafael Prado', N'rafael.prado@mywallet.io', N'faadb3ce4969c98414b086f3857d7f7c:3f87624defd85b48e19d47af64c024b9beb032151fcbabd4a8630d2a42b78d95f13904c9faf68f05068aeb58029f058e93ce1c14aa5a6b41a64dba8f68cb16cc', N'Analyst', N'Active', N'Publish news, market data', N'Sep 2023', N'2026-08-11', N'Individual');
INSERT INTO [User] ([id], [name], [email], [passwordHash], [role], [status], [perms], [since], [lastAccess], [accountType]) VALUES (N'u3', N'Marcos Lima', N'marcos.lima@mywallet.io', N'148d14b426f5e2ff11dbedf5dbfcc57b:50568a8436c42728c4ce1678aafa9d229c9080d1cb67d2cf4d21e79cb554435f54b63b3050242c2373fa18769653629a106a871989826a4bf82c50bd45840839', N'Administrator', N'Active', N'Full system access', N'Jan 2023', N'2026-08-10', N'Individual');
INSERT INTO [User] ([id], [name], [email], [passwordHash], [role], [status], [perms], [since], [lastAccess], [accountType]) VALUES (N'u4', N'Beatriz Nunes', N'bia.nunes@gmail.com', N'675844d661af93d9c40cb77947f8d633:d26150bf552b576896c871a0701a116cf41dbf1ceda543d830d979dadbd16ec5ba1d1f6a01492f2fa3d49a20ae91b0bb52e3a46bd37174a77aca4eabf0453af7', N'Investor', N'Active', N'Wallets, goals, market data', N'Nov 2025', N'2026-08-09', N'Individual');
INSERT INTO [User] ([id], [name], [email], [passwordHash], [role], [status], [perms], [since], [lastAccess], [accountType]) VALUES (N'u5', N'Caio Ferreira', N'caio.f@outlook.com', N'0f21774c5761bd2569f920ea82c1afb7:571c8bec5c9a0d1b0ea5452db3dc6c8d024492bac43c4cdb4e14d21c2fe2dec614473bfd77680ef5acc384d6e34d4deb60c26da1ccff87dea61866c74e90843b', N'Investor', N'Suspended', N'Read only', N'Feb 2025', N'2026-06-21', N'Individual');
INSERT INTO [User] ([id], [name], [email], [passwordHash], [role], [status], [perms], [since], [lastAccess], [accountType]) VALUES (N'u6', N'Helena Rocha', N'helena.rocha@mywallet.io', N'44ddfa4ff63010ab8b06aac4c7218fb9:9d5ad98c85f9219a163a08eba0a5d6b78205a9b7afabef8058b3256d3fcbc505958c450ac3158e0b158b4d45929c0c1036321f2fe422ed03123a4a3d638901d6', N'Analyst', N'Active', N'Publish news, market data', N'May 2024', N'2026-08-07', N'Individual');
INSERT INTO [User] ([id], [name], [email], [passwordHash], [role], [status], [perms], [since], [lastAccess], [accountType]) VALUES (N'u7', N'Diego Martins', N'diego.martins@gmail.com', N'a49a77f58e9c98c457fd273c26be1433:861afa3133f1867fdfdf0e98a874d893af5e4623fe651a33a216008214033cc109e0aa36eea7b04321c9cab9e4631474164b17ac7c251c8d400fa7bed52c559a', N'Investor', N'Pending', N'Awaiting email confirmation', N'Aug 2026', N'—', N'Individual');
INSERT INTO [User] ([id], [name], [email], [passwordHash], [role], [status], [perms], [since], [lastAccess], [accountType]) VALUES (N'u8', N'Larissa Alves', N'larissa.alves@uol.com.br', N'9ccb47a30b4c3a46baa52e7f6be4ee49:4940595d26ea95793ea9eabfc4de795e2d85acf215ac048fbcd44d93d5b495096e9a659da9a81be2daa809f50d7f410d4c8552c63cf139107e263e1b2baf39ad', N'Investor', N'Active', N'Wallets, goals, market data', N'Jun 2025', N'2026-08-11', N'Individual');
INSERT INTO [User] ([id], [name], [email], [passwordHash], [role], [status], [perms], [since], [lastAccess], [accountType]) VALUES (N'u9', N'Carla Mendes', N'carla.mendes@mywallet.io', N'0446b6a4650e1de458e70064c6f3e57b:11296fd53213ead32b1b1c46e66fdafd216b40681396926c9f656e71b5e34a1a52d02779a02ebf702125277b300d93b351b4cbc0c6ef2d594650833425967c91', N'Investor', N'Active', N'Wallets, goals, market data, institutional desk', N'Jan 2026', N'2026-08-12', N'Institutional');
INSERT INTO [User] ([id], [name], [email], [passwordHash], [role], [status], [perms], [since], [lastAccess], [accountType]) VALUES (N'u1790123962013', N'Teste', N'teste@teste.com', N'45d3982c286a337bc92f4679e33557ec:9502987d75e17b60819b49971503251b3545bb5cddb709d8e9b2de1655a9a266c4a3d011a50062fe5902b619f73847e10e7a3b48ec7ed3b24ab36eb8e42dc5b2', N'Investor', N'Active', N'Wallets, goals, market data', N'Sep 2026', N'2026-09-23', N'Individual');
INSERT INTO [User] ([id], [name], [email], [passwordHash], [role], [status], [perms], [since], [lastAccess], [accountType]) VALUES (N'u1791330418178', N'Ana Souza', N'ana.souza@teste.com', N'9eaec199f85b70b78d2d293fd7e732c4:2ce6412ee71576401caf01ac9647802978132dde5d84acd8a9d4aaa1fa39911b8cb7ea73f7233552518d398bfa063a3a90ee64807f808291c5b877cdd8fd12f3', N'Investor', N'Active', N'Wallets, goals, market data', N'Oct 2026', N'2026-10-06', N'Individual');

-- ActivityEntry (24)
SET IDENTITY_INSERT [ActivityEntry] ON;
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (1, N'u1', N'Added PETR4 to Core Equity', N'2026-08-11 09:40');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (2, N'u1', N'Signed in from São Paulo, BR', N'2026-08-11 08:12');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (3, N'u1', N'Account created', N'2024-03-02 10:05');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (4, N'u2', N'Published “Copom holds Selic at 9.25%”', N'2026-08-10 09:12');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (5, N'u2', N'Signed in from São Paulo, BR', N'2026-08-11 08:40');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (6, N'u2', N'Permission “Moderate news” denied by policy', N'2026-07-30 16:02');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (7, N'u2', N'Account created', N'2023-09-04 11:20');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (8, N'u3', N'Changed role for Helena Rocha to Analyst', N'2026-08-10 14:55');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (9, N'u3', N'Signed in from Rio de Janeiro, BR', N'2026-08-10 08:03');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (10, N'u3', N'Account created', N'2023-01-15 09:00');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (11, N'u4', N'Signed in from Curitiba, BR', N'2026-08-09 19:22');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (12, N'u4', N'Account created', N'2025-11-03 12:40');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (13, N'u5', N'Account suspended by policy', N'2026-06-21 10:00');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (14, N'u5', N'Account created', N'2025-02-11 08:30');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (15, N'u6', N'Signed in from Belo Horizonte, BR', N'2026-08-07 07:55');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (16, N'u6', N'Account created', N'2024-05-20 13:10');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (17, N'u7', N'Account created — email confirmation pending', N'2026-08-05 17:44');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (18, N'u8', N'Signed in from Fortaleza, BR', N'2026-08-11 06:30');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (19, N'u8', N'Account created', N'2025-06-18 09:15');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (20, N'u9', N'Added Diego Martins as Trader on the institutional desk', N'2026-08-12 11:05');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (21, N'u9', N'Signed in from São Paulo, BR', N'2026-08-12 08:50');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (22, N'u9', N'Account created — Institutional account', N'2026-01-14 09:30');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (23, N'u1790123962013', N'Account created', N'2026-09-23 21:39');
INSERT INTO [ActivityEntry] ([id], [userId], [text], [when]) VALUES (24, N'u1791330418178', N'Account created', N'2026-10-06 20:46');
SET IDENTITY_INSERT [ActivityEntry] OFF;

-- Article (5)
INSERT INTO [Article] ([id], [title], [category], [date], [views], [status], [author], [read], [summary], [body]) VALUES (N'n1', N'Copom holds Selic at 9.25% — three consequences for equity allocation', N'Macro', N'2026-08-10', 4128, N'Published', N'Rafael Prado', N'6 min read', N'The committee signalled a longer plateau. Duration-sensitive names and dividend payers react differently to that message.', NULL);
INSERT INTO [Article] ([id], [title], [category], [date], [views], [status], [author], [read], [summary], [body]) VALUES (N'n2', N'Bitcoin ETF inflows hit a nine-month high', N'Crypto', N'2026-08-08', 3277, N'Published', N'Rafael Prado', N'4 min read', N'Net creations of $1.8bn last week reversed the June outflow trend, concentrated in two issuers.', NULL);
INSERT INTO [Article] ([id], [title], [category], [date], [views], [status], [author], [read], [summary], [body]) VALUES (N'n3', N'Vale Q2: iron ore volumes beat, guidance unchanged', N'Equities', N'2026-08-05', 2610, N'Published', N'Rafael Prado', N'5 min read', N'Shipments came in 4% above consensus while unit cash cost held flat, keeping the dividend policy intact.', NULL);
INSERT INTO [Article] ([id], [title], [category], [date], [views], [status], [author], [read], [summary], [body]) VALUES (N'n4', N'Reading the yield curve before rebalancing', N'Markets', N'2026-08-01', 1894, N'Published', N'Rafael Prado', N'7 min read', N'A practical checklist for investors deciding between prefixed and inflation-linked exposure this quarter.', NULL);
INSERT INTO [Article] ([id], [title], [category], [date], [views], [status], [author], [read], [summary], [body]) VALUES (N'n5', N'Petrobras capex plan — first read', N'Equities', N'—', 0, N'Draft', N'Rafael Prado', N'3 min read', N'Draft notes on the five-year investment plan released after market close.', NULL);

-- Wallet (4)
INSERT INTO [Wallet] ([id], [name], [kind], [icon], [tint], [tintFg], [created]) VALUES (N'w1', N'Core Equity', N'Stocks', N'▤', N'#EEF4FF', N'#2563EB', N'Mar 2024');
INSERT INTO [Wallet] ([id], [name], [kind], [icon], [tint], [tintFg], [created]) VALUES (N'w2', N'Crypto', N'Digital assets', N'◈', N'#F4F0FF', N'#6938EF', N'Jul 2024');
INSERT INTO [Wallet] ([id], [name], [kind], [icon], [tint], [tintFg], [created]) VALUES (N'w3', N'Dividends', N'Income', N'◉', N'#ECFDF3', N'#067647', N'Jan 2025');
INSERT INTO [Wallet] ([id], [name], [kind], [icon], [tint], [tintFg], [created]) VALUES (N'w1789514520626', N'Tste', N'Custom', N'◆', N'#FFF6ED', N'#B54708', N'Aug 2026');

-- Asset (10)
INSERT INTO [Asset] ([id], [walletId], [ticker], [name], [type], [qty], [avg]) VALUES (N'a1', N'w1', N'PETR4', N'Petróleo Brasileiro PN', N'Stock', 1200, 6.12);
INSERT INTO [Asset] ([id], [walletId], [ticker], [name], [type], [qty], [avg]) VALUES (N'a2', N'w1', N'VALE3', N'Vale ON', N'Stock', 900, 10.85);
INSERT INTO [Asset] ([id], [walletId], [ticker], [name], [type], [qty], [avg]) VALUES (N'a3', N'w1', N'ITUB4', N'Itaú Unibanco PN', N'Stock', 2400, 5.94);
INSERT INTO [Asset] ([id], [walletId], [ticker], [name], [type], [qty], [avg]) VALUES (N'a4', N'w1', N'WEGE3', N'WEG ON', N'Stock', 1500, 9.2);
INSERT INTO [Asset] ([id], [walletId], [ticker], [name], [type], [qty], [avg]) VALUES (N'a5', N'w2', N'BTC', N'Bitcoin', N'Crypto', 0.42, 61240);
INSERT INTO [Asset] ([id], [walletId], [ticker], [name], [type], [qty], [avg]) VALUES (N'a6', N'w2', N'ETH', N'Ethereum', N'Crypto', 6.5, 2810);
INSERT INTO [Asset] ([id], [walletId], [ticker], [name], [type], [qty], [avg]) VALUES (N'a7', N'w2', N'SOL', N'Solana', N'Crypto', 48, 178.4);
INSERT INTO [Asset] ([id], [walletId], [ticker], [name], [type], [qty], [avg]) VALUES (N'a8', N'w3', N'BBAS3', N'Banco do Brasil ON', N'Stock', 1100, 4.86);
INSERT INTO [Asset] ([id], [walletId], [ticker], [name], [type], [qty], [avg]) VALUES (N'a9', N'w3', N'TAEE11', N'Taesa UNT', N'Stock', 700, 6.4);
INSERT INTO [Asset] ([id], [walletId], [ticker], [name], [type], [qty], [avg]) VALUES (N'a10', N'w3', N'CPLE6', N'Copel PNB', N'Stock', 1800, 1.92);

-- Goal (3)
INSERT INTO [Goal] ([id], [name], [target], [current], [due]) VALUES (N'g1', N'Emergency fund', 30000, 21400, N'Dec 2026');
INSERT INTO [Goal] ([id], [name], [target], [current], [due]) VALUES (N'g2', N'Apartment down payment', 120000, 43750, N'Jun 2029');
INSERT INTO [Goal] ([id], [name], [target], [current], [due]) VALUES (N'g3', N'Sabbatical year', 45000, 12900, N'Mar 2028');

-- InvestorProfileResult (2)
INSERT INTO [InvestorProfileResult] ([id], [userId], [score], [profileKey], [answers], [completedAt]) VALUES (N'ipr1790124043073', N'u1790123962013', 13, N'Conservative', N'{"0":0,"1":1,"2":1,"3":1,"4":0,"5":0,"6":0,"7":0}', N'2026-09-23T00:40:43.073Z');
INSERT INTO [InvestorProfileResult] ([id], [userId], [score], [profileKey], [answers], [completedAt]) VALUES (N'ipr1791330439357', N'u1791330418178', 100, N'Aggressive', N'{"0":3,"1":3,"2":3,"3":3,"4":3,"5":3,"6":3,"7":3}', N'2026-10-06T23:47:19.357Z');

-- PasswordResetToken (2)
INSERT INTO [PasswordResetToken] ([id], [userId], [token], [expiresAt], [usedAt], [createdAt]) VALUES (N'rst1790123183460', N'u1', N'prt1790123183460w17m3h', N'2026-09-23T00:56:23.460Z', N'2026-09-23T00:26:29.311Z', N'2026-09-23T00:26:23.460Z');
INSERT INTO [PasswordResetToken] ([id], [userId], [token], [expiresAt], [usedAt], [createdAt]) VALUES (N'rst1790123194134', N'u1', N'prt1790123194134bl7fws', N'2026-09-23T00:56:34.134Z', N'2026-09-23T00:26:37.785Z', N'2026-09-23T00:26:34.134Z');

-- Promotion (2)
INSERT INTO [Promotion] ([id], [planName], [title], [description], [discountPct], [startsAt], [endsAt], [active], [createdBy]) VALUES (N'promo1', N'Platinum', N'Black Friday — 30% off', N'30% discount on the first 3 months of Platinum, offered to investors who haven''t upgraded yet.', 30, N'2026-11-20', N'2026-11-30', 1, N'u3');
INSERT INTO [Promotion] ([id], [planName], [title], [description], [discountPct], [startsAt], [endsAt], [active], [createdBy]) VALUES (N'promo2', N'Black', N'Upgrade anual com desconto', N'15% de desconto para quem migrar do Platinum para o Black pagando o plano anual.', 15, N'2026-09-01', N'2026-09-30', 1, N'u3');

-- TeamMember (4)
INSERT INTO [TeamMember] ([id], [name], [email], [roleInTeam], [since]) VALUES (N'tm1', N'Diego Martins', N'diego.martins@vetorcapital.io', N'Trader', N'Feb 2026');
INSERT INTO [TeamMember] ([id], [name], [email], [roleInTeam], [since]) VALUES (N'tm2', N'Fernanda Costa', N'fernanda.costa@vetorcapital.io', N'Compliance', N'Feb 2026');
INSERT INTO [TeamMember] ([id], [name], [email], [roleInTeam], [since]) VALUES (N'tm3', N'Bruno Alencar', N'bruno.alencar@vetorcapital.io', N'Trader', N'Mar 2026');
INSERT INTO [TeamMember] ([id], [name], [email], [roleInTeam], [since]) VALUES (N'tm4', N'Julia Prado', N'julia.prado@vetorcapital.io', N'Viewer', N'Jun 2026');

-- Transaction (9)
INSERT INTO [Transaction] ([id], [date], [type], [asset], [wallet], [qty], [price], [total], [externalRef]) VALUES (N't1', N'2026-08-11', N'Buy', N'PETR4 · Petróleo Brasileiro', N'Core Equity', N'200', 7.31, -1462, NULL);
INSERT INTO [Transaction] ([id], [date], [type], [asset], [wallet], [qty], [price], [total], [externalRef]) VALUES (N't2', N'2026-08-07', N'Swap', N'SOL → ETH', N'Crypto', N'12.0000', 151.2, 0, NULL);
INSERT INTO [Transaction] ([id], [date], [type], [asset], [wallet], [qty], [price], [total], [externalRef]) VALUES (N't3', N'2026-08-02', N'Sell', N'WEGE3 · WEG ON', N'Core Equity', N'300', 8.74, 2622, NULL);
INSERT INTO [Transaction] ([id], [date], [type], [asset], [wallet], [qty], [price], [total], [externalRef]) VALUES (N't4', N'2026-07-28', N'Deposit', N'Cash in', N'Crypto', N'—', 0, 5000, NULL);
INSERT INTO [Transaction] ([id], [date], [type], [asset], [wallet], [qty], [price], [total], [externalRef]) VALUES (N't5', N'2026-07-21', N'Buy', N'BTC · Bitcoin', N'Crypto', N'0.0600', 72410, -4344.6, NULL);
INSERT INTO [Transaction] ([id], [date], [type], [asset], [wallet], [qty], [price], [total], [externalRef]) VALUES (N't6', N'2026-07-14', N'Buy', N'ITUB4 · Itaú Unibanco', N'Core Equity', N'400', 6.62, -2648, NULL);
INSERT INTO [Transaction] ([id], [date], [type], [asset], [wallet], [qty], [price], [total], [externalRef]) VALUES (N't7', N'2026-07-03', N'Swap', N'USDC → BTC', N'Crypto', N'3,000.00', 1, 0, NULL);
INSERT INTO [Transaction] ([id], [date], [type], [asset], [wallet], [qty], [price], [total], [externalRef]) VALUES (N't8', N'2026-06-27', N'Sell', N'BBAS3 · Banco do Brasil', N'Dividends', N'250', 4.63, 1157.5, NULL);
INSERT INTO [Transaction] ([id], [date], [type], [asset], [wallet], [qty], [price], [total], [externalRef]) VALUES (N't9', N'2026-06-19', N'Buy', N'TAEE11 · Taesa UNT', N'Dividends', N'150', 6.28, -942, NULL);

GO

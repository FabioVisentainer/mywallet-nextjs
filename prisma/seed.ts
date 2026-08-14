import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { wallets, assets } from "../src/mocks/seed/wallets";
import { goals } from "../src/mocks/seed/goals";
import { articles } from "../src/mocks/seed/articles";
import { users, activity } from "../src/mocks/seed/users";
import { transactions } from "../src/mocks/seed/transactions";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.activityEntry.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.article.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();

  for (const w of wallets) await prisma.wallet.create({ data: w });
  for (const a of assets) await prisma.asset.create({ data: a });
  for (const g of goals) await prisma.goal.create({ data: g });
  for (const a of articles) await prisma.article.create({ data: a });
  for (const t of transactions) await prisma.transaction.create({ data: t });

  for (const u of users) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: hashPassword(u.password),
        role: u.role,
        status: u.status,
        perms: u.perms,
        since: u.since,
        lastAccess: u.last,
        activity: { create: (activity[u.id] || []).map((entry) => ({ text: entry.text, when: entry.when })) },
      },
    });
  }

  console.log(
    `Seeded ${wallets.length} wallets, ${assets.length} assets, ${goals.length} goals, ${articles.length} articles, ${transactions.length} transactions, ${users.length} users.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

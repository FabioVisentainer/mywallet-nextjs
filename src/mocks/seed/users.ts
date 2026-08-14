// Seed data for the User + ActivityEntry tables — consumed only by prisma/seed.ts.
// `password` is a PLAINTEXT demo password, only ever read by the seed script to
// produce a hashed passwordHash (see src/lib/password.ts). It is never stored as-is.
// Every seeded account shares the same demo password for convenience: demo1234

export const users = [
  { id: "u1", name: "Ana Souza", email: "ana.souza@mywallet.io", password: "demo1234", role: "Investor", status: "Active", last: "2026-08-11", since: "Mar 2024", perms: "Wallets, goals, market data" },
  { id: "u2", name: "Rafael Prado", email: "rafael.prado@mywallet.io", password: "demo1234", role: "Analyst", status: "Active", last: "2026-08-11", since: "Sep 2023", perms: "Publish news, market data" },
  { id: "u3", name: "Marcos Lima", email: "marcos.lima@mywallet.io", password: "demo1234", role: "Administrator", status: "Active", last: "2026-08-10", since: "Jan 2023", perms: "Full system access" },
  { id: "u4", name: "Beatriz Nunes", email: "bia.nunes@gmail.com", password: "demo1234", role: "Investor", status: "Active", last: "2026-08-09", since: "Nov 2025", perms: "Wallets, goals, market data" },
  { id: "u5", name: "Caio Ferreira", email: "caio.f@outlook.com", password: "demo1234", role: "Investor", status: "Suspended", last: "2026-06-21", since: "Feb 2025", perms: "Read only" },
  { id: "u6", name: "Helena Rocha", email: "helena.rocha@mywallet.io", password: "demo1234", role: "Analyst", status: "Active", last: "2026-08-07", since: "May 2024", perms: "Publish news, market data" },
  { id: "u7", name: "Diego Martins", email: "diego.martins@gmail.com", password: "demo1234", role: "Investor", status: "Pending", last: "—", since: "Aug 2026", perms: "Awaiting email confirmation" },
  { id: "u8", name: "Larissa Alves", email: "larissa.alves@uol.com.br", password: "demo1234", role: "Investor", status: "Active", last: "2026-08-11", since: "Jun 2025", perms: "Wallets, goals, market data" },
];

export const activity: Record<string, { text: string; when: string }[]> = {
  u1: [
    { text: "Added PETR4 to Core Equity", when: "2026-08-11 09:40" },
    { text: "Signed in from São Paulo, BR", when: "2026-08-11 08:12" },
    { text: "Account created", when: "2024-03-02 10:05" },
  ],
  u2: [
    { text: "Published “Copom holds Selic at 9.25%”", when: "2026-08-10 09:12" },
    { text: "Signed in from São Paulo, BR", when: "2026-08-11 08:40" },
    { text: "Permission “Moderate news” denied by policy", when: "2026-07-30 16:02" },
    { text: "Account created", when: "2023-09-04 11:20" },
  ],
  u3: [
    { text: "Changed role for Helena Rocha to Analyst", when: "2026-08-10 14:55" },
    { text: "Signed in from Rio de Janeiro, BR", when: "2026-08-10 08:03" },
    { text: "Account created", when: "2023-01-15 09:00" },
  ],
  u4: [{ text: "Signed in from Curitiba, BR", when: "2026-08-09 19:22" }, { text: "Account created", when: "2025-11-03 12:40" }],
  u5: [{ text: "Account suspended by policy", when: "2026-06-21 10:00" }, { text: "Account created", when: "2025-02-11 08:30" }],
  u6: [{ text: "Signed in from Belo Horizonte, BR", when: "2026-08-07 07:55" }, { text: "Account created", when: "2024-05-20 13:10" }],
  u7: [{ text: "Account created — email confirmation pending", when: "2026-08-05 17:44" }],
  u8: [{ text: "Signed in from Fortaleza, BR", when: "2026-08-11 06:30" }, { text: "Account created", when: "2025-06-18 09:15" }],
};

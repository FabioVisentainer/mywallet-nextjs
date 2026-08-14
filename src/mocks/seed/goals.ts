// Seed data for the Goal table — consumed only by prisma/seed.ts.

export const goals = [
  { id: "g1", name: "Emergency fund", target: 30000, current: 21400, due: "Dec 2026" },
  { id: "g2", name: "Apartment down payment", target: 120000, current: 43750, due: "Jun 2029" },
  { id: "g3", name: "Sabbatical year", target: 45000, current: 12900, due: "Mar 2028" },
];

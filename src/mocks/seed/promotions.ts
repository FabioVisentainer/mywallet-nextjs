// Seed data for the Promotion table — consumed only by prisma/seed.ts.
// Cadastradas por Marcos Lima (u3, Administrator) a partir da tela de gestão de promoções.

export const promotions = [
  {
    id: "promo1",
    planName: "Platinum",
    title: "Black Friday — 30% off",
    description: "30% discount on the first 3 months of Platinum, offered to investors who haven't upgraded yet.",
    discountPct: 30,
    startsAt: "2026-11-20",
    endsAt: "2026-11-30",
    active: true,
    createdBy: "u3",
  },
  {
    id: "promo2",
    planName: "Black",
    title: "Upgrade anual com desconto",
    description: "15% de desconto para quem migrar do Platinum para o Black pagando o plano anual.",
    discountPct: 15,
    startsAt: "2026-09-01",
    endsAt: "2026-09-30",
    active: true,
    createdBy: "u3",
  },
];

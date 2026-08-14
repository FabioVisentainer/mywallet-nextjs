import type { PlanName } from "@/modules/core/types";

export interface PlanDef {
  name: PlanName;
  price: string;
  per: string;
  tagline: string;
  features: string[];
  recommended?: boolean;
  dark?: boolean;
}

export const planDefs: PlanDef[] = [
  {
    name: "Standard",
    price: "$0",
    per: "free forever",
    tagline: "Everything you need to start organising your portfolio.",
    features: [
      "Up to 2 wallets",
      "Daily closing quotes",
      "Charts with filters up to 12 months",
      "Investor profile test",
      "Public news portal",
    ],
  },
  {
    name: "Platinum",
    price: "$9.90",
    per: "/ month",
    recommended: true,
    tagline: "For investors tracking a real, growing portfolio.",
    features: [
      "Unlimited wallets",
      "Real-time quotes",
      "All period filters, including full history",
      "Indicators in USD, EUR, GBP and CAD",
      "Financial goals",
      "Complete transaction and swap history",
    ],
  },
  {
    name: "Black",
    price: "$24.90",
    per: "/ month",
    dark: true,
    tagline: "Everything in Platinum, plus the analyst desk.",
    features: [
      "Everything in Platinum",
      "Personalised analyst recommendations",
      "Exclusive research and content",
      "Report export in PDF and CSV",
      "Early access to new features",
      "Dedicated support",
    ],
  },
];

export const planMatrixDefs: [string, string, string, string][] = [
  ["Wallets", "2", "Unlimited", "Unlimited"],
  ["Quote updates", "Daily", "Real time", "Real time"],
  ["Chart period filters", "Up to 12m", "All periods", "All periods"],
  ["Investor profile test", "✓", "✓", "✓"],
  ["Public news portal", "✓", "✓", "✓"],
  ["Multi-currency indicators", "—", "✓", "✓"],
  ["Financial goals", "—", "✓", "✓"],
  ["Transaction & swap history", "—", "✓", "✓"],
  ["Personalised analyst calls", "—", "—", "✓"],
  ["Exclusive research", "—", "—", "✓"],
  ["Report export (PDF / CSV)", "—", "—", "✓"],
  ["Dedicated support", "—", "—", "✓"],
];

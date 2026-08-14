export interface QuizQuestion {
  q: string;
  o: string[];
}

export const quiz: QuizQuestion[] = [
  { q: "How would you describe your experience with investments?", o: ["I am starting now", "I have invested for 1–3 years", "I have invested for 3–10 years", "I trade professionally"] },
  { q: "What share of your income can you invest each month?", o: ["Up to 5%", "Between 5% and 15%", "Between 15% and 30%", "More than 30%"] },
  { q: "When do you expect to use this money?", o: ["Within 12 months", "In 1 to 3 years", "In 3 to 10 years", "Only at retirement"] },
  { q: "Your portfolio drops 20% in a month. What do you do?", o: ["Sell everything", "Sell part of it", "Hold and wait", "Buy more at lower prices"] },
  { q: "How much of your wealth is in emergency reserves?", o: ["None yet", "Less than 3 months of expenses", "3 to 6 months", "More than 6 months"] },
  { q: "Which statement fits you best?", o: ["Preserving capital comes first", "Small losses are acceptable", "I accept swings for higher returns", "I seek maximum return, whatever the risk"] },
  { q: "Have you invested in crypto or derivatives before?", o: ["Never", "Only small amounts", "Regularly", "They are a core part of my portfolio"] },
  { q: "How often do you review your portfolio?", o: ["Rarely", "Every few months", "Monthly", "Weekly or more"] },
];

export interface Allocation {
  label: string;
  pct: string;
  color: string;
}

export interface InvestorProfile {
  name: string;
  short: string;
  range: string;
  summary: string;
  alloc: Allocation[];
}

export const profiles: Record<"Conservative" | "Moderate" | "Aggressive", InvestorProfile> = {
  Conservative: {
    name: "Conservative",
    short: "Protects capital above all. Accepts lower returns to avoid losses.",
    range: "Score 0–39",
    summary:
      "You prioritise capital preservation and predictable returns. Short-term losses bother you more than missing an upside, so the portfolio leans on fixed income and highly liquid positions.",
    alloc: [
      { label: "Fixed income & cash", pct: "70%", color: "#2563EB" },
      { label: "Brazilian equities", pct: "18%", color: "#12B76A" },
      { label: "International equities", pct: "10%", color: "#6938EF" },
      { label: "Crypto", pct: "2%", color: "#F79009" },
    ],
  },
  Moderate: {
    name: "Moderate",
    short: "Balances growth and safety, tolerating some volatility.",
    range: "Score 40–69",
    summary:
      "You accept short-term volatility in exchange for higher long-term returns, but you keep a meaningful share of the portfolio in liquid, low-risk positions.",
    alloc: [
      { label: "Fixed income & cash", pct: "40%", color: "#2563EB" },
      { label: "Brazilian equities", pct: "32%", color: "#12B76A" },
      { label: "International equities", pct: "18%", color: "#6938EF" },
      { label: "Crypto", pct: "10%", color: "#F79009" },
    ],
  },
  Aggressive: {
    name: "Aggressive",
    short: "Chases maximum return and lives with deep drawdowns.",
    range: "Score 70–100",
    summary:
      "You are comfortable with sharp drawdowns and concentrate on assets with higher expected return. Liquidity and stability matter less than long-term growth.",
    alloc: [
      { label: "Fixed income & cash", pct: "15%", color: "#2563EB" },
      { label: "Brazilian equities", pct: "38%", color: "#12B76A" },
      { label: "International equities", pct: "27%", color: "#6938EF" },
      { label: "Crypto", pct: "20%", color: "#F79009" },
    ],
  },
};

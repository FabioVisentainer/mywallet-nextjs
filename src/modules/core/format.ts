export function usd(n: number, d?: number): string {
  const digits = d === undefined ? 2 : d;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function cur(n: number, code: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function num(n: number, d: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(n);
}

export function pctStr(n: number): string {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

export function posColor(n: number): string {
  return n >= 0 ? "#067647" : "#B42318";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

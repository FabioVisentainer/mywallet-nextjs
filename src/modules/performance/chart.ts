import {pctStr, usd} from "@/modules/core/format";

export interface MarketSeries {
  months: string[];
  series: number[];
  benchSeries: number[];
}

export interface ChartGridLine {
  y: string;
  topPct: string;
  label: string;
}

export interface ChartPoint {
  i: number;
  x: string;
  y: string;
  bx: string;
  bw: string;
  label: string;
  value: string;
  benchV: string;
  change: string;
  chgColor: string;
  left: string;
  top: string;
}

export interface ChartResult {
  line: string;
  area: string;
  bench: string;
  grid: ChartGridLine[];
  points: ChartPoint[];
  xlabels: { x: string; leftPct: string; label: string }[];
  data: number[];
  labels: string[];
}

export function buildChart(raw: MarketSeries, n: number, H: number): ChartResult {
  const all = raw.series;
  const len = all.length;
  const start = Math.max(0, len - n);
  const data = all.slice(start);
  const bench = raw.benchSeries.slice(start);
  const labels = raw.months.slice(start);
  const min = Math.min(...data, ...bench);
  const max = Math.max(...data, ...bench);
  const pad = (max - min) * 0.2 || 1;
  const lo = min - pad;
  const hi = max + pad;
  const W = 920;
  const L = 52;
  const R = 16;
  const T = 18;
  const B = H > 280 ? 40 : 34;
  const X = (i: number) => L + (data.length === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (data.length - 1));
  const Y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);

  const line = data.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join(" ");
  const benchPath = bench.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join(" ");
  const area =
    line +
    " L" + X(data.length - 1).toFixed(1) + " " + (H - B).toFixed(1) +
    " L" + X(0).toFixed(1) + " " + (H - B).toFixed(1) + " Z";

  const grid: ChartGridLine[] = [];
  for (let k = 0; k <= 4; k++) {
    const v = lo + (hi - lo) * (k / 4);
    const y = Y(v);
    grid.push({ y: y.toFixed(1), topPct: ((y / H) * 100).toFixed(2) + "%", label: Math.round(v) + "k" });
  }

  const band = data.length > 1 ? X(1) - X(0) : W - L - R;
  const points: ChartPoint[] = data.map((v, i) => ({
    i,
    x: X(i).toFixed(1),
    y: Y(v).toFixed(1),
    bx: (X(i) - band / 2).toFixed(1),
    bw: band.toFixed(1),
    label: labels[i],
    value: usd(v * 1000, 0),
    benchV: usd(bench[i] * 1000, 0),
    change: i > 0 ? pctStr((v / data[i - 1] - 1) * 100) : "—",
    chgColor: i > 0 ? (v >= data[i - 1] ? "#75E0A7" : "#FDA29B") : "#C3CCDA",
    left: ((X(i) / W) * 100).toFixed(2) + "%",
    top: ((Y(v) / H) * 100).toFixed(2) + "%",
  }));

  const every = Math.max(1, Math.ceil(data.length / 7));
  const xlabels = points
    .filter((p) => p.i % every === 0)
    .map((p) => ({ x: p.x, leftPct: ((parseFloat(p.x) / W) * 100).toFixed(2) + "%", label: p.label }));

  return { line, area, bench: benchPath, grid, points, xlabels, data, labels };
}

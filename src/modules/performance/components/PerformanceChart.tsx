"use client";

import { useId } from "react";
import type { ChartResult } from "../chart";

interface Props {
  chart: ChartResult;
  height: number;
  interactive?: boolean;
  hoverIdx?: number | null;
  onHover?: (i: number | null) => void;
}

export function PerformanceChart({ chart, height, interactive, hoverIdx, onHover }: Props) {
  const gradId = useId();
  const hp = interactive && hoverIdx !== null && hoverIdx !== undefined ? chart.points[hoverIdx] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 920 ${height}`} className="block w-full h-auto">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
        </defs>
        {chart.grid.map((g, i) => (
          <line key={i} x1="52" x2="904" y1={g.y} y2={g.y} stroke="#EEF0F3" strokeWidth={1} />
        ))}
        <path d={chart.area} fill={`url(#${gradId})`} />
        {interactive && <path d={chart.bench} fill="none" stroke="#98A2B3" strokeWidth={1.8} strokeDasharray="5 5" />}
        <path d={chart.line} fill="none" stroke="#2563EB" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {hp && (
          <>
            <line x1={hp.x} x2={hp.x} y1="18" y2={height - 34} stroke="#2563EB" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={hp.x} cy={hp.y} r={6} fill="#fff" stroke="#2563EB" strokeWidth={3} />
          </>
        )}
        {interactive &&
          chart.points.map((p) => (
            <rect
              key={p.i}
              x={p.bx}
              y={10}
              width={p.bw}
              height={height - 30}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseEnter={() => onHover?.(p.i)}
              onMouseLeave={() => onHover?.(null)}
            />
          ))}
      </svg>

      {chart.grid.map((g, i) => (
        <div
          key={i}
          className="absolute left-0 w-[5%] text-right -translate-y-[130%] font-mono text-[11px] text-[var(--color-text-faint)] pointer-events-none"
          style={{ top: g.topPct }}
        >
          {g.label}
        </div>
      ))}
      {chart.xlabels.map((l, i) => (
        <div
          key={i}
          className="absolute bottom-0 -translate-x-1/2 text-[11px] whitespace-nowrap text-[var(--color-text-faint)] pointer-events-none"
          style={{ left: l.leftPct }}
        >
          {l.label}
        </div>
      ))}

      {hp && (
        <div
          className="absolute -translate-x-1/2 -translate-y-[118%] bg-[var(--color-ink)] text-white rounded-[10px] px-3 py-2.5 min-w-[150px] pointer-events-none shadow-[0_8px_24px_rgba(17,26,43,.22)]"
          style={{ left: hp.left, top: hp.top }}
        >
          <div className="text-[11px] font-semibold text-[var(--color-ink-muted)]">{hp.label}</div>
          <div className="font-mono text-base font-semibold mt-0.5">{hp.value}</div>
          <div className="flex justify-between gap-3 mt-1.5 text-[11px]">
            <span className="text-[var(--color-ink-muted-2)]">Benchmark</span>
            <span className="font-mono text-[var(--color-ink-muted-5)]">{hp.benchV}</span>
          </div>
          <div className="flex justify-between gap-3 mt-0.5 text-[11px]">
            <span className="text-[var(--color-ink-muted-2)]">Month change</span>
            <span className="font-mono" style={{ color: hp.chgColor }}>
              {hp.change}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

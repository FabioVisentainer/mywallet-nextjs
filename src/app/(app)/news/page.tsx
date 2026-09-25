"use client";

import {useState} from "react";
import {AppPage} from "@/modules/core/layout/AppPage";
import {Loading} from "@/modules/core/layout/Loading";
import {Badge, Card} from "@fabiovisentainer/design-system";
import {useNews} from "@/modules/news/NewsContext";
import {useAnalystCalls} from "@/modules/news/useAnalystCalls";

const categories = ["All", "Macro", "Equities", "Crypto", "Markets"];

export default function NewsPage() {
  const { articles, loading } = useNews();
  const { calls: analystCalls, loading: callsLoading } = useAnalystCalls();
  const [cat, setCat] = useState("All");

  if (loading || callsLoading) {
    return (
      <AppPage title="News portal" subtitle="Coverage published by certified analysts">
        <Loading />
      </AppPage>
    );
  }

  const published = articles.filter((a) => a.status === "Published");
  const filtered = cat === "All" ? published : published.filter((a) => a.category === cat);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <AppPage title="News portal" subtitle="Coverage published by certified analysts">
      <div className="flex flex-col gap-4.5 max-w-[1100px]">
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => {
            const on = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="h-8 px-3.5 rounded-full border text-[13px] font-semibold cursor-pointer"
                style={{ borderColor: on ? "var(--color-ink)" : "var(--color-border)", background: on ? "var(--color-ink)" : "#fff", color: on ? "#fff" : "var(--color-text-muted-2)" }}
              >
                {c}
              </button>
            );
          })}
        </div>

        {featured && (
          <div className="bg-[var(--color-ink)] rounded-2xl p-7.5 text-white grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-7 items-center">
            <div className="flex flex-col gap-3.5">
              <div className="flex gap-2 items-center">
                <Badge uppercase style={{ background: "var(--color-ink-2)", color: "#9FC1FF", border: "1px solid var(--color-ink-border-2)" }}>
                  {featured.category}
                </Badge>
                <span className="text-xs text-[var(--color-ink-muted-2)]">
                  {featured.date} · {featured.read}
                </span>
              </div>
              <div className="text-[30px] font-extrabold tracking-tight leading-[1.2] text-pretty">{featured.title}</div>
              <div className="text-[15px] leading-relaxed text-[var(--color-ink-muted-5)]">{featured.summary}</div>
              <div className="flex items-center gap-2.5 mt-1">
                <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] grid place-items-center text-xs font-bold">RP</div>
                <div className="text-[13px]">
                  <span className="font-bold">{featured.author}</span>
                  <span className="text-[var(--color-ink-muted-2)]"> · Certified analyst</span>
                </div>
              </div>
            </div>
            <div className="border border-[var(--color-ink-border)] rounded-2xl p-5 flex flex-col gap-3.5">
              <div className="text-xs text-[var(--color-ink-muted-2)] font-bold uppercase tracking-wide">Analyst call</div>
              {analystCalls.map((c) => (
                <div key={c.ticker} className="flex justify-between items-center pb-2.5 border-b border-[var(--color-ink-2)]">
                  <div>
                    <div className="font-mono text-sm font-semibold">{c.ticker}</div>
                    <div className="text-[11px] text-[var(--color-ink-muted-2)]">Target {c.target}</div>
                  </div>
                  <Badge style={{ background: c.bg, color: c.fg }}>{c.rating}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {rest.map((n) => (
            <Card key={n.id} className="flex flex-col gap-2.5">
              <div className="flex gap-2 items-center">
                <Badge tone="brand" uppercase>
                  {n.category}
                </Badge>
                <span className="text-xs text-[var(--color-text-faint)]">{n.date}</span>
              </div>
              <div className="text-base font-bold leading-snug tracking-tight text-pretty">{n.title}</div>
              <div className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">{n.summary}</div>
              <div className="flex justify-between items-center mt-auto pt-3 border-t border-[var(--color-border-3)] text-xs text-[var(--color-text-muted)]">
                <span>{n.author}</span>
                <span>{n.read}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppPage>
  );
}

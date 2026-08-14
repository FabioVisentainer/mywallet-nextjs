"use client";

import { AppPage } from "@/modules/core/components/AppPage";
import { Loading } from "@/modules/core/components/Loading";
import { Card } from "@/modules/core/components/Card";
import { Badge } from "@/modules/core/components/Badge";
import { Button } from "@/modules/core/components/Button";
import { useNews } from "@/modules/news/NewsContext";
import { useConfirm } from "@/modules/core/ConfirmContext";
import { useToast } from "@/modules/core/ToastContext";
import { num } from "@/modules/core/format";

export default function AnalystStudioPage() {
  const { articles, loading, deleteArticle } = useNews();
  const { askConfirm } = useConfirm();
  const { showToast } = useToast();

  if (loading) {
    return (
      <AppPage title="Analyst studio" subtitle="Publish and manage market coverage">
        <Loading />
      </AppPage>
    );
  }

  const published = articles.filter((a) => a.status === "Published");
  const drafts = articles.length - published.length;

  const stats = [
    { label: "Published", value: String(published.length) },
    { label: "Drafts", value: String(drafts) },
    { label: "Views this month", value: "11,909" },
    { label: "Avg. read time", value: "5.2 min" },
  ];

  return (
    <AppPage title="Analyst studio" subtitle="Publish and manage market coverage">
      <div className="flex flex-col gap-4 max-w-[1160px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {stats.map((s) => (
            <Card key={s.label} padding="p-4.5">
              <div className="text-xs text-[var(--color-text-muted)] font-semibold">{s.label}</div>
              <div className="font-mono text-xl font-semibold mt-1.5">{s.value}</div>
            </Card>
          ))}
        </div>

        <Card padding="p-0" className="overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4.5 border-b border-[var(--color-border)]">
            <div className="text-[15px] font-bold">Your articles</div>
            <Button href="/analyst/new" size="sm">
              + New article
            </Button>
          </div>
          <div
            className="grid gap-3 px-5 py-2.5 bg-[var(--color-card-alt)] border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide"
            style={{ gridTemplateColumns: "2.6fr 1fr 1fr 0.8fr 150px" }}
          >
            <div>Title</div>
            <div>Category</div>
            <div>Published</div>
            <div className="text-right">Views</div>
            <div />
          </div>
          {articles.map((a) => (
            <div
              key={a.id}
              className="grid gap-3 px-5 py-3.5 border-b border-[var(--color-border-3)] items-center hover:bg-[var(--color-card-alt)]"
              style={{ gridTemplateColumns: "2.6fr 1fr 1fr 0.8fr 150px" }}
            >
              <div className="flex items-center gap-2.5">
                <Badge tone={a.status === "Published" ? "success" : "neutral"}>{a.status}</Badge>
                <span className="text-sm font-semibold">{a.title}</span>
              </div>
              <div className="text-[13px] text-[var(--color-text-muted-2)]">{a.category}</div>
              <div className="font-mono text-xs text-[var(--color-text-muted-2)]">{a.date}</div>
              <div className="text-right font-mono text-[13px]">{num(a.views, 0)}</div>
              <div className="flex gap-1.5 justify-end">
                <Button href={`/analyst/${a.id}`} variant="secondary" size="xs">
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="xs"
                  onClick={() =>
                    askConfirm({
                      title: "Delete this article?",
                      body: "It is removed from the public feed immediately. Readers with the direct link will get a 404.",
                      detail: a.title,
                      cta: "Delete article",
                      onConfirm: () => {
                        deleteArticle(a.id)
                          .then(() => showToast("Article deleted."))
                          .catch(() => showToast("Could not delete the article.", "err"));
                      },
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </AppPage>
  );
}

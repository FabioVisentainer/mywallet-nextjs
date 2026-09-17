"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppPage } from "@/modules/core/layout/AppPage";
import { Loading } from "@/modules/core/layout/Loading";
import { ArticleForm } from "@/modules/news/components/ArticleForm";
import { useNews } from "@/modules/news/NewsContext";

export default function EditArticlePage({ params }: PageProps<"/analyst/[id]">) {
  const { id } = use(params);
  const { loading, getArticle } = useNews();
  const router = useRouter();
  const article = getArticle(id);

  useEffect(() => {
    if (!loading && !article) router.replace("/analyst");
  }, [loading, article, router]);

  if (loading) {
    return (
      <AppPage title="Edit article" backHref="/analyst">
        <Loading />
      </AppPage>
    );
  }
  if (!article) return null;

  return (
    <AppPage title="Edit article" subtitle="All fields marked with * are required" backHref="/analyst">
      <ArticleForm
        mode="edit"
        articleId={id}
        initial={{
          title: article.title,
          category: article.category,
          ticker: "",
          rating: "None",
          summary: article.summary,
          body: article.body || article.summary + " Full text continues here with the analyst commentary, charts and disclosure notes.",
        }}
      />
    </AppPage>
  );
}

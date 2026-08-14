"use client";

import { AppPage } from "@/modules/core/components/AppPage";
import { ArticleForm } from "@/modules/news/components/ArticleForm";

export default function NewArticlePage() {
  return (
    <AppPage title="New article" subtitle="All fields marked with * are required" backHref="/analyst">
      <ArticleForm mode="new" initial={{ title: "", category: "", ticker: "", rating: "None", summary: "", body: "" }} />
    </AppPage>
  );
}

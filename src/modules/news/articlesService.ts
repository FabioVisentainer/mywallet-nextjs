import {apiFetch} from "@/services/apiClient";
import type {Article, ArticleInput} from "./types";

/** Service (proxy de API) do módulo news — única porta de saída pra /api/articles. */
export const articlesService = {
  list() {
    return apiFetch<{ articles: Article[] }>("/api/articles");
  },
  create(input: ArticleInput, status: "Published" | "Draft") {
    return apiFetch<{ article: Article }>("/api/articles", { method: "POST", body: JSON.stringify({ ...input, status }) });
  },
  update(id: string, input: ArticleInput, status: "Published" | "Draft") {
    return apiFetch<{ article: Article }>(`/api/articles/${id}`, { method: "PATCH", body: JSON.stringify({ ...input, status }) });
  },
  remove(id: string) {
    return apiFetch(`/api/articles/${id}`, { method: "DELETE" });
  },
};

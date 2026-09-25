import {articleRepository} from "@/server/repositories/articleRepository";

export interface ArticleInput {
  title: string;
  category: string;
  summary: string;
  body: string;
  status: "Published" | "Draft";
}

/** Service — regra de negócio de Article. Rascunho (Draft) não exige campos preenchidos; Published exige. */
export const articleService = {
  list() {
    return articleRepository.list();
  },

  findById(id: string) {
    return articleRepository.findById(id);
  },

  validate(input: ArticleInput): Record<string, string> {
    const errors: Record<string, string> = {};
    if (input.status !== "Published") return errors;
    if (!input.title) errors.title = "A headline is required.";
    if (!input.category) errors.category = "Choose a category.";
    if (!input.summary) errors.summary = "Write a short summary for the feed.";
    if (!input.body) errors.body = "The article body cannot be empty.";
    return errors;
  },

  create(input: ArticleInput) {
    return articleRepository.create({
      id: "n" + Date.now(),
      title: input.title,
      category: input.category,
      date: input.status === "Published" ? "2026-08-11" : "\u2014",
      views: 0,
      status: input.status,
      author: "Rafael Prado",
      read: input.status === "Published" ? "4 min read" : "3 min read",
      summary: input.summary,
      body: input.body || null,
    });
  },

  update(id: string, input: ArticleInput) {
    return articleRepository.update(id, {
      title: input.title,
      category: input.category,
      summary: input.summary,
      body: input.body || null,
      status: input.status,
    });
  },

  remove(id: string) {
    return articleRepository.remove(id);
  },
};

"use client";

import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import type {Article, ArticleInput} from "./types";
import {articlesService} from "./articlesService";

interface NewsContextValue {
  articles: Article[];
  loading: boolean;
  getArticle: (id: string) => Article | undefined;
  createArticle: (input: ArticleInput) => Promise<void>;
  updateArticle: (id: string, input: ArticleInput) => Promise<void>;
  saveDraft: (id: string | undefined, input: ArticleInput) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
}

const NewsContext = createContext<NewsContextValue | null>(null);

export function NewsProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articlesService
      .list()
      .then((data) => setArticles(data.articles))
      .finally(() => setLoading(false));
  }, []);

  const getArticle = useCallback((id: string) => articles.find((a) => a.id === id), [articles]);

  const createArticle = useCallback(async (input: ArticleInput) => {
    const { article } = await articlesService.create(input, "Published");
    setArticles((arts) => arts.concat([article]));
  }, []);

  const updateArticle = useCallback(async (id: string, input: ArticleInput) => {
    const { article } = await articlesService.update(id, input, "Published");
    setArticles((arts) => arts.map((a) => (a.id === id ? article : a)));
  }, []);

  const saveDraft = useCallback(async (id: string | undefined, input: ArticleInput) => {
    if (id) {
      const { article } = await articlesService.update(id, input, "Draft");
      setArticles((arts) => arts.map((a) => (a.id === id ? article : a)));
    } else {
      const { article } = await articlesService.create(input, "Draft");
      setArticles((arts) => arts.concat([article]));
    }
  }, []);

  const deleteArticle = useCallback(async (id: string) => {
    await articlesService.remove(id);
    setArticles((arts) => arts.filter((a) => a.id !== id));
  }, []);

  const value = useMemo<NewsContextValue>(
    () => ({ articles, loading, getArticle, createArticle, updateArticle, saveDraft, deleteArticle }),
    [articles, loading, getArticle, createArticle, updateArticle, saveDraft, deleteArticle]
  );

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
}

export function useNews(): NewsContextValue {
  const ctx = useContext(NewsContext);
  if (!ctx) throw new Error("useNews must be used within NewsProvider");
  return ctx;
}

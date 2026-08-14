export type ArticleStatus = "Published" | "Draft";

export interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  views: number;
  status: ArticleStatus;
  author: string;
  read: string;
  summary: string;
  body?: string;
}

export interface ArticleInput {
  title: string;
  category: string;
  ticker: string;
  rating: string;
  summary: string;
  body: string;
}

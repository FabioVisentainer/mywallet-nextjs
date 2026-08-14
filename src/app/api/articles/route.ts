import { prisma } from "@/lib/prisma";

export async function GET() {
  const articles = await prisma.article.findMany({ orderBy: { date: "desc" } });
  return Response.json({ articles });
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = String(body.title || "").trim();
  const category = String(body.category || "").trim();
  const summary = String(body.summary || "").trim();
  const articleBody = String(body.body || "").trim();
  const status: "Published" | "Draft" = body.status === "Draft" ? "Draft" : "Published";

  if (status === "Published") {
    const errors: Record<string, string> = {};
    if (!title) errors.title = "A headline is required.";
    if (!category) errors.category = "Choose a category.";
    if (!summary) errors.summary = "Write a short summary for the feed.";
    if (!articleBody) errors.body = "The article body cannot be empty.";
    if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });
  }

  const article = await prisma.article.create({
    data: {
      id: "n" + Date.now(),
      title,
      category,
      date: status === "Published" ? "2026-08-11" : "—",
      views: 0,
      status,
      author: "Rafael Prado",
      read: status === "Published" ? "4 min read" : "3 min read",
      summary,
      body: articleBody || null,
    },
  });
  return Response.json({ article });
}

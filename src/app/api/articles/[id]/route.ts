import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ article });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const article = await prisma.article.update({
    where: { id },
    data: { title, category, summary, body: articleBody || null, status },
  });
  return Response.json({ article });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.article.delete({ where: { id } });
  return Response.json({ ok: true });
}

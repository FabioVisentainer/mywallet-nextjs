import { articleService, type ArticleInput } from "@/server/services/articleService";

function parseInput(body: Record<string, unknown>): ArticleInput {
  return {
    title: String(body.title || "").trim(),
    category: String(body.category || "").trim(),
    summary: String(body.summary || "").trim(),
    body: String(body.body || "").trim(),
    status: body.status === "Draft" ? "Draft" : "Published",
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await articleService.findById(id);
  if (!article) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ article });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = parseInput(await request.json());

  const errors = articleService.validate(input);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const article = await articleService.update(id, input);
  return Response.json({ article });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await articleService.remove(id);
  return Response.json({ ok: true });
}

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

export async function GET() {
  const articles = await articleService.list();
  return Response.json({ articles });
}

export async function POST(request: Request) {
  const input = parseInput(await request.json());

  const errors = articleService.validate(input);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const article = await articleService.create(input);
  return Response.json({ article });
}

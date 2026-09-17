import { transactionService, type TransactionInput } from "@/server/services/transactionService";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const input: TransactionInput = {
    date: String(body.date || "").trim(),
    type: String(body.type || "").trim(),
    asset: String(body.asset || "").trim(),
    wallet: String(body.wallet || "").trim(),
    qty: String(body.qty || "").trim(),
    price: parseFloat(String(body.price)),
  };

  const errors = transactionService.validate(input);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const transaction = await transactionService.update(id, input);
  return Response.json({ transaction });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await transactionService.remove(id);
  return Response.json({ ok: true });
}

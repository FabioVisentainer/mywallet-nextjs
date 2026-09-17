import { prisma } from "@/lib/prisma";

const TX_TYPES = ["Buy", "Sell", "Swap", "Deposit"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const date = String(body.date || "").trim();
  const type = String(body.type || "").trim();
  const asset = String(body.asset || "").trim();
  const wallet = String(body.wallet || "").trim();
  const qty = String(body.qty || "").trim();
  const price = parseFloat(String(body.price));

  const errors: Record<string, string> = {};
  if (!date) errors.date = "Set a date.";
  if (!TX_TYPES.includes(type)) errors.type = "Pick an operation type.";
  if (!asset) errors.asset = "Name the asset.";
  if (!wallet) errors.wallet = "Pick a wallet.";
  if (type !== "Deposit" && !qty) errors.qty = "Enter a quantity.";
  if (!(price >= 0)) errors.price = type === "Deposit" ? "Enter the deposit amount." : "Enter a unit price.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const qtyNum = parseFloat(qty.replace(/,/g, ""));
  let total = 0;
  if (type === "Deposit") total = price;
  else if (type === "Sell") total = qtyNum * price;
  else if (type === "Buy") total = -(qtyNum * price);

  const transaction = await prisma.transaction.update({
    where: { id },
    data: { date, type, asset, wallet, qty: type === "Deposit" && !qty ? "—" : qty, price, total },
  });
  return Response.json({ transaction });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.transaction.delete({ where: { id } });
  return Response.json({ ok: true });
}

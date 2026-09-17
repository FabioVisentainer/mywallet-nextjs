import { prisma } from "@/lib/prisma";
import { ValidatedCreateHandler } from "@/lib/validatedCreateHandler";

const TX_TYPES = ["Buy", "Sell", "Swap", "Deposit"];

interface TransactionCreateInput {
  date: string;
  type: string;
  asset: string;
  wallet: string;
  qty: string;
  price: number;
}

/**
 * TEMPLATE METHOD — passos variáveis para lançar uma transação manual (ver ValidatedCreateHandler).
 * O sinal do total segue a mesma convenção do dado semeado em mocks/seed/transactions.ts:
 * Buy debita (negativo), Sell/Deposit creditam (positivo), Swap não altera o total do livro-razão.
 * Isso é uma simplificação do lançamento manual — a importação de swaps da corretora
 * (POST /api/transactions/import) já lida com o total real de cada swap.
 */
class CreateTransactionHandler extends ValidatedCreateHandler<TransactionCreateInput, unknown> {
  protected parse(body: Record<string, unknown>): TransactionCreateInput {
    return {
      date: String(body.date || "").trim(),
      type: String(body.type || "").trim(),
      asset: String(body.asset || "").trim(),
      wallet: String(body.wallet || "").trim(),
      qty: String(body.qty || "").trim(),
      price: parseFloat(String(body.price)),
    };
  }

  protected validate(input: TransactionCreateInput) {
    const errors: Record<string, string> = {};
    if (!input.date) errors.date = "Set a date.";
    if (!TX_TYPES.includes(input.type)) errors.type = "Pick an operation type.";
    if (!input.asset) errors.asset = "Name the asset.";
    if (!input.wallet) errors.wallet = "Pick a wallet.";
    if (input.type !== "Deposit" && !input.qty) errors.qty = "Enter a quantity.";
    if (!(input.price >= 0)) errors.price = input.type === "Deposit" ? "Enter the deposit amount." : "Enter a unit price.";
    return errors;
  }

  protected async persist(input: TransactionCreateInput) {
    const qtyNum = parseFloat(input.qty.replace(/,/g, ""));
    let total = 0;
    if (input.type === "Deposit") total = input.price;
    else if (input.type === "Sell") total = qtyNum * input.price;
    else if (input.type === "Buy") total = -(qtyNum * input.price);
    // Swap keeps total at 0 for a manual entry — see the class comment.

    return prisma.transaction.create({
      data: {
        id: "tx" + Date.now(),
        date: input.date,
        type: input.type,
        asset: input.asset,
        wallet: input.wallet,
        qty: input.type === "Deposit" && !input.qty ? "—" : input.qty,
        price: input.price,
        total,
      },
    });
  }

  protected entityKey() {
    return "transaction";
  }
}

export async function GET() {
  const transactions = await prisma.transaction.findMany({ orderBy: { date: "desc" } });
  return Response.json({ transactions });
}

export async function POST(request: Request) {
  return new CreateTransactionHandler().handle(request);
}

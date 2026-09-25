import {ValidatedCreateHandler} from "@/server/controllers/validatedCreateHandler";
import {type TransactionInput, transactionService} from "@/server/services/transactionService";

/**
 * TEMPLATE METHOD — passos variáveis para lançar uma transação manual (ver ValidatedCreateHandler).
 * A regra de sinal do total vive em transactionService.computeTotal — ver o
 * comentário lá para a convenção (Buy debita, Sell/Deposit creditam, Swap manual = 0).
 */
class CreateTransactionHandler extends ValidatedCreateHandler<TransactionInput, unknown> {
  protected parse(body: Record<string, unknown>): TransactionInput {
    return {
      date: String(body.date || "").trim(),
      type: String(body.type || "").trim(),
      asset: String(body.asset || "").trim(),
      wallet: String(body.wallet || "").trim(),
      qty: String(body.qty || "").trim(),
      price: parseFloat(String(body.price)),
    };
  }

  protected validate(input: TransactionInput) {
    return transactionService.validate(input);
  }

  protected persist(input: TransactionInput) {
    return transactionService.create(input);
  }

  protected entityKey() {
    return "transaction";
  }
}

export async function GET() {
  const transactions = await transactionService.list();
  return Response.json({ transactions });
}

export async function POST(request: Request) {
  return new CreateTransactionHandler().handle(request);
}

import {ValidatedCreateHandler} from "@/server/controllers/validatedCreateHandler";
import {type TransactionInput, transactionService} from "@/server/services/transactionService";

/**
 * TEMPLATE METHOD: preenche os passos do ValidatedCreateHandler para lançar
 * uma transação manual. A regra do sinal do total fica em
 * transactionService.computeTotal (Buy debita, Sell e Deposit creditam, Swap
 * manual fica zero).
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

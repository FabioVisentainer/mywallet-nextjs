import {transactionRepository} from "@/server/repositories/transactionRepository";
import {MarketDataGateway} from "@/server/repositories/marketDataGateway";

const TX_TYPES = ["Buy", "Sell", "Swap", "Deposit"];

export interface TransactionInput {
  date: string;
  type: string;
  asset: string;
  wallet: string;
  qty: string;
  price: number;
}

/**
 * Service — regra de negócio de Transaction, incluindo a convenção de sinal
 * do total (ver comentário original em api/transactions/route.ts, preservado
 * aqui): Buy debita (negativo), Sell/Deposit creditam (positivo), Swap manual
 * mantém total = 0 — a importação de swap calcula o total real à parte.
 */
export const transactionService = {
  list() {
    return transactionRepository.list();
  },

  validate(input: TransactionInput): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!input.date) errors.date = "Set a date.";
    if (!TX_TYPES.includes(input.type)) errors.type = "Pick an operation type.";
    if (!input.asset) errors.asset = "Name the asset.";
    if (!input.wallet) errors.wallet = "Pick a wallet.";
    if (input.type !== "Deposit" && !input.qty) errors.qty = "Enter a quantity.";
    if (!(input.price >= 0)) errors.price = input.type === "Deposit" ? "Enter the deposit amount." : "Enter a unit price.";
    return errors;
  },

  computeTotal(type: string, qty: string, price: number): number {
    const qtyNum = parseFloat(qty.replace(/,/g, ""));
    if (type === "Deposit") return price;
    if (type === "Sell") return qtyNum * price;
    if (type === "Buy") return -(qtyNum * price);
    return 0; // Swap manual — ver comentário da classe.
  },

  create(input: TransactionInput) {
    const total = this.computeTotal(input.type, input.qty, input.price);
    return transactionRepository.create({
      id: "tx" + Date.now(),
      date: input.date,
      type: input.type,
      asset: input.asset,
      wallet: input.wallet,
      qty: input.type === "Deposit" && !input.qty ? "\u2014" : input.qty,
      price: input.price,
      total,
    });
  },

  update(id: string, input: TransactionInput) {
    const total = this.computeTotal(input.type, input.qty, input.price);
    return transactionRepository.update(id, {
      date: input.date,
      type: input.type,
      asset: input.asset,
      wallet: input.wallet,
      qty: input.type === "Deposit" && !input.qty ? "\u2014" : input.qty,
      price: input.price,
      total,
    });
  },

  remove(id: string) {
    return transactionRepository.remove(id);
  },

  async importSwap(swapId: string, walletName: string) {
    const already = await transactionRepository.findByExternalRef(swapId);
    if (already) return { error: "This swap has already been imported." as const };

    const swap = MarketDataGateway.getInstance().getBrokerSwapById(swapId);
    if (!swap) return { error: "not_found" as const };

    const price = MarketDataGateway.getInstance().getQuote(swap.toTicker, 0);
    const total = swap.toQty * price;

    const transaction = await transactionRepository.create({
      id: "tx" + Date.now(),
      date: swap.executedAt,
      type: "Swap",
      asset: `${swap.fromTicker} \u2192 ${swap.toTicker}`,
      wallet: walletName,
      qty: `${swap.fromQty} \u2192 ${swap.toQty}`,
      price,
      total,
      externalRef: swap.id,
    });
    return { transaction };
  },
};

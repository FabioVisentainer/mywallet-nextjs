import { walletRepository } from "@/server/repositories/walletRepository";
import { assetRepository } from "@/server/repositories/assetRepository";
import { MarketDataGateway } from "@/server/repositories/marketDataGateway";
import type { Asset } from "@/modules/wallets/types";

function serializeAsset(a: { id: string; ticker: string; name: string; type: string; qty: number; avg: number }): Asset {
  return {
    id: a.id,
    ticker: a.ticker,
    name: a.name,
    type: a.type as Asset["type"],
    qty: a.qty,
    avg: a.avg,
    price: MarketDataGateway.getInstance().getQuote(a.ticker, a.avg),
  };
}

/** Service — regra de negócio de Wallet/Asset; chama walletRepository/assetRepository, nunca o Prisma direto. */
export const walletService = {
  async list() {
    const wallets = await walletRepository.listWithAssets();
    const assets: Record<string, Asset[]> = {};
    for (const w of wallets) assets[w.id] = w.assets.map(serializeAsset);
    return {
      wallets: wallets.map(({ id, name, kind, icon, tint, tintFg, created }) => ({ id, name, kind, icon, tint, tintFg, created })),
      assets,
    };
  },

  async validateName(name: string, excludeId?: string): Promise<string | null> {
    if (name.length < 3) return "Use at least 3 characters.";
    const dup = await walletRepository.findByName(name, excludeId);
    if (dup) return "A wallet with this name already exists.";
    return null;
  },

  create(name: string) {
    return walletRepository.create({
      id: "w" + Date.now(),
      name,
      kind: "Custom",
      icon: "\u25c6",
      tint: "#FFF6ED",
      tintFg: "#B54708",
      created: "Aug 2026",
    });
  },

  update(id: string, name: string) {
    return walletRepository.update(id, { name });
  },

  remove(id: string) {
    return walletRepository.remove(id);
  },

  validateAsset(input: { ticker: string; name: string; qty: number; avg: number }): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!input.ticker) errors.ticker = "Ticker is required.";
    if (!input.name) errors.name = "Asset name is required.";
    if (!(input.qty > 0)) errors.qty = "Enter a quantity greater than zero.";
    if (!(input.avg > 0)) errors.avg = "Enter a valid average price.";
    return errors;
  },

  async createAsset(walletId: string, input: { ticker: string; name: string; qty: number; avg: number; type?: string }) {
    const created = await assetRepository.create({
      id: "a" + Date.now(),
      walletId,
      ticker: input.ticker.toUpperCase(),
      name: input.name,
      type: input.type || "Stock",
      qty: input.qty,
      avg: input.avg,
    });
    return serializeAsset(created);
  },

  async updateAsset(assetId: string, input: { ticker: string; name: string; qty: number; avg: number; type?: string }) {
    const updated = await assetRepository.update(assetId, {
      ticker: input.ticker.toUpperCase(),
      name: input.name,
      type: input.type || "Stock",
      qty: input.qty,
      avg: input.avg,
    });
    return serializeAsset(updated);
  },

  removeAsset(assetId: string) {
    return assetRepository.remove(assetId);
  },
};

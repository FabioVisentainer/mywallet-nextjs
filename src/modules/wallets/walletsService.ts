import {apiFetch} from "@/services/apiClient";
import type {Asset, AssetInput, Wallet} from "./types";

/** Service (proxy de API) do módulo wallets — única porta de saída pra /api/wallets. */
export const walletsService = {
  list() {
    return apiFetch<{ wallets: Wallet[]; assets: Record<string, Asset[]> }>("/api/wallets");
  },
  create(name: string) {
    return apiFetch<{ wallet: Wallet }>("/api/wallets", { method: "POST", body: JSON.stringify({ name }) });
  },
  rename(id: string, name: string) {
    return apiFetch<{ wallet: Wallet }>(`/api/wallets/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
  },
  remove(id: string) {
    return apiFetch(`/api/wallets/${id}`, { method: "DELETE" });
  },
  addAsset(walletId: string, input: AssetInput) {
    return apiFetch<{ asset: Asset }>(`/api/wallets/${walletId}/assets`, { method: "POST", body: JSON.stringify(input) });
  },
  updateAsset(walletId: string, assetId: string, input: AssetInput) {
    return apiFetch<{ asset: Asset }>(`/api/wallets/${walletId}/assets/${assetId}`, { method: "PATCH", body: JSON.stringify(input) });
  },
  removeAsset(walletId: string, assetId: string) {
    return apiFetch(`/api/wallets/${walletId}/assets/${assetId}`, { method: "DELETE" });
  },
};

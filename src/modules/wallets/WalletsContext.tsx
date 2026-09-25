"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Asset, AssetInput, Wallet } from "./types";
import { walletsService } from "./walletsService";

interface WalletsContextValue {
  wallets: Wallet[];
  assets: Record<string, Asset[]>;
  loading: boolean;
  getWallet: (id: string) => Wallet | undefined;
  getAssets: (walletId: string) => Asset[];
  getAsset: (walletId: string, assetId: string) => Asset | undefined;
  walletValue: (id: string) => number;
  walletCost: (id: string) => number;
  addWallet: (name: string) => Promise<Wallet>;
  renameWallet: (id: string, name: string) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  addAsset: (walletId: string, input: AssetInput) => Promise<void>;
  updateAsset: (walletId: string, assetId: string, input: AssetInput) => Promise<void>;
  deleteAsset: (walletId: string, assetId: string) => Promise<void>;
}

const WalletsContext = createContext<WalletsContextValue | null>(null);

export function WalletsProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [assets, setAssets] = useState<Record<string, Asset[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    walletsService
      .list()
      .then((data) => {
        setWallets(data.wallets);
        setAssets(data.assets);
      })
      .finally(() => setLoading(false));
  }, []);

  const getWallet = useCallback((id: string) => wallets.find((w) => w.id === id), [wallets]);
  const getAssets = useCallback((walletId: string) => assets[walletId] || [], [assets]);
  const getAsset = useCallback(
    (walletId: string, assetId: string) => (assets[walletId] || []).find((a) => a.id === assetId),
    [assets]
  );
  const walletValue = useCallback(
    (id: string) => (assets[id] || []).reduce((s, a) => s + a.qty * a.price, 0),
    [assets]
  );
  const walletCost = useCallback(
    (id: string) => (assets[id] || []).reduce((s, a) => s + a.qty * a.avg, 0),
    [assets]
  );

  const addWallet = useCallback(async (name: string) => {
    const { wallet } = await walletsService.create(name);
    setWallets((ws) => ws.concat([wallet]));
    setAssets((as) => ({ ...as, [wallet.id]: [] }));
    return wallet;
  }, []);

  const renameWallet = useCallback(async (id: string, name: string) => {
    const { wallet } = await walletsService.rename(id, name);
    setWallets((ws) => ws.map((w) => (w.id === id ? wallet : w)));
  }, []);

  const deleteWallet = useCallback(async (id: string) => {
    await walletsService.remove(id);
    setWallets((ws) => ws.filter((w) => w.id !== id));
    setAssets((as) => {
      const next = { ...as };
      delete next[id];
      return next;
    });
  }, []);

  const addAsset = useCallback(async (walletId: string, input: AssetInput) => {
    const { asset } = await walletsService.addAsset(walletId, input);
    setAssets((as) => ({ ...as, [walletId]: (as[walletId] || []).concat([asset]) }));
  }, []);

  const updateAsset = useCallback(async (walletId: string, assetId: string, input: AssetInput) => {
    const { asset } = await walletsService.updateAsset(walletId, assetId, input);
    setAssets((as) => ({ ...as, [walletId]: (as[walletId] || []).map((a) => (a.id === assetId ? asset : a)) }));
  }, []);

  const deleteAsset = useCallback(async (walletId: string, assetId: string) => {
    await walletsService.removeAsset(walletId, assetId);
    setAssets((as) => ({ ...as, [walletId]: (as[walletId] || []).filter((a) => a.id !== assetId) }));
  }, []);

  const value = useMemo<WalletsContextValue>(
    () => ({
      wallets,
      assets,
      loading,
      getWallet,
      getAssets,
      getAsset,
      walletValue,
      walletCost,
      addWallet,
      renameWallet,
      deleteWallet,
      addAsset,
      updateAsset,
      deleteAsset,
    }),
    [wallets, assets, loading, getWallet, getAssets, getAsset, walletValue, walletCost, addWallet, renameWallet, deleteWallet, addAsset, updateAsset, deleteAsset]
  );

  return <WalletsContext.Provider value={value}>{children}</WalletsContext.Provider>;
}

export function useWallets(): WalletsContextValue {
  const ctx = useContext(WalletsContext);
  if (!ctx) throw new Error("useWallets must be used within WalletsProvider");
  return ctx;
}

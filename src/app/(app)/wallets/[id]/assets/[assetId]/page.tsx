"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppPage } from "@/modules/core/components/AppPage";
import { Loading } from "@/modules/core/components/Loading";
import { AssetForm } from "@/modules/wallets/components/AssetForm";
import { useWallets } from "@/modules/wallets/WalletsContext";

export default function EditAssetPage({ params }: PageProps<"/wallets/[id]/assets/[assetId]">) {
  const { id, assetId } = use(params);
  const { loading, getWallet, getAsset } = useWallets();
  const router = useRouter();
  const wallet = getWallet(id);
  const asset = getAsset(id, assetId);

  useEffect(() => {
    if (!loading && (!wallet || !asset)) router.replace(wallet ? `/wallets/${id}` : "/wallets");
  }, [loading, wallet, asset, id, router]);

  if (loading) {
    return (
      <AppPage title="Edit asset" backHref={`/wallets/${id}`}>
        <Loading />
      </AppPage>
    );
  }
  if (!wallet || !asset) return null;

  return (
    <AppPage title="Edit asset" subtitle={`Wallet: ${wallet.name}`} backHref={`/wallets/${id}`}>
      <AssetForm
        walletId={id}
        walletName={wallet.name}
        mode="edit"
        assetId={assetId}
        initial={{ ticker: asset.ticker, name: asset.name, type: asset.type, qty: String(asset.qty), avg: String(asset.avg), date: "2025-11-04" }}
      />
    </AppPage>
  );
}

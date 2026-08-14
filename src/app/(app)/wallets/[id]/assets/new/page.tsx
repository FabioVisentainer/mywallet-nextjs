"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppPage } from "@/modules/core/components/AppPage";
import { Loading } from "@/modules/core/components/Loading";
import { AssetForm } from "@/modules/wallets/components/AssetForm";
import { useWallets } from "@/modules/wallets/WalletsContext";

export default function NewAssetPage({ params }: PageProps<"/wallets/[id]/assets/new">) {
  const { id } = use(params);
  const { loading, getWallet } = useWallets();
  const router = useRouter();
  const wallet = getWallet(id);

  useEffect(() => {
    if (!loading && !wallet) router.replace("/wallets");
  }, [loading, wallet, router]);

  if (loading) {
    return (
      <AppPage title="Add asset" backHref={`/wallets/${id}`}>
        <Loading />
      </AppPage>
    );
  }
  if (!wallet) return null;

  return (
    <AppPage title="Add asset" subtitle={`Wallet: ${wallet.name}`} backHref={`/wallets/${id}`}>
      <AssetForm walletId={id} walletName={wallet.name} mode="new" initial={{ ticker: "", name: "", type: "Stock", qty: "", avg: "", date: "" }} />
    </AppPage>
  );
}

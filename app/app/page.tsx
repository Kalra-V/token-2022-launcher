"use client";

import Page from "@/components/Page";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <WalletModalProvider>
        <WalletProvider wallets={[]}>
          <Page />
        </WalletProvider>
      </WalletModalProvider>
    </div>
  );
}

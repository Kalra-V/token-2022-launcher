"use client";

import Page from "@/components/Page";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useMemo } from "react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

export default function Home() {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <ConnectionProvider endpoint="https://api.devnet.solana.com">
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Page />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

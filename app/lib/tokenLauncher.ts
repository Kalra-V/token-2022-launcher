import { IDL } from "@/config/solana";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";

export function useTokenLauncher() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  // Until a wallet is connected or the connection is ready, just return nulls
  if (!connection || !wallet) {
    return { program: null, provider: null } as const;
  }

  // `wallet` from `useAnchorWallet` already conforms to AnchorWallet
  const provider = new AnchorProvider(connection, wallet);
  const program = new Program(IDL as any, provider);

  return { program, provider } as const;
}

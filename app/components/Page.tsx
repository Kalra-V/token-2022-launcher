import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { WalletButton } from "./WalletButton";
import { useTokenLauncher } from "@/lib/tokenLauncher";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PROGRAM_ID } from "@/config/solana";

const MINT_ADDRESS = new PublicKey(
  "J3fgHL8MHgqXYXVmPErKZS3MEqWPQ6CsUyBxHNbuwGVv"
);

const Page = () => {
  const { publicKey, signTransaction } = useWallet();
  const { program, provider } = useTokenLauncher();
  const [minting, setMinting] = useState(false);

  const mintAuthorityPda = PublicKey.findProgramAddressSync(
    [Buffer.from("mint_auth"), MINT_ADDRESS.toBuffer()],
    new PublicKey(PROGRAM_ID)
  )[0];

  const handleMint = async () => {
    // Ensure wallet and program are ready
    if (!publicKey || !program) return;
    setMinting(true);

    const mintPk = new PublicKey(MINT_ADDRESS);
    const user = publicKey;

    const userTokenAccount = getAssociatedTokenAddressSync(
      mintPk,
      user,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const tx = await program.methods
      .mintTokens()
      .accounts({
        mint: mintPk,
        user: user,
        userTokenAccount: userTokenAccount,
        mintAuthority: mintAuthorityPda,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("tx:", tx);

    setMinting(false);
  };

  return (
    <div>
      <h1 className="text-4xl mb-8">Token-2022 Launcher</h1>
      {/* <WalletMultiButton /> */}
      <WalletButton />
      {publicKey && (
        <button
          onClick={handleMint}
          disabled={minting}
          className="mt-4 px-6 py-3 bg-blue-600 rounded disabled:opacity-50"
        >
          {minting ? "Minting..." : "Mint 1 Token"}
        </button>
      )}
    </div>
  );
};

export default Page;

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useEffect, useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { WalletButton } from "./WalletButton";
import { useTokenLauncher } from "@/lib/tokenLauncher";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getTokenMetadata,
} from "@solana/spl-token";
import { PROGRAM_ID } from "@/config/solana";
import type { TokenMetadata } from "@solana/spl-token-metadata";

const MINT_ADDRESS = new PublicKey(
  "9PW5vownEEBguqy1WEcCH55vzyLb18428RdFagq7mLfe"
); // for devnet

const Page = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { program } = useTokenLauncher();
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata | null>(
    null
  );
  const [additionalMetadata, setAdditionalMetadata] = useState<{
    image: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!connection) {
        console.log("Waiting for connection...");
        return;
      }

      try {
        // Fetch SPL Token-2022 metadata directly from the mint account
        const metadata = await getTokenMetadata(
          connection,
          MINT_ADDRESS,
          "confirmed",
          TOKEN_2022_PROGRAM_ID
        );

        if (metadata) {
          console.log("Token Metadata:", metadata);
          setTokenMetadata(metadata);
          const additionalMetadata = await fetch(metadata.uri)
            .then((res) => res.json())
            .then((data) => ({
              image: data.image,
              description: data.description,
            }));
          setAdditionalMetadata(additionalMetadata);
        } else {
          console.log("No metadata found for this token");
        }
      } catch (error) {
        console.error("Error fetching token metadata:", error);
      }
    };

    run();
  }, [connection]);

  const mintAuthorityPda = PublicKey.findProgramAddressSync(
    [Buffer.from("mint_auth"), MINT_ADDRESS.toBuffer()],
    new PublicKey(PROGRAM_ID)
  )[0];

  const handleMint = async () => {
    // Ensure wallet and program are ready
    if (!publicKey || !program) return;
    setMinting(true);
    setTxHash(null);

    try {
      const mintPk = new PublicKey(MINT_ADDRESS);
      const user = publicKey;

      const userTokenAccount = getAssociatedTokenAddressSync(
        mintPk,
        user,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const amount = new anchor.BN(1 * Math.pow(10, 9)); // for 9 decimals token

      const tx = await program.methods
        .mintTokens(amount)
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
      setTxHash(tx);
    } catch (error) {
      console.error("Minting error:", error);
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] -z-10" />

      {/* Main content container */}
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
            Token-2022
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl font-light">
            Launch & Mint Your Tokens
          </p>
        </div>

        {/* Main card */}
        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 opacity-50 blur-xl -z-10" />

          {/* Wallet section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <p className="text-sm text-slate-400 mb-3 font-medium">
                  Connect Wallet
                </p>
                <div className="flex justify-center sm:justify-start">
                  <WalletButton />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          {publicKey && (
            <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          )}

          {/* Mint section */}
          {publicKey && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-white">
                  Ready to Mint
                </h2>
                <p className="text-sm text-slate-400">
                  Mint 1 token to your connected wallet
                </p>
              </div>

              {/* Token Metadata Display */}
              {tokenMetadata && (
                <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                      {additionalMetadata?.image ? (
                        <img
                          src={additionalMetadata.image}
                          alt="Token Image"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg
                          className="w-5 h-5 text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {tokenMetadata.name && (
                          <h3 className="text-base font-semibold text-white">
                            {tokenMetadata.name}
                          </h3>
                        )}
                        {tokenMetadata.symbol && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap">
                            {tokenMetadata.symbol}
                          </span>
                        )}
                        {additionalMetadata?.description && (
                          <p className="text-sm text-slate-400">
                            {additionalMetadata.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mint button */}
              <button
                onClick={handleMint}
                disabled={minting}
                className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-[2px] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="relative flex items-center justify-center gap-3 rounded-xl bg-slate-900 px-8 py-4 font-semibold text-white transition-colors">
                  {minting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Minting...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>Mint 1 Token</span>
                    </>
                  )}
                </div>
              </button>

              {/* Transaction hash display */}
              {txHash && (
                <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-400 font-mono break-all">
                    Transaction: {txHash}
                  </p>
                </div>
              )}

              {/* Wallet address display */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Wallet Address</span>
                  <span className="text-white font-mono text-xs sm:text-sm break-all">
                    {publicKey.toString().slice(0, 4)}...
                    {publicKey.toString().slice(-4)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!publicKey && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-4">
                <svg
                  className="w-8 h-8 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">
                Connect your wallet to get started
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            Powered by Solana Token-2022 Program
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;

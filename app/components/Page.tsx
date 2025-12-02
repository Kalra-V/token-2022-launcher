import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useState } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { Program, web3 } from '@coral-xyz/anchor';
import { WalletButton } from "./WalletButton";


const MINT_ADDRESS = new PublicKey('9PW5vownEEBguqy1WEcCH55vzyLb18428RdFagq7mLfe');  // Your Day 3 mint
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

const Page = () => {
    const { publicKey, signTransaction } = useWallet();
  const [minting, setMinting] = useState(false);

  const handleMint = async () => {
    if (!publicKey) return;
    setMinting(true);

    const connection = new Connection('https://api.devnet.solana.com');  // Swap to mainnet later
    const provider = new anchor.AnchorProvider(connection, { publicKey, signTransaction } as any, {});
    const idl = await Program.fetchIdl(TOKEN_2022_PROGRAM_ID, provider);  // From anchor idl
    const program = new Program(idl as any, provider);

    try {
      const tx = await program.methods
        .mintTokens(new anchor.BN(1000000000))  // 1 token (9 decimals)
        .accounts({
          mint: MINT_ADDRESS,
          tokenAccount: /* derive ATA */'',
          mintAuthority: publicKey,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .rpc();
      console.log('Minted! Tx:', tx);
    } catch (err) {
      console.error(err);
    }
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
          {minting ? 'Minting...' : 'Mint 1 Token'}
        </button>
      )}
    </div>
  );
};

export default Page;
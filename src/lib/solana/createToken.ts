import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import {
  createMetadataAccountV3,
  findMetadataPda,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey as umiPublicKey, createSignerFromKeypair } from "@metaplex-foundation/umi";
import type { Connection } from "@solana/web3.js";
import {
  createRevokeFreezeAuthorityInstruction,
  createRevokeMintAuthorityInstruction,
} from "@/lib/solana/revokeAuthority";

export interface CreateTokenParams {
  connection: Connection;
  payer: PublicKey;
  /** A freshly generated keypair for the new mint account (plain or vanity-derived). */
  mintKeypair: Keypair;
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: bigint;
  metadataUri: string;
  revokeMintAuthority: boolean;
  revokeFreezeAuthority: boolean;
}

export interface CreateTokenBuildResult {
  /** Create-account + initialize-mint + metadata + ATA + mint-to. Always needs the mint keypair as a co-signer. */
  createInstructions: TransactionInstruction[];
  /** Any selected SetAuthority (revoke) instructions, kept separate so they can be split into their own transaction if needed. */
  revokeInstructions: TransactionInstruction[];
  extraSigners: Keypair[];
  mintAddress: PublicKey;
  associatedTokenAccount: PublicKey;
}

/**
 * Assembles every instruction needed to create a new SPL token, attach on-chain metadata,
 * mint the initial supply to the payer, and (optionally) revoke mint/freeze authority —
 * split into groups so the caller can batch them into as few transactions as fit on-chain
 * limits via txSequencer's composeTransactions().
 */
export async function buildCreateTokenInstructions(
  params: CreateTokenParams
): Promise<CreateTokenBuildResult> {
  const {
    connection,
    payer,
    mintKeypair,
    decimals,
    initialSupply,
    revokeMintAuthority,
    revokeFreezeAuthority,
  } = params;

  const mintAddress = mintKeypair.publicKey;
  const lamportsForMint = await getMinimumBalanceForRentExemptMint(connection);

  const createInstructions: TransactionInstruction[] = [];

  createInstructions.push(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mintAddress,
      space: MINT_SIZE,
      lamports: lamportsForMint,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  createInstructions.push(
    createInitializeMint2Instruction(mintAddress, decimals, payer, payer, TOKEN_PROGRAM_ID)
  );

  createInstructions.push(...(await buildMetadataInstructions(params)));

  const associatedTokenAccount = getAssociatedTokenAddressSync(mintAddress, payer);
  createInstructions.push(
    createAssociatedTokenAccountInstruction(payer, associatedTokenAccount, payer, mintAddress)
  );

  if (initialSupply > 0n) {
    const rawAmount = initialSupply * 10n ** BigInt(decimals);
    createInstructions.push(
      createMintToInstruction(mintAddress, associatedTokenAccount, payer, rawAmount)
    );
  }

  const revokeInstructions: TransactionInstruction[] = [];

  if (revokeMintAuthority) {
    revokeInstructions.push(createRevokeMintAuthorityInstruction(mintAddress, payer));
  }

  if (revokeFreezeAuthority) {
    revokeInstructions.push(createRevokeFreezeAuthorityInstruction(mintAddress, payer));
  }

  return {
    createInstructions,
    revokeInstructions,
    extraSigners: [mintKeypair],
    mintAddress,
    associatedTokenAccount,
  };
}

/**
 * Builds the Metaplex Token Metadata "create metadata account v3" instruction via Umi,
 * then extracts the underlying web3.js-compatible TransactionInstruction so it can be
 * merged into our own instruction list rather than sent through Umi's own sender.
 *
 * Only `.getInstructions()` is called on the resulting builder — no signing ever happens
 * here, so the placeholder signer below never touches real key material; the wallet is
 * the one that ultimately signs the assembled transaction.
 */
async function buildMetadataInstructions(
  params: CreateTokenParams
): Promise<TransactionInstruction[]> {
  const { connection, mintKeypair, payer, name, symbol, metadataUri } = params;

  const umi = createUmi(connection).use(mplTokenMetadata());
  const umiMint = umiPublicKey(mintKeypair.publicKey.toBase58());
  const umiPayer = umiPublicKey(payer.toBase58());
  const [metadataPda] = findMetadataPda(umi, { mint: umiMint });

  const placeholderPayerSigner = createSignerFromKeypair(umi, {
    publicKey: umiPayer,
    secretKey: new Uint8Array(64),
  });

  const builder = createMetadataAccountV3(umi, {
    metadata: metadataPda,
    mint: umiMint,
    mintAuthority: placeholderPayerSigner,
    payer: placeholderPayerSigner,
    updateAuthority: umiPayer,
    data: {
      name,
      symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: true,
    collectionDetails: null,
  });

  return builder.getInstructions().map(toWeb3Instruction);
}

function toWeb3Instruction(umiIx: {
  programId: { toString(): string };
  keys: { pubkey: { toString(): string }; isSigner: boolean; isWritable: boolean }[];
  data: Uint8Array;
}): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey(umiIx.programId.toString()),
    keys: umiIx.keys.map((k) => ({
      pubkey: new PublicKey(k.pubkey.toString()),
      isSigner: k.isSigner,
      isWritable: k.isWritable,
    })),
    data: Buffer.from(umiIx.data),
  });
}

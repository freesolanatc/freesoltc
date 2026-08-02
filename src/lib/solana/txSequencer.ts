import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

/** Conservative byte budget under Solana's ~1232-byte transaction size limit, leaving room for signatures. */
const MAX_TRANSACTION_BYTES = 1100;
const DEFAULT_COMPUTE_UNIT_LIMIT = 400_000;
const DEFAULT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS = 2_000;

export interface ComposeTransactionsParams {
  connection: Connection;
  feePayer: PublicKey;
  instructionGroups: TransactionInstruction[][];
  extraSigners?: Keypair[];
}

export interface ComposedTransaction {
  transaction: VersionedTransaction;
  label: string;
  extraSigners: Keypair[];
}

const GROUP_LABELS = ["Create Token", "Revoke Authorities"] as const;

/**
 * Packs instruction groups into as few VersionedTransactions as fit Solana's size limits.
 * Each group is kept intact (never split mid-group) and prefixed with a compute budget.
 * If a group alone exceeds the budget, it is sent as its own transaction.
 */
export async function composeTransactions({
  connection,
  feePayer,
  instructionGroups,
  extraSigners = [],
}: ComposeTransactionsParams): Promise<ComposedTransaction[]> {
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  const composed: ComposedTransaction[] = [];

  let currentInstructions: TransactionInstruction[] = [];

  const flush = () => {
    if (currentInstructions.length === 0) return;
    const withBudget = [
      ComputeBudgetProgram.setComputeUnitLimit({ units: DEFAULT_COMPUTE_UNIT_LIMIT }),
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: DEFAULT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS,
      }),
      ...currentInstructions,
    ];
    const message = new TransactionMessage({
      payerKey: feePayer,
      recentBlockhash: blockhash,
      instructions: withBudget,
    }).compileToV0Message();
    const transaction = new VersionedTransaction(message);
    const label = GROUP_LABELS[composed.length] ?? `Transaction ${composed.length + 1}`;
    composed.push({ transaction, label, extraSigners: [] });
    currentInstructions = [];
  };

  for (const group of instructionGroups) {
    if (group.length === 0) continue;
    const candidate = [...currentInstructions, ...group];
    if (currentInstructions.length > 0 && estimateSize(candidate) > MAX_TRANSACTION_BYTES) {
      flush();
    }
    currentInstructions.push(...group);
  }
  flush();

  // The mint keypair (extraSigners) must co-sign whichever transaction actually creates
  // the mint account — that's always the first composed transaction in our flow.
  if (composed.length > 0 && extraSigners.length > 0) {
    composed[0].extraSigners = extraSigners;
  }

  return composed;
}

function estimateSize(instructions: TransactionInstruction[]): number {
  return instructions.reduce((total, ix) => {
    const keysSize = ix.keys.length * 34;
    return total + 32 + keysSize + ix.data.length;
  }, 0);
}

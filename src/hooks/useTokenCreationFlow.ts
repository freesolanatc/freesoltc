"use client";

import { useCallback, useRef, useState } from "react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { buildCreateTokenInstructions } from "@/lib/solana/createToken";
import { composeTransactions } from "@/lib/solana/txSequencer";
import { uploadTokenMetadata } from "@/lib/solana/metadata";
import { buildVanityFeeTransferParams } from "@/lib/payment/verifyVanityPayment";
import { getExplorerUrl } from "@/lib/solana/explorer";
import { confirmTransactionRobust } from "@/lib/solana/connection";
import { claimOnChainTask } from "@/lib/points/claimPointsClient";
import { useVanityWorkerPool } from "@/hooks/useVanityWorkerPool";
import type { TokenFormValues, TokenCreationResult } from "@/types/token";
import type { TransactionStep } from "@/types/solana";

export type FlowStatus =
  | "idle"
  | "uploading-metadata"
  | "awaiting-vanity-payment"
  | "verifying-vanity-payment"
  | "searching-vanity"
  | "building-transactions"
  | "awaiting-signature"
  | "confirming"
  | "success"
  | "error";

interface FlowState {
  status: FlowStatus;
  error: string | null;
  result: TokenCreationResult | null;
}

export function useTokenCreationFlow() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const vanityPool = useVanityWorkerPool();

  const [state, setState] = useState<FlowState>({ status: "idle", error: null, result: null });
  const cancelRequestedRef = useRef(false);
  const vanityPaymentSignatureRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    setState({ status: "idle", error: null, result: null });
    cancelRequestedRef.current = false;
  }, []);

  const cancel = useCallback(() => {
    cancelRequestedRef.current = true;
    vanityPool.cancel();
    setState({ status: "idle", error: null, result: null });
  }, [vanityPool]);

  const submit = useCallback(
    async (values: TokenFormValues) => {
      cancelRequestedRef.current = false;

      if (!wallet.publicKey || !wallet.signTransaction || !wallet.sendTransaction) {
        setState({ status: "error", error: "Connect your wallet first.", result: null });
        return;
      }
      if (!values.image) {
        setState({ status: "error", error: "Upload a token image first.", result: null });
        return;
      }

      try {
        // 1. Upload image + metadata (Pinata, paid for by the site — no wallet approval needed).
        setState({ status: "uploading-metadata", error: null, result: null });
        const metadataUri = await uploadTokenMetadata({
          image: values.image,
          name: values.name,
          symbol: values.symbol,
          description: values.description,
          social: values.social,
        });
        if (cancelRequestedRef.current) return;

        // 2. Vanity address: pay the flat fee, verify on-chain, then search client-side.
        let mintKeypair = Keypair.generate();

        if (values.claimCustomAddress) {
          setState({ status: "awaiting-vanity-payment", error: null, result: null });
          const transferParams = buildVanityFeeTransferParams(wallet.publicKey.toBase58());
          const { blockhash: transferBlockhash, lastValidBlockHeight: transferLastValidBlockHeight } =
            await connection.getLatestBlockhash("confirmed");
          const transferTx = new Transaction({
            feePayer: wallet.publicKey,
            blockhash: transferBlockhash,
            lastValidBlockHeight: transferLastValidBlockHeight,
          }).add(SystemProgram.transfer(transferParams));
          const signature = await wallet.sendTransaction(transferTx, connection);
          await confirmTransactionRobust(connection, signature, transferBlockhash, transferLastValidBlockHeight);
          vanityPaymentSignatureRef.current = signature;
          if (cancelRequestedRef.current) return;

          setState({ status: "verifying-vanity-payment", error: null, result: null });
          const verifyRes = await fetch("/api/vanity/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              signature,
              payerPublicKey: wallet.publicKey.toBase58(),
            }),
          });
          if (!verifyRes.ok) {
            const body = await verifyRes.json().catch(() => ({}));
            throw new Error(body.error ?? "Payment verification failed.");
          }
          if (cancelRequestedRef.current) return;

          setState({ status: "searching-vanity", error: null, result: null });
          const found = await vanityPool.start(values.vanityMode, values.vanityText);
          if (cancelRequestedRef.current) return;
          const secretKey = found ? vanityPool.takeResultSecretKey() : null;
          if (!secretKey) {
            throw new Error("Vanity address search was canceled or failed.");
          }
          mintKeypair = Keypair.fromSecretKey(secretKey);
        }

        // 3. Build instructions and batch into as few transactions as possible.
        setState({ status: "building-transactions", error: null, result: null });
        const built = await buildCreateTokenInstructions({
          connection,
          payer: wallet.publicKey,
          mintKeypair,
          name: values.name,
          symbol: values.symbol,
          decimals: values.decimals,
          initialSupply: BigInt(values.initialSupply),
          metadataUri,
          revokeMintAuthority: values.revokeMintAuthority,
          revokeFreezeAuthority: values.revokeFreezeAuthority,
        });

        const composed = await composeTransactions({
          connection,
          feePayer: wallet.publicKey,
          instructionGroups: [built.createInstructions, built.revokeInstructions],
          extraSigners: built.extraSigners,
        });

        // 4. Sign and send each transaction in order, surfacing exactly what's being approved.
        setState({ status: "awaiting-signature", error: null, result: null });
        const signatures: string[] = [];
        for (const step of composed) {
          // Refresh the blockhash right before this step's wallet approval, since a prior
          // step's approval (especially with extra wallet security-warning screens) can eat
          // enough time on its own to expire a blockhash fetched earlier in the batch.
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
          step.transaction.message.recentBlockhash = blockhash;

          // Wallet security scanners (e.g. Phantom's Blowfish integration) can't reliably
          // simulate a transaction that already carries another signer's signature before
          // the combined sign-and-send call, and flag it as a "Request blocked" risk. Per
          // Phantom's own guidance for multi-signer transactions: have the wallet sign first
          // via signTransaction, layer on any other required signers after, then broadcast
          // the fully-signed transaction ourselves.
          const signedTransaction = (await wallet.signTransaction!(
            step.transaction
          )) as typeof step.transaction;
          if (step.extraSigners.length > 0) {
            signedTransaction.sign(step.extraSigners);
          }
          const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
            maxRetries: 3,
          });
          setState({ status: "confirming", error: null, result: null });
          await confirmTransactionRobust(connection, signature, blockhash, lastValidBlockHeight);
          signatures.push(signature);
        }

        setState({
          status: "success",
          error: null,
          result: {
            mintAddress: built.mintAddress.toBase58(),
            signatures,
            explorerUrl: getExplorerUrl(built.mintAddress.toBase58()),
          },
        });

        // Airdrop points: fire-and-forget, never blocks or affects the create-token result.
        void claimOnChainTask(wallet, "create_token", signatures);
        if (values.revokeMintAuthority) {
          void claimOnChainTask(wallet, "revoke_mint_authority", signatures);
        }
        if (values.revokeFreezeAuthority) {
          void claimOnChainTask(wallet, "revoke_freeze_authority", signatures);
        }
        if (values.claimCustomAddress && vanityPaymentSignatureRef.current) {
          void claimOnChainTask(wallet, "claim_vanity_address", [vanityPaymentSignatureRef.current]);
        }
      } catch (err) {
        setState({
          status: "error",
          error: err instanceof Error ? err.message : "Something went wrong. Please try again.",
          result: null,
        });
      }
    },
    [connection, wallet, vanityPool]
  );

  return {
    status: state.status,
    error: state.error,
    result: state.result,
    vanitySearchState: vanityPool.state,
    submit,
    cancel,
    reset,
  };
}

export function buildFlowSteps(status: FlowStatus, hasVanity: boolean): TransactionStep[] {
  const steps: TransactionStep[] = [
    { label: "Upload token image & metadata", status: "pending" },
  ];
  if (hasVanity) {
    steps.push({ label: "Pay vanity address fee", status: "pending" });
    steps.push({ label: "Search for matching address", status: "pending" });
  }
  steps.push({ label: "Create token", status: "pending" });
  steps.push({ label: "Confirm on-chain", status: "pending" });

  const order: FlowStatus[] = [
    "uploading-metadata",
    ...(hasVanity
      ? (["awaiting-vanity-payment", "verifying-vanity-payment", "searching-vanity"] as FlowStatus[])
      : []),
    "building-transactions",
    "awaiting-signature",
    "confirming",
  ];

  const currentIndex = order.indexOf(status);
  const stepIndexForStatus = (s: FlowStatus): number => {
    if (s === "uploading-metadata") return 0;
    if (!hasVanity) {
      if (s === "building-transactions" || s === "awaiting-signature") return 1;
      if (s === "confirming") return 2;
      return -1;
    }
    if (s === "awaiting-vanity-payment" || s === "verifying-vanity-payment") return 1;
    if (s === "searching-vanity") return 2;
    if (s === "building-transactions" || s === "awaiting-signature") return 3;
    if (s === "confirming") return 4;
    return -1;
  };

  const activeStepIndex = stepIndexForStatus(status);
  return steps.map((step, index) => {
    if (status === "success") return { ...step, status: "success" };
    if (status === "error" && index === activeStepIndex) return { ...step, status: "error" };
    if (currentIndex === -1) return step;
    if (index < activeStepIndex) return { ...step, status: "success" };
    if (index === activeStepIndex) return { ...step, status: "active" };
    return step;
  });
}

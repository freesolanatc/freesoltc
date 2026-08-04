"use client";

import { useCallback, useRef, useState } from "react";
import type {
  VanityMode,
  VanitySearchState,
  VanityWorkerResponse,
  VanityWorkerStartMessage,
} from "@/types/vanity";

// Pure CPU-bound work (ed25519 keypair generation), so more workers than physical cores
// doesn't help — this just raises the ceiling for higher-core devices; Math.min against
// hardwareConcurrency below still keeps weaker devices from over-subscribing.
const MAX_WORKERS = 16;

function getWorkerCount(): number {
  if (typeof navigator === "undefined") return 4;
  return Math.min(navigator.hardwareConcurrency || 4, MAX_WORKERS);
}

const initialState: VanitySearchState = {
  status: "idle",
  attempts: 0,
  elapsedMs: 0,
  result: null,
  error: null,
};

export function useVanityWorkerPool() {
  const [state, setState] = useState<VanitySearchState>(initialState);
  const workersRef = useRef<Worker[]>([]);
  const attemptsByWorkerRef = useRef<Map<number, number>>(new Map());
  const startTimeRef = useRef<number>(0);
  // Held in a ref (not React state) so devtools/render inspection never retains the secret key
  // any longer than necessary; consumers read it once via getResultSecretKey().
  const resultSecretKeyRef = useRef<Uint8Array | null>(null);
  // Resolves the in-flight start() promise. A ref (not component state) so it stays reachable
  // from cancel() and worker callbacks regardless of re-renders — those must never be driven by
  // reading `state` back on a stale closure, since a caller that `await`s start() captured
  // whatever hook-return snapshot existed at call time and would otherwise poll a `state` value
  // that can never change again from its point of view.
  const resolveStartRef = useRef<((found: boolean) => void) | null>(null);

  const terminateAll = useCallback(() => {
    for (const worker of workersRef.current) {
      worker.terminate();
    }
    workersRef.current = [];
  }, []);

  const cancel = useCallback(() => {
    terminateAll();
    resultSecretKeyRef.current = null;
    // Set a terminal "canceled" status (rather than resetting straight to idle) so any
    // in-flight caller awaiting the search result observes a definitive end state.
    setState((prev) => ({ ...initialState, status: "canceled", attempts: prev.attempts }));
    resolveStartRef.current?.(false);
    resolveStartRef.current = null;
  }, [terminateAll]);

  /**
   * Starts the search and resolves once it's over. Resolution happens directly inside the
   * worker's own onmessage/onerror callbacks (not by polling component state from the caller's
   * side), so it can't miss the transition or get stuck on a stale snapshot.
   */
  const start = useCallback(
    (mode: VanityMode, text: string): Promise<boolean> => {
      terminateAll();
      resultSecretKeyRef.current = null;
      attemptsByWorkerRef.current = new Map();
      startTimeRef.current = Date.now();
      setState({ ...initialState, status: "searching" });

      return new Promise<boolean>((resolve) => {
        let settled = false;
        const resolveOnce = (found: boolean) => {
          if (settled) return;
          settled = true;
          resolveStartRef.current = null;
          resolve(found);
        };
        resolveStartRef.current = resolveOnce;

        const workerCount = getWorkerCount();
        const workers: Worker[] = [];

        for (let i = 0; i < workerCount; i += 1) {
          const worker = new Worker(new URL("../workers/vanity.worker.ts", import.meta.url));
          worker.onmessage = (event: MessageEvent<VanityWorkerResponse>) => {
            const message = event.data;
            if (message.type === "progress") {
              attemptsByWorkerRef.current.set(message.workerIndex, message.attempts);
              const total = Array.from(attemptsByWorkerRef.current.values()).reduce(
                (sum, n) => sum + n,
                0
              );
              setState((prev) => ({
                ...prev,
                attempts: total,
                elapsedMs: Date.now() - startTimeRef.current,
              }));
              return;
            }

            if (message.type === "match") {
              resultSecretKeyRef.current = new Uint8Array(message.secretKey);
              terminateAll();
              setState({
                status: "found",
                attempts: message.attempts,
                elapsedMs: Date.now() - startTimeRef.current,
                result: { publicKey: message.publicKey, secretKey: resultSecretKeyRef.current },
                error: null,
              });
              resolveOnce(true);
            }
          };
          worker.onerror = () => {
            terminateAll();
            setState((prev) => ({
              ...prev,
              status: "error",
              error: "Contract address search failed. Please try again.",
            }));
            resolveOnce(false);
          };
          const startMessage: VanityWorkerStartMessage = { type: "start", mode, text, workerIndex: i };
          worker.postMessage(startMessage);
          workers.push(worker);
        }

        workersRef.current = workers;
      });
    },
    [terminateAll]
  );

  /** Reads and clears the held secret key — call exactly once, right before building the mint transaction. */
  const takeResultSecretKey = useCallback((): Uint8Array | null => {
    const key = resultSecretKeyRef.current;
    resultSecretKeyRef.current = null;
    return key;
  }, []);

  return { state, start, cancel, takeResultSecretKey };
}

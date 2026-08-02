import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import type { VanityWorkerRequest, VanityWorkerResponse } from "@/types/vanity";

/**
 * Runs entirely inside a Web Worker: generates keypairs and tests the public key against
 * the requested prefix/suffix. Secret key material never leaves this worker except in the
 * single "match" message sent back once, after which the worker terminates itself.
 */

const PROGRESS_REPORT_INTERVAL = 2000;

let stopRequested = false;

self.onmessage = (event: MessageEvent<VanityWorkerRequest>) => {
  const message = event.data;
  if (message.type === "stop") {
    stopRequested = true;
    return;
  }
  if (message.type === "start") {
    stopRequested = false;
    runSearch(message.mode, message.text, message.workerIndex);
  }
};

function runSearch(mode: "prefix" | "suffix", text: string, workerIndex: number) {
  let attempts = 0;

  while (!stopRequested) {
    const keypair = Keypair.generate();
    const address = bs58.encode(keypair.publicKey.toBytes());
    attempts += 1;

    const matches = mode === "prefix" ? address.startsWith(text) : address.endsWith(text);

    if (matches) {
      const response: VanityWorkerResponse = {
        type: "match",
        publicKey: address,
        secretKey: Array.from(keypair.secretKey),
        workerIndex,
        attempts,
      };
      postMessage(response);
      self.close();
      return;
    }

    if (attempts % PROGRESS_REPORT_INTERVAL === 0) {
      const response: VanityWorkerResponse = { type: "progress", attempts, workerIndex };
      postMessage(response);
    }
  }
}

export {};

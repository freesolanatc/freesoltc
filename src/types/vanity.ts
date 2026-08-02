export type VanityMode = "prefix" | "suffix";

export const VANITY_MAX_CHARS = 4;
export const VANITY_MIN_CHARS = 1;

/** Base58 alphabet used by Solana public keys (excludes 0, O, I, l). */
export const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export interface VanityWorkerStartMessage {
  type: "start";
  mode: VanityMode;
  text: string;
  workerIndex: number;
}

export interface VanityWorkerStopMessage {
  type: "stop";
}

export type VanityWorkerRequest = VanityWorkerStartMessage | VanityWorkerStopMessage;

export interface VanityWorkerProgressMessage {
  type: "progress";
  attempts: number;
  workerIndex: number;
}

export interface VanityWorkerMatchMessage {
  type: "match";
  publicKey: string;
  secretKey: number[];
  workerIndex: number;
  attempts: number;
}

export type VanityWorkerResponse = VanityWorkerProgressMessage | VanityWorkerMatchMessage;

export type VanitySearchStatus =
  | "idle"
  | "awaiting-payment"
  | "verifying-payment"
  | "searching"
  | "found"
  | "canceled"
  | "error";

export interface VanitySearchState {
  status: VanitySearchStatus;
  attempts: number;
  elapsedMs: number;
  result: { publicKey: string; secretKey: Uint8Array } | null;
  error: string | null;
}

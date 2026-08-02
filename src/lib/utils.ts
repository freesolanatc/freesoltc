import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function formatSol(lamports: number): string {
  const sol = lamports / 1_000_000_000
  return `${sol.toLocaleString(undefined, { maximumFractionDigits: 6 })} SOL`
}

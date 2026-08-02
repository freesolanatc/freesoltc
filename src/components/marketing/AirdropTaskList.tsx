"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Trophy,
  Send,
  Coins,
  Snowflake,
  KeyRound,
  Wand2,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { claimSocialTask } from "@/lib/points/claimPointsClient";
import { TASK_POINTS, type TaskType } from "@/lib/points/tasks";

interface AirdropTask {
  task: TaskType;
  icon: typeof Trophy;
  title: string;
  href: string;
  external?: boolean;
  cta: string;
  social?: boolean;
}

const TASKS: AirdropTask[] = [
  {
    task: "follow_x",
    icon: Send,
    title: "Follow X",
    href: "https://x.com/FreeSolan",
    external: true,
    cta: "Follow on X",
    social: true,
  },
  {
    task: "join_telegram",
    icon: Send,
    title: "Join Telegram Channel",
    href: "https://t.me/FreeSolanaTC",
    external: true,
    cta: "Join Telegram",
    social: true,
  },
  {
    task: "create_token",
    icon: Coins,
    title: "Create a Token",
    href: "/create-token",
    cta: "Create Token",
  },
  {
    task: "revoke_freeze_authority",
    icon: Snowflake,
    title: "Revoke Freeze Authority a Token",
    href: "/revoke-freeze-authority",
    cta: "Revoke Freeze Authority",
  },
  {
    task: "revoke_mint_authority",
    icon: KeyRound,
    title: "Revoke Mint Authority a Token",
    href: "/revoke-mint-authority",
    cta: "Revoke Mint Authority",
  },
  {
    task: "claim_vanity_address",
    icon: Wand2,
    title: "Claim Custom Address a Token",
    href: "/create-token",
    cta: "Claim Custom Address",
  },
];

const MAX_POINTS = TASKS.reduce((sum, t) => sum + TASK_POINTS[t.task], 0);

export function AirdropTaskList() {
  const { publicKey, signMessage, connected } = useWallet();
  const [points, setPoints] = useState<number | null>(null);
  const [claimedTasks, setClaimedTasks] = useState<Set<TaskType>>(new Set());
  const [claimingTask, setClaimingTask] = useState<TaskType | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const applyPointsResponse = useCallback((res: Response) => {
    if (res.status === 503) {
      setUnavailable(true);
      return;
    }
    if (!res.ok) return;
    res
      .json()
      .then((data) => {
        setPoints(data.points ?? 0);
        setClaimedTasks(new Set(data.claimedTasks ?? []));
      })
      .catch(() => {
        // malformed response — leave previous state as-is
      });
  }, []);

  const refresh = useCallback(() => {
    if (!publicKey) return;
    fetch(`/api/points/me?wallet=${publicKey.toBase58()}`)
      .then(applyPointsResponse)
      .catch(() => {
        // network hiccup — leave previous state as-is
      });
  }, [publicKey, applyPointsResponse]);

  useEffect(() => {
    if (!connected || !publicKey) return;
    fetch(`/api/points/me?wallet=${publicKey.toBase58()}`)
      .then(applyPointsResponse)
      .catch(() => {
        // network hiccup — leave previous state as-is
      });
  }, [connected, publicKey, applyPointsResponse]);

  const handleSocialClaim = useCallback(
    async (task: Extract<TaskType, "follow_x" | "join_telegram">) => {
      setClaimingTask(task);
      try {
        const result = await claimSocialTask({ publicKey, signMessage }, task);
        toast.success(`+${result.pointsAwarded} airdrop points`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to claim points.");
      } finally {
        setClaimingTask(null);
        refresh();
      }
    },
    [publicKey, signMessage, refresh]
  );

  return (
    <>
      <div className="py-10 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden />
          {connected && points !== null
            ? `Your points: ${points.toLocaleString()}`
            : `${MAX_POINTS.toLocaleString()} points available`}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Airdrop</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Complete the tasks below to earn points. No wallet approvals beyond what each task
          normally requires &mdash; we never ask for your seed phrase or private key.
        </p>
        {!connected && (
          <div className="mt-6">
            <WalletConnectButton />
          </div>
        )}
        {unavailable && (
          <p className="mt-4 text-xs text-destructive">
            The points system is temporarily unavailable. Your progress isn&apos;t being lost —
            please check back shortly.
          </p>
        )}
      </div>

      <ol className="space-y-3">
        {TASKS.map((item) => {
          const claimed = claimedTasks.has(item.task);
          return (
            <li
              key={item.task}
              className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-4 sm:p-5"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <Badge variant="secondary" className="mt-1">
                    +{TASK_POINTS[item.task].toLocaleString()} points
                  </Badge>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {item.external && (
                  <Button size="sm" variant="ghost" asChild>
                    <a href={item.href} target="_blank" rel="noopener noreferrer nofollow">
                      {item.cta}
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                    </a>
                  </Button>
                )}

                {claimed ? (
                  <Badge className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    Claimed
                  </Badge>
                ) : item.social ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!connected || claimingTask === item.task}
                    onClick={() => handleSocialClaim(item.task as "follow_x" | "join_telegram")}
                  >
                    {claimingTask === item.task ? "Claiming..." : "Claim Points"}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={item.href}>{item.cta}</Link>
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

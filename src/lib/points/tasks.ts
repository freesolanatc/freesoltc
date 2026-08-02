export const TASK_POINTS = {
  follow_x: 100,
  join_telegram: 100,
  create_token: 150,
  revoke_mint_authority: 150,
  revoke_freeze_authority: 150,
  claim_vanity_address: 2000,
} as const;

export type TaskType = keyof typeof TASK_POINTS;

export const SOCIAL_TASKS: TaskType[] = ["follow_x", "join_telegram"];
export const ON_CHAIN_TASKS: TaskType[] = [
  "create_token",
  "revoke_mint_authority",
  "revoke_freeze_authority",
  "claim_vanity_address",
];

export const REFERRAL_POINTS = 50;

export function isTaskType(value: string): value is TaskType {
  return value in TASK_POINTS;
}

import { pgTable, text, integer, boolean, timestamp, serial, uniqueIndex } from "drizzle-orm/pg-core";

export const walletPoints = pgTable("wallet_points", {
  address: text("address").primaryKey(),
  points: integer("points").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const taskClaims = pgTable(
  "task_claims",
  {
    id: serial("id").primaryKey(),
    walletAddress: text("wallet_address").notNull(),
    task: text("task").notNull(),
    txSignature: text("tx_signature"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("task_claims_wallet_task_unique").on(table.walletAddress, table.task)]
);

export const referrals = pgTable("referrals", {
  referredAddress: text("referred_address").primaryKey(),
  referrerAddress: text("referrer_address").notNull(),
  credited: boolean("credited").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

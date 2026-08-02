import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { AuthorityType, TOKEN_PROGRAM_ID, createSetAuthorityInstruction } from "@solana/spl-token";

/** Builds a SetAuthority instruction that revokes (nulls) the mint authority for a token mint. */
export function createRevokeMintAuthorityInstruction(
  mint: PublicKey,
  currentAuthority: PublicKey
): TransactionInstruction {
  return createSetAuthorityInstruction(
    mint,
    currentAuthority,
    AuthorityType.MintTokens,
    null,
    [],
    TOKEN_PROGRAM_ID
  );
}

/** Builds a SetAuthority instruction that revokes (nulls) the freeze authority for a token mint. */
export function createRevokeFreezeAuthorityInstruction(
  mint: PublicKey,
  currentAuthority: PublicKey
): TransactionInstruction {
  return createSetAuthorityInstruction(
    mint,
    currentAuthority,
    AuthorityType.FreezeAccount,
    null,
    [],
    TOKEN_PROGRAM_ID
  );
}

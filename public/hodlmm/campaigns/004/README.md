# Campaign 004 — draft only, no authority

**ID:** `HODLMM-DLMM6-DRAFT-004`
**Candidate pool:** Bitflow `dlmm_6` STX/sBTC
**Status:** `draft_not_authorized`
**Capital authorized:** zero
**Gas authorized:** zero
**Wallet state:** must remain locked

This is a public design document, not an executable campaign. It contains no approval phrase and grants
no permission to unlock, sign, move residual DLP, swap, deposit, withdraw, or spend gas.

## Why a draft exists

Campaign 003 ended with residual DLP and a paid `u1022` abort. Starting another numbered campaign
without resolving that boundary would repeat the accounting and execution mistakes already documented.
The draft makes the missing prerequisites visible before any capital discussion.

## Mandatory entry gates

All gates must pass in a fresh private execution scope. Publication cannot satisfy them.

1. **Residual decision:** explicitly close Campaign 003 to zero DLP or document a new residual
   transition without double counting.
2. **Failure resolution:** reproduce or explain the strict-withdraw `u1022` path using read-only state
   and simulation; the existing write halt remains dominant until then.
3. **Clean chain state:** reconcile all known hashes and prove no pending or unknown transaction can
   conflict with the next nonce.
4. **Fresh market state:** re-read active bin, user bins, DLP, balances, pool status, and independent
   price divergence immediately before planning.
5. **New private charter:** operator must define capital ceiling, gas cap, reserve floor, duration,
   cooldown, recenter cap, exit rule, and failure threshold outside this repository.
6. **Simulation:** every proposed withdraw, deposit, or swap must have current bounded outputs and
   postconditions before wallet access.
7. **Signer isolation:** only one approved branch may reach a signer; public files remain incapable of
   execution.

## Candidate objective

Test whether a smaller, explicitly bounded STX/sBTC range can beat holding after gas while preserving a
clean campaign boundary. This objective is provisional and carries no allocation.

## Promotion rule

The ID must lose the `DRAFT` marker only after all prerequisites are documented and a new private scope
exists. If the gates do not pass, the correct terminal outcome is `not_launched` with a no-tx receipt.

Not financial advice. Draft publication is not transaction approval.

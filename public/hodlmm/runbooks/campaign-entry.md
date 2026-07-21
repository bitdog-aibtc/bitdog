# Campaign entry runbook

## Purpose

Prevent a public idea, stale plan, or attractive quote from becoming accidental execution authority.
This document specifies evidence required before a separately controlled signer may be considered.

## Do not enter when

- the campaign is a draft, expired, halted, or missing a private approval scope;
- another campaign still owns unresolved DLP or inventory;
- any earlier hash is pending, unknown, or absent from the receipt ledger;
- wallet, pool, assets, limits, or nonce disagree across fresh reads;
- simulation is unavailable or produces trivial minimum-return protection;
- reserve or gas limits cannot be proven before wallet access.

## Required public inputs

- immutable campaign ID and public wallet;
- pool and asset contracts;
- duration and terminal behavior;
- capital ceiling, gas ceiling, reserve floor, cooldown, and failure threshold;
- hold baseline definition and accounting method;
- explicit statement that the public charter is non-authorizing.

Approval material belongs in a private scope and must never be committed.

## Read-only gate sequence

1. Reconcile all earlier campaign hashes to terminal chain states.
2. Read nonce, liquid balances, DLP supply, user bins, active bin, pool status, and reserves.
3. Compare pool-implied price against an independent source; fail closed if unavailable or divergent.
4. Build one deterministic plan with exact inputs, bounded outputs, fees, and postconditions.
5. Simulate every planned contract call against current state.
6. Re-read state after simulation; invalidate the plan if any material input changed.
7. Check campaign lifecycle, capital, gas, reserve, cooldown, and prior-failure gates again.

## Expected evidence

- a no-write planning record with timestamps and source health;
- a plan hash or equivalent immutable identifier;
- simulation results and minimum-return bounds;
- explicit `wallet_unlocked:false`, `signer_called:false`, and `broadcast:false` facts;
- either `READY_FOR_PRIVATE_APPROVAL` or a specific terminal blocker.

Passing this runbook does not execute a transaction. It only establishes that a fresh private approval
could be evaluated.

# Pool record — dlmm_6 STX/sBTC

## Identity

- **Pool:** Bitflow HODLMM `dlmm_6`
- **Contract:** `SM1FKXGNZJWSTWDWXQZJNF7B5TV5ZB235JTCXYXKD.dlmm-pool-stx-sbtc-v-1-bps-15`
- **Pair:** STX/sBTC
- **Base fee:** 15 bps
- **BITDOG wallet:** `SP178SWBKE4YRKPMPBTFP359DMBT025ZC48QEG7HB`

## Field-confirmed behavior

- Liquidity is represented by per-bin DLP shares; the aggregate position must be reconstructed across
  all user bins.
- Active-bin movement can change a staged withdrawal's valid minimum bounds between simulation and
  inclusion.
- A local confirmation timeout does not establish failure; final status must come from chain data.
- Bin balances include inventory conversion and embedded fees, so fee income is not safely separable
  without additional attribution evidence.
- Campaign expiry and a write halt must dominate a stale local `active` flag.

## What worked

- direct read-only calls for active bin, user shares, bin balances, reserves, and total DLP;
- per-bin accounting instead of a single pool-share approximation;
- serialized writes with terminal verification between stages;
- final Hiro reconciliation after local timeouts;
- no-tx receipts for preflight, balance, and lifecycle stops.

## What failed

- broad operational success did not overcome poor performance versus hold in Campaign 001;
- a strict withdrawal in Campaign 003 aborted with `u1022` after state moved;
- renewals and residual transitions blurred campaign accounting boundaries;
- portfolio-wide PnL remained unavailable without a complete cost basis.

## Current public terminal snapshot

At the 2026-07-20 publication mark, active bin was `-327`, BITDOG remained in bins `-301` and `-300`,
42,901 DLP remained, and Campaign 003 was write-halted. This is historical evidence, not a live trading
signal. Run the read-only position tool for current public state.

## Open questions before another live campaign

- Can strict minimum-return bounds be refreshed safely for every per-bin step near a moving active bin?
- Can fee attribution be separated from inventory conversion without relying on estimates?
- Should residual Campaign 003 DLP be exited or explicitly transitioned before any new entry?
- What smaller range and gas ceiling can produce a meaningful test without hiding costs?

## Provenance

- [Campaign 001](../../campaigns/001/README.md)
- [Campaign 003](../../campaigns/003/README.md)
- [Complete ledger](../../ledger/README.md)
- [Honest Ledger article](../../articles/the-honest-ledger.md)

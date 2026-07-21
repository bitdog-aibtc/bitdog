# BITDOG HODLMM public record

This directory is the public, audit-oriented view of BITDOG's concentrated-liquidity work on the
Bitflow `dlmm_6` STX/sBTC pool.

## Reading order

1. [Article: The Honest Ledger](articles/the-honest-ledger.md)
2. [Campaigns](campaigns/README.md)
3. [Ledger and verification](ledger/README.md)
4. [Lessons](knowledge/lessons.md)
5. [Runbooks](runbooks/README.md)
6. [Disclosure review](knowledge/disclosure-review-2026-07-20.md)
7. [Public schemas](schemas/)
8. [dlmm_6 pool record](knowledge/pools/dlmm_6.md)
9. [Self-analysis KPIs](specs/self-analysis-kpis.md)
10. [Proof bundle integrity](proof/README.md)

The public monitor is intentionally weaker than the private operational system: it reads public state,
evaluates terminal gates, and can only return a hold, a halt, or a recommendation for a separately
authorized dry-run. Run it with `npm run monitor:public`.

## Accounting rules

- The headline metric is net versus holding the same starting assets, after gas.
- An open DLP mark is not a realized exit.
- Fees embedded in bin balances are not reported as separately earned fees without attribution proof.
- A pre-broadcast stop uses `txid: null`, `broadcast: false`, and zero gas.
- A broadcast hash is recorded immediately and later reconciled to a terminal chain state.
- Old claims are corrected append-only; the earlier number and reason for correction remain visible.

## Current state at publication

Read-only scan at `2026-07-20T17:19:14Z`:

- active bin `-327`; BITDOG range `-301 → -300`;
- 26 bins out of range, about 3.97% drift;
- 42,901 DLP representing about 15.088571 STX and 0 sats sBTC;
- estimated LP mark about $2.51;
- Campaign 003 mark: gross −$0.58 vs hold, 0.50 STX gas, net −$0.66;
- write halt remains active; no wallet unlock or transaction occurred during publication.

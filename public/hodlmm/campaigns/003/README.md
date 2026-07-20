# Campaign 003 — recovery, one paid abort, and a hard stop

**ID:** `HODLMM-DLMM6-20260709-003`
**Pool:** Bitflow `dlmm_6` STX/sBTC, 15 bps
**Window:** 2026-07-10 → 2026-07-20
**Status:** ended with residual DLP; out of range; write-halted pending safety review

## Charter

- Begin with residual Campaign 001 LP assets only.
- Withdraw the stale range and redeposit into the current range.
- First move: no new capital and no swap.
- Seven-day base scope; later extended read/management window through July 20.
- Maximum ten recenters, four-hour write cooldown, one failed-write halt threshold.
- 10 STX reserve floor.
- 1.5 STX renewed gas ceiling, with an early stop before the final reserve tranche.
- No blind auto-exit, no unattended public memo tag, and no new pool without new scope.

Historical private approval tokens are intentionally not published. Public documentation is never an
execution authority.

## First recovery — 2026-07-10

- Before: active `-292`, range `-285 → -283`, 86,454 DLP, out of range.
- Three withdrawals succeeded.
- Deposit succeeded into `-292 → -290`.
- After: 66,067 DLP, 12.728583 STX + 1,559 sats, in range.
- Gas: 0.20 STX.

## Second recenter — 2026-07-13 12:18Z

- Before: active `-302`, range `-292 → -290`.
- Three withdrawals and one deposit succeeded.
- After: range `-302 → -300`, 56,982 DLP, in range.
- Gas: 0.20 STX.

## The paid abort — 2026-07-13 16:25Z

The first withdrawal branch for bin `-302` succeeded:
[`0xbbfa1c…665d6a`](https://explorer.hiro.so/txid/0xbbfa1c02960390ceb9e6c80145fe441722ee1e6d6bf2f041f203286471665d6a?chain=mainnet).

The next strict `withdraw-liquidity` call for bin `-301` aborted with `(err u1022)`:
[`0x7ea584…d1c57`](https://explorer.hiro.so/txid/0x7ea584ced8441af70d6bedfa83422d5e15cd5e1d775c7b1addd42c7a933d1c57?chain=mainnet).

Hiro terminal state: `abort_by_response`. The active bin moved during the multi-step sequence and made
the strict minimum guard stale. The guard protected funds, but the failed transaction still consumed
0.10 STX. The campaign's one-failure threshold fired immediately. No swap or top-up followed.

## End-of-window mark — 2026-07-20

- active bin `-327`; residual range `-301 → -300`;
- 26 bins out of range, approximately 3.97% drift;
- 42,901 DLP = about 15.088571 STX + 0 sats sBTC;
- current LP mark ≈ $2.51; hold baseline ≈ $3.09;
- gross vs hold ≈ −$0.58;
- verified gas = 0.500000 STX, ≈ $0.08 at the mark;
- net vs hold ≈ **−$0.66**.

This is not a realized closeout: DLP remains. The honest terminal label is
`window_ended_residual_position_write_halted`, not `closed` and not `exited`.

## Receipts

Campaign 003 has ten broadcast hashes: nine `success`, one `abort_by_response`, all matched against
Hiro. The [transaction roster](transaction-roster.md) includes each block, fee, role, and explorer link.
The July 20 attempted rebalance is also recorded as a no-tx receipt: the write-halt gate blocked it
before wallet unlock, signature, broadcast, or gas.

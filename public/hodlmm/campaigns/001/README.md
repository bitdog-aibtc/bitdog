# Campaign 001 — the expensive first desk

**ID:** `HODLMM-DLMM6-20260604-001`
**Pool:** Bitflow `dlmm_6` STX/sBTC, 15 bps
**Window:** opened 2026-06-04; renewed through 2026-07-05; residual assets transitioned on 2026-07-10
**Wallet:** `SP178SWBKE4YRKPMPBTFP359DMBT025ZC48QEG7HB`
**Status:** accounting closed by transition, not by zero-DLP exit

## Charter reconstructed from the record

- Start with 101 STX and 31,500 sats after two bounded prep swaps.
- Five-bin initial range; subsequent active management used mostly three-bin ranges.
- Fresh scan and simulation before every write.
- Per-bin withdrawals followed by a simulated relative-liquidity deposit.
- Preserve a wallet reserve and serialize signer activity.
- Record every withdrawal, deposit, gas amount, range change, and post-check.

The original campaign predates the repository's final charter template. This reconstruction is labeled
as such; it is not retroactively presented as a document that existed on day zero.

## Entry

- USDCx → STX: 80.198996 STX received.
- USDCx → sBTC: 31,518 sats received.
- Initial LP add: 101 STX + 31,500 sats across `-214 → -210`.
- Entry result: 1,065,215 DLP; estimated exposure 129.488282 STX + 22,897 sats.

## Operation

The ledger contains 22 successful recenter deposits and 63 successful per-bin withdrawals, plus the
two entry swaps and initial deposit. The campaign repeatedly converted between STX-heavy and sBTC-heavy
inventory as the active bin moved. All **88 broadcast hashes** reconcile to `success` through Hiro.

The full sequence — timestamp, role, block, fee, and explorer link — is in the
[transaction roster](transaction-roster.md).

## Result and accounting caveat

At the last comparable Campaign 001 checkpoint on 2026-07-05:

- range `-285 → -283`, 86,454 DLP;
- estimated LP mark ≈ $2.90;
- hold baseline ≈ $36.99;
- verified on-chain gas: **0.595549 STX** across 88 transactions;
- reported net versus hold: approximately **−$34.20**.

This is a severe loss versus hold, but not a clean realized closeout. The position was not withdrawn to
zero DLP. Residual LP assets were later moved into Campaign 003. The number is therefore published as a
provisional comparable mark, not as a realized final return.

## What failed even without a failed transaction

1. **The first LP add stopped safely.** No real `min-dlp` was available before simulation, so the agent
   deferred the deposit with no hash and no gas.
2. **Campaign boundaries blurred.** Renewals extended the run, then residual inventory rolled into a
   new campaign instead of a clean exit. That made aggregate accounting unsafe.
3. **Fee attribution stayed weak.** Bin balances included fees, but the ledger could not separate fee
   income cleanly from inventory conversion.
4. **A local confirmation timeout lied by omission.** On 2026-07-05 the deposit wait timed out locally;
   Hiro later proved all three withdrawals and the deposit succeeded. Retrying blindly would have been
   dangerous.

## Lesson

A long list of successful transactions is not a successful campaign. Clean boundaries, a hold baseline,
fee attribution, and a zero-DLP closeout matter more than execution count.

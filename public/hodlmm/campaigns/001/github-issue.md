## Charter

- **Campaign ID:** `HODLMM-DLMM6-20260604-001`
- **Pool:** Bitflow `dlmm_6` STX/sBTC, 15 bps
- **Wallet:** `SP178SWBKE4YRKPMPBTFP359DMBT025ZC48QEG7HB`
- **Window:** opened 2026-06-04; renewed through 2026-07-05; residual transition 2026-07-10
- **Initial capital:** 101 STX + 31,500 sats after two bounded prep swaps

## Closeout truth

Campaign 001 is **accounting-closed by residual transition, not by zero-DLP exit**. At the last
comparable checkpoint, the LP marked near $2.90 against a hold baseline near $36.99. Verified gas was
0.595549 STX. The provisional result was approximately **-$34.20 versus hold**.

This is not presented as realized PnL. Residual assets later became Campaign 003, so the two campaign
marks must not be summed.

## Receipts

- 88 broadcast hashes
- 88 `success`
- 0 mined aborts
- 1 pre-broadcast/no-tx safety stop
- 22 recenter deposits and 63 per-bin recenter withdrawals
- 98/98 hashes across the complete publication set reconciled through Hiro on 2026-07-20

## What failed

- The first deposit was deferred because no defensible minimum DLP existed before simulation.
- Campaign renewals blurred the original time boundary.
- Fee income could not be cleanly separated from changing inventory.
- A local confirmation timeout required chain reconciliation before any retry.
- There was no clean zero-DLP closeout.

## Proof bundle

- [Campaign report](https://github.com/bitdog-aibtc/bitdog/blob/main/public/hodlmm/campaigns/001/README.md)
- [Every transaction and role](https://github.com/bitdog-aibtc/bitdog/blob/main/public/hodlmm/campaigns/001/transaction-roster.md)
- [Machine-readable ledger](https://github.com/bitdog-aibtc/bitdog/blob/main/public/hodlmm/ledger/transactions.jsonl)
- [On-chain verification snapshot](https://github.com/bitdog-aibtc/bitdog/blob/main/public/hodlmm/ledger/onchain-verification.json)

This issue is the immutable public closeout pointer. Corrections should be appended and linked, never
silently rewritten.

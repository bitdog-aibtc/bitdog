# Campaign 004 — armed, waiting for entry gates

- **ID:** `HODLMM-DLMM6-20260720-004`
- **Pool:** Bitflow `dlmm_6` STX/sBTC
- **Operator scope date:** 2026-07-20
- **Status:** `ARMED / WAITING_ENTRY`
- **LP capital ceiling at entry:** US$40 total
- **Capital moved:** US$0
- **Transactions and gas:** no hash emitted; 0 STX spent
- **Wallet state:** remains locked while entry gates are unmet

`ARMED` means the operator approved a bounded capital target and range shape. It does **not** mean the
campaign is open or funded. Campaign 003 is closed for new risk; its old abort was reconciled without a
blind retry, and its residual remains on-chain until the new entry gates pass. This page records the
public scope but contains no approval phrase, signer material, credential, or wallet-access authority.

## Authorized strategy

- Use the existing Bitflow `dlmm_6` STX/sBTC pool only.
- Target the three relative bins `-1`, `0`, and `+1` around the active bin read immediately before
  entry. This is intentionally more concentrated, and therefore more exposed to moving out of range.
- Cap the total LP value at entry at **US$40**. The live-mark value of any Campaign 003 residual that
  transitions into Campaign 004 counts inside that ceiling; it cannot be counted twice or treated as
  an additional US$40.
- New capital, if any, is limited to the difference between the US$40 ceiling and the freshly marked
  residual value.
- No wider range, extra pool, extra capital, blind recenter, or open-ended gas authority is implied.

## Current entry gates

| Gate | State | Public evidence rule |
|---|---|---|
| Campaign 003 boundary | **RECONCILED** | Campaign 003 is closed for new risk. Its `u1022` abort was not retried blindly, and the residual is explicitly assigned to this transition. |
| Residual withdrawal preflight | **PASS** | The canonical multi-bin withdrawal passed a fresh read-only simulation; 42,901 DLP remains on-chain because no write is allowed while the market gates are unmet. |
| 24-hour pool volume | **WAITING** | The latest entry check was US$3,581.32, below the US$10,000 minimum. No entry while the fresh 24-hour value remains below that threshold. |
| Second confirmation | **PENDING** | A second fresh read must confirm the market and chain inputs immediately before any wallet access. |
| Simulation and postconditions | **PARTIAL PASS** | Withdrawal simulation and the 120 STX prep-swap plan passed. The exact three-bin deposit simulation waits for the actual post-swap sBTC balance. |
| Signer isolation | **DISARMED** | The wallet stays locked until every preceding gate passes in one fresh private execution scope. |

The fresh read at 2026-07-21T01:06:26Z reported 42,901 residual DLP, estimated at 15.088571 STX and
zero sats, 26 bins away from the active bin. It is a planning mark, not a realized withdrawal amount.

## Entry transition

Campaign 004 can move from `WAITING_ENTRY` to `LIVE` only after all of the following are true:

1. Campaign 003's residual withdrawal reaches a terminal chain result under the already reconciled boundary.
2. The fresh 24-hour pool volume is at or above US$10,000.
3. The second confirmation and simulations agree with the final plan.
4. The total marked LP input, including transitioned residual value, does not exceed US$40.
5. The first Campaign 004 deposit reaches terminal `success` and receives a receipt with its tx hash,
   fee, role, and post-entry range.

Until then, `opened_at` remains null. The [receipt roster](transaction-roster.md) contains one no-tx
market-gate receipt, and the honest status is `armed_waiting_entry`: authorized terms, no transaction
attempt, no txid, and no gas.

Not financial advice. Public documentation is evidence, not transaction authority.

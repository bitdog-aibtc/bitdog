# Campaign 002 — the campaign that did not launch

**ID:** `HODLMM-DLMM6-20260709-002`
**Pool proposed:** Bitflow `dlmm_6` STX/sBTC
**Prepared:** 2026-07-09
**Status:** not launched; no wallet transaction

## Proposed charter

- Existing LP only; no new wallet capital.
- Same-pool withdraw and redeposit.
- No swap for the first move.
- Seven-day duration, four-hour write cooldown, ten recenter cap.
- 0.30 STX gas budget and 10 STX reserve floor.
- One failed write branch would halt further writes.
- No public posting and no automatic exit.

## Dry-run

A later fresh scan found active bin `-292`, old range `-285 → -283`, and 86,454 DLP out of range by
seven bins. The simulated plan would withdraw the three old bins and redeposit into `-292 → -290`,
with safe `min-dlp` 13,519. The wallet remained locked; no transaction was signed or broadcast.

## Failure receipt

An earlier candidate prep-swap attempt failed its balance gate: liquid sBTC was 118 sats while the
quoted route required 1,583 sats. Correct receipt:

```json
{"status":"failed_prebroadcast","broadcast":false,"txid":null,"gas_spent_stx":0}
```

There is no transaction hash because there was no transaction. Campaign 002 was superseded by a fresh
Campaign 003 scope rather than treated as partially executed.

See the [complete one-line roster](transaction-roster.md).

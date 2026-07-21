# Campaign closeout runbook

## Purpose

Make “closed” a verifiable terminal state instead of a calendar label.

## Closeout classes

- `closed_zero_dlp` — DLP is absent or zero and final inventory is reconciled.
- `accounting_closed_by_residual_transition` — assets remain but ownership moves explicitly to a new
  campaign without double counting.
- `window_ended_residual_position` — time ended while assets remain; this is not a realized closeout.
- `not_launched` — no position opened and every attempted action stopped before broadcast.
- `write_halted` — an unresolved failure prevents further writes; closeout remains incomplete.

## Required checks

1. Reconcile every emitted hash to a terminal chain status.
2. Count and publish every no-tx attempt separately.
3. Re-read DLP and final wallet inventory from public state.
4. Prove zero DLP or name the residual owner and transition rule.
5. Compute current or final value against holding the same entry assets.
6. Subtract verified gas; label the result realized or mark-to-market.
7. State whether fees can be attributed independently. If not, do not claim them separately.
8. Publish all corrections and unresolved accounting gaps.
9. Prove the campaign is no longer targeted by signer-enabled schedules or processes without exposing
   private host configuration.

## Proof bundle

- charter and terminal label;
- full transaction roster with roles;
- machine receipts and on-chain reconciliation;
- final position/inventory snapshot;
- net-versus-hold result after gas;
- failure and correction log;
- disarm statement.

If any required evidence is missing, use the narrower truthful status instead of `closed`.

# Receipt ledger

## Files

- [`transactions.jsonl`](transactions.jsonl) — append-style public receipt stream.
- [`summary.json`](summary.json) — counts by campaign.
- [`onchain-verification.json`](onchain-verification.json) — Hiro reconciliation snapshot.
- Per-campaign Markdown rosters live beside each campaign.

## Publication snapshot

- 101 total receipts.
- 98 unique emitted transaction hashes.
- 97 successful transactions.
- 1 mined abort (`abort_by_response`).
- 3 no-tx receipts: safe preflight stop, balance-gate failure, and write-halt block.
- 98/98 broadcast hashes matched their recorded terminal status at
  `2026-07-20T17:26:32.828Z`.

## Schema

Every line has:

- `campaign_id`, `attempt_id`, timestamp, role, and stage;
- separate `broadcast` and terminal `status` fields;
- a normalized `0x` hash only when `broadcast: true`;
- the failure reason and zero gas when the attempt stopped before broadcast;
- optional sequence, bin, gas, and source metadata.

## Verify without trusting BITDOG

```bash
npm run verify:ledger
```

The verifier indexes the public wallet's Stacks transactions through Hiro, falls back to individual
hash queries when required, and fails if any expected success/abort disagrees with chain state.

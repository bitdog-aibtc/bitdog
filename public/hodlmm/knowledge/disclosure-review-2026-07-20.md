# Disclosure review — 2026-07-20

## Decision

The private BITDOG workspace was reviewed as a source, not copied as a repository. Public material was
rebuilt into a separate checkout with a deny-by-default boundary.

## Published safely

- the public agent identity and public Stacks addresses;
- campaign charters, results, caveats, transaction roles, and all known hashes;
- one mined abort and three stops that emitted no transaction;
- read-only position lookup and Hiro ledger reconciliation;
- a fail-closed public monitor that cannot unlock, sign, write state, or broadcast;
- receipt and campaign schemas, tests, runbooks, lessons, and publication controls.
- a machine-readable campaign catalog, non-authorizing Campaign 004 draft, and SHA-256 proof manifest.

## Converted instead of copied

| Private source class | Public form |
|---|---|
| Mutable campaign state | Terminal campaign reports and a non-authorizing example config |
| Transaction narrative and machine receipts | Normalized JSONL plus per-campaign rosters |
| Monitor state and safety logic | Pure evaluator with public inputs and no persistence |
| Operational lessons | Sanitized lessons without approval phrases or private coordination data |
| Execution workflow | Read-only methodology and safety gates; no signer implementation |

## Deliberately excluded

- wallet and credential material;
- signer, unlock, contract-call construction, and broadcast code;
- private inbox/outbox, contacts, and operator instructions;
- social posting credentials and private platform state;
- daemon state, schedules, local logs, raw API dumps, and temporary transaction payloads;
- live approval phrases and unresolved transaction material.

These exclusions are part of the evidence model. Reproducibility means a reader can verify what
happened; it does not require giving the internet the ability to act as BITDOG.

## Audit result

At this review, the public tree and its Git history contained no prohibited file class, recognizable
credential format, sensitive assignment, signer call, or mutating HTTP call. The complete transaction
set still reconciled 98/98 against Hiro. The release workflow now reruns these checks on every push and
pull request.

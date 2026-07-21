# Publication policy

BITDOG publishes evidence, methods, and read-only verification. It does not publish control.

## Public by default

| Material | Why it can be public |
|---|---|
| Wallet addresses, contract principals, pool IDs, block heights, and transaction hashes | Already observable on public chains |
| Campaign charters, capital ceilings, duration, safety gates, and terminal labels | Required to evaluate whether the agent followed its mandate |
| Performance marks, hold baselines, gas, losses, aborts, and accounting limitations | Required for an honest result |
| Read-only position, ledger, and monitoring code | Lets others reproduce claims without granting execution authority |
| Receipt schemas, tests, runbooks, and lessons | Improves auditability and reuse |

## Sanitize before publication

Operational state may be converted into a public artifact only after removing:

- exact approval phrases or other strings that could be interpreted as live authority;
- private filesystem paths, host details, schedules, process state, and internal message IDs;
- private contacts, inbox/outbox content, and operator notes;
- unsigned transaction payloads, nonces for pending writes, and retry material;
- secret-bearing environment variables or provider-specific authentication headers.

Publish a template, terminal snapshot, aggregate, or independently verifiable receipt instead of the
raw operational file.

## Never public

- seed phrases, WIFs, private keys, keystores, wallet registries, or recovery material;
- passwords, API keys, OAuth/PAT tokens, session cookies, `.env`, or credential-store exports;
- signer-enabled executors, unlock flows, transaction constructors, or broadcast payloads;
- live approval tokens, private agent messages, contact books, or social-platform credentials;
- daemon state, host logs, temporary transaction files, or raw dumps that have not been reviewed.

## Release gate

Every public commit must pass:

```bash
npm run audit:public
npm test
npm run check:links
npm run verify:manifest
npm run verify:ledger
```

The publication audit scans the worktree and every Git revision for prohibited paths, recognizable
secret formats, sensitive assignments, signer calls, and mutating network calls. The one HTTP POST in
the public toolset is explicitly constrained to Hiro's read-only Clarity endpoint. Automated scanning
reduces risk but does not replace human review.

If a secret is ever committed, stop publication, revoke or rotate it, and treat Git history as exposed.
Deleting the latest file is not remediation.

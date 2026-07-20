# Contributing

This repository is an evidence archive before it is a code project.

## Corrections

Open an issue with:

- the exact file and statement that may be wrong;
- a public source or Stacks transaction hash;
- the proposed correction;
- whether the correction changes a campaign result.

Do not submit wallet files, credentials, private messages, approval tokens, or personal data.

## Code changes

Keep verification tooling read-only. A public pull request must never add signing, wallet unlock,
transaction broadcast, or secret-loading behavior. Run these checks before opening it:

```bash
npm install
npm test
npm run verify:ledger
```

If a correction changes a historical number, update the relevant campaign, the root scoreboard, and
the Honest Ledger in the same pull request. Never rewrite or remove an unfavorable receipt; append a
correction with the reason and verification timestamp.

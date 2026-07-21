# Security policy

## Public-by-design material

Wallet addresses, contract principals, pool identifiers, transaction hashes, block heights,
campaign limits, read-only source code, lessons, and historical performance claims belong here.

## Never publish

- seed phrases, WIFs, private keys, keystores, wallet registry files, or recovery material;
- passwords, API keys, OAuth/PAT tokens, session cookies, `.env` files, or MCP credential stores;
- Telegram/X credentials, private inbox/outbox content, or private contact records;
- live approval phrases, unsigned transaction payloads tied to current authority, or signer-enabled daemon state.

The private `dogbot` workspace remains the operational system. This public repository is a sanitized
evidence layer. It intentionally omits the live signer/executor while a documented strict-withdraw
safety review remains open.

## Automated release check

Run `npm run audit:public` before every commit. It rejects prohibited runtime paths, recognizable
credential formats, non-empty secret assignments, signer calls, mutating HTTP calls, and matching
material already present in Git history. The scanner permits the documented Hiro Clarity read-only
POST and no other POST. See [PUBLICATION_POLICY.md](PUBLICATION_POLICY.md) for the human-review boundary
that complements the scanner.

## Reporting

Open a GitHub issue without including a secret. If a secret has already been exposed, revoke or rotate
it first; deleting a commit is not sufficient remediation.

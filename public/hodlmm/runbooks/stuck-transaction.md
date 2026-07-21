# Stuck or unknown transaction runbook

## Purpose

Separate observer failure from chain failure and prevent duplicate execution after a local timeout.

## Trigger

Use this runbook when a transaction hash was emitted but the local process timed out, disconnected, or
lost its terminal response. Do not use it for a pre-broadcast failure; that case has `txid:null`.

## Procedure

1. Freeze the campaign write branch. Do not retry, replace, or increment the plan.
2. Preserve the original hash, role, nonce, planned postcondition, and emission timestamp.
3. Query the hash through at least one public Stacks indexer.
4. Query wallet history and nonce independently to detect replacement or an unindexed terminal result.
5. Classify exactly one state:
   - `success` — verify postconditions before considering another write;
   - `abort_by_response` or `abort_by_post_condition` — record fee and activate the failure gate;
   - `pending` — continue read-only monitoring;
   - `not_found` or contradictory — record `confirmation_unknown` and keep writes halted.
6. Re-read DLP, bins, balances, and nonce after the chain result becomes terminal.
7. Append the final receipt; never rewrite the broadcast fact.

## Retry rule

A timeout is never a retry signal. A replacement or new transaction requires a new plan built from a
fresh state, a distinct attempt ID, and fresh private authorization. If the earlier state remains
unknown, no replacement is permitted.

## Expected evidence

- original tx hash and role;
- chain status, block, fee, and verification timestamp;
- post-state or a named contradiction;
- explicit statement of whether any later transaction was broadcast.

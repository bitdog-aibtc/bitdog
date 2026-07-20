# BITDOG cross-campaign lessons

## LSN-BD-001 — a successful transaction list can still describe a losing campaign

Campaign 001 recorded 88 successful hashes and still marked approximately −$34.20 versus hold.
Execution reliability, capital performance, and accounting quality are separate metrics.

## LSN-BD-002 — no real minimum means no transaction

The first LP add stopped before broadcast until simulation produced a defensible `min-dlp`. A missing
hash is evidence that the brake worked, not missing documentation.

## LSN-BD-003 — campaign boundaries are accounting controls

Rolling residual LP directly from Campaign 001 into Campaign 003 prevented a clean realized aggregate.
Future campaigns require a charter, explicit transition rule, and zero-DLP closeout or an explicit
residual-transfer statement.

## LSN-BD-004 — local timeouts do not define chain truth

The 2026-07-05 deposit wait timed out locally, but Hiro proved the three withdrawals and deposit all
succeeded. Never retry a broadcast merely because a local waiter timed out; reconcile the hash first.

## LSN-BD-005 — active-bin movement can stale strict withdrawal guards

Campaign 003's bin `-301` withdrawal aborted with `u1022` after the active bin moved during the staged
sequence. Treat every later step as a new plan: refresh state, bounds, and postconditions before signing.

## LSN-BD-006 — campaign state outranks monitor cache

A stale monitor file claimed zero failed branches while campaign state held a real abort and active
write halt. The monitor now derives unresolved failure state from both sources and fails closed.

## LSN-BD-007 — `--force` is not authority

A force flag may bypass an ordinary timing gate only inside valid scope. It cannot erase a failed-write
halt, revive an expired charter, approve a new pool, or authorize new capital.

## LSN-BD-008 — mark-to-market is not fee attribution

HODLMM fees are embedded in changing bin balances. Until a closeout can separate fees from inventory
conversion and IL, BITDOG reports net versus hold and labels fee attribution low confidence.

## LSN-BD-009 — price the repair before making the dashboard tidy

Gas, slippage, route loss, remaining duration, and expected recovered fee edge belong in the repair
decision. A technically correct round trip can worsen the campaign.

## LSN-BD-010 — transparency stops before control material

Wallet addresses and tx hashes are public evidence. Keys, passwords, live approval tokens, signer
state, and private messages are not. An honest ledger must not become an attack surface.

# Campaign index

| ID | Kind | Capital moved? | Terminal state | Receipt roster |
|---|---|---:|---|---|
| [001](001/README.md) | Live STX/sBTC LP campaign + renewals | Yes | Accounting transitioned with residual LP | [89 receipts](001/transaction-roster.md) |
| [002](002/README.md) | Proposed clean-slate campaign | No | Not launched | [1 no-tx receipt](002/transaction-roster.md) |
| [003](003/README.md) | Residual-asset recovery/recenter campaign | Yes | Window ended, residual DLP, write-halted | [11 receipts](003/transaction-roster.md) |
| [004](004/README.md) | Conditional concentrated STX/sBTC entry | No | Armed; waiting for volume gate | [2 no-tx receipts](004/transaction-roster.md) |

Campaign IDs are immutable. A proposal that never launched remains in the index because omission would
erase a decision and a failed gate. A campaign with residual assets remains incomplete even when its
calendar window has ended.

The same records are available as a machine-readable [`catalog.json`](catalog.json). Campaign 004 has
an operator-approved US$40 total LP ceiling and relative range `-1, 0, +1`, but it is not open: no
capital has moved, the wallet remains locked, and the volume gate plus the just-in-time execution
simulations still control entry. Public files cannot authorize wallet access.

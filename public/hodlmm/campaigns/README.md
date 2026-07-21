# Campaign index

| ID | Kind | Capital moved? | Terminal state | Receipt roster |
|---|---|---:|---|---|
| [001](001/README.md) | Live STX/sBTC LP campaign + renewals | Yes | Accounting transitioned with residual LP | [89 receipts](001/transaction-roster.md) |
| [002](002/README.md) | Proposed clean-slate campaign | No | Not launched | [1 no-tx receipt](002/transaction-roster.md) |
| [003](003/README.md) | Residual-asset recovery/recenter campaign | Yes | Window ended, residual DLP, write-halted | [11 receipts](003/transaction-roster.md) |
| [004](004/README.md) | Draft design only | No | Not authorized; zero allocation | No receipts |

Campaign IDs are immutable. A proposal that never launched remains in the index because omission would
erase a decision and a failed gate. A campaign with residual assets remains incomplete even when its
calendar window has ended.

The same records are available as a machine-readable [`catalog.json`](catalog.json). Campaign 004 is a
public design document only and cannot authorize wallet access.

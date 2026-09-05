# Token Gobbler — browser-bridge tab navigation test action

Reusable procedure to open the Token Gobbler modal and click through every tab,
reading the page after each. Drive it with the browser-bridge tools
(`browser_click`, `browser_snapshot`, `browser_get_text`). Indices are resolved
fresh from a snapshot each run (they shift as the session log grows), so the
**procedure** below is the reusable part, not hardcoded indices.

## The action

```
1. OPEN MODAL   → browser_click on the FAB (label: "Open Token Gobbler activity", glyph 🦃)
2. RESOLVE TABS → browser_snapshot region ".tg-seg"  (lists Events Cost Models Performance Tokens Sessions Pricing)
3. FOR EACH TAB → browser_click on the tab button, then browser_get_text ".tg-modal-body"
                  and assert the tab's signature string (below).
```

## Tab → signature string to assert after clicking

| Tab          | Signature (browser_get_text `.tg-modal-body`)         |
| ------------ | ------------------------------------------------------ |
| Events       | `ACTIVITY BY EVENT TYPE` + `TOP TOOLS`                  |
| Cost         | `WHAT IT WOULD COST THE CORP` + `COST BY DAY`           |
| Models       | `WHAT YOU ACTUALLY RAN` (real mix)                      |
| Performance  | `PERFORMANCE BY MODEL`                                   |
| Tokens       | `TOKEN BREAKDOWN — PER TURN & STEP`                     |
| Sessions     | `COST BY SESSION` (or the session table)                |
| Pricing      | `RATE CARDS — $ PER 1M TOKENS`                          |

## Notes

- The tab bar is `.tg-seg`; the clickable tab buttons are descendants (`.tg-seg-btn`).
- Resolve the button index from a `browser_snapshot` on `.tg-modal-panel` (the
  tab buttons appear there) — indices are NOT stable across reloads.
- The modal is a global overlay — open it from the FAB without selecting a workspace.
- Pricing's native `<select>` and number/decimal inputs are the interactive parts;
  `box-sizing:border-box` applies to the whole overlay via
  `.tg-root *,.tg-modal-overlay *` (client/token-gobbler.css).

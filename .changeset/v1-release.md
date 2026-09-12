---
"token-gobbler": major
---

Initial release: v3 trajectory support, turn timeline, llama.cpp metrics, and projection store merge.

Major features:
- Parser now handles both v0 and v3 DSH trajectory formats in one pass
- Per-turn outline & event timeline in every session drawer (prompts, outcomes, errors, retries, approvals, compactions, model changes)
- New Llama.cpp Metrics tab with live Prometheus endpoint polling and real-time charts
- Projection store merge: reads both legacy file and new directory store
- Trajectory shape snapshots for format-change detection (npm run report:shape)
- Sticky table headers scoped to bounded containers (fix floating bug)
- Tab consolidation: Models merged into Cost, Sessions removed
- Complete data structure documentation (docs/data-structures.md)

Tests: 1400+ total (71 llama-metrics, 304 v3, 138 drawers, 108 sticky, 51 report merge).
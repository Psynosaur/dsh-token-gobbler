"use strict";
(() => {
  // client/token-gobbler.css
  var token_gobbler_default = "/* token-gobbler \xB7 scoped styles */\n\n/* \u2500\u2500 base \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-root,.tg-modal-overlay{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e5e7eb;line-height:1.45}\n.tg-root *,.tg-modal-overlay *{box-sizing:border-box}\n.tg-num{font-variant-numeric:tabular-nums;font-feature-settings:'tnum'}\n\n/* \u2500\u2500 cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-card{background:linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015));border:1px solid rgba(255,255,255,0.08);border-radius:14px}\n.tg-label{font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#94a3b8}\n.tg-faint{color:#64748b}\n.tg-sec{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#64748b}\n.tg-muted{color:#94a3b8}\n\n/* \u2500\u2500 stat cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-stat{padding:14px 16px;transition:border-color .15s ease,transform .15s ease}\n.tg-stat:hover{border-color:rgba(255,255,255,0.2);transform:translateY(-2px)}\n.tg-stat-dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex:none}\n.tg-stat-value{font-size:22px;font-weight:700;margin-top:7px;letter-spacing:-0.01em}\n.tg-stat-total{border-color:rgba(251,191,36,0.35);background:linear-gradient(180deg,rgba(251,191,36,0.10),rgba(255,255,255,0.02))}\n.tg-stat-total .tg-stat-value{color:#fbbf24;font-size:24px}\n\n/* \u2500\u2500 hero / WFH \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-hero{padding:18px 20px;background:linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.1)}\n.tg-hero-value{font-size:34px;font-weight:800;letter-spacing:-0.02em;margin-top:2px}\n.tg-wfh{padding:18px 20px;background:linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.02));border:1px solid rgba(16,185,129,0.32)}\n.tg-wfh-value{font-size:28px;font-weight:800;letter-spacing:-0.02em;margin-top:2px;color:#34d399}\n.tg-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:5px 11px;border-radius:999px;background:rgba(16,185,129,0.16);border:1px solid rgba(16,185,129,0.35);color:#34d399;white-space:nowrap}\n\n/* \u2500\u2500 segmented control \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-seg{display:inline-flex;gap:3px;padding:3px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px}\n.tg-seg-btn{font-size:12px;font-weight:600;padding:5px 13px;border-radius:7px;border:none;cursor:pointer;color:#94a3b8;background:transparent;transition:background .15s ease,color .15s ease}\n.tg-seg-btn:hover{color:#e5e7eb}\n.tg-seg-btn.active{background:rgba(251,191,36,0.16);color:#fde68a}\n\n/* \u2500\u2500 tables \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-table{width:100%;border-collapse:separate;border-spacing:0;font-size:13px}\n.tg-th{text-align:left;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#94a3b8;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.12);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}\n/* Sticky headers are SCOPED to the table's own scroll container. `position:sticky`\n   resolves against the nearest scrolling ancestor, so an unbounded one (a plain\n   `overflow:visible` wrapper) made the header stick to the MODAL BODY \u2014 floating\n   over every drawer's content as it scrolled past. Any scroll container that can\n   hold a sticky table is therefore vertical (see .tg-vscroll / .tg-field-scroll),\n   and the offset matches its top padding. */\n.tg-tscroll>.tg-sticky .tg-th,\n.tg-vscroll>.tg-sticky .tg-th,\n.tg-scrollable>.tg-sticky .tg-th,\n.tg-field-scroll>.tg-sticky .tg-th{position:sticky;top:0;z-index:2;background:#0d1524}\n.tg-sticky .tg-th{background:#0d1524}\n.tg-th-r{text-align:right}\n/* Sortable table headers */\n.tg-sortable{cursor:pointer;user-select:none;transition:color .15s ease}\n.tg-sortable:hover{color:#e5e7eb}\n.tg-sorted{color:#fbbf24}\n.tg-td{padding:11px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:#e5e7eb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}\n.tg-td-r{text-align:right}\n.tg-tr{transition:background .12s ease}\n.tg-tr:hover{background:rgba(255,255,255,0.03)}\n.tg-tr:last-child .tg-td{border-bottom:none}\n.tg-tr.tg-total td{border-top:2px solid rgba(251,191,36,0.3);background:rgba(251,191,36,0.05)}\n.tg-tr.tg-total:hover td{background:rgba(251,191,36,0.08)}\n.tg-kind{font-size:12px;font-weight:600}\n/* Archived sessions (archived in the DSH GUI): dimmed row + \u{1F4E6} marker in the title. */\n.tg-tr.tg-archived .tg-td{opacity:0.5}\n.tg-archived-badge{font-size:10px;margin-right:2px;filter:grayscale(0.4)}\n\n/* \u2500\u2500 scroll containers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-scroll{overflow-x:auto}\n.tg-scroll::-webkit-scrollbar{height:8px}\n.tg-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:4px}\n.tg-scroll::-webkit-scrollbar-track{background:transparent}\n/* Height-UNBOUNDED by default: a table sits inline in the modal flow (the whole\n   body scrolls), which is what the long per-session lists want. Only when the\n   container must pin a sticky header is it made vertical (.tg-vscroll, applied by\n   TgTable while no drawer row is open) \u2014 an unbound container is what let a\n   sticky header escape and hover over the drawers. */\n.tg-tscroll{overflow:visible}\n.tg-vscroll{max-height:min(62vh,760px);overflow-y:auto;overflow-x:auto;overscroll-behavior:contain}\n.tg-vscroll::-webkit-scrollbar{width:8px;height:8px}\n.tg-vscroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:4px}\n.tg-vscroll::-webkit-scrollbar-track{background:transparent}\n/* A bounded field inside a scrollable drawer: a tall-but-capped window with its\n   own sticky header (used by the per-turn step table). */\n.tg-field-scroll{max-height:min(70vh,900px);overflow-y:auto;overflow-x:auto;overscroll-behavior:contain;border-radius:8px}\n.tg-field-scroll::-webkit-scrollbar{width:8px}\n.tg-field-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:4px}\n.tg-field-scroll::-webkit-scrollbar-track{background:transparent}\n\n/* \u2500\u2500 buttons \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-refresh{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;padding:7px 14px;border-radius:9px;cursor:pointer;border:1px solid rgba(251,191,36,0.4);background:rgba(251,191,36,0.12);color:#fde68a;transition:background .15s ease,transform .1s ease,border-color .15s ease;white-space:nowrap}\n.tg-refresh:hover{background:rgba(251,191,36,0.2);border-color:rgba(251,191,36,0.6)}\n.tg-refresh:active{transform:scale(0.97)}\n.tg-refresh:disabled{opacity:0.55;cursor:default}\n.tg-reprocess{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;padding:7px 14px;border-radius:9px;cursor:pointer;border:1px solid rgba(167,139,250,0.4);background:rgba(167,139,250,0.12);color:#c4b5fd;transition:background .15s ease,transform .1s ease,border-color .15s ease;white-space:nowrap}\n.tg-reprocess:hover{background:rgba(167,139,250,0.22);border-color:rgba(167,139,250,0.6)}\n.tg-reprocess:active{transform:scale(0.97)}\n.tg-reprocess:disabled{opacity:0.55;cursor:default}\n.tg-ghost{font-size:12px;font-weight:600;padding:7px 12px;border-radius:9px;cursor:pointer;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:#cbd5e1;transition:background .15s ease,border-color .15s ease;white-space:nowrap}\n.tg-ghost:hover{background:rgba(255,255,255,0.09);border-color:rgba(255,255,255,0.24)}\n.tg-ghost:disabled{opacity:0.55;cursor:default}\n\n/* \u2500\u2500 FAB \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-fab{position:fixed;bottom:22px;right:22px;z-index:1;width:46px;height:46px;border-radius:50%;border:1px solid rgba(251,191,36,0.45);background:rgba(20,16,8,0.82);backdrop-filter:blur(8px);box-shadow:0 8px 24px rgba(0,0,0,0.45);cursor:pointer;font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;transition:transform .12s ease,background .15s ease,border-color .15s ease}\n.tg-fab:hover{transform:scale(1.06);background:rgba(40,30,12,0.9);border-color:rgba(251,191,36,0.7)}\n.tg-fab:active{transform:scale(0.97)}\n\n/* \u2500\u2500 modal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-modal-overlay{position:fixed;inset:0;z-index:2;display:flex;align-items:center;justify-content:center}\n.tg-modal-mask{position:absolute;inset:0;background:rgba(2,6,12,0.62);backdrop-filter:blur(3px)}\n.tg-modal-panel{position:relative;z-index:1;width:min(2360px,calc(100vw - 48px));height:min(1720px,calc(100vh - 48px));background:linear-gradient(180deg,#0e1626,#0b111d);border:1px solid rgba(255,255,255,0.1);border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,0.6);display:flex;flex-direction:column;overflow:hidden;color:#e5e7eb}\n.tg-modal-header{flex:none;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:18px 20px 14px;border-bottom:1px solid rgba(255,255,255,0.07)}\n.tg-close{cursor:pointer;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:#cbd5e1;font-size:14px;display:flex;align-items:center;justify-content:center;transition:background .15s ease,border-color .15s ease,color .15s ease}\n.tg-close:hover{background:rgba(248,113,113,0.18);border-color:rgba(248,113,113,0.4);color:#fca5a5}\n.tg-modal-body{flex:1;min-height:0;overflow:auto;padding:20px}\n.tg-modal-body::-webkit-scrollbar{width:10px;height:8px}\n.tg-modal-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:5px}\n\n/* \u2500\u2500 chips \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* auto-FIT (not auto-fill): with the doubled modal width, unused tracks collapse\n   so the actual chips/cards stretch to fill the whole row instead of leaving a\n   dead column of empty space on the right. */\n.tg-chipgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}\n.tg-chip{display:flex;align-items:center;gap:8px;padding:11px 13px;background:linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015));border:1px solid rgba(255,255,255,0.08);border-radius:12px}\n.tg-chip-label{font-size:12px;color:#94a3b8;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.tg-chip-value{font-size:16px;font-weight:700;color:#f1f5f9}\n.tg-bar{height:8px;border-radius:4px;background:linear-gradient(90deg,#f59e0b,#fbbf24);min-width:2px}\n\n/* \u2500\u2500 rows / chevrons \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-row-btn{cursor:pointer}\n.tg-chev{display:inline-block;width:14px;font-size:10px;color:#64748b;transition:transform .15s ease}\n.tg-chev.open{transform:rotate(90deg);color:#fbbf24}\n\n/* \u2500\u2500 TgTable pager + drawer cell \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-pager{display:flex;align-items:center;gap:10px;padding:8px 4px}\n.tg-drawer-cell{padding:0;border-bottom:1px solid rgba(255,255,255,0.08);min-width:0;width:100%;box-sizing:border-box}\n\n/* \u2500\u2500 badge grid (shared costCard row: Cost / Combined / Daily tabs) \u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-badgegrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}\n\n/* active state for ghost buttons (the heatmap range switchers) \u2014 matches the\n   segmented control's active look */\n.tg-ghost.active{background:rgba(251,191,36,0.16);border-color:rgba(251,191,36,0.45);color:#fde68a}\n\n/* \u2500\u2500 Daily tab: calendar heatmap \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-day{display:flex;flex-direction:column;gap:20px}\n.tg-day-ov{display:flex;flex-direction:column;gap:18px;scroll-margin-top:8px}\n.tg-day-ov-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.tg-heat-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:10px}\n.tg-heat-ranges{display:flex;gap:6px;align-items:center}\n.tg-heat-scroll{position:relative;overflow-x:auto;border-radius:10px}\n.tg-heat-months{margin-bottom:4px;min-height:14px}\n.tg-heat-month{font-size:10px;color:#64748b;font-weight:600;white-space:nowrap;overflow:visible}\n/* 1fr columns + 1fr rows so the grid spans the full modal width; the dynamic\n   part (min-width floor, the months' repeat(weeks,1fr) template) stays inline */\n.tg-heat-cells{width:100%;height:280px;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;grid-template-rows:repeat(7,1fr);column-gap:4px;row-gap:4px}\n.tg-heat-cell{border-radius:4px;outline-offset:1px}\n.tg-heat-cell.clickable{cursor:pointer}\n.tg-heat-cell.out{opacity:0.35}\n.tg-heat-cell.today{outline:1.5px solid rgba(248,250,252,0.75)}\n.tg-heat-cell.selected{outline:1.5px solid #fbbf24}\n.tg-heat-legend{display:flex;justify-content:flex-end;align-items:center;gap:4px;margin-top:4px}\n.tg-heat-sw{width:11px;height:11px;border-radius:3px;display:inline-block}\n\n/* fixed-position day tooltip \u2014 rendered as a sibling of the scroll wrapper;\n   position:fixed anchors it to the cursor so NOTHING can clip it */\n.tg-tip{position:fixed;z-index:60;pointer-events:none;width:280px;background:#0d1524;border:1px solid rgba(255,255,255,0.14);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.5);padding:10px 12px;font-size:11.5px}\n.tg-tip-date{font-weight:700;color:#f1f5f9;font-size:12px}\n.tg-tip-sub{color:#94a3b8;margin-top:2px;font-size:11px}\n.tg-tip-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 10px;margin-top:7px}\n.tg-tip-k{color:#64748b}\n.tg-tip-total{color:#fbbf24}\n.tg-tip-foot{font-size:10px;margin-top:7px}\n\n/* \u2500\u2500 drawer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-drawer-row{background:rgba(255,255,255,0.02)}\n.tg-drawer-inner{padding:16px 18px 18px 42px;display:flex;flex-direction:column;gap:16px;width:100%;min-width:0;max-width:100%;box-sizing:border-box}\n/* scrollable sub-tables inside drawers (per-step, tool payload, etc.) */\n.tg-scrollable{max-height:320px;overflow-y:auto;overscroll-behavior:contain;border-radius:8px}\n.tg-scrollable::-webkit-scrollbar{width:7px}\n.tg-scrollable::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.10);border-radius:4px}\n.tg-scrollable::-webkit-scrollbar-track{background:transparent}\n.tg-group td{padding:8px 12px 4px;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#64748b;border-bottom:1px solid rgba(255,255,255,0.08);background:#0d1524}\n/* Group headers pin under the column header, in the same bounded containers. */\n.tg-tscroll>.tg-sticky .tg-group td,.tg-vscroll>.tg-sticky .tg-group td,.tg-scrollable>.tg-sticky .tg-group td,.tg-field-scroll>.tg-sticky .tg-group td{position:sticky;z-index:1;background:#0d1524}\n/* meta cards stretch to fill the drawer width (auto-fit collapses empty tracks) */\n.tg-meta-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}\n.tg-meta{background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px 13px;min-width:0}\n.tg-meta-k{font-size:10.5px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#64748b}\n.tg-meta-v{font-size:13.5px;color:#e5e7eb;margin-top:4px;word-break:break-word}\n.tg-drawer-sec{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#94a3b8;margin-bottom:8px}\n.tg-drawer-sub{font-size:11px;font-weight:600;color:#64748b;margin-bottom:6px}\n.tg-turn{border-left:2px solid rgba(251,191,36,0.45);padding:6px 12px;margin-bottom:8px;background:rgba(255,255,255,0.02);border-radius:0 8px 8px 0}\n.tg-turn-p{font-size:12.5px;color:#e5e7eb;font-weight:600;word-break:break-word}\n.tg-turn-r{font-size:12px;color:#94a3b8;margin-top:4px;line-height:1.5;word-break:break-word}\n\n/* \u2500\u2500 inputs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-input{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:7px;color:#e5e7eb;font-size:12.5px;padding:6px 8px;font-variant-numeric:tabular-nums;min-width:0}\n.tg-input:focus{outline:none;border-color:rgba(251,191,36,0.55)}\n.tg-input-num{text-align:right;-webkit-appearance:none;-moz-appearance:textfield;appearance:textfield}\n/* hide number spinners \u2014 they reserve a box that crowds the right-aligned value */\n.tg-input-num::-webkit-outer-spin-button,.tg-input-num::-webkit-inner-spin-button{-webkit-appearance:none;appearance:none;margin:0}\n.tg-input-label{width:100%}\n.tg-input-id{width:100%;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:#94a3b8}\n\n/* \u2500\u2500 pricing rate field (2-col grid inside a card) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-rate-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px}\n.tg-rate-field{display:flex;flex-direction:column;gap:4px;min-width:0}\n.tg-rate-field input{width:100%;min-width:0}\n\n/* \u2500\u2500 perf bar chart (reusable metricBars) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* (The hand-rolled metricBars were replaced by the canvas graph engine \u2014 see\n   client/graph.ts. These legacy classes are kept only for the simple\n   tool-share bar in the session drawer.) */\n/* .tg-chart is width:100% + min/max-width:0 so a chart with hundreds of bars\n   never expands its parent (the drawer <td> / modal) \u2014 the bars scroll inside\n   .tg-barchart instead. Legend is a bullet list outside the chart. */\n.tg-chart{display:flex;flex-direction:column;gap:8px;width:100%;min-width:0;max-width:100%}\n.tg-barchart{display:flex;align-items:flex-end;gap:3px;overflow-x:auto;width:100%;min-width:0;max-width:100%;padding:0 2px 2px}\n.tg-barchart::-webkit-scrollbar{height:7px}\n.tg-barchart::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.10);border-radius:4px}\n.tg-barstep{display:flex;flex-direction:column;align-items:center;gap:2px;flex:none;min-width:24px}\n.tg-bararea{height:150px;display:flex;align-items:flex-end;gap:2px}\n.tg-bar{width:9px;border-radius:2px 2px 0 0;min-height:2px}\n.tg-bar-decode{background:#38bdf8}\n.tg-bar-prefill{background:#2dd4bf}\n.tg-bar-in{background:#60a5fa}\n.tg-bar-out{background:#a78bfa}\n.tg-bar-cache{background:#2dd4bf}\n.tg-bar-think{background:#c084fc}\n.tg-barstep-x{font-size:9px;color:#64748b;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}\n.tg-barstep-sub{font-size:8px;color:#64748b;max-width:56px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.tg-legend{list-style:disc;margin:0;padding-left:20px;font-size:11px;color:#94a3b8;display:flex;flex-direction:column;gap:3px}\n.tg-legend-i{display:flex;align-items:center;gap:6px}\n.tg-legend-dot{width:10px;height:10px;border-radius:2px;display:inline-block;flex:none}\n\n/* legend chips \u2014 one per series group (context window); click to hide/show it.\n   Swatch = the window's paired lines: solid (decode) over dotted (prefill).\n   The row is a wrapping flex line so the chips keep a gap (they are rendered as\n   an array of buttons with no whitespace between them). */\n.tg-legend-chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}\n.tg-legend-chip{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#cbd5e1;cursor:pointer;white-space:nowrap;transition:background .12s ease,opacity .12s ease}\n.tg-legend-chip:hover{background:rgba(255,255,255,0.1)}\n.tg-legend-chip .sw{display:inline-flex;flex-direction:column;gap:3px;width:16px;flex:none}\n.tg-legend-chip .sw i{display:block;width:100%;height:0;border-top:2px solid #888}\n.tg-legend-chip .sw i.dash{border-top-style:dotted}\n.tg-legend-chip .sw i.dot{width:7px;height:7px;border:0;border-radius:50%;margin:0 auto}\n.tg-legend-chip.off{opacity:0.38}\n.tg-legend-chip.static{cursor:default}\n.tg-legend-chip.static:hover{background:rgba(255,255,255,0.04)}\n\n/* \u2500\u2500 canvas graph engine (client/graph.ts + client/graph-canvas.tsx) \u2500\u2500\u2500\u2500\u2500\n   Every chart in the plugin is drawn here: one\n   <canvas> per panel, sized to its container (min-width:0 so a wide chart can\n   never push the drawer <td> / modal wide) and repainted at device-pixel\n   resolution by the React shell in client/graph-canvas.tsx. */\n.tg-graph{width:100%;min-width:0;max-width:100%;display:flex;flex-direction:column;gap:8px}\n.tg-graph-plot{position:relative;width:100%;min-width:0;max-width:100%}\n.tg-graph-canvas{display:block;width:100%;border-radius:10px;cursor:crosshair}\n/* plot-mode switch \u2014 Lines / Both / Dots (a scatter), a segmented control that\n   sits above the plot; the choice is part of the chart's persisted state. */\n.tg-graph-modes{display:inline-flex;align-self:flex-end;gap:2px;padding:2px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.03)}\n.tg-graph-mode{font-size:10.5px;font-weight:600;padding:2px 10px;border:0;border-radius:999px;background:transparent;color:#94a3b8;cursor:pointer;white-space:nowrap;transition:background .12s ease,color .12s ease}\n.tg-graph-mode:hover{background:rgba(255,255,255,0.08);color:#e2e8f0}\n.tg-graph-mode.on{background:rgba(96,165,250,0.22);color:#dbeafe}\n\n/* hover tooltip rows (the shared multi-series box) */\n.tg-cv-tip-row{display:flex;align-items:center;gap:7px;margin-top:3px;font-size:11px}\n.tg-cv-tip-row i.dot{display:inline-block;width:7px;height:7px;border-radius:50%;flex:none}\n.tg-cv-tip-row .k{color:#94a3b8;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.tg-cv-tip-row .v{color:#f1f5f9;font-weight:600;font-variant-numeric:tabular-nums}\n\n/* \u2500\u2500 collapse (reusable) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-collapse{display:flex;flex-direction:column;gap:8px}\n.tg-collapse-head{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:#cbd5e1;padding:6px 11px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;width:fit-content;transition:background .12s ease,border-color .12s ease}\n.tg-collapse-head:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.18)}\n\n/* \u2500\u2500 settings section + chart defaults card (client/chart-settings.tsx) \u2500\u2500\u2500 */\n.tg-set-card{padding:14px 16px;display:flex;flex-direction:column;gap:11px}\n/* Label | control on the first line, the hint on its OWN line underneath. The\n   hint used to be the grid's third column, which the DSH settings pane (a\n   narrow column on a wide viewport \u2014 the media query below never fires there)\n   squeezed into a ~100px ribbon of text, or pushed clean out of the card by an\n   over-wide control. Two columns + a full-width hint cannot do either. */\n.tg-set-row{display:grid;grid-template-columns:minmax(110px,168px) minmax(0,1fr);gap:6px 12px;align-items:center}\n.tg-set-label{font-size:12px;font-weight:600;color:#cbd5e1}\n.tg-set-ctl{display:flex;align-items:center;min-width:0;flex-wrap:wrap}\n.tg-set-hint{grid-column:1 / -1;font-size:11px;color:#64748b;line-height:1.5;max-width:78ch;overflow-wrap:anywhere}\n/* One collapsible drawer per settings group: the numbers that matter stay on the\n   HEAD (visible while the drawer is closed), the cards unfold underneath. */\n.tg-set-drawers{display:flex;flex-direction:column;gap:10px}\n.tg-set-drawers .tg-collapse{gap:0}\n.tg-set-drawers .tg-collapse-head{width:100%;padding:10px 13px}\n.tg-set-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;flex:1;min-width:0}\n.tg-set-head-t{font-size:12.5px;font-weight:700;color:#e2e8f0}\n.tg-set-chip{display:inline-flex;align-items:baseline;gap:5px;background:rgba(148,163,184,0.10);border-radius:6px;padding:2px 8px;font-size:11px;white-space:nowrap}\n.tg-set-head .tg-set-chip:first-of-type{margin-left:auto}\n.tg-set-chip-l{color:#94a3b8}\n.tg-set-chip-v{color:#e5e7eb;font-weight:700}\n.tg-set-body{display:flex;flex-direction:column;gap:14px;padding:2px 2px 4px}\n.tg-set-inline{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.tg-set-unit{font-size:11px;color:#64748b}\n.tg-set-toggle{font-size:11px;padding:4px 10px;border-radius:8px}\n.tg-set-foot{display:flex;align-items:center;gap:12px;margin-top:2px;border-top:1px solid rgba(255,255,255,0.07);padding-top:11px}\n.tg-range{width:120px;height:4px;-webkit-appearance:none;appearance:none;background:rgba(255,255,255,0.14);border-radius:3px;outline:none}\n.tg-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;border-radius:50%;background:#fbbf24;cursor:pointer}\n.tg-range::-moz-range-thumb{width:12px;height:12px;border:0;border-radius:50%;background:#fbbf24;cursor:pointer}\n.tg-range:disabled{opacity:0.4}\n@media (max-width: 900px){.tg-set-row{grid-template-columns:1fr;gap:6px}}\n\n/* \u2500\u2500 misc \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* delete button \u2014 same height & radius as the corp/local <select> (.tg-input) so they\n   sit level in the card-header flex row. padding:6px 11px + line-height:1.45 \u2248 30px. */\n.tg-del{cursor:pointer;color:#64748b;font-size:12.5px;line-height:1.45;padding:6px 11px;border-radius:7px;border:1px solid rgba(255,255,255,0.1);background:transparent;transition:color .12s ease,border-color .12s ease,background .12s ease}\n.tg-del:hover{color:#fca5a5;border-color:rgba(248,113,113,0.4);background:rgba(248,113,113,0.10)}\n.tg-flash-ok{color:#34d399;font-size:12.5px;font-weight:600}\n.tg-flash-err{color:#f87171;font-size:12.5px;font-weight:600}\n.tg-refrow{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:14px 16px}\n.tg-kind-badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;white-space:nowrap}\n\n/* \u2500\u2500 compaction: COMPACTED banner rows (step table) + detail popup \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* the monospace COMPACTED badge (shared by the banner row and the popup header) */\n.tg-comp-badge{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:800;letter-spacing:0.08em;padding:3px 9px;border-radius:6px;background:rgba(251,191,36,0.15);border:1px solid rgba(251,191,36,0.4);color:#fbbf24;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:nowrap;flex:none}\n/* banner row in the step table \u2014 a full-width clickable strip between turns */\n.tg-comp-row td{background:rgba(251,191,36,0.06);border-top:1px solid rgba(251,191,36,0.28);border-bottom:1px solid rgba(251,191,36,0.28);cursor:pointer;padding:6px 12px}\n.tg-comp-row:hover td{background:rgba(251,191,36,0.13)}\n.tg-comp-row-fail td{background:rgba(248,113,113,0.06);border-color:rgba(248,113,113,0.32)}\n.tg-comp-row-fail:hover td{background:rgba(248,113,113,0.13)}\n.tg-comp-row-fail .tg-comp-badge{background:rgba(248,113,113,0.15);border-color:rgba(248,113,113,0.45);color:#f87171}\n/* running = compaction in progress (start seen, no end yet) \u2014 neutral indigo,\n   deliberately NOT red (red is reserved for genuine failures) */\n.tg-comp-row-run td{background:rgba(129,140,248,0.06);border-color:rgba(129,140,248,0.32)}\n.tg-comp-row-run:hover td{background:rgba(129,140,248,0.13)}\n.tg-comp-row-run .tg-comp-badge,.tg-comp-badge-run{background:rgba(129,140,248,0.15);border-color:rgba(129,140,248,0.45);color:#a5b4fc}\n.tg-comp-banner{display:flex;align-items:center;gap:10px;width:100%;min-width:0}\n.tg-comp-row-meta{font-size:11px;color:#94a3b8;margin-left:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n/* the detail popup \u2014 a smaller panel than the main modal */\n.tg-comp-panel{width:min(980px,calc(100vw - 48px))!important;height:min(780px,calc(100vh - 48px))!important}\n/* Fixed-height modal: header + meta grid never scroll \u2014 only the summary box. */\n.tg-comp-panel .tg-modal-body{display:flex;flex-direction:column;overflow:hidden}\n.tg-comp-body{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}\n.tg-comp-summary-wrap{flex:1;min-height:0;display:flex;flex-direction:column;margin-top:8px}\n.tg-comp-summary{flex:1;min-height:0;word-break:break-word;font-size:12.5px;line-height:1.55;color:#cbd5e1;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px 14px;overflow-y:auto}\n/* markdown rendering inside the summary box (client/markdown.tsx) */\n.tg-md{font-size:12.5px;line-height:1.55;color:#cbd5e1}\n.tg-md h1{font-size:15px;font-weight:700;color:#e2e8f0;margin:12px 0 6px}\n.tg-md h2{font-size:13.5px;font-weight:700;color:#e2e8f0;margin:12px 0 5px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.08)}\n.tg-md h3,.tg-md h4,.tg-md h5,.tg-md h6{font-size:12.5px;font-weight:700;color:#e2e8f0;margin:10px 0 4px}\n.tg-md>:first-child{margin-top:0}\n.tg-md p{margin:0 0 8px}\n.tg-md ul,.tg-md ol{margin:0 0 8px;padding-left:20px}\n.tg-md li{margin:2px 0}\n.tg-md li>ul,.tg-md li>ol{margin:2px 0 4px}\n.tg-md code{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.09);border-radius:4px;padding:1px 5px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;word-break:break-word}\n.tg-md pre{background:rgba(2,6,12,0.55);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 12px;margin:0 0 8px;overflow-x:auto}\n.tg-md pre code{background:none;border:none;padding:0;font-size:11px;line-height:1.5;white-space:pre}\n.tg-md blockquote{border-left:3px solid rgba(255,255,255,0.16);padding:2px 0 2px 12px;margin:0 0 8px;color:#94a3b8}\n.tg-md hr{border:none;border-top:1px solid rgba(255,255,255,0.1);margin:10px 0}\n.tg-md a{color:#7dd3fc;text-decoration:underline}\n.tg-md del{color:#64748b}\n.tg-md table{border-collapse:collapse;margin:0 0 8px;font-size:12px}\n.tg-md th,.tg-md td{border:1px solid rgba(255,255,255,0.1);padding:4px 8px;text-align:left}\n.tg-md th{background:rgba(255,255,255,0.05);font-weight:700;color:#e2e8f0}\n.tg-comp-summary::-webkit-scrollbar{width:7px}\n.tg-comp-summary::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.10);border-radius:4px}\n.tg-comp-summary::-webkit-scrollbar-track{background:transparent}\n\n/* \u2500\u2500 imported sources (other machines / other OSes) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n   The badge MARKS a session that came from an imported DSH home; the chips\n   filter the tables by home; .tg-src-* styles the management card in Settings. */\n.tg-src-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;line-height:1;padding:3px 7px;margin-right:6px;border-radius:999px;background:rgba(56,189,248,0.14);border:1px solid rgba(56,189,248,0.4);color:#7dd3fc;vertical-align:middle;white-space:nowrap;max-width:150px;overflow:hidden;text-overflow:ellipsis}\n.tg-src-badge .tg-src-ico{font-size:11px;filter:saturate(1.1)}\n.tg-sess-title{display:inline-flex;align-items:center;min-width:0}\n/* An imported row gets a dim left rail so a column of mixed homes reads at a\n   glance \u2014 without the archived dimming (tg-archived) that means something else. */\n.tg-tr.tg-imported>.tg-td:first-child{box-shadow:inset 3px 0 0 rgba(56,189,248,0.35)}\n.tg-importline{display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#7dd3fc;background:rgba(56,189,248,0.09);border:1px solid rgba(56,189,248,0.28);border-radius:10px;padding:9px 12px;line-height:1.5}\n.tg-importline-ico{font-size:13px;line-height:1.2}\n/* the source filter chips */\n.tg-srcbar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}\n.tg-srcchip{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;padding:5px 10px;border-radius:999px;cursor:pointer;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#cbd5e1;transition:background .15s ease,border-color .15s ease,color .15s ease}\n.tg-srcchip:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.22)}\n.tg-srcchip.active{background:rgba(56,189,248,0.16);border-color:rgba(56,189,248,0.45);color:#bae6fd}\n.tg-srcchip-n{font-size:10.5px;color:#94a3b8;background:rgba(255,255,255,0.06);border-radius:999px;padding:1px 6px}\n.tg-srcchip.active .tg-srcchip-n{color:#e0f2fe;background:rgba(56,189,248,0.22)}\n/* the management card */\n.tg-src-add .tg-set-ctl{gap:8px;flex-wrap:wrap}\n.tg-src-path{min-width:280px;flex:1}\n.tg-src-name{width:170px}\n.tg-src-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.tg-src-list,.tg-src-cands{display:flex;flex-direction:column;gap:7px;border-top:1px solid rgba(255,255,255,0.07);padding-top:11px}\n.tg-src-list-head,.tg-src-cands-head{font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#94a3b8}\n.tg-src-row{display:grid;grid-template-columns:26px 1fr auto;gap:10px;align-items:center;padding:9px 11px;border-radius:10px;background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.08)}\n.tg-src-row-bad{border-color:rgba(248,113,113,0.4);background:rgba(248,113,113,0.07)}\n.tg-src-row-off{opacity:0.62}\n.tg-src-row-ico{font-size:17px;text-align:center}\n.tg-src-row-main{min-width:0;display:flex;flex-direction:column;gap:2px}\n.tg-src-row-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.tg-src-row-label{font-size:13px;font-weight:700;color:#e5e7eb}\n.tg-src-row-os{font-size:10px;font-weight:600;color:#94a3b8;background:rgba(255,255,255,0.06);border-radius:999px;padding:2px 7px}\n.tg-src-row-off-pill{font-size:10px;font-weight:700;color:#94a3b8;background:rgba(148,163,184,0.16);border-radius:999px;padding:2px 7px}\n.tg-src-row-err{font-size:11px;font-weight:600;color:#fca5a5}\n.tg-src-row-path{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:rtl;text-align:left}\n.tg-src-row-stats{font-size:11px;color:#64748b}\n.tg-src-row-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end}\n.tg-src-btn{font-size:11px;padding:5px 9px}\n.tg-src-danger{color:#fca5a5;border-color:rgba(248,113,113,0.45)}\n.tg-src-danger:hover{background:rgba(248,113,113,0.12)}\n.tg-src-confirm{display:inline-flex;align-items:center;gap:6px}\n.tg-src-msg{font-size:12px;border-radius:9px;padding:8px 11px;line-height:1.45}\n.tg-src-msg.ok{color:#6ee7b7;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3)}\n.tg-src-msg.warn{color:#fcd34d;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3)}\n.tg-src-msg.err{color:#fca5a5;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.35)}\n.tg-src-cand{display:grid;grid-template-columns:26px 1fr auto;gap:10px;align-items:center;padding:7px 10px;border-radius:9px;background:rgba(255,255,255,0.025);border:1px dashed rgba(255,255,255,0.12)}\n.tg-src-cand-main{min-width:0}\n.tg-src-cand-path{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:#cbd5e1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.tg-src-cand-stats{font-size:10.5px;color:#64748b}\n.tg-src-cand-known{font-size:11px;color:#64748b;font-style:italic}\n.tg-seg-sm .tg-seg-btn{font-size:11px;padding:4px 10px}\n";

  // client/core.ts
  var NS = "token-gobbler";
  var STRINGS = { nav: "Token Gobbler" };
  var text = (key) => STRINGS[key] ?? key;
  var API = "/token-gobbler";
  var fmt = (n) => n == null ? "0" : Number(n).toLocaleString("en-US");
  var fmtC = (n) => {
    if (n == null) return "0";
    const x = Number(n);
    if (x < 1e3) return String(x);
    if (x < 1e6) return (x / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    if (x < 1e9) return (x / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    return (x / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
  };
  var money = (n) => n == null ? "unpriced" : (Number(n) < 0 ? "-$" : "$") + Math.abs(Number(n)).toFixed(2);
  var fmtMs = (ms) => {
    if (ms == null) return "\u2014";
    const x = Number(ms);
    if (x < 1e3) return Math.round(x) + "ms";
    if (x < 6e4) return (x / 1e3).toFixed(1).replace(/\.0$/, "") + "s";
    return Math.floor(x / 6e4) + "m " + Math.round(x % 6e4 / 1e3) + "s";
  };
  var humanizeModel = (raw) => {
    if (!raw) return raw == null ? "" : String(raw);
    const tokens = String(raw).split(/[-_/]+/).filter(Boolean);
    const upper = /* @__PURE__ */ new Set(["gguf", "cfg", "ud", "xl", "k"]);
    return tokens.map((tk) => {
      const low = tk.toLowerCase();
      if (upper.has(low)) return tk.toUpperCase();
      if (/^q\d+$/.test(low)) return "Q" + tk.slice(1);
      if (/^\d+(k|m|b)$/i.test(low)) return tk.toUpperCase();
      return tk.charAt(0).toUpperCase() + tk.slice(1);
    }).join(" ");
  };
  async function request(path, body) {
    const opts = { headers: { accept: "application/json" } };
    if (body !== void 0) {
      opts.method = "POST";
      opts.headers["content-type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    const response = await fetch(API + path, opts);
    const json = await response.json().catch(() => ({}));
    if (!response.ok || !json.ok) {
      const err = new Error(json.error || "HTTP " + response.status);
      err.status = response.status;
      throw err;
    }
    return json.value;
  }
  var EVENT_META = [
    { key: "steps", label: "LLM steps", color: "#60a5fa" },
    { key: "toolCalls", label: "Tool calls", color: "#a78bfa" },
    { key: "toolSubCalls", label: "Tool runs", color: "#c084fc" },
    { key: "userMessages", label: "Your messages", color: "#34d399" },
    { key: "assistantMessages", label: "Assistant msgs", color: "#2dd4bf" },
    { key: "systemMessages", label: "System msgs", color: "#94a3b8" },
    { key: "turns", label: "Turns", color: "#fbbf24" },
    { key: "userStops", label: "User stops", color: "#f87171" },
    { key: "compactions", label: "Compactions", color: "#f472b6" },
    { key: "retries", label: "LLM retries", color: "#fb923c" },
    { key: "approvals", label: "Approvals", color: "#f87171" },
    { key: "todos", label: "Todo writes", color: "#a3e635" },
    { key: "commands", label: "Commands", color: "#38bdf8" }
  ];
  var CACHE_VERSION = 6;
  var CACHE_KEY = "tg:cache:v" + CACHE_VERSION;
  var PREV_KEYS = ["tg:cache:v1", "tg:cache:v2", "tg:cache:v3", "tg:cache:v4", "tg:cache:v5"];
  var b64FromBytes = (bytes) => {
    let bin = "";
    for (let i = 0; i < bytes.length; i += 32768) bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 32768)));
    return btoa(bin);
  };
  var bytesFromB64 = (b64) => {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };
  async function compressPayload(obj) {
    const json = JSON.stringify(obj);
    const CS = globalThis.CompressionStream;
    if (typeof CS !== "function") return json.length < 45e5 ? "raw:" + json : "";
    try {
      const stream = new Blob([json]).stream().pipeThrough(new CS("gzip"));
      const buf = await new Response(stream).arrayBuffer();
      return "gz:" + b64FromBytes(new Uint8Array(buf));
    } catch {
      return json.length < 45e5 ? "raw:" + json : "";
    }
  }
  async function decompressPayload(s) {
    if (s.startsWith("raw:")) return JSON.parse(s.slice(4));
    const DS = globalThis.DecompressionStream;
    if (typeof DS !== "function") throw new Error("unsupported cache format");
    const raw = bytesFromB64(s.slice(3));
    const stream = new Blob([raw.buffer]).stream().pipeThrough(new DS("gzip"));
    return JSON.parse(await new Response(stream).text());
  }
  async function readCache() {
    try {
      const s = localStorage.getItem(CACHE_KEY);
      if (!s) return null;
      const c = await decompressPayload(s);
      return c && c.v === 1 ? c : null;
    } catch {
      return null;
    }
  }
  var dropPrevKeys = () => {
    try {
      for (const k of PREV_KEYS) localStorage.removeItem(k);
    } catch {
    }
  };
  async function writeCache(c) {
    for (const a of [c, { ...c, breakdown: null }]) {
      try {
        const body = await compressPayload(a);
        if (!body) return;
        localStorage.setItem(CACHE_KEY, body);
        dropPrevKeys();
        return;
      } catch {
      }
    }
  }
  function clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
    }
    dropPrevKeys();
  }
  var CSS = token_gobbler_default;
  var thL = (label) => jsx("th", { className: "tg-th", children: label });
  var thR = (label) => jsx("th", { className: "tg-th tg-th-r", children: label });
  var tdL = (children, props) => jsx("td", Object.assign({ className: "tg-td" }, props || {}, { children }));
  var tdR = (children, props) => jsx("td", Object.assign({ className: "tg-td tg-td-r tg-num" }, props || {}, { children }));
  var segBtn = (tab, setTab, key, label) => jsx("button", { className: "tg-seg-btn" + (tab === key ? " active" : ""), onClick: () => setTab(key), children: label });
  var statCard = (label, value, color, isTotal) => jsxs("div", {
    className: "tg-card tg-stat" + (isTotal ? " tg-stat-total" : ""),
    children: [
      jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
        jsx("span", { className: "tg-stat-dot", style: { background: color } }),
        jsx("span", { className: "tg-label", style: isTotal ? { color: "#fbbf24" } : void 0, children: label })
      ] }),
      jsx("div", { className: "tg-stat-value tg-num", children: fmt(value) })
    ]
  });
  var eventChips = (events) => {
    if (!events) return jsx("div", { className: "tg-muted", style: { fontSize: 13 }, children: "No activity events recorded." });
    return jsx("div", { className: "tg-chipgrid", children: EVENT_META.map((m) => jsxs("div", {
      className: "tg-chip",
      children: [
        jsx("span", { className: "tg-stat-dot", style: { background: m.color } }),
        jsx("span", { className: "tg-chip-label", children: m.label }),
        jsx("span", { className: "tg-chip-value tg-num", children: fmt(events[m.key] || 0) })
      ]
    }, m.key)) });
  };
  var badgeGrid = (items) => jsx("div", { className: "tg-badgegrid", children: items });
  var toolTable = (tools, sticky) => {
    if (!tools || !tools.length) return jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No tool invocations recorded." });
    const max = tools[0].count || 1;
    const table = jsxs("table", { className: "tg-table" + (sticky ? " tg-sticky" : ""), children: [
      jsx("tr", { children: [thL("Tool"), thR("Runs"), thL("Share")] }),
      ...tools.map((t) => jsxs("tr", {
        className: "tg-tr",
        children: [
          tdL(t.name, { style: { fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 12, maxWidth: 280, whiteSpace: "normal", wordBreak: "break-all" } }),
          tdR(String(t.count), { style: { fontWeight: 600 } }),
          tdL(jsx("div", { className: "tg-bar", style: { width: Math.max(2, Math.round(t.count / max * 100)) + "%" } }))
        ]
      }, t.name))
    ] });
    return sticky ? jsx("div", { className: "tg-tscroll tg-vscroll", children: table }) : table;
  };

  // client/sources.tsx
  var LOCAL_ID = "local";
  var OS_ICON = { windows: "\u{1FA9F}", macos: "\u{1F34E}", linux: "\u{1F427}", unknown: "\u{1F4BE}" };
  var OS_NAME = { windows: "Windows", macos: "macOS", linux: "Linux", unknown: "unknown OS" };
  var osIcon = (os) => OS_ICON[String(os)] || OS_ICON.unknown;
  var osName = (os) => OS_NAME[String(os)] || OS_NAME.unknown;
  var INDEX = {};
  function setSourceIndex(payload) {
    if (!payload) return;
    const next = {};
    const local = payload.local;
    if (local) {
      next[local.id || LOCAL_ID] = {
        id: local.id || LOCAL_ID,
        label: local.label || "This machine",
        os: local.os || "unknown",
        path: local.path || "",
        imported: false,
        sessions: local.sessions,
        tokens: local.tokens
      };
    }
    for (const s of payload.imported || []) {
      if (!s || !s.id) continue;
      next[s.id] = {
        id: s.id,
        label: s.label || s.id,
        os: s.os || "unknown",
        path: s.path || "",
        imported: true,
        enabled: s.enabled !== false,
        error: s.error || null,
        // Prefer the counters of the load being displayed; fall back to the last scan.
        sessions: s.live ? s.live.sessions : s.scan ? (s.scan.sessions || 0) + (s.scan.legacySessions || 0) : void 0,
        tokens: s.live ? s.live.tokens : s.scan ? s.scan.tokens : void 0
      };
    }
    INDEX = next;
  }
  var sourceIndex = () => INDEX;
  var sourceInfo = (id) => id ? INDEX[String(id)] || null : null;
  var localSource = () => INDEX[LOCAL_ID] || null;
  var importedSources = () => Object.values(INDEX).filter((s) => s.imported);
  var hasImports = () => importedSources().length > 0;
  var isImported = (row) => !!(row && row.source && row.source !== LOCAL_ID);
  function sourceBadge(row, opts = {}) {
    if (!isImported(row)) return null;
    const info = sourceInfo(row.source);
    const label = info ? info.label : String(row.source);
    const title = (info ? osName(info.os) + " \xB7 " + info.path : "imported source") + (info && info.error ? " \u2014 " + info.error : "");
    return jsxs("span", {
      className: "tg-src-badge",
      title,
      children: [
        jsx("span", { className: "tg-src-ico", children: osIcon(info ? info.os : "unknown") }, "ico"),
        jsx("span", { children: opts.short ? label.split(/[·(]/)[0].trim() : label }, "lbl")
      ]
    }, "src");
  }
  var sourceSessionCount = (id, rows) => (rows || []).reduce((n, r) => n + ((id === LOCAL_ID ? !isImported(r) : r.source === id) ? 1 : 0), 0);
  function SourceFilterBar(props) {
    const all = importedSources();
    if (!all.length) return null;
    const local = localSource();
    const chips = [
      { id: "all", label: "All sources", count: (props.rows || []).length, title: "Every home \u2014 this machine and every import" }
    ];
    const localCount = sourceSessionCount(LOCAL_ID, props.rows);
    if (!props.compact || localCount > 0) chips.push({
      id: LOCAL_ID,
      label: osIcon(local ? local.os : "linux") + " This machine",
      count: localCount,
      title: (local ? local.path : "the local DSH home") + " \u2014 sessions that ran here"
    });
    for (const s of all) {
      const count = sourceSessionCount(s.id, props.rows);
      if (props.compact && count === 0) continue;
      chips.push({
        id: s.id,
        label: osIcon(s.os) + " " + s.label,
        count,
        title: osName(s.os) + " \xB7 " + s.path + (s.error ? " \u2014 " + s.error : "")
      });
    }
    const value = chips.some((c) => c.id === props.value) ? props.value : "all";
    return jsx("div", { className: "tg-srcbar", children: chips.map((c) => jsxs("button", {
      className: "tg-srcchip" + (value === c.id ? " active" : "") + (c.id === "all" ? " tg-srcchip-all" : ""),
      title: c.title + " \xB7 " + fmt(c.count) + " session" + (c.count === 1 ? "" : "s"),
      onClick: () => props.onChange(c.id),
      children: [
        jsx("span", { className: "tg-srcchip-name", children: c.label }, "n"),
        jsx("span", { className: "tg-srcchip-n tg-num", children: fmt(c.count) }, "c")
      ]
    }, c.id)) });
  }
  var inSourceFilter = (row, filter) => {
    if (!filter || filter === "all") return true;
    if (filter === LOCAL_ID) return !isImported(row);
    return row && row.source === filter;
  };
  function importedSummary(payload) {
    const imported = payload && payload.imported || [];
    if (!imported.length) return null;
    const sessions = imported.reduce((n, s) => n + ((s.live ? s.live.sessions : 0) || 0), 0);
    const tokens = imported.reduce((n, s) => n + ((s.live ? s.live.tokens : 0) || 0), 0);
    const broken = imported.filter((s) => s.error).length;
    const off = imported.filter((s) => s.enabled === false).length;
    return {
      sources: imported.length,
      sessions,
      tokens,
      broken,
      off,
      text: fmt(imported.length) + " imported home" + (imported.length === 1 ? "" : "s") + " \xB7 " + fmt(sessions) + " session" + (sessions === 1 ? "" : "s") + (tokens ? " \xB7 " + fmtC(tokens) + " tokens" : "") + (off ? " \xB7 " + off + " off" : "") + (broken ? " \xB7 " + broken + " unreadable" : "")
    };
  }

  // client/table.tsx
  var groupRows = (rows, groupBy) => {
    const out = [];
    let cur = null;
    for (const r of rows ?? []) {
      const label = groupBy ? groupBy(r) : null;
      if (!cur || cur.label !== label) {
        cur = { label, rows: [] };
        out.push(cur);
      }
      cur.rows.push(r);
    }
    return out;
  };
  var sortRows = (rows, sort) => {
    const key = sort.key;
    const dir = sort.dir;
    const multiplier = dir === "asc" ? 1 : -1;
    return rows.slice().sort(function(a, b) {
      let va = a[key];
      let vb = b[key];
      if (key.indexOf(".") >= 0) {
        const parts = key.split(".");
        va = parts.reduce(function(o, p) {
          return o && o[p] != null ? o[p] : null;
        }, a);
        vb = parts.reduce(function(o, p) {
          return o && o[p] != null ? o[p] : null;
        }, b);
      }
      if (va == null && vb == null) return 0;
      if (va == null) return 1 * multiplier;
      if (vb == null) return -1 * multiplier;
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * multiplier;
      }
      return String(va).localeCompare(String(vb)) * multiplier;
    });
  };
  var TgTable = (opts) => {
    const columns = opts.columns;
    const rows = opts.rows;
    const rowKey = opts.rowKey;
    const expandedId = opts.expandedId;
    const onToggle = opts.onToggle;
    const drawer = opts.drawer;
    const page = opts.page != null ? opts.page : 0;
    const setPage = opts.setPage;
    const pageSize = opts.pageSize != null ? opts.pageSize : 0;
    const groupBy = opts.groupBy;
    const empty = opts.empty;
    const compact = opts.compact;
    const rowClass = opts.rowClass;
    const sort = opts.sort;
    const onSort = opts.onSort;
    const sortKey = opts.sortKey;
    const hasDrawer = !!drawer;
    const hasSort = !!onSort;
    if (!rows || !rows.length) return empty || jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No data." });
    const sortedRows = sort ? sortRows(rows, sort) : rows;
    const total = sortedRows.length;
    const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
    const safePage = page >= totalPages ? totalPages - 1 : Math.max(0, page);
    const pageRows = pageSize > 0 ? sortedRows.slice(safePage * pageSize, (safePage + 1) * pageSize) : sortedRows;
    const colSpan = columns.length + (hasDrawer ? 1 : 0);
    const groups = groupRows(pageRows, groupBy);
    const renderRow = (r) => {
      const key = rowKey(r);
      const open = hasDrawer && expandedId === key;
      const rowEl = jsxs("tr", {
        className: "tg-tr" + (hasDrawer ? " tg-row-btn" : "") + (compact ? " tg-compact" : "") + (rowClass && rowClass(r) ? " " + rowClass(r) : ""),
        onClick: hasDrawer ? function() {
          if (onToggle) onToggle(open ? null : key);
        } : void 0,
        style: open ? { background: "rgba(251,191,36,0.05)" } : void 0,
        children: [
          hasDrawer ? tdL(jsx("span", { className: "tg-chev" + (open ? " open" : ""), children: "\u25B6" }, "chev-" + key)) : null,
          ...columns.map(function(c) {
            const v = c.render ? c.render(r) : r[c.key] != null ? r[c.key] : c.fallback != null ? c.fallback : "\u2014";
            const cellProps = typeof c.props === "function" ? c.props(r) : c.props;
            return c.align === "r" ? tdR(v, cellProps) : tdL(v, cellProps);
          })
        ]
      }, key);
      if (!open) return [rowEl];
      return [rowEl, jsx("tr", { className: "tg-drawer-row", children: jsx("td", { className: "tg-drawer-cell", colSpan, children: drawer(r) }) }, key + "-drawer")];
    };
    const openRow = hasDrawer && expandedId != null;
    const headerCells = columns.map(function(c) {
      const isSorted = hasSort && sort != null && sort.key === (c.sortKey || c.key);
      const dirIcon = isSorted ? sort.dir === "asc" ? " \u25B2" : " \u25BC" : "";
      if (hasSort) {
        const alignClass = c.align === "r" ? " tg-th-r" : "";
        const thProps = {
          className: "tg-th tg-sortable" + alignClass + (isSorted ? " tg-sorted" : ""),
          onClick: function() {
            if (onSort) {
              const newDir = isSorted && sort.dir === "asc" ? "desc" : "asc";
              onSort({ key: c.sortKey || c.key, dir: newDir });
            }
          }
        };
        return jsx("th", Object.assign({}, thProps, { children: c.label + dirIcon }));
      }
      return c.align === "r" ? thR(c.label) : thL(c.label);
    });
    return jsxs("div", { className: "tg-tscroll" + (openRow ? "" : " tg-vscroll"), children: [
      jsxs("table", { className: "tg-table" + (openRow ? "" : " tg-sticky"), style: hasDrawer ? { tableLayout: "fixed", width: "100%" } : void 0, children: [
        jsx("tr", { children: [hasDrawer ? thL("") : null, ...headerCells] }),
        ...groups.flatMap(function(g) {
          return g.label ? [jsx("tr", { className: "tg-group", children: jsx("td", { colSpan, children: g.label }) }, g.label + "-g")] : [];
        }),
        ...pageRows.flatMap(renderRow)
      ] }),
      pageSize > 0 && totalPages > 1 ? jsxs("div", { className: "tg-pager", children: [
        jsx("button", { className: "tg-ghost", disabled: safePage <= 0, onClick: function() {
          if (setPage) setPage(safePage - 1);
        }, children: "\u2039 Prev" }),
        jsx("span", { className: "tg-faint", style: { fontSize: 12 }, children: safePage + 1 + " / " + totalPages + " \xB7 " + total + " rows" }),
        jsx("button", { className: "tg-ghost", disabled: safePage >= totalPages - 1, onClick: function() {
          if (setPage) setPage(safePage + 1);
        }, children: "Next \u203A" })
      ] }) : null
    ] });
  };

  // client/session-table.tsx
  var sessionPrefill = (s) => {
    const steps = s.steps || [];
    let tok = 0, ms = 0;
    for (const st of steps) {
      if (st.ttftMs > 0) {
        tok += st.in || 0;
        ms += st.ttftMs;
      }
    }
    return ms > 0 ? Math.round(tok / (ms / 1e3) * 10) / 10 + " tok/s" : "\u2014";
  };
  var sessionRuntime = (s) => {
    const steps = s.steps || [];
    let ms = 0, has = false;
    for (const st of steps) {
      const v = (st.ttftMs || 0) + (st.decodeMs || 0);
      if (v > 0) has = true;
      ms += v;
    }
    return has ? fmtMs(ms) : "\u2014";
  };
  var lastActiveLabel = (s) => {
    const ts = s.meta?.lastPromptAt;
    if (ts == null) return "\u2014";
    const ms = typeof ts === "string" ? Date.parse(ts) : ts;
    if (isNaN(ms)) return "\u2014";
    const d = new Date(ms);
    const now = /* @__PURE__ */ new Date();
    const isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "2-digit", day: "2-digit" });
  };
  var sessionTitle = (s) => {
    const name = s.archived ? jsxs("span", { title: "archived in DSH", children: [jsx("span", { className: "tg-archived-badge" }, "\u{1F4E6}"), " ", s.title || s.cwd || s.id] }) : s.title || s.cwd || s.id;
    if (!isImported(s)) return name;
    return jsxs("span", { className: "tg-sess-title", children: [sourceBadge(s), jsx("span", { children: name }, "name")] });
  };
  var sessionColumns = (o = {}) => {
    const { turns = false, decode = true, prefill = true, runtime = true, total = true, lastActive = false, tin = false, tout = false, tcache = false } = o;
    return [
      { key: "date", label: "Date" },
      { key: "title", label: "Session", render: sessionTitle },
      lastActive ? { key: "meta.lastPromptAt", label: "Last Active", align: "r", render: lastActiveLabel, props: { style: { color: "#94a3b8", fontSize: 12 } } } : null,
      { key: "modelMix", label: "Models", render: (s) => s.modelMix, props: { style: { whiteSpace: "normal", wordBreak: "break-word", overflow: "visible", textOverflow: "unset" } } },
      turns ? { key: "turns", label: "Turns", align: "r", render: (s) => (s.stepTree || []).length || "\u2014" } : null,
      { key: "steps", sortKey: "events.steps", label: "Steps", align: "r", render: (s) => s.events ? s.events.steps || 0 : "\u2014" },
      decode ? { key: "tokPerSec", label: "Decode", align: "r", render: (s) => s.tokPerSec != null ? s.tokPerSec + " tok/s" : "\u2014" } : null,
      prefill ? { key: "prefillPerSec", label: "Prefill", align: "r", render: sessionPrefill, props: (s) => ({ title: "prompt processing = new (uncached) input tokens \xF7 TTFT across all " + (s.steps || []).length + " step(s)" }) } : null,
      runtime ? { key: "runtime", label: "Runtime", align: "r", render: sessionRuntime, props: { title: "session runtime = sum of (TTFT + decode time) across all steps \u2014 decode already contains the thinking window, so it is not added again" } } : null,
      tin ? { key: "tin", sortKey: "uncachedInputTokens", label: "In", align: "r", render: (s) => fmtC(s.uncachedInputTokens), props: (s) => ({ title: fmt(s.uncachedInputTokens) }) } : null,
      tout ? { key: "tout", sortKey: "outputTokens", label: "Out", align: "r", render: (s) => fmtC(s.outputTokens), props: (s) => ({ title: fmt(s.outputTokens) }) } : null,
      tcache ? { key: "tcache", sortKey: "cacheReadTokens", label: "Cache", align: "r", render: (s) => fmtC(s.cacheReadTokens), props: (s) => ({ title: fmt(s.cacheReadTokens) }) } : null,
      total ? { key: "allTokens", label: "Total", align: "r", render: (s) => fmtC(s.allTokens), props: { style: { fontWeight: 600 } } } : null
    ].filter(Boolean);
  };
  var SessionTable = (o) => TgTable({
    columns: sessionColumns(o.columns),
    rows: o.rows,
    rowKey: (s) => s.id,
    expandedId: o.expandedId,
    onToggle: o.onToggle,
    drawer: o.drawer,
    page: o.page,
    setPage: o.setPage,
    pageSize: o.pageSize,
    empty: o.empty,
    rowClass: (s) => (s.archived ? "tg-archived" : "") + (isImported(s) ? " tg-imported" : ""),
    sort: o.sort,
    onSort: o.onSort,
    sortKey: o.sortKey
  });

  // client/agg.ts
  var dayStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  var sessionTokens = (s) => {
    let tthink = 0;
    for (const t of s.stepTree || []) for (const st of t.steps || []) tthink += st.thinking || 0;
    let ttools = 0;
    for (const tt of s.toolTokens || []) ttools += tt.total || 0;
    return {
      tin: s.uncachedInputTokens || 0,
      tout: s.outputTokens || 0,
      tcache: (s.cacheReadTokens || 0) + (s.cacheWriteTokens || 0),
      tthink,
      ttools,
      total: s.allTokens || 0
    };
  };
  var aggregateSessions = (rows) => {
    const list = rows || [];
    let tin = 0, tout = 0, tcache = 0, tthink = 0, ttools = 0, total = 0, cost = 0;
    let steps = 0, turns = 0, decTok = 0, decMs = 0, preTok = 0, preMs = 0, ttftSum = 0, ttftCount = 0;
    for (const s of list) {
      const t = sessionTokens(s);
      tin += t.tin;
      tout += t.tout;
      tcache += t.tcache;
      tthink += t.tthink;
      ttools += t.ttools;
      total += s.allTokens || 0;
      cost += s.cost || 0;
      steps += s.events && s.events.steps || (s.steps ? s.steps.length : 0) || 0;
      turns += s.events && s.events.turns || 0;
      for (const t2 of s.stepTree || []) for (const st of t2.steps || []) {
        decTok += st.out || 0;
        decMs += st.decodeMs || 0;
        preTok += st.in || 0;
        preMs += st.ttftMs || 0;
        if (st.ttftMs != null) {
          ttftSum += st.ttftMs;
          ttftCount++;
        }
      }
    }
    return {
      sessions: list.length,
      steps,
      turns,
      tin,
      tout,
      tcache,
      tthink,
      ttools,
      total,
      cost,
      decTok,
      decMs,
      preTok,
      preMs,
      decode: decMs > 0 ? Math.round(decTok / (decMs / 1e3) * 10) / 10 : null,
      prefill: preMs > 0 ? Math.round(preTok / (preMs / 1e3) * 10) / 10 : null,
      ttft: ttftCount > 0 ? Math.round(ttftSum / ttftCount / 1e3 * 10) / 10 : null
    };
  };
  var rangeStartFor = (range, byDate, today) => {
    if (range === "all") {
      let earliest = null;
      for (const k of byDate.keys()) if (earliest == null || k < earliest) earliest = k;
      if (earliest != null) return /* @__PURE__ */ new Date(earliest + "T00:00:00");
      return today;
    }
    const days = range === "3m" ? 92 : range === "6m" ? 184 : 367;
    const t = new Date(today);
    t.setDate(t.getDate() - days);
    return t;
  };
  var daySeries = (bySession) => {
    const map = /* @__PURE__ */ new Map();
    for (const s of bySession || []) {
      const d = s.date || (s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-CA") : "?");
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(s);
    }
    return [...map.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1).map(([date, rows]) => {
      const t = aggregateSessions(rows);
      return { date, decode: t.decode, prefill: t.prefill, ttft: t.ttft, in: t.tin, out: t.tout, cache: t.tcache, think: t.tthink, total: t.total };
    }).filter((r) => r.in || r.out || r.cache || r.total);
  };

  // client/graph.ts
  var POINT_MODES = [
    { k: "line", name: "Lines", title: "Connect the points with lines" },
    { k: "both", name: "Both", title: "Lines, plus a dot on every point" },
    { k: "dots", name: "Dots", title: "Scatter plot \u2014 a dot per point, no connecting lines" },
    { k: "trend", name: "Trend", title: "A rolling median/mean/EMA through the dots \u2014 the signal, not every spike" },
    { k: "bars", name: "Bars", title: "One bar per point, grown from the axis floor \u2014 for discrete values (a day's cost, one run) rather than a continuous signal" },
    { k: "heat", name: "Heat", title: "One row per metric, one column per step, shaded by value" }
  ];
  var seriesVisible = (s, h) => {
    if (s.hidden) return false;
    if (s.regime != null && h.chips[String(s.regime)]) return false;
    if (h.metrics[s.key]) return false;
    return true;
  };
  var dotRadius = (s, mode = "line") => {
    if (s.radius != null) return s.radius;
    if (mode === "bars") return 0;
    if (mode === "dots") return 2.4;
    if (mode === "both") return 2;
    return s.line === false ? 2 : 0;
  };
  var makeScale = (domain, range, log = false) => {
    let [d0, d1] = domain;
    if (!isFinite(d0)) d0 = 0;
    if (!isFinite(d1)) d1 = d0 + 1;
    if (log) {
      d0 = d0 > 0 ? d0 : 1e-9;
      d1 = d1 > d0 ? d1 : d0 * 10;
    } else if (d1 === d0) d1 = d0 + 1;
    const [r0, r1] = range;
    const l0 = log ? Math.log10(d0) : d0;
    const l1 = log ? Math.log10(d1) : d1;
    const span = l1 - l0 || 1;
    const sc = ((v) => {
      const lv = log ? Math.log10(v > d0 ? v : d0) : v;
      return r0 + (lv - l0) / span * (r1 - r0);
    });
    sc.invert = (px) => {
      const lv = l0 + (px - r0) / (r1 - r0 || 1) * span;
      return log ? Math.pow(10, lv) : lv;
    };
    sc.domain = [d0, d1];
    sc.range = [r0, r1];
    sc.log = log;
    return sc;
  };
  var niceStep = (raw) => {
    if (!(raw > 0) || !isFinite(raw)) return 1;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
  };
  var AXIS_HEADROOM = 0.1;
  var round6 = (v) => Math.round(v * 1e6) / 1e6;
  var linearTicks = (min, max, count = 5) => {
    if (!isFinite(min) || !isFinite(max) || max <= min) return [min];
    const step = niceStep((max - min) / Math.max(1, count));
    const out = [];
    for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) out.push(round6(v));
    return out.length ? out : [min, max];
  };
  var logTicks = (min, max) => {
    const lo = Math.floor(Math.log10(min > 0 ? min : 1));
    const hi = Math.ceil(Math.log10(max > min ? max : min * 10));
    const out = [];
    for (let e = lo; e <= hi; e++) {
      const p = Math.pow(10, e);
      if (p >= min * 0.999 && p <= max * 1.001) out.push(p);
    }
    if (out.length >= 3) return out;
    const dense = [];
    for (let e = lo; e <= hi; e++) {
      for (const m of [1, 2, 3, 5]) {
        const v = m * Math.pow(10, e);
        if (v >= min * 0.999 && v <= max * 1.001) dense.push(v);
      }
    }
    return dense.length ? dense : out;
  };
  var trim1 = (x) => {
    const s = (Math.round(x * 10) / 10).toFixed(1);
    return s.endsWith(".0") ? s.slice(0, -2) : s;
  };
  var fmtValue = (v) => {
    if (!isFinite(v)) return "\u2014";
    const a = Math.abs(v);
    if (a >= 1e9) return trim1(v / 1e9) + "B";
    if (a >= 1e6) return trim1(v / 1e6) + "M";
    if (a >= 1e3) return trim1(v / 1e3) + "K";
    if (a >= 1) return String(Math.round(v * 100) / 100);
    if (a === 0) return "0";
    return String(Math.round(v * 1e3) / 1e3);
  };
  var rowsOf = (p, s) => s.data || p.data || [];
  var minMax = (rows, field, positiveOnly) => {
    let lo = Infinity, hi = -Infinity;
    for (const r of rows) {
      const v = Number(r[field]);
      if (r[field] == null || !isFinite(v)) continue;
      if (positiveOnly && v <= 0) continue;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    return lo === Infinity ? null : [lo, hi];
  };
  var HEAT_STRIP_H = 6;
  var SHARED_RAMP = ["#0b1220", "#1e3a8a", "#0e7490", "#22c55e", "#facc15"];
  var hex2rgb = (hex) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
  var sampleRamp = (stops, t) => {
    const n = Math.max(2, stops.length);
    const u = Math.max(0, Math.min(1, t)) * (n - 1);
    const i = Math.min(n - 2, Math.floor(u));
    const f = u - i;
    const a = hex2rgb(stops[i]), b = hex2rgb(stops[i + 1]);
    const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  };
  var heatLayout = (p, f, o = {}) => {
    const rowsMode = o.rows || "metric";
    const ramp = o.ramp || "row";
    const scale = o.scale || "log";
    const stripOn = o.strip !== false;
    const cols = f.tips;
    const n = cols.length;
    const stripH = stripOn ? HEAT_STRIP_H : 0;
    const edge = (i) => i < 0 ? f.plot.x : i >= n - 1 ? f.plot.x + f.plot.w : (cols[i].px + cols[i + 1].px) / 2;
    const defs = [];
    const byKey = {};
    for (const ln of f.lines) {
      const s = ln.series;
      if (rowsMode === "series") {
        defs.push({ key: s.key + "@" + String(s.regime != null ? s.regime : defs.length), label: s.label, color: s.color, lines: [ln] });
      } else if (byKey[s.key] == null) {
        byKey[s.key] = defs.length;
        defs.push({ key: s.key, label: s.tipName || s.label, color: s.color, lines: [ln] });
      } else defs[byKey[s.key]].lines.push(ln);
    }
    const seen = {};
    for (const d of defs) seen[d.label] = (seen[d.label] || 0) + 1;
    for (const d of defs) {
      if (seen[d.label] > 1) {
        const r = d.lines[0].series.regime;
        d.label = d.label + (r != null ? " " + r : " " + defs.indexOf(d));
      }
    }
    const colOf = /* @__PURE__ */ new Map();
    cols.forEach((tip, i) => colOf.set(Number(tip.row[p.xField]), i));
    const colAt = (row) => colOf.get(Number(row[p.xField]));
    const maxCols = o.maxCols && o.maxCols > 0 ? Math.max(1, Math.round(o.maxCols)) : n;
    const bin = Math.max(1, Math.ceil(n / Math.max(1, maxCols)));
    const out = [];
    for (const d of defs) {
      const vals = new Array(n).fill(null);
      for (const ln of d.lines) {
        for (const pt of ln.points) {
          if (!pt.ok) continue;
          const i = colAt(pt.row);
          if (i == null || i < 0 || i >= n) continue;
          const cur = vals[i];
          vals[i] = cur == null ? pt.v : Math.max(cur, pt.v);
        }
      }
      const cells = [];
      for (let i = 0; i < n; i += bin) {
        const j = Math.min(n, i + bin) - 1;
        let best = null;
        for (let k = i; k <= j; k++) {
          const v = vals[k];
          if (v != null && (best == null || v > best)) best = v;
        }
        if (best == null) continue;
        cells.push({ x: edge(i - 1), w: Math.max(0.6, edge(j) - edge(i - 1)), v: best, t: 0 });
      }
      let lo = Infinity, hi = -Infinity;
      for (const c of cells) {
        if (c.v < lo) lo = c.v;
        if (c.v > hi) hi = c.v;
      }
      const useLog = scale === "log" && lo > 0;
      const l0 = useLog ? Math.log10(lo) : lo;
      const l1 = useLog ? Math.log10(hi) : hi;
      const span = l1 - l0;
      for (const c of cells) {
        const lv = useLog ? Math.log10(c.v) : c.v;
        c.t = span > 0 ? Math.max(0, Math.min(1, (lv - l0) / span)) : 0.5;
      }
      if (cells.length) out.push({ key: d.key, label: d.label, color: d.color, lo, hi, cells });
    }
    const strip = [];
    if (stripOn) {
      const chipColor = {};
      for (const c of p.chips || []) chipColor[String(c.k)] = c.color;
      const at = new Array(n).fill(null);
      for (const ln of f.lines) {
        const s = ln.series;
        if (s.regime == null) continue;
        const col = chipColor[String(s.regime)] || s.color;
        for (const pt of ln.points) {
          const i = colAt(pt.row);
          if (i != null && i >= 0 && i < n && at[i] == null) at[i] = col;
        }
      }
      for (let i = 0; i < n; i++) {
        const col = at[i];
        if (!col) continue;
        const x0 = edge(i - 1), x1 = edge(i);
        const last = strip[strip.length - 1];
        if (last && last.color === col && Math.abs(last.x + last.w - x0) < 0.6) last.w = x1 - last.x;
        else strip.push({ x: x0, w: x1 - x0, color: col });
      }
    }
    return { rows: out, strip, cellW: f.plot.w / Math.max(1, n), stripH };
  };
  var buildFrame = (p, hidden, size, opts = {}) => {
    const width = Math.max(1, Math.round(size.width || 0));
    const height = Math.max(1, Math.round(size.height || 0));
    const axes = p.axes || [];
    const nAxes = Math.max(1, axes.length || 1);
    const mode = opts.mode || "line";
    const pad = { l: 8, r: 10, t: 10, b: 22 };
    if (mode === "heat") pad.l = opts.heat && opts.heat.labels === false ? 12 : 62;
    else {
      if (nAxes > 0 && !axes[0]?.hideLabels) pad.l = 48;
      if (nAxes > 1 && !axes[1]?.hideLabels) pad.r = 48;
    }
    const plot = {
      x: pad.l,
      y: pad.t,
      w: Math.max(1, width - pad.l - pad.r),
      h: Math.max(1, height - pad.t - pad.b)
    };
    const visible = (p.series || []).filter((s) => seriesVisible(s, hidden));
    const xRows = [];
    for (const s of visible) xRows.push(...rowsOf(p, s));
    const xmm = minMax(xRows, p.xField, false) || minMax(p.tipData || [], p.xField, false) || minMax(p.data || [], p.xField, false) || [0, 1];
    const xDomain = xmm[1] > xmm[0] ? [xmm[0], xmm[1]] : [xmm[0], xmm[0] + 1];
    const x = makeScale(xDomain, [plot.x, plot.x + plot.w], false);
    const columns = [];
    for (let c = 0; c < nAxes; c++) {
      const def = axes[c] || {};
      const vals = [];
      for (const s of visible) {
        if ((s.axis || 0) !== c) continue;
        for (const r of rowsOf(p, s)) {
          const v = Number(r[s.key]);
          if (r[s.key] == null || !isFinite(v)) continue;
          if (def.log && v <= 0) continue;
          vals.push(v);
        }
      }
      let domain;
      if (def.log) {
        let lo = Infinity, hi = -Infinity;
        for (const v of vals) {
          if (!(v > 0)) continue;
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
        if (!isFinite(hi)) domain = [1, 10];
        else {
          const floor = def.min != null && def.min > 0 ? def.min : Math.pow(10, Math.floor(Math.log10(lo)));
          const hiDec = Math.log10(hi), loDec = Math.log10(floor);
          const ceil = def.max != null ? def.max : Math.pow(10, hiDec + AXIS_HEADROOM * (hiDec - loDec));
          domain = [floor, ceil > floor ? ceil : floor * 10];
        }
      } else {
        const floor = def.min != null ? def.min : def.baseline != null ? Math.min(def.baseline, 0) : 0;
        let top = -Infinity;
        for (const v of vals) if (v > top) top = v;
        const ceil = def.max != null ? def.max : isFinite(top) ? top * (1 + AXIS_HEADROOM) : floor + 1;
        domain = [floor, ceil > floor ? ceil : floor + 1];
      }
      const scale = makeScale(domain, [plot.y + plot.h, plot.y], !!def.log);
      const tickVals = def.log ? logTicks(domain[0], domain[1]) : linearTicks(domain[0], domain[1], 5);
      const fmt3 = def.format || fmtValue;
      columns.push({
        log: !!def.log,
        hideLabels: !!def.hideLabels,
        unit: def.unit || "",
        scale,
        domain,
        ticks: tickVals.map((v) => ({ v, px: scale(v), label: fmt3(v) }))
      });
    }
    const span = xDomain[1] - xDomain[0];
    const step = p.xStep && p.xStep > 0 ? p.xStep : niceStep(span / 10);
    const xTicks = [];
    for (let v = Math.ceil(xDomain[0] / step) * step; v <= xDomain[1] + step * 1e-6; v += step) {
      const val = round6(v);
      xTicks.push({ v: val, px: x(val), label: p.xTickFormat ? String(p.xTickFormat(val)) : fmtValue(val) });
    }
    const lines = [];
    for (const s of visible) {
      const axis = s.axis || 0;
      const sc = (columns[axis] || columns[0]).scale;
      const log = !!(axes[axis] && axes[axis].log);
      const points = rowsOf(p, s).map((row) => {
        const raw = row[s.key];
        const v = Number(raw);
        const ok = raw != null && isFinite(v) && !(log && v <= 0);
        const xv = Number(row[p.xField]);
        return { px: x(isFinite(xv) ? xv : xDomain[0]), py: ok ? sc(v) : plot.y + plot.h, v: ok ? v : NaN, ok, row };
      });
      lines.push({ series: s, axis, points, smooth: s.smooth != null ? !!s.smooth : !!p.smooth });
    }
    const rules = (p.rules || []).filter((r) => !(r.windows || []).some((w) => hidden.chips[String(w)]) && isFinite(Number(r.x))).map((r) => ({ px: x(Number(r.x)), label: r.label || "", color: r.color || "#f472b6", dash: r.dash || [3, 3] })).filter((r) => r.px >= plot.x - 0.5 && r.px <= plot.x + plot.w + 0.5);
    const tips = (p.tipData || p.data || []).map((row) => {
      const xv = Number(row[p.xField]);
      return { px: x(isFinite(xv) ? xv : xDomain[0]), row };
    }).filter((t) => t.px >= plot.x - 1 && t.px <= plot.x + plot.w + 1).sort((a, b) => a.px - b.px);
    const frame = {
      width,
      height,
      plot,
      pad,
      x,
      xDomain,
      xTicks,
      xLabel: p.xLabel || p.xField,
      columns,
      lines,
      rules,
      tips,
      heat: null
    };
    if (mode === "heat") frame.heat = heatLayout(p, frame, opts.heat);
    return frame;
  };
  var hitTest = (f, px, maxDist = 26) => {
    let best = null, bestD = Infinity;
    for (const t of f.tips) {
      const d = Math.abs(t.px - px);
      if (d < bestD) {
        bestD = d;
        best = t;
      }
    }
    return best && bestD <= maxDist ? best : null;
  };
  var GRAPH_THEME = {
    bg: "rgba(255,255,255,0.015)",
    grid: "rgba(255,255,255,0.06)",
    axis: "rgba(255,255,255,0.14)",
    text: "#94a3b8",
    dim: "#64748b",
    font: "10px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
    crosshair: "rgba(255,255,255,0.30)",
    ring: "#fbbf24",
    ruleText: "#f9a8d4",
    chipBg: "rgba(244,114,182,0.16)"
  };
  var trendWindow = (steps, window2 = 0) => {
    const w = window2 > 0 ? Math.round(window2) : Math.round(steps * 0.08);
    const odd = w % 2 === 0 ? w + 1 : w;
    return Math.max(3, Math.min(51, odd));
  };
  var trendOf = (points, o = {}) => {
    const n = points.length;
    const stat = o.stat || "median";
    const win = trendWindow(n, o.window || 0);
    const out = new Array(n).fill(null);
    if (stat === "ema") {
      const a = 2 / (win + 1);
      let prev = null;
      for (let i = 0; i < n; i++) {
        const pt = points[i];
        if (pt.ok) prev = prev == null ? pt.py : prev + a * (pt.py - prev);
        out[i] = prev == null ? null : { py: prev, lo: prev, hi: prev };
      }
      return out;
    }
    const half = (win - 1) / 2;
    const need = Math.max(2, Math.ceil(win * 0.5));
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - half), b = Math.min(n, i + half + 1);
      const v = [];
      for (let j = a; j < b; j++) if (points[j].ok) v.push(points[j].py);
      if (v.length < need) continue;
      v.sort((x, y) => x - y);
      const mid = v.length >> 1;
      const py = stat === "mean" ? v.reduce((s, x) => s + x, 0) / v.length : v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
      out[i] = {
        py,
        lo: v[Math.floor((v.length - 1) * 0.25)],
        hi: v[Math.ceil((v.length - 1) * 0.75)]
      };
    }
    return out;
  };
  var trendRuns = (tv) => {
    const runs = [];
    let i = 0;
    while (i < tv.length) {
      if (!tv[i]) {
        i++;
        continue;
      }
      let j = i;
      while (j + 1 < tv.length && tv[j + 1]) j++;
      runs.push({ i, j });
      i = j + 1;
    }
    return runs;
  };
  var lineRuns = (points) => {
    const out = [];
    let run = [];
    for (const pt of points) {
      if (pt.ok) run.push(pt);
      else if (run.length) {
        out.push(run);
        run = [];
      }
    }
    if (run.length) out.push(run);
    return out;
  };
  var smoothTangents = (pts) => {
    const n = pts.length;
    const m = new Array(n).fill(0);
    if (n < 2) return m;
    const slope = [];
    for (let i = 0; i < n - 1; i++) {
      const h = pts[i + 1].px - pts[i].px;
      slope.push(h > 0 ? (pts[i + 1].py - pts[i].py) / h : 0);
    }
    m[0] = slope[0];
    m[n - 1] = slope[n - 2];
    for (let i = 1; i < n - 1; i++) {
      const a = slope[i - 1], b = slope[i];
      m[i] = a * b <= 0 ? 0 : (a + b) / 2;
    }
    for (let i = 0; i < n - 1; i++) {
      const s = slope[i];
      if (s === 0) {
        m[i] = 0;
        m[i + 1] = 0;
        continue;
      }
      const a = m[i] / s, b = m[i + 1] / s;
      const q = a * a + b * b;
      if (q > 9) {
        const t = 3 / Math.sqrt(q);
        m[i] = t * a * s;
        m[i + 1] = t * b * s;
      }
    }
    return m;
  };
  var curveThrough = (ctx, pts, smooth, tension) => {
    if (!smooth || pts.length < 3) {
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].px, pts[i].py);
      return;
    }
    const m = smoothTangents(pts);
    const k = Math.max(0, Math.min(1, tension));
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i], p1 = pts[i + 1];
      const h = p1.px - p0.px;
      if (!(h > 0)) {
        ctx.lineTo(p1.px, p1.py);
        continue;
      }
      ctx.bezierCurveTo(
        p0.px + h / 3,
        p0.py + m[i] * k * h / 3,
        p1.px - h / 3,
        p1.py - m[i + 1] * k * h / 3,
        p1.px,
        p1.py
      );
    }
  };
  var strokeOf = (s) => ({
    width: s.width != null ? s.width : 1.5,
    tension: s.tension != null ? s.tension : 0.5
  });
  var px05 = (v) => Math.round(v) + 0.5;
  var renderGraph = (ctx, f, o = {}) => {
    const t = { ...GRAPH_THEME, ...o.theme || {} };
    const { plot } = f;
    const bottom = plot.y + plot.h;
    ctx.clearRect(0, 0, f.width, f.height);
    if (t.bg) {
      ctx.fillStyle = t.bg;
      ctx.fillRect(plot.x, plot.y, plot.w, plot.h);
    }
    ctx.font = t.font;
    ctx.lineWidth = 1;
    const mode = o.mode || "line";
    if (mode !== "heat") f.columns.forEach((col, i) => {
      if (col.hideLabels) return;
      const onLeft = i === 0;
      if (onLeft) {
        ctx.strokeStyle = t.grid;
        ctx.beginPath();
        for (const tk of col.ticks) {
          const y = px05(tk.px);
          ctx.moveTo(plot.x, y);
          ctx.lineTo(plot.x + plot.w, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = t.text;
      ctx.textAlign = onLeft ? "right" : "left";
      ctx.textBaseline = "middle";
      const lx = onLeft ? plot.x - 7 : plot.x + plot.w + 7;
      for (const tk of col.ticks) ctx.fillText(tk.label, lx, tk.px);
    });
    ctx.strokeStyle = t.grid;
    ctx.beginPath();
    for (const tk of f.xTicks) {
      const xp = px05(tk.px);
      ctx.moveTo(xp, plot.y);
      ctx.lineTo(xp, bottom);
    }
    ctx.stroke();
    ctx.fillStyle = t.dim;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (const tk of f.xTicks) ctx.fillText(tk.label, tk.px, bottom + 5);
    ctx.strokeStyle = t.axis;
    ctx.beginPath();
    ctx.moveTo(plot.x, px05(bottom));
    ctx.lineTo(plot.x + plot.w, px05(bottom));
    ctx.moveTo(px05(plot.x), plot.y);
    ctx.lineTo(px05(plot.x), bottom);
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.rect(plot.x, plot.y, plot.w, plot.h);
    ctx.clip();
    if (mode === "heat" && f.heat) {
      const heat = f.heat;
      const rowH = Math.max(1, (plot.h - heat.stripH) / Math.max(1, heat.rows.length));
      for (const s of heat.strip) {
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, plot.y, Math.max(0.8, s.w), heat.stripH);
      }
      heat.rows.forEach((row, ri) => {
        const y = plot.y + heat.stripH + ri * rowH;
        for (const c of row.cells) {
          ctx.globalAlpha = 0.16 + 0.84 * c.t;
          ctx.fillStyle = o.heat && o.heat.ramp === "shared" ? sampleRamp(SHARED_RAMP, c.t) : row.color;
          ctx.fillRect(c.x, y + 0.6, Math.max(0.8, c.w - 0.8), Math.max(1, rowH - 1.4));
        }
      });
      ctx.globalAlpha = 1;
    } else if (mode === "trend") {
      const to = { stat: "median", window: 0, dots: true, dotsAlpha: 0.25, band: false, ...o.trend || {} };
      if (to.dots !== false) {
        const r = 1.8;
        const alpha = to.dotsAlpha != null ? to.dotsAlpha : 0.25;
        for (const ln of f.lines) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = ln.series.color;
          for (const pt of ln.points) {
            if (!pt.ok) continue;
            ctx.beginPath();
            ctx.arc(pt.px, pt.py, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }
      for (const ln of f.lines) {
        const s = ln.series;
        const tv = trendOf(ln.points, to);
        const runs = trendRuns(tv);
        if (to.band) {
          ctx.globalAlpha = 0.15;
          ctx.fillStyle = s.color;
          for (const run of runs) {
            if (run.j <= run.i) continue;
            ctx.beginPath();
            ctx.moveTo(ln.points[run.i].px, tv[run.i].lo);
            for (let k = run.i; k <= run.j; k++) ctx.lineTo(ln.points[k].px, tv[k].lo);
            for (let k = run.j; k >= run.i; k--) ctx.lineTo(ln.points[k].px, tv[k].hi);
            ctx.closePath();
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
        ctx.beginPath();
        for (const run of runs) {
          ctx.moveTo(ln.points[run.i].px, tv[run.i].py);
          for (let k = run.i + 1; k <= run.j; k++) ctx.lineTo(ln.points[k].px, tv[k].py);
        }
        ctx.strokeStyle = s.color;
        ctx.lineWidth = Math.max(1.8, strokeOf(s).width);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
    } else if (mode === "bars") {
      let slots = 0;
      for (const ln of f.lines) if (ln.points.length > slots) slots = ln.points.length;
      const m = Math.max(1, f.lines.length);
      const slotW = Math.min(26, plot.w / Math.max(1, slots) * 0.72);
      const bw = Math.max(0.8, slotW / m);
      f.lines.forEach((ln, si) => {
        const s = ln.series;
        const sc = (f.columns[ln.axis] || f.columns[0]).scale;
        const baseY = Math.max(plot.y, Math.min(bottom, sc(sc.domain[0])));
        const dx = (si - (m - 1) / 2) * bw;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = s.color;
        for (const pt of ln.points) {
          if (!pt.ok) continue;
          ctx.fillRect(pt.px + dx - bw / 2, Math.min(pt.py, baseY), bw, Math.max(0.8, Math.abs(baseY - pt.py)));
        }
        ctx.globalAlpha = 1;
      });
    } else for (const pass of ["fill", "line", "dot"]) {
      for (const ln of f.lines) {
        const s = ln.series;
        const sc = (f.columns[ln.axis] || f.columns[0]).scale;
        const baseY = Math.max(plot.y, Math.min(bottom, sc(sc.domain[0])));
        const { width, tension } = strokeOf(s);
        const runs = lineRuns(ln.points);
        if (pass === "fill" && s.fill && mode !== "dots") {
          for (const run of runs) {
            if (run.length < 2) continue;
            ctx.beginPath();
            ctx.moveTo(run[0].px, baseY);
            ctx.lineTo(run[0].px, run[0].py);
            curveThrough(ctx, run, ln.smooth, tension);
            ctx.lineTo(run[run.length - 1].px, baseY);
            ctx.closePath();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = s.color;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        } else if (pass === "line" && s.line !== false && mode !== "dots") {
          ctx.beginPath();
          for (const run of runs) {
            if (!run.length) continue;
            ctx.moveTo(run[0].px, run[0].py);
            curveThrough(ctx, run, ln.smooth, tension);
          }
          ctx.strokeStyle = s.color;
          ctx.lineWidth = width;
          ctx.setLineDash(s.dash || []);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (pass === "dot") {
          const r = dotRadius(s, mode);
          if (r > 0) {
            ctx.fillStyle = s.color;
            for (const pt of ln.points) {
              if (!pt.ok) continue;
              ctx.beginPath();
              ctx.arc(pt.px, pt.py, r, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
    }
    ctx.lineWidth = 1;
    for (const r of f.rules) {
      ctx.strokeStyle = r.color;
      ctx.setLineDash(r.dash);
      ctx.beginPath();
      ctx.moveTo(px05(r.px), plot.y);
      ctx.lineTo(px05(r.px), bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      if (!r.label) continue;
      const w = (ctx.measureText ? ctx.measureText(r.label).width : r.label.length * 5.5) + 8;
      const bx = Math.max(plot.x, Math.min(plot.x + plot.w - w, r.px + 3));
      ctx.fillStyle = t.chipBg;
      ctx.fillRect(bx, plot.y + 2, w, 13);
      ctx.fillStyle = t.ruleText;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(r.label, bx + 4, plot.y + 9);
    }
    if (o.hoverPx != null && o.hoverPx >= plot.x && o.hoverPx <= plot.x + plot.w) {
      if (mode === "heat" && f.heat) {
        let bestPx = o.hoverPx, bestD = Infinity;
        for (const tip of f.tips) {
          const d = Math.abs(tip.px - o.hoverPx);
          if (d < bestD) {
            bestD = d;
            bestPx = tip.px;
          }
        }
        const w = Math.max(2, f.heat.cellW || 6);
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.fillRect(bestPx - w / 2, plot.y, w, plot.h);
      }
      ctx.strokeStyle = t.crosshair;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(px05(o.hoverPx), plot.y);
      ctx.lineTo(px05(o.hoverPx), bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const ln of mode === "heat" ? [] : f.lines) {
        let best = null, bestD = Infinity;
        for (const pt of ln.points) {
          if (!pt.ok) continue;
          const d = Math.abs(pt.px - o.hoverPx);
          if (d < bestD) {
            bestD = d;
            best = pt;
          }
        }
        if (!best) continue;
        ctx.strokeStyle = t.ring;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(best.px, best.py, 3.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
    }
    ctx.restore();
    if (mode === "heat" && f.heat) {
      const heat = f.heat;
      const rowH = Math.max(1, (plot.h - heat.stripH) / Math.max(1, heat.rows.length));
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      heat.rows.forEach((row, ri) => {
        if (o.heat && o.heat.labels === false) return;
        const y = plot.y + heat.stripH + ri * rowH + rowH / 2;
        const label = row.label.length > 10 ? row.label.slice(0, 9) + "\u2026" : row.label;
        ctx.fillStyle = row.color;
        ctx.fillText(label, plot.x - 7, y);
      });
      if (o.heat && o.heat.ramp === "shared") {
        const lw = 64, lh = 5, lx = plot.x + plot.w - lw, ly = plot.y + Math.max(0, (heat.stripH - lh) / 2);
        for (let i = 0; i < 16; i++) {
          ctx.fillStyle = sampleRamp(SHARED_RAMP, i / 15);
          ctx.fillRect(lx + lw * i / 16, ly, lw / 16 + 0.7, lh);
        }
        ctx.fillStyle = t.dim;
        ctx.textAlign = "right";
        ctx.fillText("low", lx - 5, ly + lh / 2);
        ctx.textAlign = "left";
        ctx.fillText("high", lx + lw + 5, ly + lh / 2);
      }
    }
  };

  // client/graph-store.ts
  var GRAPH_STORE_KEY = "token-gobbler:graph:v1:";
  var POINT_MODE_KEYS = POINT_MODES.map((m) => m.k);
  var isPointMode = (v) => POINT_MODE_KEYS.indexOf(v) >= 0;
  var boolMap = (v) => {
    const out = {};
    if (v && typeof v === "object") {
      for (const k of Object.keys(v)) if (v[k] === true) out[k] = true;
    }
    return out;
  };
  var emptyUi = (mode = "line") => ({ chips: {}, metrics: {}, mode });
  var graphStorage = () => {
    try {
      return typeof localStorage !== "undefined" && localStorage ? localStorage : null;
    } catch {
      return null;
    }
  };
  var loadUi = (key, mode = "line") => {
    const base = emptyUi(mode);
    if (!key) return base;
    const s = graphStorage();
    if (!s) return base;
    try {
      const raw = s.getItem(GRAPH_STORE_KEY + key);
      if (!raw) return base;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return base;
      return {
        chips: boolMap(parsed.chips),
        metrics: boolMap(parsed.metrics),
        mode: isPointMode(parsed.mode) ? parsed.mode : mode
      };
    } catch {
      return base;
    }
  };
  var saveUi = (key, ui) => {
    if (!key) return;
    const s = graphStorage();
    if (!s) return;
    try {
      const k = GRAPH_STORE_KEY + key;
      const next = JSON.stringify({ chips: boolMap(ui.chips), metrics: boolMap(ui.metrics), mode: ui.mode });
      if (s.getItem(k) !== next) s.setItem(k, next);
    } catch {
    }
  };
  var clearChartModes = () => {
    const s = graphStorage();
    if (!s) return 0;
    let n = 0;
    try {
      const keys = [];
      for (let i = 0; i < s.length; i++) {
        const k = s.key(i);
        if (k && k.indexOf(GRAPH_STORE_KEY) === 0) keys.push(k);
      }
      for (const k of keys) {
        const raw = s.getItem(k);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || parsed.mode == null) continue;
        delete parsed.mode;
        s.setItem(k, JSON.stringify(parsed));
        n++;
      }
    } catch {
    }
    return n;
  };
  var DEFAULT_CHART_SETTINGS = {
    mode: "line",
    trend: { stat: "median", window: 0, dots: true, dotsAlpha: 0.25, band: false },
    heat: { rows: "metric", ramp: "row", scale: "log", maxCols: 400, strip: true, labels: true }
  };
  var CHART_SETTINGS_KEY = "token-gobbler:chart:v1";
  var TREND_STATS = [
    { k: "median", name: "Median", hint: "Middle value of the window \u2014 ignores single-step spikes" },
    { k: "mean", name: "Mean", hint: "Average of the window \u2014 every step pulls on it" },
    { k: "ema", name: "EMA", hint: "Exponential moving average \u2014 recent steps weigh more, no window edges" }
  ];
  var oneOf = (v, allowed, fallback) => allowed.indexOf(v) >= 0 ? v : fallback;
  var bool = (v, fallback) => typeof v === "boolean" ? v : fallback;
  var num = (v, lo, hi, fallback) => {
    const n = Number(v);
    return isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fallback;
  };
  var trendWindowSize = (settings, steps) => trendWindow(steps, settings.window);
  var normalizeChartSettings = (raw) => {
    const d = DEFAULT_CHART_SETTINGS;
    const r = raw && typeof raw === "object" ? raw : {};
    const t = r.trend && typeof r.trend === "object" ? r.trend : {};
    const h = r.heat && typeof r.heat === "object" ? r.heat : {};
    return {
      mode: oneOf(r.mode, POINT_MODE_KEYS, d.mode),
      trend: {
        stat: oneOf(t.stat, ["median", "mean", "ema"], d.trend.stat),
        window: num(t.window, 0, 51, d.trend.window),
        dots: bool(t.dots, d.trend.dots),
        dotsAlpha: num(t.dotsAlpha, 0.05, 0.8, d.trend.dotsAlpha),
        band: bool(t.band, d.trend.band)
      },
      heat: {
        rows: oneOf(h.rows, ["metric", "series"], d.heat.rows),
        ramp: oneOf(h.ramp, ["row", "shared"], d.heat.ramp),
        scale: oneOf(h.scale, ["log", "linear"], d.heat.scale),
        maxCols: num(h.maxCols, 0, 4e3, d.heat.maxCols),
        strip: bool(h.strip, d.heat.strip),
        labels: bool(h.labels, d.heat.labels)
      }
    };
  };
  var listeners = /* @__PURE__ */ new Set();
  var subscribeChartSettings = (fn) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  };
  var loadChartSettings = () => {
    const s = graphStorage();
    if (!s) return { ...DEFAULT_CHART_SETTINGS, trend: { ...DEFAULT_CHART_SETTINGS.trend }, heat: { ...DEFAULT_CHART_SETTINGS.heat } };
    try {
      const raw = s.getItem(CHART_SETTINGS_KEY);
      return normalizeChartSettings(raw ? JSON.parse(raw) : null);
    } catch {
      return normalizeChartSettings(null);
    }
  };
  var saveChartSettings = (next) => {
    const clean = normalizeChartSettings(next);
    const s = graphStorage();
    if (s) {
      try {
        const body = JSON.stringify(clean);
        if (s.getItem(CHART_SETTINGS_KEY) !== body) s.setItem(CHART_SETTINGS_KEY, body);
      } catch {
      }
    }
    for (const fn of Array.from(listeners)) {
      try {
        fn();
      } catch {
      }
    }
    return clean;
  };
  var resetChartSettings = () => saveChartSettings(DEFAULT_CHART_SETTINGS);

  // client/graph-canvas.tsx
  var tipBody = (p, row) => {
    const raw = p.tipField ? row[p.tipField] : null;
    if (typeof raw === "string" && raw.length) {
      const lines = raw.split("\n");
      return jsxs("div", { children: [
        jsx("div", { className: "tg-tip-date", children: lines[0] }),
        ...lines.slice(1).map((l, i) => jsx("div", { className: "tg-tip-sub", children: l }, "l" + i))
      ] });
    }
    const rawX = row[p.xField];
    const xv = rawX == null ? "?" : p.xTickFormat ? String(p.xTickFormat(Number(rawX))) : rawX;
    const head = p.tipHeadField && row[p.tipHeadField] != null ? String(row[p.tipHeadField]) + " \xB7 " + (p.xLabel || p.xField) + " " + xv : (p.xLabel || p.xField) + " " + xv + (p.xUnit ? " " + p.xUnit : "");
    const seen = {};
    const rows = [];
    for (const s of p.series) {
      if (seen[s.key]) continue;
      seen[s.key] = true;
      const v = row[s.key];
      if (v == null || !isFinite(Number(v))) continue;
      rows.push(jsxs("div", { className: "tg-cv-tip-row", children: [
        jsx("i", { className: "dot", style: { background: s.color } }),
        jsx("span", { className: "k", children: s.tipName || s.label }),
        jsx("span", { className: "v", children: fmtValue(Number(v)) + (s.unit ? " " + s.unit : "") })
      ] }, s.key));
    }
    return jsxs("div", { children: [jsx("div", { className: "tg-tip-date", children: head }), ...rows] });
  };
  var GraphCanvas = (props) => {
    const plotRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const [width, setWidth] = React.useState(0);
    const [settings, setSettings] = React.useState(() => loadChartSettings());
    React.useEffect(() => subscribeChartSettings(() => setSettings(loadChartSettings())), []);
    const [ui, setUi] = React.useState(() => loadUi(props.persistKey, props.pointMode || settings.mode));
    const [hover, setHover] = React.useState(null);
    const height = props.height || 320;
    React.useEffect(() => {
      const el = plotRef.current;
      if (!el) return;
      const measure = () => setWidth(Math.round(el.clientWidth || 0));
      measure();
      if (typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);
    React.useEffect(() => {
      saveUi(props.persistKey, ui);
    }, [props.persistKey, ui]);
    const hidden = ui;
    const frame = React.useMemo(
      () => buildFrame(props, hidden, { width: width || 480, height }, { mode: ui.mode, heat: settings.heat }),
      [props, ui, width, height, settings]
    );
    React.useEffect(() => {
      const cv = canvasRef.current;
      if (!cv || !width) return;
      const dpr = typeof window !== "undefined" && window.devicePixelRatio || 1;
      const w = Math.max(1, Math.round(width * dpr));
      const h = Math.max(1, Math.round(height * dpr));
      if (cv.width !== w) cv.width = w;
      if (cv.height !== h) cv.height = h;
      const ctx = cv.getContext ? cv.getContext("2d") : null;
      if (!ctx) return;
      if (ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderGraph(ctx, frame, { hoverPx: hover ? hover.px : null, mode: ui.mode, trend: settings.trend, heat: settings.heat });
    }, [frame, width, height, hover, ui.mode, settings]);
    const onMove = (e) => {
      const cv = canvasRef.current;
      if (!cv || !cv.getBoundingClientRect) return;
      const rect = cv.getBoundingClientRect();
      const hit = hitTest(frame, e.clientX - rect.left);
      setHover(hit ? { px: hit.px, row: hit.row, cx: e.clientX, cy: e.clientY } : null);
    };
    const onLeave = () => setHover(null);
    const hasData = (props.series || []).some((s) => (s.data || props.data || []).length > 0);
    if (!hasData) return props.empty != null ? props.empty : null;
    const chips = props.chips && props.chips.length ? props.chips : props.legendChips ? (props.series || []).filter((s, i, all) => all.findIndex((o) => o.key === s.key) === i).map((s) => ({ name: s.label, color: s.color, k: s.key })) : [];
    const explicit = !!(props.chips && props.chips.length);
    const toggleChip = (k) => setUi((h) => {
      const key = String(k), group = explicit ? h.chips : h.metrics;
      return explicit ? { ...h, chips: { ...group, [key]: !group[key] } } : { ...h, metrics: { ...group, [key]: !group[key] } };
    });
    const toggleMetric = (k) => setUi((h) => {
      const key = String(k);
      return { ...h, metrics: { ...h.metrics, [key]: !h.metrics[key] } };
    });
    const setMode = (m) => setUi((h) => h.mode === m ? h : { ...h, mode: m });
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const tipStyle = hover ? {
      left: Math.max(8, Math.min(hover.cx + 14, vw - 300)) + "px",
      top: Math.max(8, Math.min(hover.cy + 16, vh - 140)) + "px"
    } : null;
    return jsxs("div", { className: "tg-graph", children: [
      chips.length ? jsx("div", { className: "tg-legend-chips", children: chips.map((c) => {
        const off = !!(explicit ? ui.chips[String(c.k)] : ui.metrics[String(c.k)]);
        return jsx("button", {
          className: "tg-legend-chip" + (off ? " off" : ""),
          onClick: () => toggleChip(c.k),
          title: (off ? "Show " : "Hide ") + c.name,
          children: [
            jsx("span", { className: "sw", children: [
              jsx("i", { style: { borderTopColor: c.color } }),
              jsx("i", { className: "dot", style: { background: c.color } })
            ] }),
            c.name + (props.legendUnit ? " \xB7 " + props.legendUnit : "")
          ]
        }, "chip-" + c.k);
      }) }) : null,
      props.metricChips && props.metricChips.length ? jsx("div", { className: "tg-legend-chips", children: props.metricChips.map((c) => {
        const off = !!ui.metrics[c.k];
        return jsx("button", {
          className: "tg-legend-chip" + (off ? " off" : ""),
          onClick: () => toggleMetric(c.k),
          title: (off ? "Show " : "Hide ") + c.name,
          children: [
            jsx("span", { className: "sw", children: jsx("i", { className: "dot", style: { background: c.color } }) }),
            c.name
          ]
        }, "metric-" + c.k);
      }) }) : null,
      props.modeChips ? jsx("div", { className: "tg-graph-modes", children: POINT_MODES.map((m) => jsx("button", {
        className: "tg-graph-mode" + (ui.mode === m.k ? " on" : ""),
        onClick: () => setMode(m.k),
        title: m.title,
        children: m.name
      }, "mode-" + m.k)) }) : null,
      jsxs("div", { className: "tg-graph-plot", ref: plotRef, children: [
        jsx("canvas", {
          ref: canvasRef,
          className: "tg-graph-canvas",
          style: { width: "100%", height: height + "px" },
          onMouseMove: onMove,
          onMouseLeave: onLeave
        }),
        hover && tipStyle ? jsx("div", { className: "tg-tip", style: tipStyle, children: tipBody(props, hover.row) }) : null
      ] })
    ] });
  };

  // client/markdown.tsx
  var inline = (text2, kb) => {
    const out = [];
    let buf = "";
    let i = 0;
    let k = 0;
    const flush = () => {
      if (buf) {
        out.push(buf);
        buf = "";
      }
    };
    const tag = (el, inner) => {
      flush();
      const nk = kb + k++;
      out.push(jsx(el, { key: nk, children: inline(inner, nk + ".") }));
    };
    while (i < text2.length) {
      const ch = text2[i];
      if (ch === "`") {
        const end = text2.indexOf("`", i + 1);
        if (end > i) {
          flush();
          out.push(jsx("code", { key: kb + k++, children: text2.slice(i + 1, end) }));
          i = end + 1;
          continue;
        }
      }
      if (ch === "*" && text2[i + 1] === "*") {
        const end = text2.indexOf("**", i + 2);
        if (end > i + 2) {
          tag("strong", text2.slice(i + 2, end));
          i = end + 2;
          continue;
        }
      }
      if (ch === "~" && text2[i + 1] === "~") {
        const end = text2.indexOf("~~", i + 2);
        if (end > i + 2) {
          tag("del", text2.slice(i + 2, end));
          i = end + 2;
          continue;
        }
      }
      if (ch === "*") {
        const end = text2.indexOf("*", i + 1);
        if (end > i + 1) {
          tag("em", text2.slice(i + 1, end));
          i = end + 1;
          continue;
        }
      }
      if (ch === "[") {
        const close = text2.indexOf("]", i + 1);
        if (close > i && text2[close + 1] === "(") {
          const urlEnd = text2.indexOf(")", close + 2);
          if (urlEnd > close) {
            flush();
            out.push(jsx("a", { key: kb + k++, href: text2.slice(close + 2, urlEnd), target: "_blank", rel: "noreferrer", children: text2.slice(i + 1, close) }));
            i = urlEnd + 1;
            continue;
          }
        }
      }
      buf += ch;
      i++;
    }
    flush();
    return out;
  };
  var LIST_RE = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
  var buildList = (items, start, indent, key) => {
    const ordered = items[start].ordered;
    const kids = [];
    let i = start;
    while (i < items.length && items[i].indent >= indent) {
      if (items[i].indent > indent) {
        const [sub, next] = buildList(items, i, items[i].indent, key + "n");
        const prev = kids[kids.length - 1];
        if (prev) {
          const arr = Array.isArray(prev.props.children) ? prev.props.children : prev.props.children = [prev.props.children];
          arr.push(sub);
        }
        i = next;
        continue;
      }
      kids.push(jsx("li", { key: key + i, children: inline(items[i].text, key + i + ".") }));
      i++;
    }
    return [jsx(ordered ? "ol" : "ul", { key: key + "l", children: kids }), i];
  };
  var Markdown = ({ text: text2 }) => {
    const lines = (text2 || "").replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let key = 0;
    let para = [];
    const flushPara = () => {
      if (para.length) {
        blocks.push(jsx("p", { key: "p" + key, children: inline(para.join(" "), "p" + key + ".") }));
        key++;
        para = [];
      }
    };
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (/^\s*```/.test(line)) {
        flushPara();
        const buf = [];
        i++;
        while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        i++;
        blocks.push(jsx("pre", { key: "pre" + key, children: jsx("code", { children: buf.join("\n") }) }));
        key++;
        continue;
      }
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        flushPara();
        blocks.push(jsx("h" + h[1].length, { key: "h" + key, children: inline(h[2], "h" + key + ".") }));
        key++;
        i++;
        continue;
      }
      if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) {
        flushPara();
        blocks.push(jsx("hr", { key: "hr" + key++ }));
        i++;
        continue;
      }
      if (/^>\s?/.test(line)) {
        flushPara();
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          buf.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        blocks.push(jsx("blockquote", { key: "bq" + key, children: inline(buf.join(" "), "bq" + key + ".") }));
        key++;
        continue;
      }
      if (LIST_RE.test(line)) {
        flushPara();
        const items = [];
        while (i < lines.length) {
          const m = lines[i].match(LIST_RE);
          if (!m) break;
          items.push({ indent: m[1].replace(/\t/g, "  ").length, ordered: /^\d/.test(m[2]), text: m[3] });
          i++;
        }
        blocks.push(buildList(items, 0, items[0].indent, "l" + key + ".")[0]);
        key++;
        continue;
      }
      if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
        flushPara();
        const parseRow = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
        const rows = [parseRow(line)];
        i += 2;
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
          rows.push(parseRow(lines[i]));
          i++;
        }
        blocks.push(jsxs("table", { key: "t" + key, className: "tg-md-table", children: [
          jsx("thead", { key: "th", children: jsx("tr", { children: rows[0].map((c, j) => jsx("th", { key: j, children: inline(c, "t" + key + "h" + j + ".") })) }) }),
          jsx("tbody", { key: "tb", children: rows.slice(1).map((r, ri) => jsx("tr", { key: ri, children: r.map((c, j) => jsx("td", { key: j, children: inline(c, "t" + key + "r" + ri + "c" + j + ".") })) })) })
        ] }));
        key++;
        continue;
      }
      if (!line.trim()) {
        flushPara();
        i++;
        continue;
      }
      para.push(line.trim());
      i++;
    }
    flushPara();
    return jsx("div", { className: "tg-md", children: blocks });
  };

  // client/drawers.tsx
  var TURN_STATUS_META = {
    completed: { label: "completed", color: "#34d399" },
    open: { label: "in progress", color: "#60a5fa" },
    aborted: { label: "aborted", color: "#f87171", warn: true },
    blocked: { label: "blocked", color: "#fb923c", warn: true },
    error: { label: "error", color: "#ef4444", warn: true },
    "max-tokens": { label: "max tokens", color: "#fbbf24", warn: true },
    interrupted: { label: "interrupted", color: "#f59e0b", warn: true }
  };
  var EVENT_META_KINDS = [
    { key: "system", icon: "\u2699", label: "System prompt", color: "#94a3b8" },
    { key: "prompt", icon: "\u25B8", label: "Your message", color: "#34d399" },
    { key: "error", icon: "\u26A0", label: "Error / abort", color: "#ef4444" },
    { key: "user-stop", icon: "\u25A0", label: "User stop", color: "#f87171" },
    { key: "retry", icon: "\u21BB", label: "LLM retry", color: "#fb923c" },
    { key: "approval", icon: "\u270B", label: "Approval", color: "#fbbf24" },
    { key: "compaction", icon: "\u2702", label: "Compaction", color: "#f472b6" },
    { key: "prune", icon: "\u2702", label: "Prune", color: "#f9a8d4" },
    { key: "todo", icon: "\u2611", label: "Todo write", color: "#a3e635" },
    { key: "command", icon: "\u2318", label: "Command", color: "#38bdf8" },
    { key: "title", icon: "\u{1F3F7}", label: "Title", color: "#94a3b8" },
    { key: "model", icon: "\u21C4", label: "Model change", color: "#60a5fa" },
    { key: "deliverable", icon: "\u{1F4E6}", label: "Deliverables", color: "#2dd4bf" },
    { key: "info", icon: "\u2022", label: "Info", color: "#94a3b8" }
  ];
  var EVENT_META_BY_KIND = Object.fromEntries(EVENT_META_KINDS.map((e) => [e.key, e]));
  var evMeta = (kind) => EVENT_META_BY_KIND[kind] || { icon: "\u2022", label: kind, color: "#94a3b8" };
  var clockTime = (t) => {
    const d = new Date(t);
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  };
  var statusBadge = (status, detail) => {
    const m = TURN_STATUS_META[status] || TURN_STATUS_META.open;
    return jsxs("span", {
      title: "turn/end: " + status + (detail ? " \u2014 " + detail : ""),
      style: { display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 6px", borderRadius: 8, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3, color: m.color, background: m.color + "1f", border: "1px solid " + m.color + "55" },
      children: [m.warn ? "\u26A0 " : "", m.label]
    });
  };
  var timelineChip = (e, i) => {
    const m = evMeta(e.kind);
    const stamp = e.time ? clockTime(e.time) + " \xB7 " : "";
    return jsx("span", {
      key: "ev" + i,
      title: stamp + e.text,
      style: { display: "inline-flex", alignItems: "center", gap: 4, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "1px 7px", borderRadius: 8, fontSize: 10.5, color: m.color, background: m.color + "14", border: "1px solid " + m.color + "44" },
      children: [jsx("span", { children: m.icon }), jsx("span", { children: e.text })]
    });
  };
  var TurnTimelineSection = ({ s, maxTurns = 12 }) => {
    const tl = s.turnTimeline;
    const byTurn = /* @__PURE__ */ new Map();
    const sessionEvents = [];
    for (const e of tl && tl.events || []) {
      if (e.kind === "prompt") continue;
      if (e.turn == null) {
        sessionEvents.push(e);
        continue;
      }
      const arr = byTurn.get(e.turn) || [];
      arr.push(e);
      byTurn.set(e.turn, arr);
    }
    const turns = tl && tl.turns && tl.turns.length ? tl.turns : (s.stepTree || []).map((t) => ({ turn: t.turn, status: "completed", steps: (t.steps || []).length, prompt: "", response: "", detail: null }));
    if (!turns.length) return null;
    const shown = turns.slice(0, maxTurns);
    const hidden = turns.length - shown.length;
    const legend = EVENT_META_KINDS.filter((k) => k.key === "prompt" ? false : true);
    return jsxs("div", { style: { marginBottom: 14 }, children: [
      jsx("div", { className: "tg-drawer-sec", children: "Turn outline & events" }),
      sessionEvents.length ? jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10, alignItems: "center" }, children: [
        jsx("span", { className: "tg-faint", style: { fontSize: 10, marginRight: 4 }, children: "Session" }),
        ...sessionEvents.map(timelineChip)
      ] }) : null,
      ...shown.map((t) => {
        const evs = byTurn.get(t.turn) || [];
        const status = t.status || (t.detail ? "aborted" : "completed");
        const steps = t.steps != null ? t.steps : (s.stepTree || []).find((x) => x.turn === t.turn)?.steps?.length;
        return jsxs("div", { className: "tg-turn", children: [
          jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
            jsx("span", { style: { fontWeight: 700, fontSize: 12 }, children: "Turn " + t.turn }),
            statusBadge(status, t.detail),
            steps != null ? jsx("span", { className: "tg-faint", style: { fontSize: 10.5 }, children: steps + " step" + (steps === 1 ? "" : "s") }) : null,
            t.startTime && t.endTime && t.endTime > t.startTime ? jsx("span", { className: "tg-faint", style: { fontSize: 10.5 }, children: fmtMs(t.endTime - t.startTime) + " wall" }) : null
          ] }),
          t.prompt ? jsx("div", { className: "tg-turn-p", children: t.prompt }) : null,
          t.response ? jsx("div", { className: "tg-turn-r", children: t.response }) : null,
          evs.length ? jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }, children: evs.map(timelineChip) }) : null
        ] }, "turn-" + t.turn);
      }),
      hidden > 0 ? jsx("div", { className: "tg-faint", style: { fontSize: 10.5, padding: "4px 2px" }, children: "\u2026 " + hidden + " more turn" + (hidden === 1 ? "" : "s") + " (of " + turns.length + ")" }) : null,
      tl && tl.totalEvents > (tl.events || []).length ? jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 4 }, children: "showing " + (tl.events || []).length + " of " + tl.totalEvents + " events" }) : null,
      jsxs("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 6, display: "flex", flexWrap: "wrap", gap: 10 }, children: [
        ...legend.map((k) => jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, color: k.color }, children: [k.icon, jsx("span", { children: k.label })] }, "lg-" + k.key))
      ] })
    ] });
  };
  var Collapse = ({ label, children, defaultOpen, onOpenChange }) => {
    const [open, setOpen] = React.useState(!!defaultOpen);
    const toggle = () => {
      const n = !open;
      setOpen(n);
      if (onOpenChange) onOpenChange(n);
    };
    return jsxs("div", { className: "tg-collapse", children: [
      jsx("button", { className: "tg-collapse-head", onClick: toggle, children: [
        jsx("span", { className: "tg-chev" + (open ? " open" : ""), children: "\u25B6" }),
        jsx("span", { children: label })
      ] }),
      open ? jsx("div", { className: "tg-collapse-body", children }) : null
    ] });
  };
  var sourceMeta = (s) => {
    if (!isImported(s)) return null;
    const info = sourceInfo(s.source);
    if (!info) return String(s.source);
    return osIcon(info.os) + " " + info.label + " (" + osName(info.os) + ") \xB7 " + info.path;
  };
  var metaGrid = (meta) => jsx("div", { className: "tg-meta-grid", children: meta.map(([k, v]) => v == null || v === "" ? null : jsxs("div", { className: "tg-meta", children: [
    jsx("div", { className: "tg-meta-k", children: k }),
    jsx("div", { className: "tg-meta-v tg-num", children: v })
  ] }, k)) });
  var glance = (label, value, color, total = false) => jsxs("div", { className: "tg-card tg-stat" + (total ? " tg-stat-total" : ""), style: { padding: "14px 16px" }, children: [
    jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
      jsx("span", { className: "tg-stat-dot", style: { background: color } }),
      jsx("span", { className: "tg-label", style: { fontSize: 11.5 }, children: label })
    ] }),
    jsx("div", { className: "tg-stat-value tg-num", style: { fontSize: total ? 24 : 21, marginTop: 5 }, children: fmtC(value) })
  ] });
  var toolChips = (st) => jsxs("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }, children: [
    ...(st.tools || []).map((t) => jsx("span", { className: "tg-chip", style: { fontSize: 10 }, children: t }, t)),
    st.parallel ? jsx("span", { className: "tg-chip", style: { fontSize: 10, color: "#fbbf24" }, children: "parallel" }, "parallel") : null
  ] });
  var stepRuntimeMs = (st) => {
    const a = st.ttftMs, b = st.decodeMs;
    if (a == null && b == null) return null;
    return (a || 0) + (b || 0);
  };
  var fmtRuntime = (st) => {
    const v = stepRuntimeMs(st);
    return v != null ? fmtMs(v) : "\u2014";
  };
  var ctxPct = (st) => st.ctxTotal != null && st.ctxWindow > 0 ? Math.round(st.ctxTotal / st.ctxWindow * 100) : null;
  var ctxColor = (pct) => pct == null ? void 0 : pct > 85 ? "#f87171" : pct > 60 ? "#fbbf24" : "#94a3b8";
  var ctxTitle = (st) => {
    const pct = ctxPct(st);
    return "context at this step: ~" + fmtC(st.ctxTotal) + (pct != null ? " / " + fmtC(st.ctxWindow) + " (" + pct + "%)" : "") + " \u2014 System ~" + fmtC(st.ctxSys) + " \xB7 Tools ~" + fmtC(st.ctxTools) + " \xB7 Messages ~" + fmtC(st.ctxMsg) + ". Total = actual prompt tokens (uncached " + fmtC(st.in) + " + cached " + fmtC(st.cache) + "); the breakdown is a chars/4 estimate of the trajectory content.";
  };
  var ctxCell = (st) => tdR(st.ctxTotal != null ? (st.postCompaction ? "\u2702 " : "") + fmtC(st.ctxTotal) : "\u2014", { style: { fontWeight: 600, color: ctxColor(ctxPct(st)) }, title: (st.postCompaction ? "context was compacted (reset) before this step \u2014 " : "") + ctxTitle(st) });
  var combinedStepCell = (st) => jsxs("tr", { className: "tg-tr", children: [
    tdL("S" + st.step, { style: { fontFamily: "monospace", fontSize: 11 } }),
    tdL(toolChips(st), { title: st.parallel ? "multiple tools called after this step (parallel group)" : "single tool call after this step" }),
    tdR(fmtC(st.in)),
    tdR(fmtC(st.out)),
    tdR(st.cache ? fmtC(st.cache) : "\u2014"),
    tdR(st.thinking ? (st.thinkingEstimated ? "\u2248" : "") + fmtC(st.thinking) : "\u2014", { style: { color: st.thinking ? "#c084fc" : void 0 }, title: st.thinkingEstimated ? "\u2248 estimated from reasoning text (provider reported 0 reasoning tokens)" : "reasoning tokens" }),
    tdR(st.prefillTokPerSec != null ? st.prefillTokPerSec + " tok/s" : "\u2014", { style: { fontWeight: 600 }, title: "trajectory prefill = new (uncached) input tokens \xF7 TTFT (" + st.in + " prompt tokens). TTFT includes network + queue, so it is a lower bound" }),
    tdR(st.decodeTokPerSec != null ? st.decodeTokPerSec + " tok/s" : "\u2014", { style: { fontWeight: 600 }, title: "trajectory decode = streamed output tokens \xF7 decode time (first\u2192last chunk), " + st.out + " output tokens" }),
    tdR(st.ttftMs != null ? fmtMs(st.ttftMs) : "\u2014", { title: "time from request to first token (TTFT) \u2014 includes network + queue" }),
    tdR(st.decodeMs != null ? fmtMs(st.decodeMs) : "\u2014"),
    tdR(fmtRuntime(st), { style: { fontWeight: 600 }, title: "step runtime = TTFT + decode time (decode already contains the thinking window)" }),
    ctxCell(st)
  ] }, st.turn + "-" + st.step);
  var CompactionModal = ({ session, comp, onClose }) => {
    const running = comp.state === "running" || comp.state == null && !comp.ok && !comp.error;
    const [detail, setDetail] = React.useState(null);
    const [err, setErr] = React.useState(null);
    React.useEffect(() => {
      if (running) return;
      let live = true;
      request("/compaction?session=" + encodeURIComponent(session) + "&index=" + comp.index).then((d) => {
        if (live) setDetail(d);
      }).catch((e) => {
        if (live) setErr(e instanceof Error ? e.message : String(e));
      });
      return () => {
        live = false;
      };
    }, [session, comp.index, running]);
    const ctxAfter = !running && comp.contextBefore && comp.shadowedTokens ? comp.contextBefore - comp.shadowedTokens : null;
    const meta = [
      ["Status", running ? "Running (compacting\u2026)" : comp.ok ? "Completed" : "Failed" + (comp.error ? " \u2014 " + comp.error : "")],
      ["Duration", !running && comp.durationMs != null ? fmtMs(comp.durationMs) : null],
      ["Tokens removed", !running && comp.shadowedTokens ? fmtC(comp.shadowedTokens) : null],
      ["Context before", !running && comp.contextBefore ? fmtC(comp.contextBefore) : null],
      ["Context after", ctxAfter && ctxAfter > 0 ? fmtC(ctxAfter) : null],
      ["Summary size", !running && comp.summaryChars ? "\u2248" + fmtC(Math.ceil(comp.summaryChars / 4)) + " tok" : null]
    ];
    return jsx("div", { className: "tg-modal-overlay", role: "presentation", onClick: (e) => {
      if (e && e.target === e.currentTarget) onClose();
    }, children: [
      jsx("div", { className: "tg-modal-mask", "aria-hidden": "true", onClick: onClose }),
      jsxs("div", { className: "tg-modal-panel tg-comp-panel", role: "dialog", "aria-modal": "true", children: [
        jsxs("div", { className: "tg-modal-header", style: { padding: "14px 18px 12px" }, children: [
          jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
            jsx("span", { className: "tg-comp-badge" + (running ? " tg-comp-badge-run" : ""), children: running ? "\u2702 COMPACTING\u2026" : "\u2702 COMPACTED" }),
            jsx("span", { className: "tg-faint", style: { fontSize: 12 }, children: "Between turns" + (comp.afterTurn != null ? " \xB7 after Turn " + comp.afterTurn + (comp.afterStep != null ? " \xB7 Step " + comp.afterStep : "") : "") })
          ] }),
          jsx("button", { className: "tg-close", onClick: onClose, "aria-label": "Close", children: "\u2715" })
        ] }),
        // The modal panel is a fixed-height flex column: header + meta grid stay
        // put, and ONLY the summary box scrolls (tg-comp-summary-wrap = flex:1).
        jsx("div", { className: "tg-modal-body", children: jsxs("div", { className: "tg-comp-body", style: { padding: "4px 20px 18px" }, children: [
          metaGrid(meta),
          jsx("div", { className: "tg-drawer-sec", style: { marginTop: 14 }, children: "Summary" }),
          jsx("div", {
            className: "tg-comp-summary-wrap",
            children: running ? jsx("div", { className: "tg-muted", style: { fontSize: 12.5 }, children: "Compacting \u2014 the generated summary will appear here once the compaction completes (re-open the row after it finishes)." }) : err ? jsx("div", { className: "tg-muted", style: { fontSize: 12.5 }, children: "Could not load the summary: " + err }) : detail ? jsx("div", { className: "tg-comp-summary", children: detail.summaryText ? jsx(Markdown, { text: detail.summaryText }) : "(no summary text recorded)" }) : jsx("div", { className: "tg-muted", style: { fontSize: 12.5 }, children: "Loading summary\u2026" })
          })
        ] }) })
      ] })
    ] });
  };
  var CombinedStepTable = ({ steps, defaultClosed = false, compactions, onCompaction, turnTimeline }) => {
    const [closed, setClosed] = React.useState(() => defaultClosed ? new Set((steps || []).map((t) => t.turn)) : /* @__PURE__ */ new Set());
    const toggle = (turn) => setClosed((p) => {
      const n = new Set(p);
      if (n.has(turn)) n.delete(turn);
      else n.add(turn);
      return n;
    });
    const tlByTurn = React.useMemo(() => {
      const map = /* @__PURE__ */ new Map();
      const get = (turn) => {
        let e = map.get(turn);
        if (!e) {
          e = { status: null, detail: null, events: [] };
          map.set(turn, e);
        }
        return e;
      };
      for (const t of turnTimeline && turnTimeline.turns || []) {
        const e = get(t.turn);
        e.status = t.status || "completed";
        e.detail = t.detail ?? null;
      }
      for (const ev of turnTimeline && turnTimeline.events || []) {
        if (ev.kind === "prompt" || ev.turn == null) continue;
        get(ev.turn).events.push(ev);
      }
      for (const t of steps || []) {
        const e = get(t.turn);
        if (!e.status) e.status = "completed";
      }
      return map;
    }, [turnTimeline, steps]);
    const bannerRow = (comp) => {
      const running = comp.state === "running" || comp.state == null && !comp.ok && !comp.error;
      return jsx("tr", {
        className: "tg-tr tg-comp-row" + (running ? " tg-comp-row-run" : comp.ok ? "" : " tg-comp-row-fail"),
        onClick: (e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          if (onCompaction) onCompaction(comp);
        },
        children: [
          jsx("td", { colSpan: 12, children: jsxs("span", { className: "tg-comp-banner", children: [
            jsx("span", { className: "tg-comp-badge", children: running ? "\u2702 COMPACTING\u2026" : "\u2702 COMPACTED" }),
            jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: "Between turns" + (comp.afterTurn != null ? " \xB7 after Turn " + comp.afterTurn + (comp.afterStep != null ? " \xB7 Step " + comp.afterStep : "") : "") }),
            jsx("span", {
              className: "tg-comp-row-meta",
              children: (running ? "Compacting\u2026" : comp.ok ? "Completed" : "Failed" + (comp.error ? " \u2014 " + comp.error : "")) + (!running && comp.durationMs != null ? " \xB7 " + (comp.durationMs / 1e3).toFixed(1) + "s" : "") + (!running && comp.shadowedTokens ? " \xB7 " + fmtC(comp.shadowedTokens) + " tokens removed" : "")
            })
          ] }) })
        ]
      }, "comp" + comp.index);
    };
    const allStepKeys = new Set((steps || []).reduce((acc, t) => acc.concat((t.steps || []).map((st) => t.turn + ":" + st.step)), []));
    const bannerAfter = /* @__PURE__ */ new Map();
    const beforeTurn = /* @__PURE__ */ new Map();
    const bannerEnd = [];
    for (const c of compactions || []) {
      const k = c.afterTurn != null && c.afterStep != null ? c.afterTurn + ":" + c.afterStep : null;
      if (k && allStepKeys.has(k)) {
        bannerAfter.set(k, [...bannerAfter.get(k) || [], c]);
        continue;
      }
      const flat = (steps || []).reduce((acc, t) => acc.concat(t.steps || []), []);
      const target = flat.find((st) => (st.compactionRegime || 0) >= c.index);
      if (target) beforeTurn.set(target.turn, [...beforeTurn.get(target.turn) || [], c]);
      else bannerEnd.push(c);
    }
    return jsx("div", { className: "tg-field-scroll", children: jsx("table", { className: "tg-table tg-sticky", style: { fontSize: 12.5 }, children: [
      jsx("tr", { children: [thL("Step"), thL("Tools"), thR("In"), thR("Out"), thR("Cache"), thR("Think"), thR("Prefill"), thR("Decode"), thR("TTFT"), thR("Dec time"), thR("Runtime"), thR("Ctx")] }),
      ...(steps || []).flatMap((turn) => {
        const isClosed = closed.has(turn.turn);
        const tIn = turn.steps.reduce((n, st) => n + (st.in || 0), 0);
        const tOut = turn.steps.reduce((n, st) => n + (st.out || 0), 0);
        const tCache = turn.steps.reduce((n, st) => n + (st.cache || 0), 0);
        const tThink = turn.steps.reduce((n, st) => n + (st.thinking || 0), 0);
        const avgOf = (key) => {
          const vals = turn.steps.map((st) => st[key]).filter((v) => v != null && Number.isFinite(v));
          return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        };
        const ttftMsTot = turn.steps.reduce((n, st) => st.ttftMs > 0 ? n + st.ttftMs : n, 0);
        const prefillTokTot = turn.steps.reduce((n, st) => st.ttftMs > 0 ? n + (st.in || 0) : n, 0);
        const decMsTot = turn.steps.reduce((n, st) => st.decodeMs > 0 ? n + st.decodeMs : n, 0);
        const decTokTot = turn.steps.reduce((n, st) => st.decodeMs > 0 ? n + (st.out || 0) : n, 0);
        const avgTtft = avgOf("ttftMs");
        const turnPrefill = ttftMsTot > 0 ? Math.round(prefillTokTot / (ttftMsTot / 1e3) * 10) / 10 : null;
        const avgDecMs = avgOf("decodeMs");
        const turnDec = decMsTot > 0 ? Math.round(decTokTot / (decMsTot / 1e3) * 10) / 10 : null;
        const tRt = turn.steps.reduce((n, st) => n + (stepRuntimeMs(st) || 0), 0);
        const header = jsxs("tr", {
          className: "tg-tr tg-row-btn",
          style: { background: "rgba(255,255,255,0.03)" },
          onClick: (e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            toggle(turn.turn);
          },
          children: [
            tdL(jsxs("span", { style: { display: "flex", alignItems: "center", gap: 7, fontWeight: 700 }, children: [
              jsx("span", { className: "tg-chev" + (isClosed ? "" : " open"), children: "\u25B6" }),
              jsx("span", { children: "Turn " + turn.turn }),
              (() => {
                const td = tlByTurn.get(turn.turn);
                const st = td ? td.status : null;
                if (!td || !st && !td.events.length) return null;
                return jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
                  st ? statusBadge(st, td.detail) : null,
                  ...td.events.slice(0, 4).map((e) => jsx("span", { title: e.text, style: { fontSize: 10 }, children: evMeta(e.kind).icon })),
                  td.events.length > 4 ? jsx("span", { className: "tg-faint", style: { fontSize: 10 }, children: "+" + (td.events.length - 4) }) : null
                ] });
              })()
            ] })),
            tdL(jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: turn.steps.length + " step" + (turn.steps.length > 1 ? "s" : "") })),
            tdR(fmtC(tIn), { style: { fontWeight: 700 } }),
            tdR(fmtC(tOut), { style: { fontWeight: 700 } }),
            tdR(fmtC(tCache), { style: { fontWeight: 700 } }),
            tdR(tThink ? fmtC(tThink) : "\u2014", { style: { fontWeight: 700, color: tThink ? "#c084fc" : void 0 } }),
            tdR(turnPrefill != null ? turnPrefill + " tok/s" : "\u2014", { style: { fontWeight: 700, color: "#94a3b8" }, title: "turn prefill = new (uncached) input tokens \xF7 TTFT across the turn's steps \u2014 same ratio-of-sums math as the session row" }),
            tdR(turnDec != null ? turnDec + " tok/s" : "\u2014", { style: { fontWeight: 700, color: "#94a3b8" }, title: "turn decode = streamed output tokens \xF7 decode time across the turn's steps \u2014 same ratio-of-sums math as the session row" }),
            tdR(avgTtft != null ? fmtMs(avgTtft) : "\u2014", { style: { fontWeight: 700, color: "#94a3b8" }, title: "turn-average TTFT" }),
            tdR(avgDecMs != null ? fmtMs(avgDecMs) : "\u2014", { style: { fontWeight: 700, color: "#94a3b8" }, title: "turn-average decode time" }),
            tdR(tRt > 0 ? fmtMs(tRt) : "\u2014", { style: { fontWeight: 700, color: "#94a3b8" }, title: "turn total runtime = sum of (TTFT + decode) across steps \u2014 decode already contains the thinking window, so no separate thinking term" }),
            (() => {
              const last = turn.steps[turn.steps.length - 1];
              return last && last.ctxTotal != null ? tdR(fmtC(last.ctxTotal) + (last.ctxWindow ? " / " + fmtC(last.ctxWindow) : ""), { style: { fontWeight: 700, color: ctxColor(ctxPct(last)) }, title: "context at the turn's last step: ~" + fmtC(last.ctxTotal) + (last.ctxWindow ? " / " + fmtC(last.ctxWindow) + " (" + ctxPct(last) + "%)" : "") + " \u2014 System ~" + fmtC(last.ctxSys) + " \xB7 Tools ~" + fmtC(last.ctxTools) + " \xB7 Messages ~" + fmtC(last.ctxMsg) }) : tdR("\u2014");
            })()
          ]
        }, "turn" + turn.turn);
        const turnStepKeys = new Set((turn.steps || []).map((st) => turn.turn + ":" + st.step));
        const anchoredHere = [];
        for (const [k, arr] of bannerAfter) if (turnStepKeys.has(k)) anchoredHere.push(...arr);
        const headBanners = (beforeTurn.get(turn.turn) || []).map(bannerRow);
        if (isClosed) return [...headBanners, header, ...anchoredHere.length ? anchoredHere.map(bannerRow) : []];
        return [
          ...headBanners,
          header,
          ...turn.steps.flatMap((st) => [
            combinedStepCell(st),
            ...(bannerAfter.get(turn.turn + ":" + st.step) || []).map(bannerRow)
          ])
        ];
      }),
      ...bannerEnd.map(bannerRow)
    ] }) });
  };
  var CompactionTable = ({ s, defaultClosed = false }) => {
    const [compOpen, setCompOpen] = React.useState(null);
    return jsxs("div", { children: [
      jsx(CombinedStepTable, { steps: s.stepTree, defaultClosed, compactions: s.compactionEvents, onCompaction: setCompOpen, turnTimeline: s.turnTimeline }),
      compOpen ? jsx(CompactionModal, { session: s.id, comp: compOpen, onClose: () => setCompOpen(null) }) : null
    ] });
  };
  var combinedDrawer = (s, opts = {}) => {
    const m = s.meta || {};
    const stepCount = s.events ? s.events.steps || 0 : s.stepTree ? s.stepTree.reduce((n, t) => n + t.steps.length, 0) : 0;
    const allSteps = (s.stepTree || []).reduce((acc, t) => acc.concat(t.steps), []);
    const ctxWin = allSteps.map((st) => st.ctxWindow).find((v) => v != null) ?? null;
    const ctxPeak = allSteps.reduce((mx, st) => Math.max(mx, st.ctxTotal || 0), 0);
    const compInfo = (() => {
      const n = s.compactions || 0, err = s.compactionErrors || 0, tok = s.compactedTokens || 0, pr = s.prunes || 0, pt = s.prunedTokens || 0;
      if (!n && !pr) return null;
      let v = n + " compaction" + (n === 1 ? "" : "s");
      if (err) v += " \xB7 " + err + " failed";
      if (tok) v += " \xB7 " + fmtC(tok) + " tokens removed";
      if (pr) v += " \xB7 " + pr + " prune" + (pr === 1 ? "" : "s") + (pt ? " \xB7 " + fmtC(pt) : "");
      return v;
    })();
    const REGIME_COLORS = ["#e5e7eb", "#f87171", "#fb923c", "#a3e635", "#38bdf8", "#f43f5e", "#d946ef", "#22d3ee"];
    const PERF_METRICS = [
      { key: "in", name: "in", color: "#4ade80", unit: "tok" },
      { key: "out", name: "out", color: "#94a3b8", unit: "tok" },
      { key: "thinking", name: "thinking", color: "#c084fc", unit: "tok", radius: 2 },
      { key: "cache", name: "cache", color: "#2dd4bf", unit: "tok" },
      { key: "pf", name: "prefill", color: "#fb923c", unit: "tok/s" },
      { key: "dc", name: "decode", color: "#facc15", unit: "tok/s" }
    ];
    const regimeRows = {};
    const stepG = {};
    let gIdx = 0;
    for (const st of allSteps) {
      if (st.ctxTotal == null) continue;
      if (st.in == null && st.out == null && st.cache == null && st.thinking == null && st.prefillTokPerSec == null && st.decodeTokPerSec == null) continue;
      const r = st.compactionRegime || 0;
      const row = {
        g: gIdx,
        ctx: st.ctxTotal,
        in: st.in ?? null,
        out: st.out ?? null,
        thinking: st.thinking ?? null,
        cache: st.cache ?? null,
        pf: st.prefillTokPerSec ?? null,
        dc: st.decodeTokPerSec ?? null,
        thinkEst: !!st.thinkingEstimated,
        label: "T" + st.turn + "S" + st.step
      };
      stepG[st.turn + ":" + st.step] = gIdx;
      (regimeRows[r] || (regimeRows[r] = [])).push(row);
      gIdx++;
    }
    for (const k of Object.keys(regimeRows)) regimeRows[Number(k)].sort((a, b) => a.g - b.g);
    const regimeKeys = Object.keys(regimeRows).map(Number).sort((a, b) => a - b);
    const perfSeries = [];
    const perfChips = [];
    regimeKeys.forEach((r, i) => {
      const rows = regimeRows[r];
      if (!rows.length) return;
      const c = REGIME_COLORS[r % REGIME_COLORS.length];
      const name = r === 0 ? "Before compaction" : "After compaction " + r;
      perfChips.push({ name, color: c, k: r });
      const lineRows = rows.map((x) => ({ g: x.g, ctx: x.ctx, label: x.label }));
      const next = regimeKeys[i + 1];
      if (next != null && regimeRows[next].length) {
        const first = regimeRows[next][0];
        lineRows.push({ g: first.g, ctx: first.ctx, label: name + " -> reset" });
      }
      perfSeries.push({ key: "ctx", label: name, tipName: "ctx", color: c, unit: "tok", axis: 0, regime: r, line: true, fill: true, data: lineRows });
      for (const m2 of PERF_METRICS) {
        perfSeries.push({ key: m2.key, label: m2.name, color: m2.color, unit: m2.unit, axis: 1, regime: r, line: true, data: rows });
      }
    });
    const perfTipRows = regimeKeys.flatMap((r) => regimeRows[r]);
    const perfRules = (s.compactionEvents || []).filter((c) => c.contextBefore != null && c.afterTurn != null && c.afterStep != null && stepG[c.afterTurn + ":" + c.afterStep] != null).map((c) => ({
      x: stepG[c.afterTurn + ":" + c.afterStep],
      label: "\u2702 C" + c.index,
      tip: "Compaction " + c.index + " \xB7 after Turn " + c.afterTurn + " \xB7 Step " + c.afterStep + " \xB7 context " + fmtC(c.contextBefore) + " tok",
      color: "#f472b6",
      windows: [c.index - 1, c.index]
    }));
    const perfHas = perfSeries.length > 0;
    const meta = [
      ["Source", sourceMeta(s)],
      ["Project", s.cwd],
      ["Turns", s.turns || null],
      ["Steps", stepCount || null],
      ["Models", s.modelMix],
      ["LLM time", s.llmMs ? fmtMs(s.llmMs) : null],
      ["Decode", s.tokPerSec != null ? s.tokPerSec + " tok/s" : null],
      ["Context", ctxPeak > 0 ? fmtC(ctxPeak) + " peak" + (ctxWin ? " / " + fmtC(ctxWin) + " window (" + Math.round(ctxPeak / ctxWin * 100) + "%)" : "") : null],
      ["Compactions", compInfo],
      ["Archived", s.archived ? "\u{1F4E6} yes" : null],
      ["Last model", m.lastUsedModel ? m.lastUsedModel.model + " \xB7 " + (m.lastUsedModel.provider || "?") : null]
    ];
    const tot = sessionTokens(s);
    return jsxs("div", { className: "tg-drawer-inner", children: [
      metaGrid(meta),
      perfHas ? jsxs("div", { style: { marginBottom: 14 }, children: [
        jsxs("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }, children: [
          jsx("div", { className: "tg-drawer-sec", style: { marginBottom: 0 }, children: "Performance & context \u2014 over steps" }),
          jsx("div", { className: "tg-faint", style: { fontSize: 10 }, children: "left = context (linear) \xB7 right = metrics (log)" })
        ] }),
        // Drawn by the plugin's own canvas engine (client/graph.ts) instead of
        // the vendored amCharts bundle — the first chart migrated, see
        // client/graph-canvas.tsx.
        jsx(GraphCanvas, {
          xField: "g",
          xLabel: "step",
          xUnit: "",
          xStep: Math.max(1, Math.round(gIdx / 12)),
          series: perfSeries,
          axes: [
            { unit: "ctx" },
            { log: true, hideLabels: true, unit: "tok" }
          ],
          rules: perfRules,
          legendChips: true,
          chips: perfChips,
          metricChips: PERF_METRICS.map((m2) => ({ name: m2.name + " \xB7 " + m2.unit, color: m2.color, k: m2.key })),
          tipHeadField: "label",
          tipData: perfTipRows,
          smooth: true,
          // the Lines / Both / Dots switch above the plot, and chips + plot mode
          // remembered across drawer opens (client/graph-store.ts)
          modeChips: true,
          persistKey: "perf",
          height: 400
        }),
        jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 6 }, children: "One chart for every compaction regime \u2014 x = step (session time; the shared axis auto-scales to the visible data). The context filling up is shown as filled area lines: each window's line (left axis = context size) rises step by step as the context fills, then drops at its \u2702 compaction to the next window's starting context \u2014 the session's context sawtooth, in the window's color. Every step also plots on the right log axis, one color per metric \u2014 in / out / thinking / cache (tokens) and prefill / decode (tok/s); hover any point for that step's full stats in one box. The mode switch re-draws the same data five ways: Lines and Both connect the steps, Dots is a scatter (a dot per step), Trend is a rolling median/mean/EMA through those dots (the raw steps stay faint behind it), and Heat is a grid of one row per metric against one column per step, shaded by value. Every chip and the plot mode are remembered, and how Trend and Heat behave \u2014 statistic, window, spread band, rows, ramp, shading, binning \u2014 is set in the settings tab under \u201CChart defaults\u201D. Click a window chip to remove or restore a whole window: its lines, its context area and the \u2702 boundary lines it bounds all hide with it, and the x-axis rescales to the remaining windows. Each \u2702 line marks a compaction, drawn at the step after which it ran: windows left of \u2702 C1 ran before compaction 1, between \u2702 C1 and \u2702 C2 after it, and so on." })
      ] }) : null,
      jsx(TurnTimelineSection, { s }),
      jsxs("div", { style: { marginBottom: 14 }, children: [
        jsx("div", { className: "tg-drawer-sec", children: "Token breakdown \u2014 this session" }),
        jsx("div", { className: "tg-chipgrid", children: [
          glance("In", tot.tin, "#60a5fa"),
          glance("Out", tot.tout, "#a78bfa"),
          glance("Cache", tot.tcache, "#2dd4bf"),
          glance("Thinking", tot.tthink, "#c084fc"),
          glance("Tools", tot.ttools, "#34d399"),
          glance("Total", tot.total, "#fbbf24", true)
        ] })
      ] }),
      s.stepTree && s.stepTree.length ? jsxs("div", { children: [
        jsx("div", { className: "tg-drawer-sec", children: "Per turn & step \u2014 tokens + speed (combined)" }),
        jsx(CompactionTable, { s, defaultClosed: !!opts.defaultClosed }),
        jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 6 }, children: "Each step row is one LLM step: the tools it called and the context tokens it moved (In/Out/Cache/Think) alongside its timing (TTFT / Prefill / Decode) and its Ctx \u2014 the context-window allocation at that step (System / Tools / Messages, chars/4 estimate of the trajectory content) with the total prompt size against the model's window. \u2702 COMPACTED rows mark where a compaction ran between turns (\u2702 COMPACTING\u2026 = one still in progress, not a failure) \u2014 click one for its status, duration, tokens removed and the generated summary (\u2702 prefix on a Ctx cell = that step ran after a compaction reset). Turn header shows the turn's token column totals; its speed columns use total tokens \xF7 total time (same math as the session row) while TTFT / decode time are per-step averages. Prefill/decode speeds use the trajectory's own timestamps (TTFT includes network + queue, so prefill is a lower bound). Thinking = reasoning tokens (\u2248 estimated from the reasoning text when the provider reports 0)." })
      ] }) : null
    ] });
  };

  // client/panels.tsx
  var costModelTable = (rows) => {
    const R = rows || [];
    const tot = R.reduce((a, m) => {
      a.sessions += m.sessions || 0;
      a.steps += m.steps || 0;
      a.in += m.uncachedInputTokens || 0;
      a.out += m.outputTokens || 0;
      a.think += m.reasoningTokens || 0;
      a.cache += m.cacheReadTokens || 0;
      a.cost += m.cost != null ? m.cost : 0;
      a.decodeMs += m.decodeMs || 0;
      a.decodeTokens += m.decodeTokens || 0;
      a.prefillMs += m.prefillMs || 0;
      a.prefillTokens += m.prefillTokens || 0;
      a.prefillSteps += m.prefillSteps || 0;
      return a;
    }, { sessions: 0, steps: 0, in: 0, out: 0, think: 0, cache: 0, cost: 0, decodeMs: 0, decodeTokens: 0, prefillMs: 0, prefillTokens: 0, prefillSteps: 0 });
    const allPriced = R.length > 0 && R.every((m) => m.cost != null);
    const decTps = tot.decodeMs > 0 ? Math.round(tot.decodeTokens / (tot.decodeMs / 1e3) * 10) / 10 : null;
    const preTps = tot.prefillMs > 0 ? Math.round(tot.prefillTokens / (tot.prefillMs / 1e3) * 10) / 10 : null;
    const avgTtft = tot.prefillSteps > 0 ? Math.round(tot.prefillMs / tot.prefillSteps) : null;
    const rt = tot.decodeMs + tot.prefillMs > 0 ? tot.decodeMs + tot.prefillMs : null;
    const cstyle = { fontWeight: 700, color: "#f8fafc" };
    return jsx("div", { className: "tg-tscroll tg-vscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
      jsx("tr", { children: [
        thL("Model"),
        thL("Kind"),
        thR("Sessions \xB7 Steps"),
        thR("In"),
        thR("Out"),
        thR("Think"),
        thR("Cache"),
        thR("Cost"),
        thR("Run time"),
        thR("Decode"),
        thR("Prefill"),
        thR("Avg TTFT")
      ] }),
      ...R.map((m) => jsxs("tr", {
        className: "tg-tr",
        children: [
          tdL(m.label, { style: { maxWidth: 210, whiteSpace: "normal", wordBreak: "break-word", fontWeight: 600 }, title: m.label }),
          tdL(jsx("span", { className: "tg-kind", style: { color: m.kind === "corp" ? "#f87171" : "#34d399" }, children: m.kind === "corp" ? "corp" : "local" })),
          tdR(m.sessions + " \xB7 " + m.steps, { style: { fontWeight: 600 }, title: m.sessions + " session(s) \xB7 " + m.steps + " LLM steps" }),
          tdR(fmtC(m.uncachedInputTokens), { title: fmt(m.uncachedInputTokens) + " new (uncached) input tokens" }),
          tdR(fmtC(m.outputTokens), { title: fmt(m.outputTokens) + " output tokens" }),
          tdR(m.reasoningTokens > 0 ? fmtC(m.reasoningTokens) : "\u2014", { title: fmt(m.reasoningTokens) + " reasoning / thinking tokens (a subdivision of Out)" }),
          tdR(fmtC(m.cacheReadTokens), { title: fmt(m.cacheReadTokens) + " cache read \xB7 " + fmt(m.cacheWriteTokens) + " cache write tokens" }),
          tdR(m.cost != null ? money(m.cost) : "unpriced", { style: { fontWeight: 700, color: m.cost != null ? "#f8fafc" : "#fbbf24" } }),
          tdR((m.decodeMs || 0) + (m.prefillMs || 0) > 0 ? fmtMs((m.decodeMs || 0) + (m.prefillMs || 0)) : "\u2014", { title: "total runtime = sum of (TTFT + decode) across this model's steps \u2014 decode already contains the thinking window" }),
          tdR(m.tokPerSec != null ? m.tokPerSec + " tok/s" : "\u2014", { style: { fontWeight: 700 }, title: "decode speed \u2014 streamed output tokens \xF7 decode time (first\u2192last chunk)" }),
          tdR(m.promptTokPerSec != null ? m.promptTokPerSec + " tok/s" : "\u2014", { style: { fontWeight: 700 }, title: "prefill speed \u2014 new (uncached) input tokens \xF7 TTFT. TTFT includes network + queue, so this is a lower bound on true prefill rate." }),
          tdR(m.avgTtftMs != null ? fmtMs(m.avgTtftMs) : "\u2014", { title: "average time from request to first token" })
        ]
      }, m.model)),
      R.length ? jsx("tr", {
        className: "tg-tr tg-total",
        children: [
          tdL("Total", { style: { fontWeight: 800, color: "#fbbf24" } }),
          tdL(jsx("span", { className: "tg-faint", children: "\u2014" })),
          tdR(tot.sessions + " \xB7 " + tot.steps, { style: cstyle }),
          tdR(fmtC(tot.in), { style: cstyle }),
          tdR(fmtC(tot.out), { style: cstyle }),
          tdR(fmtC(tot.think), { style: cstyle }),
          tdR(fmtC(tot.cache), { style: cstyle }),
          tdR(allPriced ? money(tot.cost) : "unpriced", { style: { fontWeight: 800, color: allPriced ? "#fde68a" : "#fbbf24" } }),
          tdR(rt != null ? fmtMs(rt) : "\u2014", { style: cstyle }),
          tdR(decTps != null ? decTps + " tok/s" : "\u2014", { style: cstyle }),
          tdR(preTps != null ? preTps + " tok/s" : "\u2014", { style: cstyle }),
          tdR(avgTtft != null ? fmtMs(avgTtft) : "\u2014", { style: cstyle })
        ]
      }) : null
    ] }) });
  };
  var comparisonTable = (comparison) => {
    const rows = comparison || [];
    const baseline = rows.find((c) => c.baseline);
    const others = rows.filter((c) => !c.baseline);
    others.sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0));
    const shown = baseline ? [baseline, ...others.slice(0, 9)] : others.slice(0, 10);
    return jsx("div", { className: "tg-tscroll tg-vscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
      jsx("tr", { children: [thL("Model"), thR("$/M in"), thR("$/M out"), thR("$/M cacheR"), thR("Cost"), thR("You save")] }),
      ...shown.map((c) => jsxs("tr", {
        className: "tg-tr",
        style: c.baseline ? { background: "rgba(16,185,129,0.06)" } : void 0,
        children: [
          tdL(c.label + (c.estimated ? " (est.)" : ""), { style: { maxWidth: 240, whiteSpace: "normal", wordBreak: "break-word", fontWeight: c.baseline ? 700 : 600, color: c.baseline ? "#34d399" : void 0 } }),
          tdR(c.pricing ? String(c.pricing.input) : "\u2014"),
          tdR(c.pricing ? String(c.pricing.output) : "\u2014"),
          tdR(c.pricing ? String(c.pricing.cacheRead) : "\u2014"),
          tdR(c.priced ? money(c.cost) : "unpriced", { style: { fontWeight: 700, color: c.priced ? "#f8fafc" : "#fbbf24" } }),
          tdR(c.baseline ? "baseline" : c.savings != null ? money(c.savings) : "\u2014", { style: { fontWeight: 700, color: c.baseline ? "#64748b" : "#34d399" } })
        ]
      }, c.id))
    ] }) });
  };
  var dayChart = (byDay) => {
    const sorted = [...byDay || []].sort((a, b) => b.date.localeCompare(a.date));
    const rows = sorted.map((d, i) => ({ n: i, date: d.date, cost: d.cost ?? 0 }));
    return jsx(GraphCanvas, {
      data: rows,
      xField: "n",
      xLabel: "day",
      xStep: Math.max(1, Math.round(rows.length / 8)),
      xTickFormat: (v) => {
        const r = rows[Math.round(v)];
        return r ? r.date : "";
      },
      series: [{ key: "cost", label: "Cost", tipName: "cost", color: "#fbbf24", unit: "USD", axis: 0 }],
      axes: [{ unit: "USD", format: (v) => "$" + (Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 100) / 100) }],
      pointMode: "bars",
      modeChips: true,
      persistKey: "cost-day",
      height: 200
    });
  };
  var sessionTime = (s) => {
    const rawLast = s.meta && s.meta.lastPromptAt != null ? s.meta.lastPromptAt : null;
    const last = typeof rawLast === "string" ? Date.parse(rawLast) : rawLast;
    const created = typeof s.createdAt === "number" ? s.createdAt : null;
    const ms = last != null && created != null && last > created ? last : created != null ? created : last;
    return ms != null && isFinite(ms) ? ms : null;
  };
  var slotLabel = (s) => {
    const ms = sessionTime(s);
    if (ms == null) return s.date || "unknown";
    const d = new Date(ms);
    const p = (n) => String(n).padStart(2, "0");
    return p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  };
  var sessionChart = (bySession) => {
    const rows = (bySession || []).map((s) => ({ s, ms: sessionTime(s) })).sort((a, b) => {
      if (a.ms != null && b.ms != null) return b.ms - a.ms;
      return String(b.s.date || "").localeCompare(String(a.s.date || ""));
    });
    const bySlot = /* @__PURE__ */ new Map();
    for (const r of rows) {
      const label = slotLabel(r.s);
      const e = bySlot.get(label);
      if (e) e.cost += r.s.cost ?? 0;
      else bySlot.set(label, { label, cost: r.s.cost ?? 0 });
    }
    const data = [...bySlot.values()];
    const bars = data.map((d, i) => ({ n: i, label: d.label, cost: d.cost }));
    return jsx(GraphCanvas, {
      data: bars,
      xField: "n",
      xLabel: "session",
      xStep: Math.max(1, Math.round(bars.length / 8)),
      xTickFormat: (v) => {
        const r = bars[Math.round(v)];
        return r ? r.label : "";
      },
      series: [{ key: "cost", label: "Cost", tipName: "cost", color: "#fbbf24", unit: "USD", axis: 0 }],
      axes: [{ unit: "USD", format: (v) => "$" + (Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 100) / 100) }],
      pointMode: "bars",
      modeChips: true,
      persistKey: "cost-session",
      height: 200
    });
  };
  var costCard = (label, value, sub, color) => jsxs("div", { className: "tg-card tg-stat", children: [
    jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
      jsx("span", { className: "tg-stat-dot", style: { background: color } }),
      jsx("span", { className: "tg-label", children: label })
    ] }),
    jsx("div", { className: "tg-stat-value tg-num", children: value }),
    sub ? jsx("div", { style: { color: "#94a3b8", fontSize: 11, marginTop: 5 }, children: sub }) : null
  ] });
  var rateField = (label, value, onCommit) => jsxs("div", { className: "tg-rate-field", children: [
    jsx("span", { className: "tg-faint", style: { fontSize: 10, fontWeight: 600, letterSpacing: "0.04em" }, children: label }),
    jsx("input", {
      className: "tg-input tg-input-num",
      type: "text",
      inputMode: "decimal",
      placeholder: "0",
      autoComplete: "off",
      value: value === "" ? "" : String(value),
      onChange: (e) => onCommit(e.target.value),
      onBlur: (e) => {
        const x = Number(e.target.value);
        onCommit(e.target.value === "" || !Number.isFinite(x) ? "" : Math.max(0, x));
      }
    })
  ] });
  var modelCard = (m, patch, remove, isRef, canRemove) => jsxs("div", {
    className: "tg-card",
    style: { padding: "13px 15px", display: "flex", flexDirection: "column", gap: 11, minWidth: 0, border: isRef ? "1px solid rgba(251,191,36,0.5)" : void 0, background: isRef ? "linear-gradient(180deg,rgba(251,191,36,0.08),rgba(255,255,255,0.02))" : void 0 },
    children: [
      jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 8, justifyContent: "space-between" }, children: [
        jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
          // The model's own name is the card title (derived from its id).
          jsx("div", { style: { fontSize: 15, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.01em", lineHeight: 1.25, wordBreak: "break-word" }, children: humanizeModel(m.id || m.label) }),
          jsxs("input", { className: "tg-input tg-input-label", value: m.label, onChange: (e) => patch(m.id, { label: e.target.value }), placeholder: "custom display name", style: { marginTop: 3, fontSize: 11.5, color: "#94a3b8" } }),
          jsxs("div", { style: { marginTop: 5, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
            isRef ? jsx("span", { className: "tg-kind-badge", style: { background: "rgba(251,191,36,0.14)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24" }, children: "\u2605 reference" }) : null,
            jsx("span", { style: { fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 10.5, color: "#64748b", wordBreak: "break-all" }, children: m.id }),
            m.provider ? jsx("span", { className: "tg-kind-badge", style: { background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.3)", color: "#2dd4bf" }, children: m.provider }) : null
          ] })
        ] }),
        jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
          jsxs("select", {
            className: "tg-input",
            style: { minWidth: 78, cursor: "pointer", fontWeight: 600 },
            title: "corp = billed at this rate; local = home lab \u2014 priced at its configured rates, kept in the performance analysis",
            value: m.local ? "local" : "corp",
            onChange: (e) => patch(m.id, e.target.value === "local" ? { local: true, corp: false } : { local: false, corp: true }),
            children: [
              jsx("option", { value: "local", children: "local" }),
              jsx("option", { value: "corp", children: "corp" })
            ]
          }),
          canRemove ? jsx("button", { className: "tg-del", title: "Remove " + m.id, onClick: () => remove(m.id), children: "\u2715" }) : null
        ] })
      ] }),
      jsxs("div", { className: "tg-rate-grid", children: [
        rateField("$/M in", m.input, (v) => patch(m.id, { input: v })),
        rateField("$/M out", m.output, (v) => patch(m.id, { output: v })),
        rateField("$/M cacheR", m.cacheRead, (v) => patch(m.id, { cacheRead: v })),
        rateField("$/M cacheW", m.cacheWrite, (v) => patch(m.id, { cacheWrite: v }))
      ] }),
      jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 11 }, children: [
        jsx("input", { type: "checkbox", checked: !!m.estimated, onChange: (e) => patch(m.id, { estimated: e.target.checked }), style: { accentColor: "#fbbf24", cursor: "pointer" } }),
        jsx("span", { children: "estimated" })
      ] })
    ]
  }, m.id);
  var pricingTab = (p) => {
    const d = p.draft;
    if (!d) return jsx("div", { style: { padding: 40, color: "#94a3b8", textAlign: "center" }, children: "Loading pricing table\u2026" });
    const effectiveBaseline = (x) => {
      const models = x && x.models || [];
      const has = models.some((m) => m.id === x.baselineModel && m.local && m.id !== "local-free");
      return has ? x.baselineModel : (models.find((m) => m.local && m.id !== "local-free") || {}).id || null;
    };
    const patchModel = (id, patch) => p.setDraft((x) => {
      if (!x) return x;
      const models = x.models.map((m) => m.id === id ? { ...m, ...patch } : m);
      const baselineModel = id === x.baselineModel && !models.find((m) => m.id === id && m.local) ? (models.find((m) => m.local && m.id !== "local-free") || {}).id || null : x.baselineModel;
      return { ...x, models, baselineModel };
    });
    const removeModel = (id) => p.setDraft((x) => {
      if (!x) return x;
      const models = x.models.filter((m) => m.id !== id);
      let referenceModel = x.referenceModel;
      if (referenceModel === id) referenceModel = (models.find((m) => !m.local) || {}).id || null;
      const baselineModel = id === x.baselineModel ? (models.find((m) => m.local && m.id !== "local-free") || {}).id || null : x.baselineModel;
      return { ...x, models, referenceModel, baselineModel };
    });
    const refOptions = d.models.filter((m) => !m.local);
    const baseOptions = d.models.filter((m) => m.local && m.id !== "local-free");
    const baseValue = effectiveBaseline(d);
    return jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
      jsxs("div", { className: "tg-card tg-refrow", children: [
        jsxs("div", { style: { flex: 1, minWidth: 240 }, children: [
          jsx("div", { className: "tg-label", style: { color: "#fbbf24", marginBottom: 5 }, children: "\u2605 WFH reference model" }),
          jsx("div", { style: { color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }, children: "Local (home-lab) compute is valued against this rate card \u2014 the \u201Cwhat the corp would've billed\u201D number behind every WFH savings figure." })
        ] }),
        jsx("select", {
          className: "tg-input",
          style: { minWidth: 250, cursor: "pointer" },
          value: d.referenceModel,
          onChange: (e) => p.setDraft((x) => x ? { ...x, referenceModel: e.target.value } : x),
          children: refOptions.map((m) => jsx("option", { value: m.id, children: m.label }, m.id))
        }),
        jsx("div", { style: { width: "100%", height: 1, background: "rgba(255,255,255,0.07)" } }),
        jsxs("div", { style: { flex: 1, minWidth: 240 }, children: [
          jsx("div", { className: "tg-label", style: { color: "#34d399", marginBottom: 5 }, children: "\u2605 Local baseline model" }),
          jsx("div", { style: { color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }, children: "The home-lab model the comparison table marks as \u201Cbaseline\u201D \u2014 every \u201CYou save\u201D figure is how much cheaper local runs than the paid cards. Pick the model your local compute actually metered." })
        ] }),
        jsx("select", {
          className: "tg-input",
          style: { minWidth: 250, cursor: "pointer" },
          value: baseValue || "",
          onChange: (e) => p.setDraft((x) => x ? { ...x, baselineModel: e.target.value || null } : x),
          children: baseOptions.length ? baseOptions.map((m) => jsx("option", { value: m.id, children: m.label }, m.id)) : [jsx("option", { value: "", children: "\u2014 no local model \u2014" })]
        })
      ] }),
      jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", children: "Rate cards \u2014 $ per 1M tokens" }),
          jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: 2 }, children: "Saved to " + (p.pricingPath || "your DSH home") + " \xB7 " + (d.fromFile ? "custom table (file)" : d.seeded ? "seeded from your trajectories (not saved yet)" : "built-in table (not saved yet)") })
        ] }),
        jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }, children: [
          jsx("button", { className: "tg-reprocess", onClick: p.onDiscover, disabled: p.discovering, children: p.discovering ? "Scanning\u2026" : "\u{1F50E} Scan trajectories for all models" }),
          p.discoverMsg ? jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: p.discoverMsg }) : null,
          jsx("button", { className: "tg-refresh", onClick: p.onSave, disabled: p.saving, children: p.saving ? "Saving\u2026" : "\u{1F4BE} Save rates" }),
          p.saveMsg ? jsx("span", { className: p.saveMsg.kind === "ok" ? "tg-flash-ok" : "tg-flash-err", children: p.saveMsg.text }) : null
        ] })
      ] }),
      d.models.length ? jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))", gap: 12 }, children: d.models.map((m) => modelCard(m, patchModel, removeModel, d.referenceModel === m.id, true)) }) : jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No rate cards yet \u2014 scan trajectories or add a model." }),
      jsxs("div", { className: "tg-card", style: { padding: "14px 16px" }, children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Add a model (any model without a rate card yet \u2014 e.g. a new Copilot or API model)" }),
        jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }, children: [
          jsx("input", { className: "tg-input tg-input-id", style: { width: 190 }, placeholder: "model id (claude-sonnet-5)", value: p.addRow.id, onChange: (e) => p.setAddRow((r) => ({ ...r, id: e.target.value })) }),
          jsx("input", { className: "tg-input", style: { width: 150 }, placeholder: "Label", value: p.addRow.label, onChange: (e) => p.setAddRow((r) => ({ ...r, label: e.target.value })) }),
          jsx("input", { className: "tg-input tg-input-num", style: { width: 90 }, type: "text", inputMode: "decimal", placeholder: "in", autoComplete: "off", value: p.addRow.input, onChange: (e) => p.setAddRow((r) => ({ ...r, input: e.target.value })) }),
          jsx("input", { className: "tg-input tg-input-num", style: { width: 90 }, type: "text", inputMode: "decimal", placeholder: "out", autoComplete: "off", value: p.addRow.output, onChange: (e) => p.setAddRow((r) => ({ ...r, output: e.target.value })) }),
          jsx("input", { className: "tg-input tg-input-num", style: { width: 90 }, type: "text", inputMode: "decimal", placeholder: "cacheR", autoComplete: "off", value: p.addRow.cacheRead, onChange: (e) => p.setAddRow((r) => ({ ...r, cacheRead: e.target.value })) }),
          jsx("input", { className: "tg-input tg-input-num", style: { width: 90 }, type: "text", inputMode: "decimal", placeholder: "cacheW", autoComplete: "off", value: p.addRow.cacheWrite, onChange: (e) => p.setAddRow((r) => ({ ...r, cacheWrite: e.target.value })) }),
          jsx("select", { className: "tg-input", style: { minWidth: 80, cursor: "pointer" }, value: p.addRow.kind || "corp", onChange: (e) => p.setAddRow((r) => ({ ...r, kind: e.target.value })), children: [jsx("option", { value: "corp", children: "corp" }), jsx("option", { value: "local", children: "local" })] }),
          jsx("button", { className: "tg-ghost", onClick: p.onAdd, children: "+ Add model" })
        ] })
      ] }),
      p.unpriced.length ? jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Models in your usage with no rate card (click to add)" }),
        jsx("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: p.unpriced.map((m) => jsxs("span", {
          className: "tg-chip",
          style: { cursor: "pointer" },
          onClick: () => p.onPrefill(m.model, m.label),
          children: [
            jsx("span", { className: "tg-chip-label", children: m.label + " \xB7 " + m.model }),
            jsx("span", { className: "tg-chip-value", style: { color: "#fbbf24" }, children: "+ add" })
          ]
        }, m.model)) })
      ] }) : null
    ] });
  };

  // client/daily-heatmap.tsx
  var LEVEL_COLORS = ["#1a2437", "#2b4a70", "#3d6c9c", "#5b93c9", "#7db7e9"];
  var GAP = 4;
  var MIN_CELL = 12;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var rangeLabel = (range) => range === "all" ? "All-time" : range === "3m" ? "Last 3 months" : range === "6m" ? "Last 6 months" : "Last year";
  var DailyHeatmap = ({ byDate, range, onRange, selDay, onDayClick, totals }) => {
    const [tip, setTip] = React.useState(null);
    const today = React.useMemo(() => {
      const t = /* @__PURE__ */ new Date();
      t.setHours(0, 0, 0, 0);
      return t;
    }, []);
    const todayStr = dayStr(today);
    const rangeStart = React.useMemo(() => rangeStartFor(range, byDate, today), [range, byDate, today]);
    const grid = React.useMemo(() => {
      const weekStart = new Date(rangeStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const days = Math.floor((today.getTime() - weekStart.getTime()) / 864e5) + 1;
      const weeks = Math.max(1, Math.ceil(days / 7));
      const out = [];
      for (let w = 0; w < weeks; w++) {
        for (let r = 0; r < 7; r++) {
          const d = new Date(weekStart.getTime() + (w * 7 + r) * 864e5);
          if (d > today) {
            out.push({ date: dayStr(d), d, stats: null, inRange: false, isFuture: true });
            continue;
          }
          const ds = dayStr(d);
          out.push({ date: ds, d, stats: byDate.get(ds) ? aggregateSessions(byDate.get(ds)) : null, inRange: d >= rangeStart, isFuture: false });
        }
      }
      const maxV = out.reduce((n, c) => c.stats ? Math.max(n, c.stats.total) : n, 0) || 1;
      return { out, weeks, maxV };
    }, [rangeStart, byDate, today]);
    const lvl = (total) => {
      if (!total) return 0;
      const t = Math.log1p(total) / Math.log1p(grid.maxV);
      return t <= 0.25 ? 1 : t <= 0.5 ? 2 : t <= 0.8 ? 3 : 4;
    };
    const monthLabels = React.useMemo(() => {
      const out = [];
      let prev = "";
      for (let w = 0; w < grid.weeks; w++) {
        const d = grid.out[w * 7].d;
        if (d > today) break;
        const label = MONTHS[d.getMonth()];
        if (label !== prev) {
          out.push({ label, week: w });
          prev = label;
        }
      }
      return out;
    }, [grid, today]);
    const gridMinWidth = grid.weeks * MIN_CELL + (grid.weeks - 1) * GAP;
    const tipEl = tip ? jsxs("div", {
      className: "tg-tip",
      style: {
        left: tip.x,
        top: tip.y,
        transform: "translate(-50%, " + (tip.y < 150 ? "16px" : "calc(-100% - 12px)") + ")"
      },
      children: [
        jsx("div", { className: "tg-tip-date", children: tip.stats ? (/* @__PURE__ */ new Date(tip.date + "T00:00:00")).toDateString().replace(/^\w+ /, "") : tip.date }),
        tip.stats ? jsx("div", {
          className: "tg-tip-sub",
          children: tip.stats.sessions + " session" + (tip.stats.sessions !== 1 ? "s" : "") + " \xB7 " + fmt(tip.stats.steps) + " LLM step" + (tip.stats.steps !== 1 ? "s" : "") + (tip.stats.turns ? " \xB7 " + fmt(tip.stats.turns) + " turn" + (tip.stats.turns !== 1 ? "s" : "") : "")
        }) : null,
        tip.stats ? jsx("div", { className: "tg-tip-grid", children: [
          jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "In " }), jsx("b", { children: fmtC(tip.stats.tin) })] }),
          jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "Out " }), jsx("b", { children: fmtC(tip.stats.tout) })] }),
          jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "Cache " }), jsx("b", { children: fmtC(tip.stats.tcache) })] }),
          jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "Think " }), jsx("b", { children: fmtC(tip.stats.tthink) })] }),
          jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "Decode " }), jsx("b", { children: tip.stats.decode != null ? tip.stats.decode + " tok/s" : "\u2014" })] }),
          jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "TTFT " }), jsx("b", { children: tip.stats.ttft != null ? tip.stats.ttft + "s" : "\u2014" })] }),
          jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "Total " }), jsx("b", { className: "tg-tip-total", children: fmtC(tip.stats.total) })] }),
          jsxs("span", { children: [jsx("span", { className: "tg-tip-k", children: "Priced " }), jsx("b", { children: money(tip.stats.cost) })] })
        ] }) : null,
        jsx("div", { className: "tg-faint tg-tip-foot", children: tip.stats ? "Click to open this day's overview + sessions" : "No sessions this day" })
      ]
    }, "tip-" + tip.date) : null;
    return jsxs("div", { children: [
      jsxs("div", { className: "tg-heat-head", children: [
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", children: "\u{1F4C5} Sessions over time \u2014 " + rangeLabel(range) }),
          jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: 2 }, children: fmtC(totals.total) + " tokens \xB7 in " + fmtC(totals.tin) + " \xB7 cache " + fmtC(totals.tcache) + " \xB7 out " + fmtC(totals.tout) + " \xB7 " + fmt(totals.sessions) + " session" + (totals.sessions !== 1 ? "s" : "") + " \xB7 " + fmt(totals.steps) + " LLM step" + (totals.steps !== 1 ? "s" : "") })
        ] }),
        jsxs("div", { className: "tg-heat-ranges", children: [
          jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: "Range:" }),
          ["3m", "6m", "1y", "all"].map((k) => jsx("button", {
            className: "tg-ghost" + (range === k ? " active" : ""),
            onClick: () => onRange(k),
            children: k === "all" ? "All" : k.toUpperCase()
          }, "range-" + k))
        ] })
      ] }),
      jsx("div", { className: "tg-heat-scroll", onMouseLeave: () => setTip(null), children: [
        jsxs("div", { style: { width: "100%", minWidth: gridMinWidth }, children: [
          // month labels — same column template as the cells so they line up
          jsx("div", { className: "tg-heat-months", style: { display: "grid", gridTemplateColumns: "repeat(" + grid.weeks + ", 1fr)", columnGap: GAP }, children: monthLabels.map((m) => jsx("span", {
            className: "tg-heat-month",
            style: { gridColumnStart: m.week + 1 },
            children: m.label
          }, m.label + m.week)) }),
          // the cells — 1fr columns + 1fr rows so the grid spans the full width
          jsx("div", { className: "tg-heat-cells", style: { minWidth: gridMinWidth }, children: grid.out.map((c) => {
            if (c.isFuture) return null;
            const selected = selDay === c.date;
            const isToday = c.date === todayStr;
            return jsx("div", {
              key: c.date,
              className: "tg-heat-cell" + (c.stats ? " clickable" : "") + (c.inRange ? "" : " out") + (isToday ? " today" : "") + (selected ? " selected" : ""),
              style: { background: LEVEL_COLORS[c.stats ? lvl(c.stats.total) : 0] },
              onMouseMove: (e) => setTip({ date: c.date, x: e.clientX, y: e.clientY, stats: c.stats }),
              onMouseLeave: () => setTip(null),
              onClick: c.stats ? () => onDayClick(c.date) : void 0
            }, "cell-" + c.date);
          }) })
        ] })
      ] }),
      jsxs("div", { className: "tg-heat-legend", children: [
        jsx("span", { className: "tg-faint", style: { fontSize: 10 }, children: "Less" }),
        LEVEL_COLORS.map((c2) => jsx("span", { className: "tg-heat-sw", style: { background: c2 }, key: c2 })),
        jsx("span", { className: "tg-faint", style: { fontSize: 10 }, children: "More" })
      ] }),
      // fixed tooltip — rendered wherever; position:fixed anchors it to the
      // cursor and nothing (scroll wrapper, modal body) can clip it
      tipEl
    ] });
  };

  // client/daily.tsx
  var DailyTab = ({ bySession, initialDay }) => {
    const [range, setRange] = React.useState("6m");
    const [selDay, setSelDayRaw] = React.useState(initialDay || null);
    const [expanded, setExpanded] = React.useState(null);
    const [page, setPage] = React.useState(0);
    const [sortState, setSortState] = React.useState(() => {
      try {
        const s = localStorage.getItem("tg:sort:daily-sessions");
        return s ? JSON.parse(s) : null;
      } catch {
        return null;
      }
    });
    const handleSort = React.useCallback((col) => {
      setSortState(col);
      try {
        localStorage.setItem("tg:sort:daily-sessions", JSON.stringify(col));
      } catch {
      }
    }, []);
    const overRef = React.useRef(null);
    const byDate = React.useMemo(() => {
      const m = /* @__PURE__ */ new Map();
      for (const s of bySession || []) {
        if (!s.date || s.date === "unknown") continue;
        const k = String(s.date);
        if (!m.has(k)) m.set(k, []);
        m.get(k).push(s);
      }
      return m;
    }, [bySession]);
    const today = React.useMemo(() => {
      const t = /* @__PURE__ */ new Date();
      t.setHours(0, 0, 0, 0);
      return t;
    }, []);
    const rangeStart = React.useMemo(() => rangeStartFor(range, byDate, today), [range, byDate, today]);
    const rangeTotals = React.useMemo(() => {
      const rows = [];
      for (const [k, v] of byDate) if (k >= dayStr(rangeStart) && k <= dayStr(today)) rows.push(...v);
      return aggregateSessions(rows);
    }, [byDate, rangeStart, today]);
    const dayTotals = React.useMemo(
      () => selDay && byDate.has(selDay) ? aggregateSessions(byDate.get(selDay)) : null,
      [byDate, selDay]
    );
    const ov = dayTotals || rangeTotals;
    const setSelDay = (d) => {
      setSelDayRaw(d);
      setPage(0);
    };
    const onRange = (k) => {
      setRange(k);
      setSelDayRaw(null);
    };
    const clickDay = (date) => {
      const next = selDay === date ? null : date;
      setSelDay(next);
      if (next && overRef.current) overRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const selRows = React.useMemo(() => {
      const rows = bySession || [];
      const filtered = selDay ? rows.filter((s) => s.date === selDay) : rows;
      return filtered.map((s) => {
        let preTok = 0, preMs = 0;
        for (const st of s.steps || []) {
          if (st.ttftMs > 0) {
            preTok += st.in || 0;
            preMs += st.ttftMs;
          }
        }
        const prefillPerSec = preMs > 0 ? preTok / (preMs / 1e3) : null;
        let rtMs = 0;
        for (const st of s.steps || []) {
          rtMs += (st.ttftMs || 0) + (st.decodeMs || 0);
        }
        return { ...s, prefillPerSec, runtime: rtMs };
      });
    }, [bySession, selDay]);
    return jsxs("div", { className: "tg-day", children: [
      jsx(DailyHeatmap, { byDate, range, onRange, selDay, onDayClick: clickDay, totals: rangeTotals }),
      // ── daily overview (badges + table) ──────────────────────────────────
      jsxs("div", { ref: overRef, className: "tg-day-ov", children: [
        jsxs("div", { className: "tg-day-ov-head", children: [
          jsx("div", { className: "tg-label", style: { fontSize: 12 }, children: dayTotals ? "\u{1F4C5} Day overview \u2014 " + selDay : "Overview \u2014 " + rangeLabel(range) }),
          dayTotals ? jsx("button", { className: "tg-ghost", onClick: () => setSelDay(null), children: "\u2715 clear day filter" }) : null
        ] }),
        jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: [
          jsx("div", { className: "tg-label", children: "\u26A1 Speed" }),
          badgeGrid([
            costCard("Decode speed (avg)", ov.decode != null ? ov.decode + " tok/s" : "\u2014", fmtC(ov.decTok) + " streamed \xB7 " + fmtMs(ov.decMs), "#fbbf24"),
            costCard("Prompt processing (avg)", ov.prefill != null ? ov.prefill + " tok/s" : "\u2014", fmtC(ov.preTok) + " new ctx \xB7 " + fmtMs(ov.preMs) + " TTFT", "#2dd4bf"),
            costCard("Avg TTFT", ov.ttft != null ? ov.ttft + "s" : "\u2014", "request \u2192 first token", "#38bdf8"),
            costCard("LLM steps", fmt(ov.steps), ov.turns ? fmt(ov.turns) + " turns" : "turns not recorded", "#60a5fa")
          ]),
          jsx("div", { className: "tg-label", children: "\u{1FA99} Tokens" }),
          badgeGrid([
            costCard("Input (uncached)", fmtC(ov.tin), "total", "#60a5fa"),
            costCard("Output", fmtC(ov.tout), "total", "#a78bfa"),
            costCard("Cache (read+write)", fmtC(ov.tcache), "total", "#2dd4bf"),
            costCard("Thinking", fmtC(ov.tthink), "reasoning tokens", "#c084fc"),
            costCard("Tools (payload)", fmtC(ov.ttools), "tool-call args (chars/4)", "#34d399"),
            costCard("Total tokens", fmtC(ov.total), "all buckets", "#fbbf24"),
            costCard("Cost", money(ov.cost), ov.sessions + " session" + (ov.sessions !== 1 ? "s" : ""), "#fb923c"),
            costCard("Avg tokens / session", ov.sessions > 0 ? fmtC(Math.round(ov.total / ov.sessions)) : "\u2014", ov.sessions + " sessions", "#f472b6")
          ])
        ] }),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Per session \u2014 " + (selDay ? selDay + " (" + selRows.length + ")" : "all days, click a day in the heatmap to filter") + " \u2014 expand for the unified turn \u2192 step table (tokens + speed)" }),
          SessionTable({
            rows: selRows,
            expandedId: expanded,
            onToggle: setExpanded,
            drawer: (s) => combinedDrawer(s, { defaultClosed: true }),
            page,
            setPage,
            pageSize: 25,
            sort: sortState,
            onSort: handleSort,
            sortKey: "daily-sessions",
            columns: { lastActive: true, tin: true, tout: true, tcache: true },
            empty: jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No combined per-step data" + (selDay ? " for " + selDay : " yet") + " \u2014 sessions with per-turn usage appear here." })
          })
        ] })
      ] })
    ] });
  };

  // client/runs.tsx
  var shortId = (id) => String(id || "").replace(/^session-/, "").slice(0, 8);
  var rate = (tok, ms) => ms > 0 ? Math.round(tok / (ms / 1e3) * 10) / 10 : null;
  var usedModels = (s) => (s.models || []).filter((m) => m && m.key && (m.steps || 0) > 0);
  var isMixed = (s) => usedModels(s).length > 1;
  function makeRun(s, m) {
    const b = m.buckets || {};
    const steps = m.steps || 0;
    const run = {
      id: s.id,
      date: s.date || "",
      title: s.title || s.cwd || s.id,
      source: String(s.source || LOCAL_ID),
      steps,
      in: b.uncachedInputTokens || 0,
      out: b.outputTokens || 0,
      cache: (b.cacheReadTokens || 0) + (b.cacheWriteTokens || 0),
      think: m.reasoningTokens || 0,
      ctx: m.ctxTokens || 0,
      dTok: m.decodeTokens || 0,
      dMs: m.decodeMs || 0,
      pTok: m.prefillTokens || 0,
      pMs: m.prefillMs || 0,
      pSteps: m.prefillSteps || 0,
      decode: null,
      prefill: null,
      ttftMs: null,
      avgCtx: null,
      p2p: !!s.p2p
    };
    run.decode = rate(run.dTok, run.dMs);
    run.prefill = rate(run.pTok, run.pMs);
    run.ttftMs = run.pSteps > 0 ? Math.round(run.pMs / run.pSteps) : null;
    run.avgCtx = steps > 0 ? Math.round(run.ctx / steps) : null;
    return run;
  }
  function buildMixed(bySession) {
    return (bySession || []).filter(isMixed).map((s) => {
      const runs = usedModels(s).map((m) => ({ run: makeRun(s, m), key: m.key, provider: m.provider || null }));
      return {
        id: s.id,
        date: s.date || "",
        title: s.title || s.cwd || s.id,
        p2p: !!s.p2p,
        runs,
        total: runs.reduce((n, r) => n + r.run.in + r.run.out + r.run.cache + r.run.think, 0),
        steps: runs.reduce((n, r) => n + r.run.steps, 0),
        models: runs.length
      };
    }).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1);
  }
  function buildGroups(bySession) {
    const by = /* @__PURE__ */ new Map();
    for (const s of (bySession || []).filter((x) => !isMixed(x))) {
      for (const m of usedModels(s)) {
        const steps = m.steps || 0;
        let g = by.get(m.key);
        if (!g) {
          g = {
            key: m.key,
            label: m.key,
            provider: m.provider || null,
            runs: [],
            sessions: 0,
            steps: 0,
            in: 0,
            out: 0,
            cache: 0,
            think: 0,
            total: 0,
            decode: null,
            prefill: null,
            ttftMs: null,
            avgCtx: null,
            firstDate: "",
            lastDate: ""
          };
          by.set(m.key, g);
        }
        const run = makeRun(s, m);
        g.runs.push(run);
        g.sessions++;
        g.steps += steps;
        g.in += run.in;
        g.out += run.out;
        g.cache += run.cache;
        g.think += run.think;
        g.total += run.in + run.out + run.cache + run.think;
      }
    }
    for (const g of by.values()) {
      g.runs.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1);
      const T = g.runs.reduce((a, r) => ({
        dTok: a.dTok + r.dTok,
        dMs: a.dMs + r.dMs,
        pTok: a.pTok + r.pTok,
        pMs: a.pMs + r.pMs,
        pSteps: a.pSteps + r.pSteps,
        ctx: a.ctx + r.ctx
      }), { dTok: 0, dMs: 0, pTok: 0, pMs: 0, pSteps: 0, ctx: 0 });
      g.decode = rate(T.dTok, T.dMs);
      g.prefill = rate(T.pTok, T.pMs);
      g.ttftMs = T.pSteps > 0 ? Math.round(T.pMs / T.pSteps) : null;
      g.avgCtx = g.steps > 0 ? Math.round(T.ctx / g.steps) : null;
      g.firstDate = g.runs.length ? g.runs[0].date : "";
      g.lastDate = g.runs.length ? g.runs[g.runs.length - 1].date : "";
    }
    return [...by.values()].sort((a, b) => b.total - a.total || b.steps - a.steps);
  }
  var allocBar = (g) => {
    const segs = [
      { k: "In", v: g.in, c: "#60a5fa" },
      { k: "Out", v: g.out, c: "#a78bfa" },
      { k: "Cache", v: g.cache, c: "#2dd4bf" },
      { k: "Think", v: g.think, c: "#c084fc" }
    ];
    const tot = segs.reduce((n, s) => n + s.v, 0) || 1;
    return jsxs("div", { children: [
      jsx("div", { style: { display: "flex", height: 10, borderRadius: 5, overflow: "hidden", background: "rgba(148,163,184,0.15)" }, children: segs.filter((s) => s.v > 0).map((s) => jsx("div", {
        style: { width: s.v / tot * 100 + "%", background: s.c, height: "100%" },
        title: s.k + " \xB7 " + fmt(s.v) + " (" + (s.v / tot * 100).toFixed(1) + "%)"
      }, s.k)) }),
      jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 14, marginTop: 8, fontSize: 11 }, children: segs.map((s) => jsxs("span", { style: { display: "flex", alignItems: "center", gap: 5, color: "#94a3b8" }, children: [
        jsx("span", { style: { width: 8, height: 8, borderRadius: 2, background: s.c, display: "inline-block" } }),
        jsx("span", { children: s.k }),
        jsx("span", { className: "tg-num", style: { color: "#e5e7eb", fontWeight: 600 }, children: fmtC(s.v) }),
        jsx("span", { style: { color: "#64748b" }, children: (s.v / tot * 100).toFixed(1) + "%" })
      ] }, s.k)) })
    ] });
  };
  var sourceName = (id) => {
    if (id === LOCAL_ID) return "This machine";
    const info = sourceInfo(id);
    return info ? info.label : id;
  };
  var hasMultiHome = (g) => g.runs.some((r) => r.source !== (g.runs.length ? g.runs[0].source : ""));
  var RUN_METRICS = [
    { key: "decode", name: "Decode", color: "#38bdf8", unit: "tok/s", axis: 0, fill: true },
    { key: "prefill", name: "Prefill", color: "#2dd4bf", unit: "tok/s", axis: 1 },
    { key: "ttft", name: "Avg TTFT", color: "#fbbf24", unit: "s", axis: 1 },
    { key: "ctx", name: "Avg ctx", color: "#a78bfa", unit: "tok", axis: 1 }
  ];
  var SOURCE_COLORS = ["#60a5fa", "#fbbf24", "#34d399", "#f472b6", "#a78bfa"];
  function runChart(g) {
    const homes = [];
    for (const r of g.runs) if (!homes.includes(r.source)) homes.push(r.source);
    const split = homes.length > 1;
    const rowsOf2 = (sid) => g.runs.map((r, i) => ({ r, i })).filter(({ r }) => !sid || r.source === sid).map(({ r, i }) => ({
      n: i,
      // the head of the hover box: which run, and (when the model spans homes)
      // which home it ran in
      label: (r.date || "?") + " \xB7 " + shortId(r.id) + (split ? " \xB7 " + sourceName(r.source) : ""),
      decode: r.decode,
      prefill: r.prefill,
      ttft: r.ttftMs != null ? Math.round(r.ttftMs / 100) / 10 : null,
      ctx: r.avgCtx
    }));
    const all = rowsOf2();
    const series = (split ? homes.map((sid) => ({ sid })) : [{ sid: "" }]).flatMap(({ sid }) => RUN_METRICS.map((m) => ({
      key: m.key,
      label: m.name,
      tipName: m.name,
      color: m.color,
      unit: m.unit,
      axis: m.axis,
      line: true,
      fill: m.fill,
      dash: split && homes.indexOf(sid) > 0 ? [4, 3] : void 0,
      regime: split ? sid : void 0,
      data: split ? rowsOf2(sid) : all
    })));
    return jsx(GraphCanvas, {
      data: all,
      xField: "n",
      xLabel: "run",
      xStep: Math.max(1, Math.round(all.length / 8)),
      // The x axis is the run's ORDINAL — every run weighs the same — but each
      // tick is LABELLED with that run's date, so the sequence still reads as time.
      xTickFormat: (v) => {
        const r = g.runs[Math.round(v)];
        return r && r.date ? r.date.slice(5) : "";
      },
      series,
      axes: [{ unit: "tok/s" }, { log: true, hideLabels: true, unit: "tok/s" }],
      chips: split ? homes.map((sid, si) => ({ name: sourceName(sid), color: SOURCE_COLORS[si % SOURCE_COLORS.length], k: sid })) : void 0,
      metricChips: RUN_METRICS.map((m) => ({ name: m.name + " \xB7 " + m.unit, color: m.color, k: m.key })),
      tipHeadField: "label",
      tipData: all,
      smooth: true,
      modeChips: true,
      persistKey: "runs",
      height: 260
    });
  }
  function groupBody(g) {
    const perf = jsxs("div", { children: [
      jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "\u26A1 Performance \u2014 this model only" }),
      badgeGrid([
        costCard("Decode (time-weighted)", g.decode != null ? g.decode + " tok/s" : "\u2014", g.runs.length + " runs \xB7 " + fmt(g.steps) + " steps", "#38bdf8"),
        costCard("Prefill (time-weighted)", g.prefill != null ? Math.round(g.prefill) + " tok/s" : "\u2014", "new ctx \xF7 TTFT (lower bound)", "#2dd4bf"),
        costCard("Avg TTFT", g.ttftMs != null ? fmtMs(g.ttftMs) : "\u2014", "request \u2192 first token", "#fbbf24"),
        costCard("Avg context", g.avgCtx != null ? fmtC(g.avgCtx) : "\u2014", "prompt tokens per step", "#a78bfa")
      ])
    ] });
    const alloc = jsxs("div", { children: [
      jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 4 }, children: "\u{1FA99} Allocation \u2014 where this model's tokens went" }),
      jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 10 }, children: fmtC(g.total) + " tokens attributed to this model across " + g.runs.length + " run(s). Think is a subdivision of Out (shown separately, never double-counted); Cache = cache read + write." }),
      allocBar(g)
    ] });
    const table = jsxs("div", { children: [
      jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Runs \u2014 oldest \u2192 newest" }),
      jsx("div", { className: "tg-tscroll tg-vscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
        jsx("tr", { children: [thL("Date"), thL("Session"), thR("Steps"), thR("Decode"), thR("Prefill"), thR("Avg TTFT"), thR("Avg ctx"), thR("In"), thR("Out"), thR("Cache"), thR("Think")] }),
        ...g.runs.map((r) => jsxs("tr", {
          className: "tg-tr",
          children: [
            tdL(jsxs("span", { style: { whiteSpace: "nowrap" }, children: [
              r.p2p ? jsx("span", { style: { color: "#34d399", marginRight: 5, fontWeight: 700 }, title: "P2P-enablement evidence in this session's trajectory", children: "\u25CF" }) : null,
              r.date
            ] })),
            tdL(jsxs("span", { children: [
              jsx("span", { style: { color: "#64748b", marginRight: 6 }, children: shortId(r.id) }),
              String(r.title).slice(0, 34)
            ] }), { title: r.id + " \xB7 " + r.title, style: { maxWidth: 260, whiteSpace: "normal", wordBreak: "break-word" } }),
            tdR(String(r.steps)),
            tdR(r.decode != null ? r.decode + " tok/s" : "\u2014", { style: { fontWeight: 700 }, title: fmt(r.dTok) + " tokens \xF7 " + fmtMs(r.dMs) }),
            tdR(r.prefill != null ? Math.round(r.prefill) + " tok/s" : "\u2014", { title: fmt(r.pTok) + " new ctx tokens \xF7 " + fmtMs(r.pMs) + " TTFT" }),
            tdR(r.ttftMs != null ? fmtMs(r.ttftMs) : "\u2014"),
            tdR(r.avgCtx != null ? fmtC(r.avgCtx) : "\u2014"),
            tdR(fmtC(r.in), { title: fmt(r.in) }),
            tdR(fmtC(r.out), { title: fmt(r.out) }),
            tdR(fmtC(r.cache), { title: fmt(r.cache) }),
            tdR(r.think > 0 ? fmtC(r.think) : "\u2014", { title: fmt(r.think) + " reasoning tokens" })
          ]
        }, r.id))
      ] }) })
    ] });
    return jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 22 }, children: [perf, alloc, table] });
  }
  function mixBody(mixed) {
    const MODEL_COLORS = ["#38bdf8", "#a78bfa", "#2dd4bf", "#fbbf24", "#f472b6", "#34d399"];
    return jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 20 }, children: [
      jsx("div", { className: "tg-faint", style: { fontSize: 11, lineHeight: 1.6 }, children: "These " + mixed.length + " session(s) changed model mid-run, so they are kept out of the per-model stats above \u2014 a blended session would otherwise fold one model's rate into another's average. Each block below shows the blend: which models ran, how many steps each served, and how the tokens split. Speeds are per model, computed only from that model's own steps." }),
      ...mixed.map((mx) => {
        const tot = mx.total || 1;
        const segs = mx.runs.map((r, i) => ({
          key: r.key,
          v: r.run.in + r.run.out + r.run.cache + r.run.think,
          c: MODEL_COLORS[i % MODEL_COLORS.length]
        }));
        return jsxs("div", { style: { border: "1px solid rgba(148,163,184,0.18)", borderRadius: 8, padding: "12px 14px" }, children: [
          jsxs("div", { style: { display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 10 }, children: [
            mx.p2p ? jsx("span", { style: { color: "#34d399", fontWeight: 700 }, title: "P2P-enablement evidence in this session's trajectory", children: "\u25CF" }) : null,
            jsx("span", { style: { color: "#64748b", fontSize: 11 }, children: mx.date }),
            jsx("span", { style: { color: "#64748b", fontSize: 11 }, children: shortId(mx.id) }),
            jsx("span", { style: { fontWeight: 600, maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: mx.title, children: mx.title }),
            jsx("span", { className: "tg-faint", style: { fontSize: 11, marginLeft: "auto", whiteSpace: "nowrap" }, children: mx.models + " models \xB7 " + fmt(mx.steps) + " steps \xB7 " + fmtC(mx.total) + " tokens" })
          ] }),
          // blend bar — one segment per model, width = its share of the session's tokens
          jsx("div", { style: { display: "flex", height: 10, borderRadius: 5, overflow: "hidden", background: "rgba(148,163,184,0.15)", marginBottom: 10 }, children: segs.filter((s) => s.v > 0).map((s) => jsx("div", {
            style: { width: s.v / tot * 100 + "%", background: s.c, height: "100%" },
            title: s.key + " \xB7 " + fmt(s.v) + " (" + (s.v / tot * 100).toFixed(1) + "%)"
          }, s.key)) }),
          jsx("div", { className: "tg-tscroll tg-vscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
            jsx("tr", { children: [thL("Model"), thR("Steps"), thR("Decode"), thR("Prefill"), thR("Avg TTFT"), thR("Share"), thR("In"), thR("Out"), thR("Cache"), thR("Think")] }),
            ...mx.runs.map((r, i) => {
              const v = r.run.in + r.run.out + r.run.cache + r.run.think;
              return jsxs("tr", {
                className: "tg-tr",
                children: [
                  tdL(jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
                    jsx("span", { style: { width: 8, height: 8, borderRadius: 2, background: MODEL_COLORS[i % MODEL_COLORS.length], display: "inline-block", flexShrink: 0 } }),
                    jsx("span", { style: { maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: r.key, children: r.key })
                  ] })),
                  tdR(String(r.run.steps)),
                  tdR(r.run.decode != null ? r.run.decode + " tok/s" : "\u2014", { style: { fontWeight: 700 }, title: fmt(r.run.dTok) + " tokens \xF7 " + fmtMs(r.run.dMs) }),
                  tdR(r.run.prefill != null ? Math.round(r.run.prefill) + " tok/s" : "\u2014", { title: fmt(r.run.pTok) + " new ctx tokens \xF7 " + fmtMs(r.run.pMs) }),
                  tdR(r.run.ttftMs != null ? fmtMs(r.run.ttftMs) : "\u2014"),
                  tdR((v / tot * 100).toFixed(1) + "%", { title: fmt(v) + " tokens" }),
                  tdR(fmtC(r.run.in), { title: fmt(r.run.in) }),
                  tdR(fmtC(r.run.out), { title: fmt(r.run.out) }),
                  tdR(fmtC(r.run.cache), { title: fmt(r.run.cache) }),
                  tdR(r.run.think > 0 ? fmtC(r.run.think) : "\u2014", { title: fmt(r.run.think) + " reasoning tokens" })
                ]
              }, r.key);
            })
          ] }) })
        ] }, mx.id);
      })
    ] });
  }
  function RunsTab({ bySession }) {
    const groups = buildGroups(bySession);
    const mixed = buildMixed(bySession);
    if (!groups.length && !mixed.length) {
      return jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No per-model runs yet \u2014 appears once sessions record per-turn usage." });
    }
    const [open, setOpen] = React.useState(groups.length ? groups[0].key : null);
    const chip = (label, value, color) => jsxs("span", { style: { display: "inline-flex", alignItems: "baseline", gap: 5, background: "rgba(148,163,184,0.10)", borderRadius: 6, padding: "3px 8px", fontSize: 11, whiteSpace: "nowrap" }, children: [
      jsx("span", { style: { width: 6, height: 6, borderRadius: 3, background: color, display: "inline-block", alignSelf: "center" } }),
      jsx("span", { style: { color: "#94a3b8" }, children: label }),
      jsx("span", { className: "tg-num", style: { color: "#e5e7eb", fontWeight: 700 }, children: value })
    ] });
    const mixTotal = mixed.reduce((n, m) => n + m.total, 0);
    const mixSteps = mixed.reduce((n, m) => n + m.steps, 0);
    return jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
      jsxs("div", { children: [
        jsx("div", { className: "tg-label", style: { marginBottom: 4 }, children: "\u{1F3C1} Runs by model \u2014 like-for-like over time" }),
        jsx("div", { className: "tg-faint", style: { fontSize: 11, lineHeight: 1.6 }, children: "Sessions are grouped by the model that served them, so a model is only ever compared against itself. Only single-model sessions are counted here \u2014 sessions that switched models are held out in the Mix drawer at the bottom, where a blended rate can't distort a model's average. Expand a model for its aggregate token performance and allocation, and a per-run speed chart drawn by the same canvas engine as the step chart (Lines / Dots / Trend / Heat, metric chips, hover for the run). Leader = most tokens." })
      ] }),
      ...groups.map((g) => {
        const isOpen = open === g.key;
        const head = jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", width: "100%" }, children: [
          jsx("span", { style: { fontWeight: 700, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: g.key, children: g.label }),
          g.provider ? jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: g.provider }) : null,
          chip("runs", String(g.runs.length), "#60a5fa"),
          chip("steps", fmt(g.steps), "#60a5fa"),
          chip("decode", g.decode != null ? g.decode + " tok/s" : "\u2014", "#38bdf8"),
          chip("prefill", g.prefill != null ? Math.round(g.prefill) + " tok/s" : "\u2014", "#2dd4bf"),
          chip("tokens", fmtC(g.total), "#fbbf24"),
          jsx("span", { className: "tg-faint", style: { fontSize: 11, marginLeft: "auto", whiteSpace: "nowrap" }, children: g.firstDate === g.lastDate ? g.firstDate : g.firstDate + " \u2192 " + g.lastDate })
        ] });
        return jsxs("div", { key: g.key, children: [
          jsx(Collapse, { label: head, defaultOpen: isOpen, onOpenChange: (o) => setOpen(o ? g.key : null), children: jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 22 }, children: [
            jsxs("div", { children: [
              jsx("div", { className: "tg-label", style: { marginBottom: 4 }, children: "\u{1F4C8} Speeds per run \u2014 same model, oldest \u2192 newest" }),
              jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "One line per metric, one x tick per run date \u2014 the x axis is the run's ordinal, so every run weighs the same. Decode is on the left linear axis; prefill, TTFT and ctx share the right log axis (their scales differ by orders of magnitude, so its labels are dropped and the tooltip carries the values). Click a metric chip to drop it \u2014 the axes rescale to what is left \u2014 or switch the plot to Trend to read the model's trajectory instead of every spike. A run with no measured speed is a gap, never a zero." + (hasMultiHome(g) ? " These runs came from more than one home, so each home has its own chip: an import's slower runs would otherwise read as this machine's regression." : "") }),
              runChart(g)
            ] }),
            groupBody(g)
          ] }) })
        ] }, g.key);
      }),
      mixed.length ? jsxs("div", { children: [
        jsx(Collapse, { label: jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", width: "100%" }, children: [
          jsx("span", { style: { fontWeight: 700 }, children: "\u{1F500} Mix \u2014 sessions that switched model" }),
          jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: "held out of the stats" }),
          chip("sessions", String(mixed.length), "#f472b6"),
          chip("steps", fmt(mixSteps), "#60a5fa"),
          chip("tokens", fmtC(mixTotal), "#fbbf24"),
          jsx("span", { className: "tg-faint", style: { fontSize: 11, marginLeft: "auto", whiteSpace: "nowrap" }, children: mixed[0].date === mixed[mixed.length - 1].date ? mixed[0].date : mixed[0].date + " \u2192 " + mixed[mixed.length - 1].date })
        ] }), children: mixBody(mixed) })
      ] }) : null
    ] });
  }

  // client/llama-metrics.tsx
  function parsePrometheus(text2) {
    const samples = [];
    const lines = text2.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\s*(\{[^}]*\})?\s+([0-9eE.+-]+)$/);
      if (!match) continue;
      const name = match[1];
      const labelsStr = match[2] || "";
      const value = parseFloat(match[3]);
      const labels = {};
      if (labelsStr) {
        const inner = labelsStr.slice(1, -1);
        for (const pair of inner.split(",")) {
          const eqIdx = pair.indexOf("=");
          if (eqIdx > 0) {
            const key = pair.slice(0, eqIdx).trim();
            let val = pair.slice(eqIdx + 1).trim();
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1);
            }
            labels[key] = val;
          }
        }
      }
      samples.push({ name, labels, value });
    }
    return samples;
  }
  function getMetric(samples, name, labels) {
    for (const s of samples) {
      if (s.name !== name) continue;
      if (labels) {
        let match = true;
        for (const [k, v] of Object.entries(labels)) {
          if (s.labels[k] !== v) {
            match = false;
            break;
          }
        }
        if (!match) continue;
      }
      return s.value;
    }
    return null;
  }
  var POLL_INTERVAL = 2e3;
  function LlamaMetricsTab() {
    const [serverUrl, setServerUrl] = React.useState(() => {
      try {
        const saved = localStorage.getItem("tg_llama_server_url");
        return saved || "http://127.0.0.1:8080";
      } catch {
        return "http://127.0.0.1:8080";
      }
    });
    const [modelName, setModelName] = React.useState(() => {
      try {
        const saved = localStorage.getItem("tg_llama_model_name");
        return saved || "";
      } catch {
        return "";
      }
    });
    const [models, setModels] = React.useState([]);
    const [loadingModels, setLoadingModels] = React.useState(false);
    const [connected, setConnected] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [lastUpdate, setLastUpdate] = React.useState(null);
    const [promptTokPerSec, setPromptTokPerSec] = React.useState(null);
    const [genTokPerSec, setGenTokPerSec] = React.useState(null);
    const [requestsProcessing, setRequestsProcessing] = React.useState(null);
    const [requestsDeferred, setRequestsDeferred] = React.useState(null);
    const [busySlots, setBusySlots] = React.useState(null);
    const [specDraftTokens, setSpecDraftTokens] = React.useState(null);
    const [specAcceptedTokens, setSpecAcceptedTokens] = React.useState(null);
    const [specAcceptanceRate, setSpecAcceptanceRate] = React.useState(null);
    const [promptTokensTotal, setPromptTokensTotal] = React.useState(null);
    const [genTokensTotal, setGenTokensTotal] = React.useState(null);
    const [cachedTokensTotal, setCachedTokensTotal] = React.useState(null);
    const [throughputHistory, setThroughputHistory] = React.useState([]);
    const [requestHistory, setRequestHistory] = React.useState([]);
    const [specHistory, setSpecHistory] = React.useState([]);
    const pollTimer = React.useRef(null);
    React.useEffect(() => {
      try {
        localStorage.setItem("tg_llama_server_url", serverUrl);
      } catch {
      }
    }, [serverUrl]);
    React.useEffect(() => {
      try {
        localStorage.setItem("tg_llama_model_name", modelName);
      } catch {
      }
    }, [modelName]);
    const loadModels = React.useCallback(async () => {
      setLoadingModels(true);
      setError(null);
      try {
        const url = serverUrl.replace(/\/+$/, "");
        const resp = await fetch(`${url}/models`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const modelList = Array.isArray(data) ? data : data.data || [];
        setModels(modelList);
        if (!modelName && modelList.length > 0) {
          const loaded = modelList.find((m) => m.status && m.status.value === "loaded");
          if (loaded) {
            setModelName(loaded.id);
            try {
              localStorage.setItem("tg_llama_model_name", loaded.id);
            } catch {
            }
          }
        }
      } catch (e) {
        setError("Failed to load models: " + (e.message || String(e)));
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    }, [serverUrl, modelName]);
    const pollMetrics = React.useCallback(async () => {
      if (!modelName) return;
      try {
        const url = serverUrl.replace(/\/+$/, "");
        const modelParam = encodeURIComponent(modelName);
        const resp = await fetch(`${url}/metrics?model=${modelParam}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const text2 = await resp.text();
        const samples = parsePrometheus(text2);
        const ptps = getMetric(samples, "llamacpp:prompt_tokens_seconds");
        const gtps = getMetric(samples, "llamacpp:predicted_tokens_seconds");
        const rp = getMetric(samples, "llamacpp:requests_processing");
        const rd = getMetric(samples, "llamacpp:requests_deferred");
        const bs = getMetric(samples, "llamacpp:n_busy_slots_per_decode");
        const sd = getMetric(samples, "llamacpp:spec_decode_num_draft_tokens_total");
        const sa = getMetric(samples, "llamacpp:spec_decode_num_accepted_tokens_total");
        const pt = getMetric(samples, "llamacpp:prompt_tokens_total");
        const gt = getMetric(samples, "llamacpp:tokens_predicted_total");
        const ct = getMetric(samples, "llamacpp:prompt_tokens_cached_total");
        setPromptTokPerSec(ptps);
        setGenTokPerSec(gtps);
        setRequestsProcessing(rp);
        setRequestsDeferred(rd);
        setBusySlots(bs);
        setSpecDraftTokens(sd);
        setSpecAcceptedTokens(sa);
        setSpecAcceptanceRate(sd != null && sd > 0 ? (sa || 0) / sd : null);
        setPromptTokensTotal(pt);
        setGenTokensTotal(gt);
        setCachedTokensTotal(ct);
        setConnected(true);
        setError(null);
        setLastUpdate(Date.now());
        const now = /* @__PURE__ */ new Date();
        const timeStr = now.toLocaleTimeString();
        setThroughputHistory((prev) => {
          const next = [...prev, { time: timeStr, prompt: ptps || 0, gen: gtps || 0 }];
          if (next.length > 60) next.shift();
          return next;
        });
        setRequestHistory((prev) => {
          const next = [...prev, { time: timeStr, processing: rp || 0, deferred: rd || 0 }];
          if (next.length > 60) next.shift();
          return next;
        });
        const specRate = sd != null && sd > 0 ? (sa || 0) / sd : 0;
        setSpecHistory((prev) => {
          const next = [...prev, { time: timeStr, rate: specRate }];
          if (next.length > 60) next.shift();
          return next;
        });
      } catch (e) {
        setConnected(false);
        setError("Failed to fetch metrics: " + (e.message || String(e)));
      }
    }, [serverUrl, modelName]);
    React.useEffect(() => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
      if (modelName) {
        pollMetrics();
        pollTimer.current = window.setInterval(pollMetrics, POLL_INTERVAL);
      }
      return () => {
        if (pollTimer.current) {
          clearInterval(pollTimer.current);
          pollTimer.current = null;
        }
      };
    }, [modelName, pollMetrics]);
    const formatTime = (ts) => {
      if (!ts) return "\u2014";
      return new Date(ts).toLocaleTimeString();
    };
    const serverConfig = jsxs("div", {
      className: "tg-card",
      style: { padding: "16px 20px" },
      children: [
        jsxs("div", {
          style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
          children: [
            jsx("label", {
              className: "tg-label",
              style: { whiteSpace: "nowrap" },
              children: "Server URL:"
            }),
            jsx("input", {
              type: "text",
              value: serverUrl,
              onChange: (e) => setServerUrl(e.target.value),
              style: {
                flex: 1,
                minWidth: 200,
                padding: "6px 10px",
                fontSize: 13,
                background: "#1e293b",
                color: "#e2e8f0",
                border: "1px solid #334155",
                borderRadius: 6
              },
              placeholder: "http://127.0.0.1:8080"
            }),
            jsx("button", {
              className: "tg-ghost",
              onClick: loadModels,
              disabled: loadingModels,
              children: loadingModels ? "Loading\u2026" : "\u21BB Load Models"
            })
          ]
        }),
        models.length > 0 ? jsxs("div", {
          style: { display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" },
          children: [
            jsx("label", {
              className: "tg-label",
              style: { whiteSpace: "nowrap" },
              children: "Model:"
            }),
            jsx("select", {
              value: modelName,
              onChange: (e) => setModelName(e.target.value),
              style: {
                flex: 1,
                minWidth: 200,
                padding: "6px 10px",
                fontSize: 13,
                background: "#1e293b",
                color: "#e2e8f0",
                border: "1px solid #334155",
                borderRadius: 6,
                maxWidth: 500
              },
              children: [
                jsx("option", { value: "", children: "\u2014 select a model \u2014" }),
                ...models.map(
                  (m) => jsx("option", {
                    key: m.id,
                    value: m.id,
                    children: `${m.aliases?.[0] || m.id} (${m.status?.value || "?"})`
                  })
                )
              ]
            })
          ]
        }) : null
      ]
    });
    const statusIndicator = jsxs("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
        fontSize: 12,
        color: "#94a3b8"
      },
      children: [
        jsx("span", {
          style: {
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: connected ? "#34d399" : error ? "#f87171" : "#64748b",
            display: "inline-block"
          }
        }),
        connected ? `Connected \u2014 last update ${formatTime(lastUpdate)}` : error ? error : "Not connected \u2014 select a model to start polling"
      ]
    });
    const gauges = jsxs("div", {
      style: { marginTop: 20 },
      children: [
        jsx("div", {
          className: "tg-label",
          style: { marginBottom: 10 },
          children: "\u26A1 Live Throughput"
        }),
        badgeGrid([
          costCard("Prompt throughput", promptTokPerSec != null ? `${promptTokPerSec.toFixed(1)} tok/s` : "\u2014", "prompt processing speed", "#38bdf8"),
          costCard("Generation throughput", genTokPerSec != null ? `${genTokPerSec.toFixed(1)} tok/s` : "\u2014", "token generation speed", "#a78bfa"),
          costCard("Requests processing", requestsProcessing != null ? fmt(requestsProcessing) : "\u2014", "actively being processed", "#fbbf24"),
          costCard("Requests deferred", requestsDeferred != null ? fmt(requestsDeferred) : "\u2014", "waiting for capacity", "#f472b6")
        ])
      ]
    });
    const specGauges = jsxs("div", {
      style: { marginTop: 20 },
      children: [
        jsx("div", {
          className: "tg-label",
          style: { marginBottom: 10 },
          children: "\u{1F3AF} Speculative Decoding"
        }),
        badgeGrid([
          costCard("Draft tokens", specDraftTokens != null ? fmtC(specDraftTokens) : "\u2014", "total draft tokens generated", "#34d399"),
          costCard("Accepted tokens", specAcceptedTokens != null ? fmtC(specAcceptedTokens) : "\u2014", "draft tokens accepted", "#2dd4bf"),
          costCard("Acceptance rate", specAcceptanceRate != null ? `${(specAcceptanceRate * 100).toFixed(1)}%` : "\u2014", "accepted / drafted", "#fbbf24"),
          costCard("Busy slots", busySlots != null ? `${busySlots.toFixed(1)}` : "\u2014", "avg busy slots per decode", "#a78bfa")
        ])
      ]
    });
    const tokenTotals = jsxs("div", {
      style: { marginTop: 20 },
      children: [
        jsx("div", {
          className: "tg-label",
          style: { marginBottom: 10 },
          children: "\u{1FA99} Token Totals (since server start)"
        }),
        badgeGrid([
          costCard("Prompt tokens", promptTokensTotal != null ? fmtC(promptTokensTotal) : "\u2014", "uncached prompt tokens", "#60a5fa"),
          costCard("Cached tokens", cachedTokensTotal != null ? fmtC(cachedTokensTotal) : "\u2014", "reused from cache", "#2dd4bf"),
          costCard("Generated tokens", genTokensTotal != null ? fmtC(genTokensTotal) : "\u2014", "output tokens", "#a78bfa")
        ])
      ]
    });
    const liveRows = (rows) => rows.map((r, i) => ({ ...r, n: i }));
    const liveTick = (rows) => (v) => {
      const r = rows[Math.round(v)];
      return r && r.time ? String(r.time).slice(-5) : "";
    };
    const tpRows = liveRows(throughputHistory);
    const rqRows = liveRows(requestHistory);
    const specRows = liveRows(specHistory).map((r) => ({ ...r, rate: (r.rate || 0) * 100 }));
    const throughputChart = throughputHistory.length > 1 ? jsxs("div", {
      style: { marginTop: 24 },
      children: [
        jsx("div", {
          className: "tg-label",
          style: { marginBottom: 8 },
          children: "\u{1F4C8} Throughput over time (tok/s)"
        }),
        jsx(GraphCanvas, {
          data: tpRows,
          xField: "n",
          xLabel: "time",
          xTickFormat: liveTick(tpRows),
          series: [
            { key: "prompt", label: "Prompt", tipName: "prompt", color: "#38bdf8", unit: "tok/s", axis: 0, line: true, fill: true },
            { key: "gen", label: "Generation", tipName: "generation", color: "#a78bfa", unit: "tok/s", axis: 0, line: true, fill: true }
          ],
          axes: [{ unit: "tok/s" }],
          legendChips: true,
          legendUnit: "tok/s",
          persistKey: "llama-throughput",
          height: 200
        })
      ]
    }) : null;
    const requestsChart = requestHistory.length > 1 ? jsxs("div", {
      style: { marginTop: 24 },
      children: [
        jsx("div", {
          className: "tg-label",
          style: { marginBottom: 8 },
          children: "\u{1F4CA} Requests over time"
        }),
        jsx(GraphCanvas, {
          data: rqRows,
          xField: "n",
          xLabel: "time",
          xTickFormat: liveTick(rqRows),
          series: [
            { key: "processing", label: "Processing", tipName: "processing", color: "#fbbf24", unit: "req", axis: 0, line: true },
            { key: "deferred", label: "Deferred", tipName: "deferred", color: "#f472b6", unit: "req", axis: 0, line: true }
          ],
          axes: [{ unit: "req" }],
          legendChips: true,
          legendUnit: "req",
          persistKey: "llama-requests",
          height: 160
        })
      ]
    }) : null;
    const specChart = specHistory.length > 1 ? jsxs("div", {
      style: { marginTop: 24 },
      children: [
        jsx("div", {
          className: "tg-label",
          style: { marginBottom: 8 },
          children: "\u{1F3AF} Speculative decoding acceptance rate over time"
        }),
        jsx(GraphCanvas, {
          data: specRows,
          xField: "n",
          xLabel: "time",
          xTickFormat: liveTick(specRows),
          series: [
            { key: "rate", label: "Acceptance rate", tipName: "accepted", color: "#34d399", unit: "%", axis: 0, line: true, fill: true }
          ],
          axes: [{ unit: "%", max: 100 }],
          legendChips: true,
          legendUnit: "%",
          persistKey: "llama-spec",
          height: 160
        })
      ]
    }) : null;
    if (!modelName) {
      return jsxs("div", {
        style: { display: "flex", flexDirection: "column", gap: 16 },
        children: [
          serverConfig,
          statusIndicator,
          jsx("div", {
            className: "tg-faint",
            style: { fontSize: 11, marginTop: 20 },
            children: "Configure the llama.cpp server URL above and load the available models. Once a model is selected, metrics are polled every 2 seconds and plotted live."
          })
        ]
      });
    }
    return jsxs("div", {
      style: { display: "flex", flexDirection: "column", gap: 16 },
      children: [
        serverConfig,
        statusIndicator,
        gauges,
        specGauges,
        tokenTotals,
        throughputChart,
        requestsChart,
        specChart,
        jsx("div", {
          className: "tg-faint",
          style: { fontSize: 11, marginTop: 20 },
          children: `Polling ${serverUrl} every ${POLL_INTERVAL / 1e3}s. Metrics source: llama.cpp /metrics endpoint (Prometheus format). Throughput gauges are server-reported averages since last request; charts show the rolling window of sampled values.`
        })
      ]
    });
  }

  // client/hooks.ts
  var activityRef = { open: null };
  var usageFingerprint = (u) => {
    if (!u) return "";
    const t = u.sources && u.sources.trajectories || {};
    const src = u.sources && u.sources.imported || [];
    return JSON.stringify({
      tok: u.totals && u.totals.allTokens || 0,
      files: t.files || 0,
      wu: t.withUsage || 0,
      rec: t.usageRecords || 0,
      wmt: t.withModelTimeline || 0,
      n: Array.isArray(u.sessions) ? u.sessions.length : 0,
      comp: u.compactionSig || "",
      stops: u.events && u.events.userStops || 0,
      // Imported homes are part of the payload: adding, removing, pausing or
      // resyncing one changes the fingerprint, so the cached points are refetched.
      src: src.map((s) => s.id + ":" + (s.enabled === false ? 0 : 1) + ":" + (s.lastSyncAt || 0) + ":" + (s.live && s.live.sessions || 0) + ":" + (s.error ? 1 : 0)).join(",")
    });
  };
  function useGobblerData() {
    const [data, setData] = React.useState(void 0);
    const [breakdown, setBreakdown] = React.useState(void 0);
    const [perf, setPerf] = React.useState(void 0);
    const [error, setError] = React.useState(void 0);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [reprocessing, setReprocessing] = React.useState(false);
    const [reprocessMsg, setReprocessMsg] = React.useState(null);
    const loadData = React.useCallback(async () => {
      setRefreshing(true);
      const missing = (e) => e && e.status === 404 ? null : { __error: e instanceof Error ? e.message : String(e) };
      let sawData = false;
      try {
        let cached = null;
        try {
          cached = await readCache();
        } catch {
          cached = null;
        }
        if (cached && cached.usage) {
          sawData = true;
          setSourceIndex(cached.usage.sources);
          setData(cached.usage);
          setBreakdown(cached.breakdown ?? null);
          setPerf(cached.perf ?? null);
          setError(null);
          setLoading(false);
        }
        const u = await request("/usage");
        sawData = true;
        setSourceIndex(u.sources);
        setData(u);
        const homeOk = !cached || !cached.home || cached.home === u.dshHome;
        const fp = usageFingerprint(u);
        if (cached && homeOk && cached.fp === fp) {
          setError(null);
        } else {
          if (cached && !homeOk) clearCache();
          const [b, p] = await Promise.all([request("/breakdown").catch(missing), request("/performance").catch(missing)]);
          setBreakdown(b);
          setPerf(p);
          if (b && b.bySession) {
            await writeCache({ v: 1, home: u.dshHome || "", fp, at: Date.now(), usage: u, breakdown: b, perf: p });
          }
          setError(null);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (e && e.status === 404) {
          clearCache();
          setData(void 0);
          setBreakdown(null);
          setPerf(null);
          setError(msg);
        } else if (!sawData) {
          setError(msg);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);
    const reprocess = React.useCallback(async () => {
      setReprocessing(true);
      setReprocessMsg(null);
      try {
        const r = await request("/reprocess", {});
        const n = r && r.cache ? r.cache.recomputed || 0 : 0;
        const f = r ? r.files || 0 : 0;
        setReprocessMsg("\u267B Reprocessed " + f + " trajectories (" + n + " re-parsed).");
        clearCache();
        await loadData();
      } catch (e) {
        setReprocessMsg("\u267B Reprocess failed: " + (e instanceof Error ? e.message : String(e)));
      } finally {
        setReprocessing(false);
      }
    }, [loadData]);
    React.useEffect(() => {
      loadData();
    }, [loadData]);
    return { data, breakdown, perf, error, loading, refreshing, loadData, reprocess, reprocessing, reprocessMsg };
  }

  // client/chart-settings.tsx
  function Seg(props) {
    return jsx("div", { className: "tg-seg", children: props.options.map((o) => jsx("button", {
      className: "tg-seg-btn" + (props.value === o.k ? " active" : ""),
      title: o.hint || o.name,
      onClick: () => props.onChange(o.k),
      children: o.name
    }, "seg-" + o.k)) });
  }
  var Toggle = (props) => jsx("button", {
    className: "tg-ghost tg-set-toggle" + (props.on ? " active" : ""),
    onClick: () => props.onChange(!props.on),
    children: props.label || (props.on ? "On" : "Off")
  });
  var Num = (props) => jsx("input", {
    className: "tg-input tg-input-num tg-set-num",
    type: "number",
    min: props.min,
    max: props.max,
    step: props.step || 1,
    value: props.value,
    style: { width: (props.width || 74) + "px" },
    onChange: (e) => props.onChange(Number(e.target.value))
  });
  var Row = (label, control, hint) => jsxs("div", { className: "tg-set-row", children: [
    jsx("div", { className: "tg-set-label", children: label }),
    jsx("div", { className: "tg-set-ctl", children: control }),
    jsx("div", { className: "tg-set-hint", children: hint || "" })
  ] }, "row-" + label);
  function ChartDefaultsCard() {
    const [s, setS] = React.useState(() => loadChartSettings());
    const apply2 = (next) => setS(saveChartSettings(next));
    const setTrend = (p) => apply2({ ...s, trend: { ...s.trend, ...p } });
    const setHeat = (p) => apply2({ ...s, heat: { ...s.heat, ...p } });
    const autoWindow = trendWindowSize(s.trend, 150);
    return jsxs("div", { className: "tg-card tg-set-card", children: [
      Row("Default plot mode", jsx(Seg, {
        value: s.mode,
        options: POINT_MODES,
        onChange: (k) => apply2({ ...s, mode: k })
      }), "What a chart opens with the first time. A mode you pick on a chart itself is remembered per chart and overrules this."),
      Row("Trend statistic", jsx(Seg, {
        value: s.trend.stat,
        options: TREND_STATS,
        onChange: (k) => setTrend({ stat: k })
      }), "Median ignores single-step spikes, the mean lets them pull, the EMA weights recent steps and has no window edges."),
      Row("Trend window", jsxs("div", { className: "tg-set-inline", children: [
        jsx(Num, { value: s.trend.window, min: 0, max: 51, onChange: (v) => setTrend({ window: v }) }),
        jsx("span", { className: "tg-set-unit", children: "steps" }),
        jsx(Toggle, { on: s.trend.window === 0, label: "Auto", onChange: (on) => setTrend({ window: on ? 0 : 15 }) })
      ] }), "0 = auto: 8% of the session's steps, forced odd, 3\u201351. A 150-step session would use " + autoWindow + "."),
      Row("Raw steps under the trend", jsxs("div", { className: "tg-set-inline", children: [
        jsx(Toggle, { on: s.trend.dots, onChange: (on) => setTrend({ dots: on }) }),
        jsx("input", {
          className: "tg-range",
          type: "range",
          min: 0.05,
          max: 0.8,
          step: 0.05,
          value: s.trend.dotsAlpha,
          title: "Opacity of the raw steps",
          disabled: !s.trend.dots,
          onChange: (e) => setTrend({ dotsAlpha: Number(e.target.value) })
        }),
        jsx("span", { className: "tg-set-unit", children: Math.round(s.trend.dotsAlpha * 100) + "%" })
      ] }), "The trend is the reading; the faint steps behind it are the audit trail (the tooltip still hits real steps)."),
      Row(
        "Spread band",
        jsx(Toggle, { on: s.trend.band, onChange: (on) => setTrend({ band: on }) }),
        "Shade the window's p25\u2013p75 behind the trend \u2014 how much the session wobbles around it."
      ),
      Row("Heat rows", jsx(Seg, {
        value: s.heat.rows,
        options: [
          { k: "metric", name: "Per metric", hint: "One row per metric \u2014 the window's steps share the row" },
          { k: "series", name: "Per series", hint: "One row per drawn series, so each context window gets its own" }
        ],
        onChange: (k) => setHeat({ rows: k })
      }), "The perf panel has 7 metrics; per series it has one row per window and metric."),
      Row("Heat colours", jsx(Seg, {
        value: s.heat.ramp,
        options: [
          { k: "row", name: "Row hue", hint: "Each row in its own colour \u2014 identity and intensity in one channel" },
          { k: "shared", name: "Shared ramp", hint: "One ramp for every row, with a low\u2192high legend" }
        ],
        onChange: (k) => setHeat({ ramp: k })
      }), 'Rows are normalised inside themselves either way, so the shade always means "high for this metric".'),
      Row("Heat shading", jsx(Seg, {
        value: s.heat.scale,
        options: [
          { k: "log", name: "Log", hint: "Logarithmic \u2014 the right call for token counts spanning decades" },
          { k: "linear", name: "Linear", hint: "Linear within the row's own min..max" }
        ],
        onChange: (k) => setHeat({ scale: k })
      }), "Log keeps a 36 \u2192 23K tok/s prefill row readable; linear is easier to compare against the axis."),
      Row("Heat max columns", jsxs("div", { className: "tg-set-inline", children: [
        jsx(Num, { value: s.heat.maxCols, min: 0, max: 4e3, onChange: (v) => setHeat({ maxCols: v }) }),
        jsx("span", { className: "tg-set-unit", children: s.heat.maxCols === 0 ? "never bin" : "columns" })
      ] }), "Past this many steps the grid bins them, and a cell shows the largest step it covers so spikes survive."),
      Row(
        "Window strip",
        jsx(Toggle, { on: s.heat.strip, onChange: (on) => setHeat({ strip: on }) }),
        "The compaction-window colours along the top of the grid."
      ),
      Row(
        "Row labels",
        jsx(Toggle, { on: s.heat.labels, onChange: (on) => setHeat({ labels: on }) }),
        "Metric names in the left gutter; without them the chips are the only legend."
      ),
      jsxs("div", { className: "tg-set-foot", children: [
        jsx("button", {
          className: "tg-ghost",
          onClick: () => setS(resetChartSettings()),
          children: "\u21BA Reset to defaults"
        }),
        jsx("button", {
          className: "tg-ghost tg-set-forget",
          title: "Drop the mode remembered for each chart, so the default above applies to them again",
          onClick: () => clearChartModes(),
          children: "Forget per-chart modes"
        }),
        jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: "Saved per browser, and charts already on screen follow along. A chart you switch by hand remembers its own mode \u2014 \u201CForget per-chart modes\u201D hands them back to the default." })
      ] })
    ] });
  }

  // client/import-sources.tsx
  function ago(ms) {
    if (!ms) return "never";
    const d = Date.now() - ms;
    if (d < 45e3) return "just now";
    if (d < 36e5) return Math.round(d / 6e4) + "m ago";
    if (d < 864e5) return Math.round(d / 36e5) + "h ago";
    return Math.round(d / 864e5) + "d ago";
  }
  var fmtBytes = (n) => {
    if (!n) return "0 B";
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(0) + " KB";
    if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + " MB";
    return (n / 1024 / 1024 / 1024).toFixed(2) + " GB";
  };
  function counts(s) {
    if (s.live) return { sessions: s.live.sessions || 0, files: s.live.files || 0, tokens: s.live.tokens || 0, live: true };
    const scan = s.scan || {};
    return { sessions: (scan.sessions || 0) + (scan.legacySessions || 0), files: scan.files || 0, tokens: scan.tokens || 0, live: false };
  }
  var OS_CHOICES = [
    { k: "auto", name: "Auto-detect", hint: "Read the OS from the sessions' own cwd (C:\\\u2026 = Windows, /Users/\u2026 = macOS, /home/\u2026 = Linux)" },
    { k: "windows", name: "\u{1FA9F} Windows", hint: "Force the Windows badge" },
    { k: "macos", name: "\u{1F34E} macOS", hint: "Force the macOS badge" },
    { k: "linux", name: "\u{1F427} Linux", hint: "Force the Linux badge" }
  ];
  function Seg2(props) {
    return jsx("div", { className: "tg-seg tg-seg-sm", children: props.options.map((o) => jsx("button", {
      className: "tg-seg-btn" + (props.value === o.k ? " active" : ""),
      title: o.hint,
      onClick: () => props.onChange(o.k),
      children: o.name
    }, "os-" + o.k)) });
  }
  function ImportSourcesCard(props = {}) {
    const [sources, setSources] = React.useState(null);
    const [candidates, setCandidates] = React.useState(null);
    const [busy, setBusy] = React.useState(null);
    const [msg, setMsg] = React.useState(null);
    const [path, setPath] = React.useState("");
    const [label, setLabel] = React.useState("");
    const [os, setOs] = React.useState("auto");
    const [confirmId, setConfirmId] = React.useState(null);
    const apply2 = React.useCallback((value, note) => {
      if (value && Array.isArray(value.sources)) setSources(value.sources);
      if (value && value.candidates) setCandidates(value.candidates);
      if (note) setMsg(note);
      if (value && Array.isArray(value.sources)) setSourceIndex({ imported: value.sources.map((s) => ({ ...s, live: s.live })), local: sourceIndex()[LOCAL_ID] || null });
    }, []);
    const fail = (e) => setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    const load = React.useCallback(async (scan2 = false) => {
      try {
        apply2(await request("/sources" + (scan2 ? "?scan=1" : "")));
      } catch (e) {
        fail(e);
      }
    }, [apply2]);
    React.useEffect(() => {
      load();
    }, [load]);
    const act = React.useCallback(async (body, id, ok) => {
      setBusy(id);
      setMsg(null);
      try {
        const value = await request("/sources", body);
        apply2(value, ok(value));
        if (props.onChanged) props.onChanged();
      } catch (e) {
        fail(e);
      } finally {
        setBusy(null);
      }
    }, [apply2, props]);
    const add = (p) => {
      const target = (p != null ? p : path).trim();
      if (!target) {
        setMsg({ kind: "err", text: "Give the path of the other machine's .dsh folder (or of its sessions folder)." });
        return;
      }
      return act({ action: "add", path: target, label: p != null ? "" : label, os }, "add:" + target, (v) => ({ kind: "ok", text: "Imported " + (v.result && v.result.label || target) + " \u2014 its sessions are now folded in and marked." }));
    };
    const resync = (id) => act({ action: "resync", id }, "resync:" + id, (v) => ({ kind: "ok", text: "Resynced " + id + " \u2014 " + (v.result && v.result.dropped || 0) + " cached trajectories dropped; the next load re-reads the home." }));
    const toggle = (s) => act({ action: "update", id: s.id, enabled: !s.enabled }, "toggle:" + s.id, (v) => ({ kind: "ok", text: (v.result && v.result.enabled === false ? "Paused " : "Re-enabled ") + s.label }));
    const remove = (id) => {
      setConfirmId(null);
      return act({ action: "remove", id }, "remove:" + id, () => ({ kind: "ok", text: "Removed " + id + " \u2014 its files were not touched." }));
    };
    const scan = async () => {
      setBusy("scan");
      setMsg(null);
      try {
        const value = await request("/sources?scan=1");
        apply2(value);
        const n = (value.candidates || []).length;
        setMsg({ kind: n ? "ok" : "warn", text: n ? "Found " + n + " candidate" + (n === 1 ? "" : "s") + " \u2014 add the one you want." : "No DSH home found under the usual mount points. Type the path instead." });
      } catch (e) {
        fail(e);
      } finally {
        setBusy(null);
      }
    };
    const list = sources || [];
    const row = (s) => {
      const c = counts(s);
      const bad = !!s.error;
      return jsxs("div", { className: "tg-src-row" + (bad ? " tg-src-row-bad" : "") + (s.enabled === false ? " tg-src-row-off" : ""), children: [
        jsx("div", { className: "tg-src-row-ico", title: OS_NAME[s.os] || s.os, children: osIcon(s.os) }),
        jsxs("div", { className: "tg-src-row-main", children: [
          jsxs("div", { className: "tg-src-row-top", children: [
            jsx("span", { className: "tg-src-row-label", children: s.label }),
            jsx("span", { className: "tg-src-row-os", children: OS_NAME[s.os] || s.os }),
            s.enabled === false ? jsx("span", { className: "tg-src-row-off-pill", children: "paused" }) : null,
            bad ? jsx("span", { className: "tg-src-row-err", children: "\u26A0 " + s.error }) : null
          ] }),
          jsx("div", { className: "tg-src-row-path", title: s.path, children: s.path }),
          jsx("div", {
            className: "tg-src-row-stats",
            children: fmt(c.sessions) + " sessions \xB7 " + fmt(c.files) + " trajectories" + (c.tokens ? " \xB7 " + fmtC(c.tokens) + " tokens" : "") + (s.scan && s.scan.bytes ? " \xB7 " + fmtBytes(s.scan.bytes) : "") + (c.live ? "" : " \xB7 last scan") + " \xB7 synced " + ago(s.lastSyncAt)
          })
        ] }),
        jsxs("div", { className: "tg-src-row-actions", children: [
          jsx("button", { className: "tg-ghost tg-src-btn", disabled: !!busy, title: "Re-read this home from disk (drops its cached parses)", onClick: () => resync(s.id), children: busy === "resync:" + s.id ? "\u2026" : "\u21BB Resync" }),
          jsx("button", { className: "tg-ghost tg-src-btn", disabled: !!busy, title: s.enabled === false ? "Fold this home back into the dashboard" : "Keep it registered but stop reading it", onClick: () => toggle(s), children: busy === "toggle:" + s.id ? "\u2026" : s.enabled === false ? "\u25B6 Enable" : "\u23F8 Pause" }),
          confirmId === s.id ? jsxs("span", { className: "tg-src-confirm", children: [
            jsx("button", { className: "tg-ghost tg-src-btn tg-src-danger", disabled: !!busy, onClick: () => remove(s.id), children: busy === "remove:" + s.id ? "\u2026" : "Remove" }),
            jsx("button", { className: "tg-ghost tg-src-btn", onClick: () => setConfirmId(null), children: "Cancel" })
          ] }) : jsx("button", { className: "tg-ghost tg-src-btn", title: "Forget this import (the files on disk are never touched)", onClick: () => setConfirmId(s.id), children: "\u2715 Remove" })
        ] })
      ] }, s.id);
    };
    return jsxs("div", { className: "tg-card tg-set-card", children: [
      jsxs("div", { className: "tg-set-row tg-src-add", children: [
        jsx("div", { className: "tg-set-label", children: "Add a DSH home" }),
        jsxs("div", { className: "tg-set-ctl", children: [
          jsx("input", {
            className: "tg-input tg-src-path",
            placeholder: "/media/you/DRIVE/Users/you/.dsh  \xB7  /Volumes/backup/.dsh  \xB7  ~/dsh-copies/laptop",
            value: path,
            spellcheck: false,
            onChange: (e) => setPath(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") add();
            }
          }),
          jsx("input", {
            className: "tg-input tg-src-name",
            placeholder: "name (optional)",
            value: label,
            onChange: (e) => setLabel(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") add();
            }
          })
        ] }),
        jsxs("div", { className: "tg-set-hint", children: [
          "Point it at the other machine's ",
          jsx("code", { children: ".dsh" }),
          " folder \u2014 or straight at its ",
          jsx("code", { children: "sessions" }),
          " folder if that is all you copied. Nothing on that machine is written to; it is read where it lies (a mounted drive, a network share, a synced backup)."
        ] })
      ] }),
      jsxs("div", { className: "tg-set-row", children: [
        jsx("div", { className: "tg-set-label", children: "Its OS" }),
        jsx("div", { className: "tg-set-ctl", children: jsx(Seg2, { value: os, options: OS_CHOICES, onChange: setOs }) }),
        jsx("div", { className: "tg-set-hint", children: "Drives the badge that MARKS every session it contributed, so a Windows session never looks like one of your own." })
      ] }),
      jsxs("div", { className: "tg-src-actions", children: [
        jsx("button", { className: "tg-refresh", disabled: !!busy, onClick: () => add(), children: busy && busy.startsWith("add:") ? "Importing\u2026" : "\uFF0B Import source" }),
        jsx("button", { className: "tg-ghost", disabled: !!busy, onClick: scan, title: "Look for .dsh homes under /mnt, /media/<you>, /run/media/<you>, /Volumes and your home", children: busy === "scan" ? "Scanning\u2026" : "\u{1F50D} Scan for DSH homes" }),
        jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: list.length ? list.length + " imported home" + (list.length === 1 ? "" : "s") : "No imports yet \u2014 Token Gobbler reads only this machine." })
      ] }),
      msg ? jsx("div", { className: "tg-src-msg" + (msg.kind === "err" ? " err" : msg.kind === "warn" ? " warn" : " ok"), children: msg.text }) : null,
      candidates && candidates.length ? jsxs("div", { className: "tg-src-cands", children: [
        jsx("div", { className: "tg-src-cands-head", children: "Found on this machine" }),
        ...candidates.map((c) => jsxs("div", { className: "tg-src-cand", children: [
          jsx("span", { className: "tg-src-row-ico", children: osIcon(c.os) }),
          jsxs("div", { className: "tg-src-cand-main", children: [
            jsx("div", { className: "tg-src-cand-path", title: c.path, children: c.path }),
            jsx("div", { className: "tg-src-cand-stats", children: fmt(c.sessions) + " sessions \xB7 " + fmt(c.files) + " trajectories \xB7 " + OS_NAME[c.os] })
          ] }),
          c.known ? jsx("span", { className: "tg-src-cand-known", children: "already imported" }) : jsx("button", { className: "tg-ghost tg-src-btn", disabled: !!busy, onClick: () => add(c.path), children: "\uFF0B Add" })
        ] }, c.path))
      ] }) : null,
      list.length ? jsxs("div", { className: "tg-src-list", children: [
        jsx("div", { className: "tg-src-list-head", children: "Imported homes" }),
        ...list.map(row)
      ] }) : null,
      jsxs("div", { className: "tg-set-foot", children: [
        jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: "Imported sessions are folded into every total and marked with their home's badge. An id that exists in two homes is counted once (this machine wins). Resync re-reads that home only; the rest of the dashboard keeps its warm cache." })
      ] })
    ] });
  }

  // client/activity.tsx
  function TokenGobblerSettings(props) {
    const close = props && props.close;
    const { data, error, loading, refreshing, loadData, reprocess, reprocessing, reprocessMsg } = useGobblerData();
    const [chartMode, setChartMode] = React.useState(() => loadChartSettings().mode);
    React.useEffect(() => subscribeChartSettings(() => setChartMode(loadChartSettings().mode)), []);
    if (loading) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsx("div", { style: { padding: 24, color: "#94a3b8", fontSize: 14 }, children: "Counting the gobbled tokens\u2026" })] });
    if (error && !data) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsxs("div", { style: { padding: 24 }, children: [jsx("div", { style: { fontWeight: 700 }, children: "Couldn't load token usage" }), jsx("div", { style: { color: "#f87171", marginTop: 6, fontSize: 13 }, children: error })] })] });
    if (!data) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsx("div", { style: { padding: 24, color: "#94a3b8" }, children: "No data." })] });
    const t = data.totals;
    const wfh = data.split && data.split.wfh;
    const refLabel = wfh && wfh.referenceLabel || "corp";
    const ev = data.events || null;
    const imp = importedSummary(data.sources);
    const dec = data.decode;
    const byModel = data.byModel || [];
    const fastest = byModel.filter((m) => m.tokPerSec != null).sort((a, b) => b.tokPerSec - a.tokPerSec)[0] || null;
    const setChip = (label, value, color) => jsxs("span", { className: "tg-set-chip", children: [
      jsx("span", { className: "tg-stat-dot", style: { background: color } }),
      jsx("span", { className: "tg-set-chip-l", children: label }),
      jsx("span", { className: "tg-set-chip-v tg-num", children: value })
    ] });
    const drawer = (title, chips, body, open = false) => jsx(Collapse, {
      defaultOpen: open,
      label: jsxs("span", { className: "tg-set-head", children: [
        jsx("span", { className: "tg-set-head-t", children: title }),
        ...chips
      ] }),
      children: jsx("div", { className: "tg-set-body", children: body })
    });
    const chip = (label, value, color) => jsxs("div", { className: "tg-chip", children: [
      jsx("span", { className: "tg-stat-dot", style: { background: color } }),
      jsx("span", { className: "tg-chip-label", children: label }),
      jsx("span", { className: "tg-chip-value tg-num", children: value })
    ] });
    const wfhCard = wfh ? jsxs("div", { className: "tg-card tg-wfh", children: [
      jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }, children: [
        jsx("div", { className: "tg-label", style: { color: "#34d399" }, children: "\u{1F3E0} WFH compute \u2014 local sessions" }),
        wfh.saved != null && wfh.saved > 0 ? jsx("span", { className: "tg-badge", children: "\u{1F4B0} saved " + money(wfh.saved) + " vs " + refLabel + " rates" }) : null
      ] }),
      jsx("div", { className: "tg-wfh-value tg-num", children: money(wfh.cost) }),
      jsx("div", {
        style: { color: "#94a3b8", fontSize: 12, marginTop: 8, lineHeight: 1.5 },
        children: fmt(wfh.sessions) + " local sessions \xB7 " + fmtC(wfh.tokens) + " tokens metered on the home lab" + (wfh.corpCost != null ? " \u2014 at " + refLabel + " rates that would bill " + money(wfh.corpCost) : "")
      })
    ] }) : null;
    const openActivity = () => {
      if (close) close();
      if (activityRef.open) activityRef.open("cost");
    };
    return jsxs("div", {
      className: "tg-root",
      style: { display: "flex", flexDirection: "column", gap: 16, padding: 2 },
      children: [
        jsx("style", { children: CSS }),
        jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }, children: [
          jsxs("div", { children: [
            jsx("div", { style: { fontSize: 19, fontWeight: 800, letterSpacing: "-0.01em" }, children: "\u{1F983} Token Gobbler" }),
            jsx("div", { style: { color: "#94a3b8", marginTop: 3, fontSize: 13 }, children: "Every token you fed the machine \u2014 your WFH compute, and what it would've cost the corp." })
          ] }),
          jsxs("div", { style: { display: "flex", gap: 8 }, children: [
            jsx("button", { className: "tg-ghost", onClick: openActivity, children: "Open activity view" }),
            jsx("button", { className: "tg-refresh", onClick: () => loadData(), disabled: refreshing || loading, children: refreshing ? "Refreshing\u2026" : "\u21BB Refresh" }),
            jsx("button", { className: "tg-reprocess", onClick: () => reprocess(), disabled: reprocessing || refreshing || loading, children: reprocessing ? "Reprocessing\u2026" : "\u267B Reprocess" })
          ] })
        ] }),
        reprocessMsg ? jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: -6 }, children: reprocessMsg }) : null,
        // Imported homes are folded into every number on this page — say so, and
        // which ones, right under the header instead of burying it in a settings card.
        imp ? jsxs("div", { className: "tg-importline", children: [
          jsx("span", { className: "tg-importline-ico", children: "\u{1F50C}" }),
          jsx("span", { children: imp.text + " folded in \u2014 imported sessions carry their home's badge and can be filtered in the activity view." })
        ] }) : null,
        jsxs("div", { className: "tg-set-drawers", children: [
          drawer("\u{1F4B0} Cost \u2014 what it adds up to", [
            setChip("actually ran", money(data.actual.cost), "#fbbf24"),
            ...data.actualSavings > 0 ? [setChip("saved", money(data.actualSavings), "#34d399")] : []
          ], [
            jsxs("div", { className: "tg-card tg-hero", children: [
              jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }, children: [
                jsx("div", { className: "tg-label", children: "What you actually ran" }),
                data.actualSavings > 0 ? jsx("span", { className: "tg-badge", children: "\u{1F4B0} Home lab saved " + money(data.actualSavings) }) : null
              ] }),
              jsx("div", { className: "tg-hero-value tg-num", style: { color: "#f8fafc" }, children: money(data.actual.cost) }),
              jsx("div", { style: { color: "#94a3b8", fontSize: 12, marginTop: 9, lineHeight: 1.5 }, children: data.actual.note })
            ] }),
            wfhCard
          ], true),
          drawer("\u{1FA99} Tokens \u2014 everything metered", [setChip("total", fmtC(t.allTokens), "#fbbf24")], [
            jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }, children: [
              statCard("Input (uncached)", t.uncachedInputTokens, "#60a5fa", false),
              statCard("Output", t.outputTokens, "#a78bfa", false),
              statCard("Cache read", t.cacheReadTokens, "#2dd4bf", false),
              statCard("Cache write", t.cacheWriteTokens, "#f472b6", false),
              statCard("Total tokens", t.allTokens, "#fbbf24", true)
            ] })
          ]),
          dec && dec.tokPerSec != null ? drawer("\u26A1 Speed \u2014 how fast it ran", [
            setChip("decode", dec.tokPerSec + " tok/s", "#fbbf24"),
            ...data.prefill && data.prefill.tokPerSec != null ? [setChip("prefill", data.prefill.tokPerSec + " tok/s", "#2dd4bf")] : []
          ], [
            jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }, children: [
              jsxs("div", { className: "tg-card tg-stat", children: [
                jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
                  jsx("span", { className: "tg-stat-dot", style: { background: "#fbbf24" } }),
                  jsx("span", { className: "tg-label", children: "Average decode speed" })
                ] }),
                jsx("div", { className: "tg-stat-value tg-num", children: dec.tokPerSec + " tok/s" }),
                jsx("div", { style: { color: "#94a3b8", fontSize: 11, marginTop: 5 }, children: fmtC(dec.tokens) + " streamed tokens \xB7 " + fmtMs(dec.ms) + " of decode time" + (fastest ? " \xB7 fastest " + fastest.label + " at " + fastest.tokPerSec + " tok/s" : "") })
              ] }),
              data.prefill && data.prefill.tokPerSec != null ? jsxs("div", { className: "tg-card tg-stat", children: [
                jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
                  jsx("span", { className: "tg-stat-dot", style: { background: "#2dd4bf" } }),
                  jsx("span", { className: "tg-label", children: "Prompt processing (new ctx)" })
                ] }),
                jsx("div", { className: "tg-stat-value tg-num", children: data.prefill.tokPerSec + " tok/s" }),
                jsx("div", { style: { color: "#94a3b8", fontSize: 11, marginTop: 5 }, children: fmtC(data.prefill.tokens) + " new context tokens \xB7 " + fmtMs(data.prefill.ms) + " of TTFT" + (data.prefill.avgTtftMs != null ? " \xB7 avg TTFT " + fmtMs(data.prefill.avgTtftMs) : "") })
              ] }) : null
            ] })
          ]) : null,
          ev ? drawer("\u{1F4CA} Activity \u2014 what actually happened", [
            setChip("sessions", fmt(data.sources.projcache.sessions), "#60a5fa"),
            setChip("LLM steps", fmt(ev.steps || 0), "#60a5fa")
          ], [
            jsx("div", { className: "tg-chipgrid", children: [
              chip("Sessions", fmt(data.sources.projcache.sessions), "#60a5fa"),
              chip("LLM steps", fmt(ev.steps || 0), "#60a5fa"),
              chip("Tool calls", fmt((ev.toolCalls || 0) + (ev.toolSubCalls || 0)), "#a78bfa"),
              chip("Your messages", fmt(ev.userMessages || 0), "#34d399"),
              chip("Assistant msgs", fmt(ev.assistantMessages || 0), "#2dd4bf"),
              chip("Turns", fmt(ev.turns || 0), "#fbbf24"),
              chip("Compactions", fmt(ev.compactions || 0), "#f472b6")
            ] })
          ]) : null,
          // The chart knobs live here rather than in the charts: one place to set
          // what every canvas chart opens with (see client/chart-settings.tsx).
          drawer("\u{1F4C8} Chart defaults \u2014 trend & heat", [
            setChip("opens as", (POINT_MODES.find((m) => m.k === chartMode) || { name: String(chartMode) }).name, "#38bdf8")
          ], [
            jsx(ChartDefaultsCard, {})
          ]),
          // Imported DSH homes: add / pause / resync / remove (client/import-sources.tsx).
          drawer("\u{1F50C} Imported sources \u2014 other machines & OSes", [
            setChip(importedSources().length === 1 ? "home" : "homes", String(importedSources().length), "#34d399")
          ], [
            jsx(ImportSourcesCard, { onChanged: loadData })
          ])
        ] }),
        jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: 2 }, children: "sources: " + data.sources.projcache.sessions + " sessions (" + data.sources.projcache.nonZero + " with usage) \xB7 " + data.sources.trajectories.files + " trajectories (" + data.sources.trajectories.withUsage + " with per-turn usage, " + data.sources.trajectories.withModelTimeline + " with model events" + (data.sources.trajectories.cache ? " \xB7 parse cache " + data.sources.trajectories.cache.hits + " hits / " + data.sources.trajectories.cache.recomputed + " recomputed" : "") + ")" })
      ]
    });
  }
  function TokenGobblerModal({ onClose, initialTab, initialDay }) {
    const { data, breakdown, perf, error, loading, refreshing, loadData, reprocess, reprocessing, reprocessMsg } = useGobblerData();
    const [tab, setTab] = React.useState(initialTab || "events");
    const [srcFilter, setSrcFilter] = React.useState("all");
    const [openSession, setOpenSession] = React.useState(null);
    const [openToken, setOpenToken] = React.useState(null);
    const [pageState, setPageState] = React.useState({});
    const pageFor = (k) => pageState[k] || 0;
    const setPageFor = (k) => (p) => setPageState((s) => ({ ...s, [k]: p }));
    const [sortState, setSortState] = React.useState(() => {
      try {
        const s = localStorage.getItem("tg:sort:perf-sessions");
        return s ? JSON.parse(s) : null;
      } catch {
        return null;
      }
    });
    const handleSort = React.useCallback((col) => {
      setSortState(col);
      try {
        localStorage.setItem("tg:sort:perf-sessions", JSON.stringify(col));
      } catch {
      }
    }, []);
    const [pricingData, setPricingData] = React.useState(null);
    const [draft, setDraft] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const [saveMsg, setSaveMsg] = React.useState(null);
    const [addRow, setAddRow] = React.useState({ id: "", label: "", input: "", output: "", cacheRead: "", cacheWrite: "", kind: "corp" });
    const [discovering, setDiscovering] = React.useState(false);
    const [discoverMsg, setDiscoverMsg] = React.useState(null);
    const loadPricingData = React.useCallback(async () => {
      try {
        const p = await request("/pricing");
        setPricingData(p);
        setDraft({ referenceModel: p.referenceModel, baselineModel: p.baselineModel, models: p.models, fromFile: p.fromFile, seeded: p.seeded });
      } catch (e) {
        setSaveMsg({ kind: "err", text: "Couldn't load pricing: " + (e instanceof Error ? e.message : String(e)) });
      }
    }, []);
    React.useEffect(() => {
      loadPricingData();
    }, [loadPricingData]);
    const doSave = React.useCallback(async () => {
      if (!draft) return;
      setSaving(true);
      setSaveMsg(null);
      try {
        const models = draft.models.map((m) => ({ ...m, input: m.input === "" ? 0 : m.input, output: m.output === "" ? 0 : m.output, cacheRead: m.cacheRead === "" ? 0 : m.cacheRead, cacheWrite: m.cacheWrite === "" ? 0 : m.cacheWrite }));
        const saved = await request("/pricing", { referenceModel: draft.referenceModel, baselineModel: draft.baselineModel, models });
        setPricingData(saved);
        setDraft({ referenceModel: saved.referenceModel, baselineModel: saved.baselineModel, models: saved.models, fromFile: true, seeded: false });
        setSaveMsg({ kind: "ok", text: "Saved \u2014 all costs re-priced." });
        await loadData();
      } catch (e) {
        setSaveMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
      } finally {
        setSaving(false);
      }
    }, [draft, loadData]);
    const addModel = React.useCallback(() => {
      const id = addRow.id.trim().toLowerCase();
      if (!id) {
        setSaveMsg({ kind: "err", text: "New model needs an id." });
        return;
      }
      setDraft((d) => {
        if (!d) return d;
        if (d.models.some((m) => m.id === id)) {
          setSaveMsg({ kind: "err", text: "Model id already in the table." });
          return d;
        }
        const n = (v) => {
          const x = Number(v);
          return Number.isFinite(x) && x > 0 ? x : 0;
        };
        setSaveMsg(null);
        return { ...d, models: [...d.models, { id, label: addRow.label.trim() || id, input: n(addRow.input), output: n(addRow.output), cacheRead: n(addRow.cacheRead), cacheWrite: n(addRow.cacheWrite), estimated: false, local: addRow.kind === "local", corp: addRow.kind !== "local" }] };
      });
      setAddRow({ id: "", label: "", input: "", output: "", cacheRead: "", cacheWrite: "" });
    }, [addRow]);
    const discoverLocal = React.useCallback(async () => {
      setDiscovering(true);
      setDiscoverMsg(null);
      try {
        const found = await request("/discover-models");
        const list = Array.isArray(found) ? found : [];
        const known = new Set((draft ? draft.models : []).map((m) => m.id));
        const add = list.filter((lp) => lp && lp.id && !known.has(lp.id));
        if (add.length) {
          const rows = add.map((lp) => ({ id: lp.id, label: lp.label || humanizeModel(lp.id), provider: lp.provider || null, input: lp.input || 0, output: lp.output || 0, cacheRead: lp.cacheRead || 0, cacheWrite: lp.cacheWrite || 0, estimated: !!lp.estimated, local: !!lp.local, corp: !lp.local }));
          setDraft((d) => d ? { ...d, models: [...d.models, ...rows] } : d);
        }
        setDiscoverMsg(add.length ? "Added " + add.length + " provider/model" + (add.length > 1 ? "s" : "") + " from trajectories \u2014 set their kind & rates, then save." : "No new models found \u2014 all already listed.");
      } catch (e) {
        setDiscoverMsg("Scan failed: " + (e instanceof Error ? e.message : String(e)));
      } finally {
        setDiscovering(false);
      }
    }, [draft]);
    React.useEffect(() => {
      const onKey = (e) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);
    let body;
    if (loading) body = jsx("div", { style: { padding: 40, color: "#94a3b8", textAlign: "center" }, children: "Counting the gobbled tokens\u2026" });
    else if (error && !data) body = jsx("div", { style: { padding: 40, color: "#f87171", textAlign: "center" }, children: error });
    else if (!data) body = jsx("div", { style: { padding: 40, color: "#94a3b8", textAlign: "center" }, children: "No data." });
    else {
      const allSessions = breakdown && breakdown.bySession || [];
      const bySession = srcFilter === "all" ? allSessions : allSessions.filter((s) => inSourceFilter(s, srcFilter));
      const byDay = breakdown && breakdown.byDay || [];
      const events = data.events || breakdown && breakdown.events || null;
      const tools = data.tools || breakdown && breakdown.tools || [];
      const wfh = data.split && data.split.wfh || { sessions: 0, tokens: 0, cost: 0, corpCost: null, saved: null, referenceLabel: null };
      const cop = data.split && data.split.corp || { sessions: 0, tokens: 0, cost: 0 };
      const sv = data.savings;
      const refLabel = wfh.referenceLabel || "corp";
      const recentSessions = [...bySession].sort((a, b) => {
        const ta = a.meta?.lastPromptAt ?? a.createdAt ?? 0;
        const tb = b.meta?.lastPromptAt ?? b.createdAt ?? 0;
        return (typeof tb === "string" ? Date.parse(tb) : tb) - (typeof ta === "string" ? Date.parse(ta) : ta);
      }).slice(0, 5);
      const eventsTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
        badgeGrid([
          costCard("WFH compute (local)", money(wfh.cost), fmt(wfh.sessions) + " sessions \xB7 " + fmtC(wfh.tokens) + " tokens", "#34d399"),
          costCard("Corp (billed)", money(cop.cost), fmt(cop.sessions) + " sessions \xB7 " + fmtC(cop.tokens) + " tokens", "#f87171"),
          costCard("Total actual", money(data.actual.cost), "priced from " + data.actual.source, "#fbbf24"),
          costCard("WFH savings", money(wfh.saved != null ? wfh.saved : 0), "local tokens at " + refLabel + " rates vs home lab", "#34d399")
        ]),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 12 }, children: "Activity by event type" }),
          eventChips(events)
        ] }),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 12 }, children: "Top tools (what actually ran)" }),
          toolTable(tools, true)
        ] }),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 12 }, children: "Recent sessions" }),
          recentSessions.length > 0 ? SessionTable({
            rows: recentSessions,
            expandedId: openSession,
            onToggle: setOpenSession,
            drawer: combinedDrawer,
            page: pageFor("overviewSess"),
            setPage: setPageFor("overviewSess"),
            pageSize: 5,
            columns: { turns: false, decode: false, prefill: false, runtime: false, total: true, lastActive: true }
          }) : jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No recent sessions." })
        ] })
      ] });
      const unpriced = (data.byModel || []).filter((m) => m.cost == null);
      const pricingTabEl = pricingTab({
        draft,
        setDraft,
        saving,
        saveMsg,
        onSave: doSave,
        addRow,
        setAddRow,
        onAdd: addModel,
        unpriced,
        onPrefill: (id, label) => {
          setAddRow({ id, label: label === id ? "" : label, input: "", output: "", cacheRead: "", cacheWrite: "" });
          setSaveMsg(null);
        },
        pricingPath: pricingData ? pricingData.path : null,
        fromFile: draft ? draft.fromFile : false,
        discovering,
        discoverMsg,
        onDiscover: discoverLocal
      });
      const costTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
        jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }, children: [
          jsxs("div", { children: [
            jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Cost by day" }),
            dayChart(byDay)
          ] }),
          jsxs("div", { children: [
            jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Cost by session" }),
            sessionChart(bySession)
          ] })
        ] }),
        badgeGrid([
          costCard("WFH compute (local)", money(wfh.cost), fmt(wfh.sessions) + " sessions \xB7 " + fmtC(wfh.tokens) + " tokens", "#34d399"),
          costCard("Corp (billed)", money(cop.cost), fmt(cop.sessions) + " sessions \xB7 " + fmtC(cop.tokens) + " tokens", "#f87171"),
          costCard("Total actual", money(data.actual.cost), "priced from " + data.actual.source, "#fbbf24"),
          costCard("WFH savings", money(wfh.saved != null ? wfh.saved : 0), "local tokens at " + refLabel + " rates vs home lab", "#34d399")
        ]),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 4 }, children: "Cost breakdown by model" }),
          jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Every model you ran, with its token mix (in / out / think / cache), what it cost, how long it ran (TTFT + decode), and how fast it decoded / pre-filled. Think = reasoning tokens (authoritative, else \u2248 chars/4 of the reasoning text). Cache = cache-read tokens (cache write in the tooltip). Decode & prefill are tok/s; TTFT is the average time to the first token." }),
          costModelTable(data.byModel)
        ] }),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "What it would cost the corp (all tokens on one model)" }),
          comparisonTable(data.comparison),
          sv && sv.max > 0 ? jsx("div", { style: { color: "#34d399", fontSize: 13, marginTop: 12, fontWeight: 600 }, children: "\u{1F4B0} You save " + (sv.min > 0 && sv.min < sv.max ? money(sv.min) + "\u2013" + money(sv.max) : money(sv.max)) + " by running local instead of the corp." }) : null
        ] })
      ] });
      const mSec = data.sources && data.sources.projcache ? data.sources.projcache.sessions : breakdown && breakdown.bySession ? breakdown.bySession.length : 0;
      const evC = data.events || null;
      const stepsN = evC && evC.steps || 0;
      const turnsN = evC && evC.turns || 0;
      const T = data.totals || {};
      const tin = T.uncachedInputTokens || 0;
      const tout = T.outputTokens || 0;
      const tc = (T.cacheReadTokens || 0) + (T.cacheWriteTokens || 0);
      const tAll = T.allTokens || tin + tout + tc;
      const mRows = data.byModel || [];
      const tThink = aggregateSessions(bySession).tthink;
      const toolAgg = breakdown && breakdown.toolTokensAggregate || [];
      const tTools = toolAgg.reduce((n, t) => n + (t.total || 0), 0);
      const dec = data.decode || {};
      const pre = data.prefill || {};
      const fastest = mRows.filter((m) => m.tokPerSec != null).sort((a, b) => b.tokPerSec - a.tokPerSec)[0] || null;
      const avg = (tot, denom) => denom > 0 ? Math.round(tot / denom) : null;
      const daySeries2 = daySeries(bySession);
      const dayRows = daySeries2.map((r, i) => ({ ...r, n: i }));
      const dayTick = (v) => {
        const r = dayRows[Math.round(v)];
        return r && r.date ? r.date : "";
      };
      const overTime = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 20 }, children: [
        jsxs("div", { children: [
          jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Daily totals of the token badges (In / Out / Cache / Think / Total) across every session \u2014 log axis, since a day's cache reads in millions and a day's thinking in thousands." }),
          jsx(GraphCanvas, {
            data: dayRows,
            xField: "n",
            xLabel: "day",
            xTickFormat: dayTick,
            series: [
              { key: "in", label: "In", tipName: "in", color: "#60a5fa", unit: "tok", axis: 0, line: true },
              { key: "out", label: "Out", tipName: "out", color: "#a78bfa", unit: "tok", axis: 0, line: true },
              { key: "cache", label: "Cache", tipName: "cache", color: "#2dd4bf", unit: "tok", axis: 0, line: true },
              { key: "think", label: "Think", tipName: "think", color: "#c084fc", unit: "tok", axis: 0, line: true },
              { key: "total", label: "Total", tipName: "total", color: "#fbbf24", unit: "tok", axis: 0, line: true, width: 2 }
            ],
            axes: [{ log: true, unit: "tok" }],
            legendChips: true,
            legendUnit: "tok",
            modeChips: true,
            persistKey: "day-tokens",
            height: 220
          })
        ] }),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 8 }, children: "\u{1F4C8} Over time \u2014 speed" }),
          jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Daily decode & prefill speed (tok/s) on the left axis; average TTFT (seconds) shares the right log axis, whose labels are dropped \u2014 the tooltip carries its value." }),
          jsx(GraphCanvas, {
            data: dayRows,
            xField: "n",
            xLabel: "day",
            xTickFormat: dayTick,
            series: [
              { key: "decode", label: "Decode", tipName: "decode", color: "#38bdf8", unit: "tok/s", axis: 0, line: true, fill: true },
              { key: "prefill", label: "Prefill", tipName: "prefill", color: "#2dd4bf", unit: "tok/s", axis: 0, line: true },
              { key: "ttft", label: "Avg TTFT", tipName: "TTFT", color: "#fbbf24", unit: "s", axis: 1, line: true }
            ],
            axes: [{ unit: "tok/s" }, { log: true, hideLabels: true, unit: "s" }],
            legendChips: true,
            modeChips: true,
            persistKey: "day-speed",
            height: 190
          })
        ] })
      ] });
      const performanceTabEl = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
        overTime,
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "\u26A1 Speed \u2014 totals & averages" }),
          badgeGrid([
            costCard("Decode speed (avg)", dec.tokPerSec != null ? dec.tokPerSec + " tok/s" : "\u2014", fmtC(dec.tokens) + " streamed \xB7 " + fmtMs(dec.ms), "#fbbf24"),
            costCard("Prompt processing (avg)", pre.tokPerSec != null ? pre.tokPerSec + " tok/s" : "\u2014", fmtC(pre.tokens) + " new ctx \xB7 " + fmtMs(pre.ms) + " TTFT", "#2dd4bf"),
            costCard("Avg TTFT", pre.avgTtftMs != null ? fmtMs(pre.avgTtftMs) : "\u2014", "request \u2192 first token", "#38bdf8"),
            costCard("Fastest model", fastest ? fastest.label + " \xB7 " + fastest.tokPerSec + " tok/s" : "\u2014", fastest ? "best decode rate" : "no timing yet", "#a78bfa"),
            costCard("Streamed tokens", fmtC(dec.tokens), "outputs \xB7 " + (dec.steps || 0) + " decode steps", "#60a5fa"),
            costCard("New context tokens", fmtC(pre.tokens), "uncached input \xB7 " + (pre.steps || 0) + " prefill steps", "#34d399")
          ])
        ] }),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "\u{1FA99} Tokens \u2014 totals & averages" }),
          badgeGrid([
            costCard("Input (uncached)", fmtC(tin), "total", "#60a5fa"),
            costCard("Output", fmtC(tout), "total", "#a78bfa"),
            costCard("Cache (read+write)", fmtC(tc), "total", "#2dd4bf"),
            costCard("Thinking", fmtC(tThink), "reasoning tokens", "#c084fc"),
            costCard("Tools (payload)", fmtC(tTools), "tool-call args (chars/4)", "#34d399"),
            costCard("Total tokens", fmtC(tAll), "all buckets", "#fbbf24"),
            costCard("Avg tokens / session", avg(tAll, mSec) != null ? fmtC(avg(tAll, mSec)) : "\u2014", mSec + " sessions", "#fbbf24"),
            costCard("Avg tokens / step", avg(tAll, stepsN) != null ? fmtC(avg(tAll, stepsN)) : "\u2014", stepsN + " LLM steps", "#fb923c"),
            costCard("Avg tokens / turn", avg(tAll, turnsN) != null ? fmtC(avg(tAll, turnsN)) : "\u2014", turnsN + " turns", "#f472b6")
          ]),
          jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: 10, lineHeight: 1.6 }, children: "Averages = grand total \xF7 that granularity (session / LLM step / turn). Thinking = reasoning tokens (exact-usage sessions only; a chars/4 estimate otherwise). Tools = estimated tokens of the actual tool-call arguments (chars/4), NOT the whole step context. Speed badges come from /usage; the per-session detail below comes from /breakdown." })
        ] }),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Per session \u2014 expand for the unified turn \u2192 step table (tokens + speed)" }),
          SessionTable({
            rows: bySession.filter((s) => s.stepTree && s.stepTree.length || s.toolTokens && s.toolTokens.length),
            expandedId: openToken,
            onToggle: setOpenToken,
            drawer: combinedDrawer,
            page: pageFor("combSess"),
            setPage: setPageFor("combSess"),
            pageSize: 25,
            sort: sortState,
            onSort: handleSort,
            sortKey: "perf-sessions",
            empty: jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No combined per-step data yet \u2014 appears once sessions record per-turn usage." })
          })
        ] })
      ] });
      const runsTab = jsx(RunsTab, { bySession });
      const llamaTab = jsx(LlamaMetricsTab, {});
      body = tab === "events" ? eventsTab : tab === "cost" ? costTab : tab === "performance" ? performanceTabEl : tab === "runs" ? runsTab : tab === "daily" ? jsx(DailyTab, { bySession, initialDay }) : tab === "llama" ? llamaTab : pricingTabEl;
    }
    return jsxs("div", { className: "tg-modal-overlay", role: "presentation", children: [
      jsx("div", { className: "tg-modal-mask", "aria-hidden": "true", onClick: onClose }),
      jsxs("div", { className: "tg-modal-panel", role: "dialog", "aria-modal": "true", children: [
        jsxs("div", { className: "tg-modal-header", children: [
          jsxs("div", { children: [
            jsx("div", { style: { fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }, children: "\u{1F983} Token Gobbler \u2014 activity" }),
            jsx("div", { style: { color: "#94a3b8", marginTop: 2, fontSize: 12 }, children: "Events, tools, models and sessions across your whole DSH home." + (importedSummary(data && data.sources) ? " \xB7 " + importedSummary(data && data.sources).text : "") })
          ] }),
          jsxs("div", { style: { display: "flex", gap: 8 }, children: [
            jsx("button", { className: "tg-ghost", onClick: () => loadData(), disabled: refreshing, children: refreshing ? "Refreshing\u2026" : "\u21BB Refresh" }),
            jsx("button", { className: "tg-reprocess", onClick: () => reprocess(), disabled: reprocessing || refreshing, children: reprocessing ? "Reprocessing\u2026" : "\u267B Reprocess" }),
            jsx("button", { className: "tg-close", onClick: onClose, "aria-label": "Close", children: "\u2715" })
          ] })
        ] }),
        reprocessMsg ? jsx("div", { className: "tg-faint", style: { fontSize: 11, padding: "0 20px 10px" }, children: reprocessMsg }) : null,
        jsx("div", { className: "tg-seg", style: { margin: "0 20px 16px" }, children: [segBtn(tab, setTab, "events", "Overview"), segBtn(tab, setTab, "cost", "Cost"), segBtn(tab, setTab, "performance", "Performance"), segBtn(tab, setTab, "runs", "Runs"), segBtn(tab, setTab, "daily", "Daily"), segBtn(tab, setTab, "llama", "Llama Metrics"), segBtn(tab, setTab, "pricing", "Settings")] }),
        // One chip per home — only shown once something is actually imported.
        hasImports() ? jsx("div", { style: { margin: "0 20px 12px" }, children: jsx(SourceFilterBar, {
          value: srcFilter,
          onChange: setSrcFilter,
          rows: breakdown && breakdown.bySession || [],
          compact: true
        }) }) : null,
        jsx("div", { className: "tg-modal-body", children: body })
      ] })
    ] });
  }
  function TokenGobblerOverlay() {
    const [open, setOpen] = React.useState(false);
    const [openTab, setOpenTab] = React.useState("events");
    const [openDay, setOpenDay] = React.useState(null);
    React.useEffect(() => {
      activityRef.open = (tab) => {
        if (tab) setOpenTab(tab);
        setOpenDay(null);
        setOpen(true);
      };
      return () => {
        activityRef.open = null;
      };
    }, []);
    return jsxs(React.Fragment, { children: [
      jsx("style", { children: CSS }),
      jsx("button", { className: "tg-fab", onClick: () => {
        setOpenDay(dayStr(/* @__PURE__ */ new Date()));
        setOpenTab("daily");
        setOpen(true);
      }, title: "Token Gobbler \u2014 today's daily entry", "aria-label": "Open today's daily entry", children: "\u{1F983}" }),
      open ? jsx(TokenGobblerModal, { onClose: () => setOpen(false), initialTab: openTab, initialDay: openDay }) : null
    ] });
  }
  var inject = ["slots"];
  function apply(ctx) {
    ctx.slots.inject("settings.section", () => ctx.slots.register({
      name: "settings.section",
      id: "token-gobbler",
      order: 12,
      locale: NS,
      label: () => text("nav")
    }, TokenGobblerSettings));
    ctx.slots.inject("shell.overlay", () => ctx.slots.register({
      name: "shell.overlay",
      id: "token-gobbler",
      order: 50,
      label: () => "Token Gobbler"
    }, TokenGobblerOverlay));
  }
  function createSurfaces() {
    return { apply, inject };
  }

  // client/index.ts
  window.__ModuleLoader__.load({
    id: "token-gobbler",
    factory: (require2) => {
      const React2 = require2("react");
      const rt = require2("react/jsx-runtime");
      const w = window;
      w.React = React2;
      w.jsx = rt.jsx;
      w.jsxs = rt.jsxs;
      w.Fragment = rt.Fragment;
      return createSurfaces();
    }
  });
})();

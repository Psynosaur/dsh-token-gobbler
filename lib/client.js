"use strict";
(() => {
  // client/token-gobbler.css
  var token_gobbler_default = "/* token-gobbler \xB7 scoped styles */\n\n/* \u2500\u2500 base \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-root,.tg-modal-overlay{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e5e7eb;line-height:1.45}\n.tg-root *,.tg-modal-overlay *{box-sizing:border-box}\n.tg-num{font-variant-numeric:tabular-nums;font-feature-settings:'tnum'}\n\n/* \u2500\u2500 cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-card{background:linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015));border:1px solid rgba(255,255,255,0.08);border-radius:14px}\n.tg-label{font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#94a3b8}\n.tg-faint{color:#64748b}\n.tg-sec{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#64748b}\n.tg-muted{color:#94a3b8}\n\n/* \u2500\u2500 stat cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-stat{padding:14px 16px;transition:border-color .15s ease,transform .15s ease}\n.tg-stat:hover{border-color:rgba(255,255,255,0.2);transform:translateY(-2px)}\n.tg-stat-dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex:none}\n.tg-stat-value{font-size:22px;font-weight:700;margin-top:7px;letter-spacing:-0.01em}\n.tg-stat-total{border-color:rgba(251,191,36,0.35);background:linear-gradient(180deg,rgba(251,191,36,0.10),rgba(255,255,255,0.02))}\n.tg-stat-total .tg-stat-value{color:#fbbf24;font-size:24px}\n\n/* \u2500\u2500 hero / WFH \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-hero{padding:18px 20px;background:linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.1)}\n.tg-hero-value{font-size:34px;font-weight:800;letter-spacing:-0.02em;margin-top:2px}\n.tg-wfh{padding:18px 20px;background:linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.02));border:1px solid rgba(16,185,129,0.32)}\n.tg-wfh-value{font-size:28px;font-weight:800;letter-spacing:-0.02em;margin-top:2px;color:#34d399}\n.tg-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:5px 11px;border-radius:999px;background:rgba(16,185,129,0.16);border:1px solid rgba(16,185,129,0.35);color:#34d399;white-space:nowrap}\n\n/* \u2500\u2500 segmented control \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-seg{display:inline-flex;gap:3px;padding:3px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px}\n.tg-seg-btn{font-size:12px;font-weight:600;padding:5px 13px;border-radius:7px;border:none;cursor:pointer;color:#94a3b8;background:transparent;transition:background .15s ease,color .15s ease}\n.tg-seg-btn:hover{color:#e5e7eb}\n.tg-seg-btn.active{background:rgba(251,191,36,0.16);color:#fde68a}\n\n/* \u2500\u2500 tables \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-table{width:100%;border-collapse:separate;border-spacing:0;font-size:13px}\n.tg-th{text-align:left;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#94a3b8;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.12);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}\n.tg-sticky .tg-th{position:sticky;top:0;z-index:2;background:#0d1524}\n.tg-th-r{text-align:right}\n.tg-td{padding:11px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:#e5e7eb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}\n.tg-td-r{text-align:right}\n.tg-tr{transition:background .12s ease}\n.tg-tr:hover{background:rgba(255,255,255,0.03)}\n.tg-tr:last-child .tg-td{border-bottom:none}\n.tg-tr.tg-total td{border-top:2px solid rgba(251,191,36,0.3);background:rgba(251,191,36,0.05)}\n.tg-tr.tg-total:hover td{background:rgba(251,191,36,0.08)}\n.tg-kind{font-size:12px;font-weight:600}\n/* Archived sessions (archived in the DSH GUI): dimmed row + \u{1F4E6} marker in the title. */\n.tg-tr.tg-archived .tg-td{opacity:0.5}\n.tg-archived-badge{font-size:10px;margin-right:2px;filter:grayscale(0.4)}\n\n/* \u2500\u2500 scroll containers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-scroll{overflow-x:auto}\n.tg-scroll::-webkit-scrollbar{height:8px}\n.tg-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:4px}\n.tg-scroll::-webkit-scrollbar-track{background:transparent}\n.tg-tscroll{overflow:visible}\n\n/* \u2500\u2500 buttons \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-refresh{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;padding:7px 14px;border-radius:9px;cursor:pointer;border:1px solid rgba(251,191,36,0.4);background:rgba(251,191,36,0.12);color:#fde68a;transition:background .15s ease,transform .1s ease,border-color .15s ease;white-space:nowrap}\n.tg-refresh:hover{background:rgba(251,191,36,0.2);border-color:rgba(251,191,36,0.6)}\n.tg-refresh:active{transform:scale(0.97)}\n.tg-refresh:disabled{opacity:0.55;cursor:default}\n.tg-reprocess{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;padding:7px 14px;border-radius:9px;cursor:pointer;border:1px solid rgba(167,139,250,0.4);background:rgba(167,139,250,0.12);color:#c4b5fd;transition:background .15s ease,transform .1s ease,border-color .15s ease;white-space:nowrap}\n.tg-reprocess:hover{background:rgba(167,139,250,0.22);border-color:rgba(167,139,250,0.6)}\n.tg-reprocess:active{transform:scale(0.97)}\n.tg-reprocess:disabled{opacity:0.55;cursor:default}\n.tg-ghost{font-size:12px;font-weight:600;padding:7px 12px;border-radius:9px;cursor:pointer;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:#cbd5e1;transition:background .15s ease,border-color .15s ease;white-space:nowrap}\n.tg-ghost:hover{background:rgba(255,255,255,0.09);border-color:rgba(255,255,255,0.24)}\n.tg-ghost:disabled{opacity:0.55;cursor:default}\n\n/* \u2500\u2500 FAB \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-fab{position:fixed;bottom:22px;right:22px;z-index:1;width:46px;height:46px;border-radius:50%;border:1px solid rgba(251,191,36,0.45);background:rgba(20,16,8,0.82);backdrop-filter:blur(8px);box-shadow:0 8px 24px rgba(0,0,0,0.45);cursor:pointer;font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;transition:transform .12s ease,background .15s ease,border-color .15s ease}\n.tg-fab:hover{transform:scale(1.06);background:rgba(40,30,12,0.9);border-color:rgba(251,191,36,0.7)}\n.tg-fab:active{transform:scale(0.97)}\n\n/* \u2500\u2500 modal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-modal-overlay{position:fixed;inset:0;z-index:2;display:flex;align-items:center;justify-content:center}\n.tg-modal-mask{position:absolute;inset:0;background:rgba(2,6,12,0.62);backdrop-filter:blur(3px)}\n.tg-modal-panel{position:relative;z-index:1;width:min(2360px,calc(100vw - 48px));height:min(1720px,calc(100vh - 48px));background:linear-gradient(180deg,#0e1626,#0b111d);border:1px solid rgba(255,255,255,0.1);border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,0.6);display:flex;flex-direction:column;overflow:hidden;color:#e5e7eb}\n.tg-modal-header{flex:none;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:18px 20px 14px;border-bottom:1px solid rgba(255,255,255,0.07)}\n.tg-close{cursor:pointer;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:#cbd5e1;font-size:14px;display:flex;align-items:center;justify-content:center;transition:background .15s ease,border-color .15s ease,color .15s ease}\n.tg-close:hover{background:rgba(248,113,113,0.18);border-color:rgba(248,113,113,0.4);color:#fca5a5}\n.tg-modal-body{flex:1;min-height:0;overflow:auto;padding:20px}\n.tg-modal-body::-webkit-scrollbar{width:10px;height:8px}\n.tg-modal-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:5px}\n\n/* \u2500\u2500 chips \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* auto-FIT (not auto-fill): with the doubled modal width, unused tracks collapse\n   so the actual chips/cards stretch to fill the whole row instead of leaving a\n   dead column of empty space on the right. */\n.tg-chipgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}\n.tg-chip{display:flex;align-items:center;gap:8px;padding:11px 13px;background:linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015));border:1px solid rgba(255,255,255,0.08);border-radius:12px}\n.tg-chip-label{font-size:12px;color:#94a3b8;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.tg-chip-value{font-size:16px;font-weight:700;color:#f1f5f9}\n.tg-bar{height:8px;border-radius:4px;background:linear-gradient(90deg,#f59e0b,#fbbf24);min-width:2px}\n\n/* \u2500\u2500 rows / chevrons \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-row-btn{cursor:pointer}\n.tg-chev{display:inline-block;width:14px;font-size:10px;color:#64748b;transition:transform .15s ease}\n.tg-chev.open{transform:rotate(90deg);color:#fbbf24}\n\n/* \u2500\u2500 TgTable pager + drawer cell \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-pager{display:flex;align-items:center;gap:10px;padding:8px 4px}\n.tg-drawer-cell{padding:0;border-bottom:1px solid rgba(255,255,255,0.08);min-width:0;width:100%;box-sizing:border-box}\n\n/* \u2500\u2500 badge grid (shared costCard row: Cost / Combined / Daily tabs) \u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-badgegrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}\n\n/* active state for ghost buttons (the heatmap range switchers) \u2014 matches the\n   segmented control's active look */\n.tg-ghost.active{background:rgba(251,191,36,0.16);border-color:rgba(251,191,36,0.45);color:#fde68a}\n\n/* \u2500\u2500 Daily tab: calendar heatmap \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-day{display:flex;flex-direction:column;gap:20px}\n.tg-day-ov{display:flex;flex-direction:column;gap:18px;scroll-margin-top:8px}\n.tg-day-ov-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.tg-heat-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:10px}\n.tg-heat-ranges{display:flex;gap:6px;align-items:center}\n.tg-heat-scroll{position:relative;overflow-x:auto;border-radius:10px}\n.tg-heat-months{margin-bottom:4px;min-height:14px}\n.tg-heat-month{font-size:10px;color:#64748b;font-weight:600;white-space:nowrap;overflow:visible}\n/* 1fr columns + 1fr rows so the grid spans the full modal width; the dynamic\n   part (min-width floor, the months' repeat(weeks,1fr) template) stays inline */\n.tg-heat-cells{width:100%;height:280px;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;grid-template-rows:repeat(7,1fr);column-gap:4px;row-gap:4px}\n.tg-heat-cell{border-radius:4px;outline-offset:1px}\n.tg-heat-cell.clickable{cursor:pointer}\n.tg-heat-cell.out{opacity:0.35}\n.tg-heat-cell.today{outline:1.5px solid rgba(248,250,252,0.75)}\n.tg-heat-cell.selected{outline:1.5px solid #fbbf24}\n.tg-heat-legend{display:flex;justify-content:flex-end;align-items:center;gap:4px;margin-top:4px}\n.tg-heat-sw{width:11px;height:11px;border-radius:3px;display:inline-block}\n\n/* fixed-position day tooltip \u2014 rendered as a sibling of the scroll wrapper;\n   position:fixed anchors it to the cursor so NOTHING can clip it */\n.tg-tip{position:fixed;z-index:60;pointer-events:none;width:280px;background:#0d1524;border:1px solid rgba(255,255,255,0.14);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.5);padding:10px 12px;font-size:11.5px}\n.tg-tip-date{font-weight:700;color:#f1f5f9;font-size:12px}\n.tg-tip-sub{color:#94a3b8;margin-top:2px;font-size:11px}\n.tg-tip-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 10px;margin-top:7px}\n.tg-tip-k{color:#64748b}\n.tg-tip-total{color:#fbbf24}\n.tg-tip-foot{font-size:10px;margin-top:7px}\n\n/* \u2500\u2500 drawer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-drawer-row{background:rgba(255,255,255,0.02)}\n.tg-drawer-inner{padding:16px 18px 18px 42px;display:flex;flex-direction:column;gap:16px;width:100%;min-width:0;max-width:100%;box-sizing:border-box}\n/* scrollable sub-tables inside drawers (per-step, tool payload, etc.) */\n.tg-scrollable{max-height:320px;overflow-y:auto;overscroll-behavior:contain;border-radius:8px}\n.tg-scrollable::-webkit-scrollbar{width:7px}\n.tg-scrollable::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.10);border-radius:4px}\n.tg-scrollable::-webkit-scrollbar-track{background:transparent}\n.tg-group td{padding:8px 12px 4px;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#64748b;border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);position:sticky;top:0}\n/* meta cards stretch to fill the drawer width (auto-fit collapses empty tracks) */\n.tg-meta-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}\n.tg-meta{background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px 13px;min-width:0}\n.tg-meta-k{font-size:10.5px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#64748b}\n.tg-meta-v{font-size:13.5px;color:#e5e7eb;margin-top:4px;word-break:break-word}\n.tg-drawer-sec{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#94a3b8;margin-bottom:8px}\n.tg-drawer-sub{font-size:11px;font-weight:600;color:#64748b;margin-bottom:6px}\n.tg-turn{border-left:2px solid rgba(251,191,36,0.45);padding:6px 12px;margin-bottom:8px;background:rgba(255,255,255,0.02);border-radius:0 8px 8px 0}\n.tg-turn-p{font-size:12.5px;color:#e5e7eb;font-weight:600;word-break:break-word}\n.tg-turn-r{font-size:12px;color:#94a3b8;margin-top:4px;line-height:1.5;word-break:break-word}\n\n/* \u2500\u2500 inputs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-input{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:7px;color:#e5e7eb;font-size:12.5px;padding:6px 8px;font-variant-numeric:tabular-nums;min-width:0}\n.tg-input:focus{outline:none;border-color:rgba(251,191,36,0.55)}\n.tg-input-num{text-align:right;-webkit-appearance:none;-moz-appearance:textfield;appearance:textfield}\n/* hide number spinners \u2014 they reserve a box that crowds the right-aligned value */\n.tg-input-num::-webkit-outer-spin-button,.tg-input-num::-webkit-inner-spin-button{-webkit-appearance:none;appearance:none;margin:0}\n.tg-input-label{width:100%}\n.tg-input-id{width:100%;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:#94a3b8}\n\n/* \u2500\u2500 pricing rate field (2-col grid inside a card) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-rate-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px}\n.tg-rate-field{display:flex;flex-direction:column;gap:4px;min-width:0}\n.tg-rate-field input{width:100%;min-width:0}\n\n/* \u2500\u2500 perf bar chart (reusable metricBars) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* (metricBars was replaced by amCharts \u2014 see client/amchart.tsx. These legacy\n   classes are kept only as a fallback and for the simple tool-share bar.) */\n/* .tg-chart is width:100% + min/max-width:0 so a chart with hundreds of bars\n   never expands its parent (the drawer <td> / modal) \u2014 the bars scroll inside\n   .tg-barchart instead. Legend is a bullet list outside the chart. */\n.tg-chart{display:flex;flex-direction:column;gap:8px;width:100%;min-width:0;max-width:100%}\n.tg-barchart{display:flex;align-items:flex-end;gap:3px;overflow-x:auto;width:100%;min-width:0;max-width:100%;padding:0 2px 2px}\n.tg-barchart::-webkit-scrollbar{height:7px}\n.tg-barchart::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.10);border-radius:4px}\n.tg-barstep{display:flex;flex-direction:column;align-items:center;gap:2px;flex:none;min-width:24px}\n.tg-bararea{height:150px;display:flex;align-items:flex-end;gap:2px}\n.tg-bar{width:9px;border-radius:2px 2px 0 0;min-height:2px}\n.tg-bar-decode{background:#38bdf8}\n.tg-bar-prefill{background:#2dd4bf}\n.tg-bar-in{background:#60a5fa}\n.tg-bar-out{background:#a78bfa}\n.tg-bar-cache{background:#2dd4bf}\n.tg-bar-think{background:#c084fc}\n.tg-barstep-x{font-size:9px;color:#64748b;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}\n.tg-barstep-sub{font-size:8px;color:#64748b;max-width:56px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.tg-legend{list-style:disc;margin:0;padding-left:20px;font-size:11px;color:#94a3b8;display:flex;flex-direction:column;gap:3px}\n.tg-legend-i{display:flex;align-items:center;gap:6px}\n.tg-legend-dot{width:10px;height:10px;border-radius:2px;display:inline-block;flex:none}\n\n/* \u2500\u2500 amCharts column chart (reusable AmBarChart) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* amCharts renders an SVG sized to its container; the container is width:100%\n   and min-width:0, so a chart with hundreds of categories stays inside the\n   drawer <td> / modal instead of pushing it wide. */\n.tg-amchart{width:100%;min-width:0;max-width:100%;position:relative;border-radius:10px;overflow:hidden}\n.tg-amchart-err{display:flex;align-items:center;justify-content:center;color:#f87171;font-size:12.5px;padding:12px}\n/* wrapper so the turn chips sit above the chart without widening it */\n.tg-amchart-wrap{width:100%;min-width:0;max-width:100%;display:flex;flex-direction:column;gap:8px}\n/* turn chips \u2014 one per turn; click to zoom the chart to that turn */\n.tg-turn-chips{display:flex;flex-wrap:wrap;gap:6px}\n.tg-turn-chip{font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#94a3b8;cursor:pointer;white-space:nowrap;transition:background .12s ease,color .12s ease,border-color .12s ease}\n.tg-turn-chip:hover{background:rgba(255,255,255,0.1);color:#e5e7eb}\n.tg-turn-chip.active{background:rgba(251,191,36,0.16);color:#fde68a;border-color:rgba(251,191,36,0.4)}\n/* legend chips \u2014 one per series group (context window); click to hide/show it.\n   Swatch = the window's paired lines: solid (decode) over dotted (prefill). */\n.tg-legend-chip{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#cbd5e1;cursor:pointer;white-space:nowrap;transition:background .12s ease,opacity .12s ease}\n.tg-legend-chip:hover{background:rgba(255,255,255,0.1)}\n.tg-legend-chip .sw{display:inline-flex;flex-direction:column;gap:3px;width:16px;flex:none}\n.tg-legend-chip .sw i{display:block;width:100%;height:0;border-top:2px solid #888}\n.tg-legend-chip .sw i.dash{border-top-style:dotted}\n.tg-legend-chip .sw i.dot{width:7px;height:7px;border:0;border-radius:50%;margin:0 auto}\n.tg-legend-chip.off{opacity:0.38}\n.tg-legend-chip.static{cursor:default}\n.tg-legend-chip.static:hover{background:rgba(255,255,255,0.04)}\n.tg-xmin-row{display:flex;align-items:center;gap:8px;justify-content:flex-end;margin:0 0 4px}\n.tg-xmin{width:110px;font-size:11px;padding:2px 6px;border-radius:6px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.05);color:#e2e8f0;outline:none}\n.tg-xmin:focus{border-color:rgba(96,165,250,0.6)}\n.tg-xmin-clear{font-size:13px;line-height:1;padding:1px 5px;border:0;border-radius:6px;background:rgba(255,255,255,0.08);color:#94a3b8;cursor:pointer}\n.tg-xmin-clear:hover{background:rgba(255,255,255,0.16);color:#e2e8f0}\n\n/* \u2500\u2500 collapse (reusable) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-collapse{display:flex;flex-direction:column;gap:8px}\n.tg-collapse-head{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:#cbd5e1;padding:6px 11px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;width:fit-content;transition:background .12s ease,border-color .12s ease}\n.tg-collapse-head:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.18)}\n\n/* \u2500\u2500 misc \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* delete button \u2014 same height & radius as the corp/local <select> (.tg-input) so they\n   sit level in the card-header flex row. padding:6px 11px + line-height:1.45 \u2248 30px. */\n.tg-del{cursor:pointer;color:#64748b;font-size:12.5px;line-height:1.45;padding:6px 11px;border-radius:7px;border:1px solid rgba(255,255,255,0.1);background:transparent;transition:color .12s ease,border-color .12s ease,background .12s ease}\n.tg-del:hover{color:#fca5a5;border-color:rgba(248,113,113,0.4);background:rgba(248,113,113,0.10)}\n.tg-flash-ok{color:#34d399;font-size:12.5px;font-weight:600}\n.tg-flash-err{color:#f87171;font-size:12.5px;font-weight:600}\n.tg-refrow{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:14px 16px}\n.tg-kind-badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;white-space:nowrap}\n\n/* \u2500\u2500 compaction: COMPACTED banner rows (step table) + detail popup \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* the monospace COMPACTED badge (shared by the banner row and the popup header) */\n.tg-comp-badge{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:800;letter-spacing:0.08em;padding:3px 9px;border-radius:6px;background:rgba(251,191,36,0.15);border:1px solid rgba(251,191,36,0.4);color:#fbbf24;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:nowrap;flex:none}\n/* banner row in the step table \u2014 a full-width clickable strip between turns */\n.tg-comp-row td{background:rgba(251,191,36,0.06);border-top:1px solid rgba(251,191,36,0.28);border-bottom:1px solid rgba(251,191,36,0.28);cursor:pointer;padding:6px 12px}\n.tg-comp-row:hover td{background:rgba(251,191,36,0.13)}\n.tg-comp-row-fail td{background:rgba(248,113,113,0.06);border-color:rgba(248,113,113,0.32)}\n.tg-comp-row-fail:hover td{background:rgba(248,113,113,0.13)}\n.tg-comp-row-fail .tg-comp-badge{background:rgba(248,113,113,0.15);border-color:rgba(248,113,113,0.45);color:#f87171}\n/* running = compaction in progress (start seen, no end yet) \u2014 neutral indigo,\n   deliberately NOT red (red is reserved for genuine failures) */\n.tg-comp-row-run td{background:rgba(129,140,248,0.06);border-color:rgba(129,140,248,0.32)}\n.tg-comp-row-run:hover td{background:rgba(129,140,248,0.13)}\n.tg-comp-row-run .tg-comp-badge,.tg-comp-badge-run{background:rgba(129,140,248,0.15);border-color:rgba(129,140,248,0.45);color:#a5b4fc}\n.tg-comp-banner{display:flex;align-items:center;gap:10px;width:100%;min-width:0}\n.tg-comp-row-meta{font-size:11px;color:#94a3b8;margin-left:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n/* the detail popup \u2014 a smaller panel than the main modal */\n.tg-comp-panel{width:min(980px,calc(100vw - 48px))!important;height:min(780px,calc(100vh - 48px))!important}\n/* Fixed-height modal: header + meta grid never scroll \u2014 only the summary box. */\n.tg-comp-panel .tg-modal-body{display:flex;flex-direction:column;overflow:hidden}\n.tg-comp-body{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}\n.tg-comp-summary-wrap{flex:1;min-height:0;display:flex;flex-direction:column;margin-top:8px}\n.tg-comp-summary{flex:1;min-height:0;word-break:break-word;font-size:12.5px;line-height:1.55;color:#cbd5e1;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px 14px;overflow-y:auto}\n/* markdown rendering inside the summary box (client/markdown.tsx) */\n.tg-md{font-size:12.5px;line-height:1.55;color:#cbd5e1}\n.tg-md h1{font-size:15px;font-weight:700;color:#e2e8f0;margin:12px 0 6px}\n.tg-md h2{font-size:13.5px;font-weight:700;color:#e2e8f0;margin:12px 0 5px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.08)}\n.tg-md h3,.tg-md h4,.tg-md h5,.tg-md h6{font-size:12.5px;font-weight:700;color:#e2e8f0;margin:10px 0 4px}\n.tg-md>:first-child{margin-top:0}\n.tg-md p{margin:0 0 8px}\n.tg-md ul,.tg-md ol{margin:0 0 8px;padding-left:20px}\n.tg-md li{margin:2px 0}\n.tg-md li>ul,.tg-md li>ol{margin:2px 0 4px}\n.tg-md code{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.09);border-radius:4px;padding:1px 5px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;word-break:break-word}\n.tg-md pre{background:rgba(2,6,12,0.55);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 12px;margin:0 0 8px;overflow-x:auto}\n.tg-md pre code{background:none;border:none;padding:0;font-size:11px;line-height:1.5;white-space:pre}\n.tg-md blockquote{border-left:3px solid rgba(255,255,255,0.16);padding:2px 0 2px 12px;margin:0 0 8px;color:#94a3b8}\n.tg-md hr{border:none;border-top:1px solid rgba(255,255,255,0.1);margin:10px 0}\n.tg-md a{color:#7dd3fc;text-decoration:underline}\n.tg-md del{color:#64748b}\n.tg-md table{border-collapse:collapse;margin:0 0 8px;font-size:12px}\n.tg-md th,.tg-md td{border:1px solid rgba(255,255,255,0.1);padding:4px 8px;text-align:left}\n.tg-md th{background:rgba(255,255,255,0.05);font-weight:700;color:#e2e8f0}\n.tg-comp-summary::-webkit-scrollbar{width:7px}\n.tg-comp-summary::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.10);border-radius:4px}\n.tg-comp-summary::-webkit-scrollbar-track{background:transparent}\n";

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
    { key: "turns", label: "Turns", color: "#fbbf24" },
    { key: "userStops", label: "User stops", color: "#f87171" },
    { key: "compactions", label: "Compactions", color: "#f472b6" },
    { key: "retries", label: "LLM retries", color: "#fb923c" },
    { key: "approvals", label: "Approvals", color: "#f87171" },
    { key: "todos", label: "Todo writes", color: "#a3e635" },
    { key: "commands", label: "Commands", color: "#38bdf8" }
  ];
  var CACHE_VERSION = 4;
  var CACHE_KEY = "tg:cache:v" + CACHE_VERSION;
  var PREV_KEYS = ["tg:cache:v1", "tg:cache:v2", "tg:cache:v3"];
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
    return sticky ? jsx("div", { className: "tg-tscroll", children: table }) : table;
  };

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
  var TgTable = (opts) => {
    const { columns, rows, rowKey, expandedId, onToggle, drawer, page = 0, setPage, pageSize = 0, groupBy, empty, compact, rowClass } = opts;
    const hasDrawer = !!drawer;
    if (!rows || !rows.length) return empty || jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No data." });
    const total = rows.length;
    const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
    const safePage = page >= totalPages ? totalPages - 1 : Math.max(0, page);
    const pageRows = pageSize > 0 ? rows.slice(safePage * pageSize, (safePage + 1) * pageSize) : rows;
    const colSpan = columns.length + (hasDrawer ? 1 : 0);
    const groups = groupRows(pageRows, groupBy);
    const renderRow = (r) => {
      const key = rowKey(r);
      const open = hasDrawer && expandedId === key;
      const rowEl = jsxs("tr", {
        className: "tg-tr" + (hasDrawer ? " tg-row-btn" : "") + (compact ? " tg-compact" : "") + (rowClass && rowClass(r) ? " " + rowClass(r) : ""),
        onClick: hasDrawer ? () => {
          if (onToggle) onToggle(open ? null : key);
        } : void 0,
        style: open ? { background: "rgba(251,191,36,0.05)" } : void 0,
        children: [
          hasDrawer ? tdL(jsx("span", { className: "tg-chev" + (open ? " open" : ""), children: "\u25B6" }, "chev-" + key)) : null,
          ...columns.map((c) => {
            const v = c.render ? c.render(r) : r[c.key] ?? c.fallback ?? "\u2014";
            const cellProps = typeof c.props === "function" ? c.props(r) : c.props;
            return c.align === "r" ? tdR(v, cellProps) : tdL(v, cellProps);
          })
        ]
      }, key);
      if (!open) return [rowEl];
      return [rowEl, jsx("tr", { className: "tg-drawer-row", children: jsx("td", { className: "tg-drawer-cell", colSpan, children: drawer(r) }) }, key + "-drawer")];
    };
    return jsxs("div", { className: "tg-tscroll", children: [
      jsxs("table", { className: "tg-table tg-sticky", style: hasDrawer ? { tableLayout: "fixed", width: "100%" } : void 0, children: [
        jsx("tr", { children: [hasDrawer ? thL("") : null, ...columns.map((c) => c.align === "r" ? thR(c.label) : thL(c.label))] }),
        ...groups.flatMap((g) => g.label ? [jsx("tr", { className: "tg-group", children: jsx("td", { colSpan, children: g.label }) }, g.label + "-g")] : []),
        ...pageRows.flatMap(renderRow)
      ] }),
      pageSize > 0 && totalPages > 1 ? jsxs("div", { className: "tg-pager", children: [
        jsx("button", { className: "tg-ghost", disabled: safePage <= 0, onClick: () => setPage && setPage(safePage - 1), children: "\u2039 Prev" }),
        jsx("span", { className: "tg-faint", style: { fontSize: 12 }, children: safePage + 1 + " / " + totalPages + " \xB7 " + total + " rows" }),
        jsx("button", { className: "tg-ghost", disabled: safePage >= totalPages - 1, onClick: () => setPage && setPage(safePage + 1), children: "Next \u203A" })
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
  var sessionTitle = (s) => s.archived ? jsxs("span", { title: "archived in DSH", children: [jsx("span", { className: "tg-archived-badge" }, "\u{1F4E6}"), " ", s.title || s.cwd || s.id] }) : s.title || s.cwd || s.id;
  var sessionColumns = (o = {}) => {
    const { turns = false, decode = true, prefill = true, runtime = true, total = true, lastActive = false, tin = false, tout = false, tcache = false } = o;
    return [
      { key: "date", label: "Date" },
      { key: "title", label: "Session", render: sessionTitle },
      lastActive ? { key: "lastActive", label: "Last Active", align: "r", render: lastActiveLabel, props: { style: { color: "#94a3b8", fontSize: 12 } } } : null,
      { key: "modelMix", label: "Models", render: (s) => s.modelMix, props: { style: { whiteSpace: "normal", wordBreak: "break-word", overflow: "visible", textOverflow: "unset" } } },
      turns ? { key: "turns", label: "Turns", align: "r", render: (s) => (s.stepTree || []).length || "\u2014" } : null,
      { key: "steps", label: "Steps", align: "r", render: (s) => s.events ? s.events.steps || 0 : "\u2014" },
      decode ? { key: "tokPerSec", label: "Decode", align: "r", render: (s) => s.tokPerSec != null ? s.tokPerSec + " tok/s" : "\u2014" } : null,
      prefill ? { key: "prefillPerSec", label: "Prefill", align: "r", render: sessionPrefill, props: (s) => ({ title: "prompt processing = new (uncached) input tokens \xF7 TTFT across all " + (s.steps || []).length + " step(s)" }) } : null,
      runtime ? { key: "runtime", label: "Runtime", align: "r", render: sessionRuntime, props: { title: "session runtime = sum of (TTFT + decode time) across all steps \u2014 decode already contains the thinking window, so it is not added again" } } : null,
      tin ? { key: "tin", label: "In", align: "r", render: (s) => fmtC(s.uncachedInputTokens), props: (s) => ({ title: fmt(s.uncachedInputTokens) }) } : null,
      tout ? { key: "tout", label: "Out", align: "r", render: (s) => fmtC(s.outputTokens), props: (s) => ({ title: fmt(s.outputTokens) }) } : null,
      tcache ? { key: "tcache", label: "Cache", align: "r", render: (s) => fmtC(s.cacheReadTokens), props: (s) => ({ title: fmt(s.cacheReadTokens) }) } : null,
      total ? { key: "allTokens", label: "Total", align: "r", render: (s) => fmtC(s.allTokens), props: { style: { fontWeight: 600 } } } : null
    ].filter(Boolean);
  };
  var sessionCostColumns = [
    { key: "date", label: "Date" },
    { key: "title", label: "Session", render: sessionTitle, props: (s) => ({ style: { maxWidth: 180, whiteSpace: "normal", wordBreak: "break-word" }, title: (s.archived ? "archived in DSH \u2014 " : "") + (s.title || s.cwd || s.id) }) },
    { key: "modelMix", label: "Models used", render: (s) => s.modelMix, props: (s) => ({ style: { maxWidth: 200, whiteSpace: "normal", wordBreak: "break-word", fontSize: 12, color: "#94a3b8" }, title: (s.models || []).map((m) => (m.label || m.key) + " \xD7" + m.steps).join("\n") }) },
    { key: "steps", label: "Steps", align: "r", render: (s) => s.events ? String(s.events.steps || 0) : "\u2014" },
    { key: "tools", label: "Tools", align: "r", render: (s) => s.events ? String((s.events.toolCalls || 0) + (s.events.toolSubCalls || 0)) : "\u2014" },
    { key: "tin", label: "In", align: "r", render: (s) => fmtC(s.uncachedInputTokens), props: (s) => ({ title: fmt(s.uncachedInputTokens) }) },
    { key: "tout", label: "Out", align: "r", render: (s) => fmtC(s.outputTokens), props: (s) => ({ title: fmt(s.outputTokens) }) },
    { key: "tcache", label: "CacheR", align: "r", render: (s) => fmtC(s.cacheReadTokens), props: (s) => ({ title: fmt(s.cacheReadTokens) }) },
    { key: "allTokens", label: "Total", align: "r", render: (s) => fmtC(s.allTokens), props: (s) => ({ style: { fontWeight: 700 }, title: fmt(s.allTokens) }) },
    { key: "cost", label: "Cost", align: "r", render: (s) => s.cost != null ? money(s.cost) : "\u2014", props: { style: { fontWeight: 600, color: "#fde68a" } } }
  ];
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
    rowClass: (s) => s.archived ? "tg-archived" : ""
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

  // client/amchart.tsx
  var CDN = "/token-gobbler/vendor/";
  var FILES = [
    { src: "index.js", global: "am5" },
    { src: "xy.js", global: "am5xy" },
    { src: "themes/Animated.js", global: "am5themes_Animated" },
    { src: "themes/Dark.js", global: "am5themes_Dark" }
  ];
  var amPromise = null;
  function loadAmCharts() {
    if (amPromise) return amPromise;
    amPromise = new Promise((resolve, reject) => {
      const w = window;
      const ready = () => w.am5 && w.am5xy && w.am5themes_Animated && w.am5themes_Dark;
      if (ready()) {
        resolve(w);
        return;
      }
      let i = 0;
      const next = () => {
        if (i >= FILES.length) {
          ready() ? resolve(w) : reject(new Error("amCharts globals missing after load"));
          return;
        }
        const f = FILES[i++];
        if (w[f.global]) {
          next();
          return;
        }
        const s = document.createElement("script");
        s.src = CDN + f.src;
        s.async = true;
        s.onload = () => next();
        s.onerror = () => reject(new Error("Failed to load " + CDN + f.src));
        document.head.appendChild(s);
      };
      next();
    });
    return amPromise;
  }
  var sig = (p) => {
    const perSeries = p.series.some((s) => s.data);
    const cells = perSeries ? p.series.map((s) => (s.data || p.data).map((r) => (p.xField ? (Number(r[p.xField]) || 0) + "." : "") + (Number(r[s.key]) || 0)).join(",")).join("|") : p.data.map((r) => p.series.map((s) => Number(r[s.key]) || 0).join(".")).join(",");
    return (p.categoryField || "") + "|x" + (p.xField || "") + "|n" + p.data.length + "|" + p.series.map((s) => s.key + ":" + s.color + ":" + (s.axis || 0) + ":" + (s.data ? s.data.length : 0) + ":" + (s.group || "") + (s.line ? "L" : "") + (s.dash ? "D" : "") + (s.regime != null ? "R" + s.regime : "")).join(",") + "|k" + (p.kind || "column") + "|sm" + (p.smooth ? 1 : 0) + "|st" + (p.stacked ? 1 : 0) + "|lg" + (p.log ? 1 : 0) + "|hz" + (p.horizontal ? 1 : 0) + "|h" + (p.height ?? 260) + "|lc" + (p.legendChips ? 1 : 0) + "|ch" + (p.chips || []).map((c) => c.k + ":" + c.color).join(",") + "|mc" + (p.metricChips || []).map((c) => c.k).join(",") + "|xm" + (p.xMinControl ? 1 : 0) + "|la" + (p.logAxes || []).join(",") + "|hal" + (p.hideAxisLabels || []).join(",") + "|tf" + (p.tipField || "") + "|td" + (p.tipData ? p.tipData.length : 0) + (p.tipData ? "|" + p.tipData.map((r) => Number(r[p.xField || "x"]) || 0).join(",") : "") + "|g" + (p.groupField || "") + "|" + p.data.map((r) => r[p.groupField]).join(",") + "|ru" + (p.rules || []).map((r) => r.x + ":" + (r.label || "") + (r.windows ? ":" + r.windows.join("-") : "")).join(",") + cells;
  };
  var AmBarChart = (props) => {
    const ref = React.useRef(null);
    const axisRef = React.useRef(null);
    const [err, setErr] = React.useState(false);
    const [errMsg, setErrMsg] = React.useState("");
    const [active, setActive] = React.useState(null);
    const key = sig(props);
    const [hiddenGroups, setHiddenGroups] = React.useState({});
    const hiddenRef = React.useRef({});
    hiddenRef.current = hiddenGroups;
    const [hiddenMetrics, setHiddenMetrics] = React.useState({});
    const hiddenMetricsRef = React.useRef({});
    hiddenMetricsRef.current = hiddenMetrics;
    const xRef = React.useRef(null);
    const xFixedRef = React.useRef(false);
    const seriesMetaRef = React.useRef([]);
    const ruleMetaRef = React.useRef([]);
    const XMIN_KEY = "tg:perf-xmin";
    const [xMinText, setXMinText] = React.useState(() => {
      try {
        return props.xMinControl ? localStorage.getItem(XMIN_KEY) || "" : "";
      } catch {
        return "";
      }
    });
    const xMinRef = React.useRef(null);
    const parseXMin = (t) => {
      const v = Number(String(t).trim().replace(/[,\s]/g, ""));
      return Number.isFinite(v) && v > 0 ? v : null;
    };
    xMinRef.current = parseXMin(xMinText);
    const applyHidden = React.useCallback(() => {
      const x = xRef.current;
      let lo = Infinity, hi = -Infinity, anyRegimeHidden = false;
      for (const m of seriesMetaRef.current) {
        const hidRegime = !!hiddenRef.current[m.k];
        const hidMetric = m.mk != null && !!hiddenMetricsRef.current[m.mk];
        const hid = hidRegime || hidMetric;
        if (hidRegime) anyRegimeHidden = true;
        try {
          m.ser.set("visible", !hid);
        } catch (_) {
        }
        if (!hidRegime) for (const c of m.ctxs) {
          if (c < lo) lo = c;
          if (c > hi) hi = c;
        }
      }
      for (const r of ruleMetaRef.current) {
        const hid = r.windows.some((w) => hiddenRef.current[w]);
        try {
          r.ser.set("visible", !hid);
        } catch (_) {
        }
      }
      if (!x) return;
      const manual = xMinRef.current;
      if (anyRegimeHidden && lo < hi) {
        const pad = (hi - lo) * 0.02 || 1;
        x.set("min", manual != null ? manual : lo - pad);
        x.set("max", hi + pad);
        xFixedRef.current = true;
      } else if (manual != null) {
        x.set("min", manual);
        x.set("max", void 0);
        xFixedRef.current = true;
      } else if (xFixedRef.current) {
        x.set("min", void 0);
        x.set("max", void 0);
        xFixedRef.current = false;
      }
    }, []);
    const onXMinChange = (t) => {
      setXMinText(t);
      try {
        localStorage.setItem(XMIN_KEY, t);
      } catch {
      }
      applyHidden();
    };
    React.useEffect(() => {
      applyHidden();
    }, [hiddenGroups, hiddenMetrics, key, applyHidden]);
    const groups = React.useMemo(() => {
      if (!props.groupField) return [];
      const out = [];
      let start = 0, last = void 0;
      const rows = props.data || [];
      for (let i = 0; i < rows.length; i++) {
        const g = rows[i][props.groupField];
        if (i > 0 && g !== last) {
          out.push({ label: last, start, end: i - 1 });
          start = i;
        }
        last = g;
      }
      if (rows.length) out.push({ label: last, start, end: rows.length - 1 });
      return out;
    }, [props.groupField, props.data, props.data && props.data.length]);
    const zoomTo = (g) => {
      const axis = axisRef.current;
      if (!axis) return;
      if (!g) {
        axis.zoomToIndexes(0, (props.data.length || 1) - 1);
        setActive(null);
        return;
      }
      axis.zoomToIndexes(g.start, g.end);
      setActive(String(g.label));
    };
    const chipGroups = React.useMemo(() => {
      if (!props.legendChips) return [];
      if (props.chips && props.chips.length) return props.chips;
      const out = [];
      for (const s of props.series) {
        if (out.some((g) => g.name === s.label)) continue;
        out.push({ name: s.label, color: s.color, k: s.regime != null ? s.regime : s.label });
      }
      return out;
    }, [props.series, props.legendChips, props.chips]);
    React.useEffect(() => {
      xRef.current = null;
      xFixedRef.current = false;
      seriesMetaRef.current = [];
      ruleMetaRef.current = [];
      let root;
      let disposed = false;
      loadAmCharts().then((w) => {
        if (disposed || !ref.current) return;
        const am5 = w.am5, am5xy = w.am5xy;
        root = am5.Root.new(ref.current);
        root.setThemes([w.am5themes_Dark.new(root), w.am5themes_Animated.new(root)]);
        const chart = root.container.children.push(am5xy.XYChart.new(root, { panY: false, layout: root.verticalLayout }));
        if ((props.kind || "column") === "scatter") {
          const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererX.new(root, {}) }));
          if (props.xStep) xAxis.set("step", props.xStep);
          const maxAxis2 = Math.max(props.series.reduce((m, s) => Math.max(m, s.axis || 0), 0), props.tipAxis || 0);
          const logAxes = props.logAxes || (props.log ? Array.from({ length: maxAxis2 + 1 }, (_, i) => i) : []);
          const yAxes2 = [];
          for (let a = 0; a <= maxAxis2; a++) {
            const ys = { renderer: am5xy.AxisRendererY.new(root, a === 0 ? {} : { opposite: true }) };
            if (logAxes.indexOf(a) >= 0) {
              ys.logarithmic = true;
              ys.treatZeroAs = 1;
            } else {
              ys.min = 0;
            }
            yAxes2.push(chart.yAxes.push(am5xy.ValueAxis.new(root, ys)));
          }
          const hideAxis = (a, keepGrid = false) => {
            try {
              const r = a.get("renderer");
              r.labels.template.set("visible", false);
              r.ticks.template.set("visible", false);
              if (!keepGrid) r.grid.template.set("visible", false);
            } catch (_) {
            }
          };
          const allGrouped = props.series.length > 0 && props.series.every((s) => s.group != null);
          for (const ya of [xAxis, ...yAxes2]) {
            ya.get("renderer").grid.template.setAll({ stroke: am5.color(16777215), strokeOpacity: 0.05 });
            ya.get("renderer").labels.template.setAll({ fill: am5.color("#94a3b8"), fontSize: 9 });
            if (allGrouped && ya !== xAxis) hideAxis(ya, ya === yAxes2[0]);
          }
          for (const a of props.hideAxisLabels || []) {
            if (yAxes2[a]) hideAxis(yAxes2[a]);
          }
          const groupAxes = {};
          const yAxisFor = (s) => {
            if (s.group == null) return yAxes2[s.axis || 0];
            const k = s.group + ":" + (s.axis || 0);
            if (!groupAxes[k]) {
              groupAxes[k] = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, { visible: false }) }));
              hideAxis(groupAxes[k]);
            }
            return groupAxes[k];
          };
          const ruleSers = [];
          if (props.rules && props.rules.length) {
            const ruleAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, { visible: false }), min: 0, max: 1 }));
            hideAxis(ruleAxis);
            const xF = props.xField || "x";
            props.rules.forEach((r) => {
              const rc = r.color || "#f472b6";
              const rser = chart.series.push(am5xy.LineSeries.new(root, {
                name: r.label,
                xAxis,
                yAxis: ruleAxis,
                valueXField: xF,
                valueYField: "tgRuleY"
              }));
              rser.strokes.template.setAll({ stroke: am5.color(rc), strokeOpacity: 0.8, strokeWidth: 1.5 });
              const rtt = am5.Tooltip.new(root, { labelText: r.tip || r.label });
              try {
                const lbl = rtt.get("label");
                if (lbl && typeof lbl.setAll === "function") lbl.setAll({ fontSize: 11, textAlign: "left" });
              } catch (_) {
              }
              rser.set("tooltip", rtt);
              rser.data.setAll([
                { [xF]: r.x, tgRuleY: 0 },
                { [xF]: r.x, tgRuleY: 1 }
              ]);
              ruleSers.push(rser);
              ruleMetaRef.current.push({ ser: rser, windows: r.windows ? [r.windows[0], r.windows[1]] : [] });
            });
          }
          const dataMeta = [];
          const metricKeys = new Set((props.metricChips || []).map((c) => c.k));
          for (const s of [...props.series.filter((x) => x.line), ...props.series.filter((x) => !x.line)]) {
            const Ctor = s.line && am5xy.SmoothedXYLineSeries ? am5xy.SmoothedXYLineSeries : am5xy.LineSeries;
            const ser = chart.series.push(Ctor.new(root, {
              name: s.label,
              xAxis,
              yAxis: yAxisFor(s),
              valueXField: props.xField,
              valueYField: s.key
            }));
            if (s.line) {
              if (s.tension != null) {
                try {
                  ser.set("tension", s.tension);
                } catch (_) {
                }
              }
              const st = { stroke: am5.color(s.color), strokeOpacity: 0.9, strokeWidth: 1.5 };
              if (s.dash) st.dash = s.dash;
              ser.strokes.template.setAll(st);
              if (s.fill) {
                ser.fills.template.setAll({
                  visible: true,
                  fill: am5.color(s.color),
                  fillOpacity: 0.15
                });
              }
            } else {
              ser.strokes.template.setAll({ stroke: am5.color(s.color), strokeOpacity: 0 });
              ser.bullets.push(() => am5.Bullet.new(root, {
                // dot shape per series: circle by default, triangle when asked
                // (a second metric on a shared chart can keep its shape apart).
                sprite: s.bullet === "triangle" ? am5.Triangle.new(root, { width: 9, height: 8, fill: am5.color(s.color), fillOpacity: 0.85, stroke: am5.color(s.color), strokeOpacity: 1, strokeWidth: 1.5 }) : am5.Circle.new(root, { radius: 1, fill: am5.color(s.color), fillOpacity: 0.85, stroke: am5.color(s.color), strokeOpacity: 1, strokeWidth: 0.5 })
              }));
            }
            if (!props.tipField) {
              const parts = [];
              if (props.labelField) parts.push("{" + props.labelField + "}");
              parts.push("{valueY}" + (s.unit || props.unit ? " " + (s.unit || props.unit) : ""));
              const tt = am5.Tooltip.new(root, { labelText: parts.join(" \xB7 ") });
              try {
                const lbl = tt.get("label");
                if (lbl && typeof lbl.setAll === "function") lbl.setAll({ fontSize: 11, textAlign: "left" });
                else if (lbl && typeof lbl.set === "function") {
                  lbl.set("fontSize", 11);
                  lbl.set("textAlign", "left");
                }
              } catch (_) {
              }
              ser.set("tooltip", tt);
            }
            const rows = s.data || props.data;
            ser.data.setAll(rows);
            dataMeta.push({ ser, k: s.regime != null ? s.regime : s.label, mk: metricKeys.has(s.key) ? s.key : void 0, ctxs: rows.map((r) => Number(r[props.xField || "x"]) || 0) });
          }
          let tipSer = null;
          if (props.tipField && props.tipData && props.tipData.length) {
            tipSer = chart.series.push(am5xy.LineSeries.new(root, {
              name: "tip",
              xAxis,
              yAxis: yAxes2[props.tipAxis || 1],
              valueXField: props.xField,
              valueYField: props.xField
              // y position is irrelevant (x-only matching)
            }));
            tipSer.strokes.template.setAll({ stroke: am5.color(16777215), strokeOpacity: 0 });
            const ttt = am5.Tooltip.new(root, { labelText: "{" + props.tipField + "}" });
            try {
              const lbl = ttt.get("label");
              if (lbl && typeof lbl.setAll === "function") lbl.setAll({ fontSize: 11, textAlign: "left", oversizedBehavior: "wrap" });
              else if (lbl && typeof lbl.set === "function") {
                lbl.set("fontSize", 11);
                lbl.set("textAlign", "left");
                lbl.set("oversizedBehavior", "wrap");
              }
            } catch (_) {
            }
            tipSer.set("tooltip", ttt);
            tipSer.data.setAll(props.tipData);
          }
          if (!props.legendChips) {
            const legend2 = chart.children.push(am5.Legend.new(root, {}));
            legend2.data.setAll(chart.series.values.filter((s) => ruleSers.indexOf(s) === -1 && s !== tipSer));
            legend2.labels.template.setAll({ fill: am5.color("#e5e7eb"), fontSize: 11 });
          }
          const cursor2 = chart.set("cursor", am5xy.XYCursor.new(root, { xAxis, yAxis: yAxes2[0] }));
          cursor2.set("behavior", "none");
          if (props.tipField) {
            cursor2.set("maxTooltipDistance", 30);
            cursor2.set("maxTooltipDistanceBy", "x");
          }
          xRef.current = xAxis;
          seriesMetaRef.current = dataMeta;
          applyHidden();
          return;
        }
        const horizontal = !!props.horizontal;
        const catAxis = (horizontal ? chart.yAxes : chart.xAxes).push(am5xy.CategoryAxis.new(root, {
          renderer: (horizontal ? am5xy.AxisRendererY : am5xy.AxisRendererX).new(root, {}),
          categoryField: props.categoryField
        }));
        catAxis.data.setAll(props.data);
        catAxis.get("renderer").grid.template.set("strokeOpacity", 0);
        if (horizontal) catAxis.get("renderer").labels.template.setAll({ fontSize: 11, maxWidth: 150, wrap: true, textAlign: "left" });
        else catAxis.get("renderer").labels.template.setAll({ fontSize: 10, maxWidth: 100, wrap: true, textAlign: "center" });
        if (props.rotateCategories && !horizontal) catAxis.get("renderer").labels.template.set("rotation", -45);
        if (props.hideCategoryLabels) {
          catAxis.get("renderer").labels.template.set("visible", false);
          catAxis.get("renderer").grid.template.set("visible", false);
          catAxis.get("renderer").ticks.template.set("visible", false);
        }
        axisRef.current = catAxis;
        const maxAxis = props.series.reduce((m, s) => Math.max(m, s.axis || 0), 0);
        const yAxes = [];
        for (let a = 0; a <= maxAxis; a++) {
          const settings = {
            renderer: (horizontal ? am5xy.AxisRendererX : am5xy.AxisRendererY).new(root, a === 0 ? {} : { opposite: true })
          };
          if (props.log) {
            settings.logarithmic = true;
            settings.treatZeroAs = 1;
          } else {
            settings.min = 0;
          }
          yAxes.push((horizontal ? chart.xAxes : chart.yAxes).push(am5xy.ValueAxis.new(root, settings)));
        }
        for (const ya of yAxes) {
          ya.get("renderer").grid.template.setAll({ stroke: am5.color(16777215), strokeOpacity: 0.05 });
          ya.get("renderer").labels.template.setAll({ fill: am5.color("#94a3b8"), fontSize: 9 });
        }
        const yA = 16102145, yB = 12880384;
        if (props.groupField) {
          const items = catAxis.dataItems;
          let gi = -1, last = void 0;
          for (let i = 0; i < props.data.length; i++) {
            const g = props.data[i][props.groupField];
            if (g !== last) {
              gi += 1;
              last = g;
            }
            const di = items[i];
            if (di) di.set("background", am5.Rectangle.new(root, {
              fill: am5.color(gi % 2 === 0 ? yA : yB),
              fillOpacity: 0.16,
              stroke: am5.color(16498468),
              strokeOpacity: 0.35,
              strokeWidth: 1
            }));
          }
        }
        const kind = props.kind || "column";
        const isCol = kind === "column";
        const LineCtor = props.smooth ? am5xy.SmoothedXLineSeries : am5xy.LineSeries;
        for (const s of props.series) {
          const base = { name: s.label, stacked: !!props.stacked };
          if (horizontal) {
            base.xAxis = yAxes[s.axis || 0];
            base.yAxis = catAxis;
            base.valueXField = s.key;
            base.categoryYField = props.categoryField;
          } else {
            base.xAxis = catAxis;
            base.yAxis = yAxes[s.axis || 0];
            base.valueYField = s.key;
            base.categoryXField = props.categoryField;
          }
          let ser;
          if (isCol) {
            ser = chart.series.push(am5xy.ColumnSeries.new(root, base));
            ser.set("fill", am5.color(s.color));
            ser.set("stroke", am5.color(s.color));
            ser.set("fillOpacity", 0.9);
          } else {
            ser = chart.series.push(LineCtor.new(root, base));
            ser.strokes.template.setAll({ stroke: am5.color(s.color), strokeWidth: kind === "area" ? 1.5 : 2 });
            ser.fills.template.setAll({
              visible: kind === "area",
              fill: am5.color(s.color),
              fillOpacity: kind === "area" ? 0.32 : 0
            });
          }
          const unit = s.unit || props.unit || "";
          const parts = [];
          if (props.groupField) parts.push("{" + props.groupField + "}");
          const catPh = horizontal ? "{categoryY}" : "{categoryX}";
          const valPh = horizontal ? "{valueX}" : "{valueY}";
          parts.push(catPh, "{name}", valPh + (unit ? " " + unit : ""));
          const tt = am5.Tooltip.new(root, { labelText: parts.join(" \xB7 ") });
          try {
            const lbl = tt.get("label");
            if (lbl && typeof lbl.setAll === "function") {
              lbl.setAll({ fontSize: 11, textAlign: "left" });
            } else if (lbl && typeof lbl.set === "function") {
              lbl.set("fontSize", 11);
              lbl.set("textAlign", "left");
            }
          } catch (_) {
          }
          ser.set("tooltip", tt);
          if (isCol) {
            ser.columns.template.set(horizontal ? "height" : "width", am5.percent(props.stacked ? 90 : 60));
          }
          ser.data.setAll(s.data || props.data);
        }
        if (!isCol) for (const ya of yAxes) ya.get("renderer").grid.template.set("strokeOpacity", 0.08);
        const legend = chart.children.push(am5.Legend.new(root, {}));
        legend.data.setAll(chart.series.values);
        legend.labels.template.setAll({ fill: am5.color("#e5e7eb"), fontSize: 11 });
        const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
        cursor.set("behavior", "none");
      }).catch((e) => {
        if (!disposed) {
          setErr(true);
          setErrMsg(String(e && e.message || e));
        }
      });
      return () => {
        disposed = true;
        if (root) {
          try {
            root.dispose();
          } catch (_) {
          }
        }
      };
    }, [key]);
    if (err) return jsx("div", { className: "tg-amchart tg-amchart-err", style: { height: (props.height ?? 260) + "px" }, children: "Chart failed to load amCharts: " + (errMsg || "vendor assets missing") });
    const hasData = props.data && props.data.length || props.series.some((s) => s.data && s.data.length);
    if (!hasData) return null;
    return jsxs("div", { className: "tg-amchart-wrap", children: [
      groups.length ? jsxs("div", { className: "tg-turn-chips", children: [
        jsx("button", { className: "tg-turn-chip" + (active === null ? " active" : ""), onClick: () => zoomTo(null), children: "All" }, "all"),
        ...groups.map((g) => jsx("button", {
          className: "tg-turn-chip" + (String(g.label) === active ? " active" : ""),
          onClick: () => zoomTo(g),
          title: "Zoom to " + g.label + " (steps S" + (g.start + 1) + "\u2013S" + (g.end + 1) + ")",
          children: g.label
        }, String(g.label) + "-" + g.start))
      ] }) : null,
      chipGroups.length ? jsx("div", { className: "tg-legend-chips", children: chipGroups.map((g) => {
        const off = !!hiddenGroups[g.k];
        return jsx("button", {
          className: "tg-legend-chip" + (off ? " off" : ""),
          onClick: () => setHiddenGroups((h) => ({ ...h, [g.k]: !h[g.k] })),
          title: (off ? "Show " : "Hide ") + g.name + (props.legendUnit ? " (" + props.legendUnit + ")" : ""),
          children: [
            // swatch: explicit window chips get a solid line + dot (the window's
            // context line + its scatter dots); name-derived chips keep the
            // paired solid/dotted swatch (decode + prefill).
            props.chips && props.chips.length ? jsx("span", { className: "sw", children: [
              jsx("i", { style: { borderTopColor: g.color } }),
              jsx("i", { className: "dot", style: { background: g.color } })
            ] }) : jsx("span", { className: "sw", children: [
              jsx("i", { style: { borderTopColor: g.color } }),
              jsx("i", { className: "dash", style: { borderTopColor: g.color } })
            ] }),
            g.name + (props.legendUnit ? " \xB7 " + props.legendUnit : "")
          ]
        }, g.name);
      }) }) : null,
      props.metricChips && props.metricChips.length ? jsx("div", { className: "tg-legend-chips", style: { marginTop: 4 }, children: props.metricChips.map((g) => {
        const off = !!hiddenMetrics[g.k];
        return jsx("button", {
          className: "tg-legend-chip" + (off ? " off" : ""),
          onClick: () => setHiddenMetrics((h) => ({ ...h, [g.k]: !h[g.k] })),
          title: (off ? "Show " : "Hide ") + g.name + " dots",
          children: [
            jsx("span", { className: "sw", children: jsx("i", { className: "dot", style: { background: g.color } }) }),
            g.name
          ]
        }, "metric-" + g.k);
      }) }) : null,
      props.xMinControl ? jsxs("div", { className: "tg-xmin-row", children: [
        jsx("label", { className: "tg-faint", style: { fontSize: 10 }, children: props.xMinLabel || "x min (ctx, tok)" }),
        jsx("input", {
          className: "tg-xmin",
          type: "number",
          min: 0,
          step: props.xMinStep ?? 1e3,
          placeholder: "auto",
          value: xMinText,
          onChange: (e) => onXMinChange(e.target.value),
          title: "Pin the x-axis minimum to this value. Empty = auto."
        }),
        xMinText ? jsx("button", { className: "tg-xmin-clear", onClick: () => onXMinChange(""), title: "Reset to auto", children: "\xD7" }) : null
      ] }) : null,
      jsx("div", { ref, className: "tg-amchart", style: { height: (props.height ?? 260) + "px" } })
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
  var stepTree = (s) => {
    const tree = s.stepTree || [];
    if (!tree.length) return jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No step tree for this session." });
    const stepCell2 = (st) => jsxs("tr", { className: "tg-tr", children: [
      tdL("S" + st.step, { style: { fontFamily: "monospace", fontSize: 11 } }),
      tdL(jsxs("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }, children: [
        ...(st.tools || []).map((t) => jsx("span", { className: "tg-chip", style: { fontSize: 10 }, children: t }, t)),
        st.parallel ? jsx("span", { className: "tg-chip", style: { fontSize: 10, color: "#fbbf24" }, children: "parallel" }, "parallel") : null
      ] }), { title: st.parallel ? "multiple tools called after this step (parallel group)" : "single tool call after this step" }),
      tdR(fmtC(st.in)),
      tdR(fmtC(st.out)),
      tdR(st.thinking ? (st.thinkingEstimated ? "\u2248" : "") + fmtC(st.thinking) : "\u2014", { style: { color: st.thinking ? "#c084fc" : void 0 } }),
      tdR(st.prefillTokPerSec != null ? st.prefillTokPerSec + " tok/s" : "\u2014", { style: { fontWeight: 600 } }),
      tdR(st.decodeTokPerSec != null ? st.decodeTokPerSec + " tok/s" : "\u2014", { style: { fontWeight: 600 } }),
      tdR(st.decodeMs != null ? fmtMs(st.decodeMs) : "\u2014")
    ] }, st.turn + "-" + st.step);
    return jsxs("div", { children: tree.map((turn) => jsxs("div", { style: { marginBottom: 10 }, children: [
      jsx("div", { className: "tg-drawer-sub", children: "Turn " + turn.turn }),
      jsxs("table", { className: "tg-table", style: { fontSize: 12 }, children: [
        jsx("tr", { children: [thL("Step"), thL("Tools"), thR("In"), thR("Out"), thR("Think"), thR("Prefill"), thR("Decode"), thR("Dec time")] }),
        ...turn.steps.map(stepCell2)
      ] })
    ] }, turn.turn)) });
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
  var TOKEN_SERIES = [
    { key: "in", label: "In", color: "#60a5fa", unit: "tok" },
    { key: "out", label: "Out", color: "#a78bfa", unit: "tok" },
    { key: "cache", label: "Cache", color: "#2dd4bf", unit: "tok" },
    { key: "think", label: "Think", color: "#c084fc", unit: "tok" }
  ];
  var TokenSpendChart = ({ rows, height = 240, stacked = false, rotate = false, horizontal = false, hideCategoryLabels = false }) => jsx(AmBarChart, {
    data: rows.map((r) => ({ cat: r.label, in: r.in ?? 0, out: r.out ?? 0, cache: r.cache ?? 0, think: r.think ?? 0 })),
    categoryField: "cat",
    kind: "column",
    stacked,
    horizontal,
    hideCategoryLabels,
    rotateCategories: rotate,
    series: TOKEN_SERIES,
    height
  });
  var metaGrid = (meta) => jsx("div", { className: "tg-meta-grid", children: meta.map(([k, v]) => v == null || v === "" ? null : jsxs("div", { className: "tg-meta", children: [
    jsx("div", { className: "tg-meta-k", children: k }),
    jsx("div", { className: "tg-meta-v tg-num", children: v })
  ] }, k)) });
  var sessionDrawer = (s) => {
    const m = s.meta || {};
    const meta = [
      ["Project", s.cwd],
      ["Turns", s.turns || null],
      ["LLM time", s.llmMs ? fmtMs(s.llmMs) : null],
      ["Tool time", m.toolMs ? fmtMs(m.toolMs) : null],
      ["TTFT avg", m.ttftSteps ? fmtMs(m.ttftMs / m.ttftSteps) : null],
      ["Decode", m.decodeMs ? fmtMs(m.decodeMs) + " \xB7 " + fmtC(m.decodeTokens) + " tok" : null],
      ["Speed", s.tokPerSec != null ? s.tokPerSec + " tok/s" : null],
      ["Sandbox", m.sandbox],
      ["Approval", m.approval],
      ["Preset", m.preset || m.agentPreset],
      ["Last model", m.lastUsedModel ? m.lastUsedModel.model + " \xB7 " + (m.lastUsedModel.provider || "?") : null],
      ["Goal", m.goal ? m.goal.objective || m.goal.id || "active" : m.goalFailure ? "failed: " + String(m.goalFailure) : null],
      ["Plan mode", m.planActive ? "active" : null],
      ["Subagents", m.subagentCount ? String(m.subagentCount) + (m.subagentSettledMs ? " \xB7 " + fmtMs(m.subagentSettledMs) : "") : null],
      ["Last prompt", m.lastPromptAt ? new Date(m.lastPromptAt).toLocaleString("en-GB") : null],
      ["Context", m.contextPressure && m.contextPressure.contextWindow ? fmtC(m.contextPressure.surfaceTokens) + " / " + fmtC(m.contextPressure.contextWindow) + " (" + Math.round(100 * m.contextPressure.surfaceTokens / m.contextPressure.contextWindow) + "%)" : null],
      ["Context mix", m.contextBreakdown ? fmtC(m.contextBreakdown.systemTokens) + " sys \xB7 " + fmtC(m.contextBreakdown.toolsTokens) + " tools \xB7 " + fmtC(m.contextBreakdown.messageTokens) + " msgs" : null],
      ["Seeded", m.isSeeded ? "yes" : null]
    ];
    const callRows = s.toolCalls || [];
    const codeRows = s.tools || [];
    return jsxs("div", { className: "tg-drawer-inner", children: [
      metaGrid(meta),
      s.events ? jsxs("div", { children: [
        jsx("div", { className: "tg-drawer-sec", children: "Events" }),
        eventChips(s.events)
      ] }) : null,
      callRows.length || codeRows.length ? jsxs("div", { children: [
        jsx("div", { className: "tg-drawer-sec", children: "Tools called in this session" }),
        jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
          jsxs("div", { children: [jsx("div", { className: "tg-drawer-sub", children: "Top-level calls" }), toolTable(callRows, false)] }),
          jsxs("div", { children: [jsx("div", { className: "tg-drawer-sub", children: "Code runs (dispatched)" }), toolTable(codeRows, false)] })
        ] })
      ] }) : null,
      s.toolTokens && s.toolTokens.length ? jsxs("div", { children: [
        jsx("div", { className: "tg-drawer-sec", children: "Tool payload per tool (actual call arguments)" }),
        jsxs("table", { className: "tg-table", style: { fontSize: 12 }, children: [
          jsx("tr", { children: [thL("Tool"), thR("Calls"), thR("Min"), thR("Avg"), thR("Max"), thR("Payload"), thR("Thinking")] }),
          ...s.toolTokens.map((t) => jsxs("tr", { className: "tg-tr", children: [
            tdL(t.tool, { style: { fontFamily: "monospace", fontSize: 11 } }),
            tdR(String(t.calls)),
            tdR(fmtC(t.min)),
            tdR(fmtC(t.avg)),
            tdR(fmtC(t.max)),
            tdR(fmtC(t.total), { style: { fontWeight: 600 } }),
            tdR(t.reasoning ? fmtC(t.reasoning) : "\u2014", { style: { color: t.reasoning ? "#c084fc" : void 0 } })
          ] }, t.tool))
        ] }),
        jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 4 }, children: "Payload = estimated tokens of the actual tool-call arguments the tool received (chars/4), NOT the whole LLM step's context. Thinking = reasoning tokens in the LLM step that invoked it." })
      ] }) : null,
      s.steps && s.steps.length ? jsxs("div", { children: [
        jsx("div", { className: "tg-drawer-sec", children: "Per-step \u2014 prefill / decode speed + thinking" }),
        jsx("div", { className: "tg-scrollable", children: jsxs("table", { className: "tg-table", style: { fontSize: 12 }, children: [
          jsx("tr", { children: [thL("Step"), thR("In"), thR("Out"), thR("Thinking"), thR("TTFT"), thR("Prefill"), thR("Dec time"), thR("Dec speed")] }),
          ...s.steps.flatMap((st, i) => {
            const showTurn = i === 0 || s.steps[i - 1].turn !== st.turn;
            const rows = [];
            if (showTurn) rows.push(jsx("tr", { className: "tg-group", children: jsx("td", { colSpan: 8, children: "Turn " + st.turn }) }, "grp-" + st.turn));
            rows.push(jsxs("tr", { className: "tg-tr", children: [
              tdL("S" + st.step, { style: { fontFamily: "monospace", fontSize: 11 } }),
              tdR(fmtC(st.in)),
              tdR(fmtC(st.out)),
              tdR(st.thinking ? (st.thinkingEstimated ? "\u2248" : "") + fmtC(st.thinking) : "\u2014", { style: { color: st.thinking ? "#c084fc" : void 0 }, title: (st.thinkingEstimated ? "\u2248 estimated from reasoning text (provider reported 0 reasoning tokens)" : "reasoning tokens") + (st.thinkingMs ? " \xB7 " + fmtMs(st.thinkingMs) + " thinking time" : "") }),
              tdR(st.ttftMs != null ? fmtMs(st.ttftMs) : "\u2014"),
              tdR(st.prefillTokPerSec != null ? st.prefillTokPerSec + " tok/s" : "\u2014", { style: { fontWeight: 600 }, title: "trajectory prefill = new (uncached) input tokens \xF7 TTFT (" + st.in + " prompt tokens). TTFT includes network + queue, so it is a lower bound" }),
              tdR(st.decodeMs != null ? fmtMs(st.decodeMs) : "\u2014"),
              tdR(st.decodeTokPerSec != null ? st.decodeTokPerSec + " tok/s" : "\u2014", { style: { fontWeight: 600 }, title: "trajectory decode = streamed output tokens \xF7 decode time (first\u2192last chunk), " + st.out + " output tokens" })
            ] }, st.turn + "-" + st.step));
            return rows;
          })
        ] }) }),
        jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 4 }, children: "Prefill/decode speeds use the trajectory's own timestamps (TTFT includes network + queue, so prefill is a lower bound). Thinking = reasoning tokens (\u2248 estimated from the reasoning text when the provider reports 0)." })
      ] }) : null,
      m.turnOutline && m.turnOutline.length ? jsxs("div", { children: [
        jsx("div", { className: "tg-drawer-sec", children: "Turn outline" }),
        m.turnOutline.map((t) => jsxs("div", { className: "tg-turn", children: [
          jsx("div", { className: "tg-turn-p", children: "Turn " + t.turn + (t.prompt ? " \u2014 " + t.prompt : "") }),
          t.response ? jsx("div", { className: "tg-turn-r", children: t.response }) : null
        ] }, t.turn))
      ] }) : null
    ] });
  };
  var perfDrawer = (s) => {
    let i = 0;
    const steps = (s.stepTree || []).flatMap((t) => (t.steps || []).map((st) => {
      i += 1;
      return { ...st, cat: "S" + i, turn: "Turn " + t.turn };
    }));
    return jsxs("div", { className: "tg-drawer-inner", children: [
      jsx("div", { className: "tg-drawer-sec", children: "Step performance \u2014 decode & prefill speed" }),
      jsx(AmBarChart, {
        data: steps.map((st) => ({ cat: st.cat, turn: st.turn, tool: (st.tools || []).slice(0, 3).join(", "), decode: st.decodeTokPerSec ?? 0, prefill: st.prefillTokPerSec ?? 0 })),
        categoryField: "cat",
        groupField: "turn",
        subField: "tool",
        kind: "line",
        smooth: true,
        series: [
          { key: "decode", label: "Decode", color: "#38bdf8", unit: "tok/s", axis: 0 },
          { key: "prefill", label: "Prefill", color: "#2dd4bf", unit: "tok/s", axis: 1 }
        ],
        height: 220
      }),
      jsx(Collapse, { label: "Show per-step table (tools + tokens + speeds)", children: jsx("div", { className: "tg-scrollable", children: stepTree(s) }) })
    ] });
  };
  var stepCell = (st) => jsxs("tr", { className: "tg-tr", children: [
    tdL("S" + st.step, { style: { fontFamily: "monospace", fontSize: 11 } }),
    tdL(jsxs("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }, children: [
      ...(st.tools || []).map((t) => jsx("span", { className: "tg-chip", style: { fontSize: 10 }, children: t }, t)),
      st.parallel ? jsx("span", { className: "tg-chip", style: { fontSize: 10, color: "#fbbf24" }, children: "parallel" }, "parallel") : null
    ] }), { title: st.parallel ? "multiple tools called after this step (parallel group)" : "single tool call after this step" }),
    tdR(fmtC(st.in)),
    tdR(fmtC(st.out)),
    tdR(st.cache ? fmtC(st.cache) : "\u2014"),
    tdR(st.thinking ? (st.thinkingEstimated ? "\u2248" : "") + fmtC(st.thinking) : "\u2014", { style: { color: st.thinking ? "#c084fc" : void 0 }, title: st.thinkingEstimated ? "\u2248 estimated from reasoning text (provider reported 0 reasoning tokens)" : "reasoning tokens" })
  ] }, "s" + st.turn + "-" + st.step);
  var TurnStepTable = ({ steps }) => {
    const [closed, setClosed] = React.useState(() => /* @__PURE__ */ new Set());
    const toggle = (turn) => setClosed((p) => {
      const n = new Set(p);
      if (n.has(turn)) n.delete(turn);
      else n.add(turn);
      return n;
    });
    return jsx("table", { className: "tg-table", style: { fontSize: 12.5 }, children: [
      jsx("tr", { children: [thL("Step"), thL("Tools"), thR("In"), thR("Out"), thR("Cache"), thR("Think")] }),
      ...(steps || []).flatMap((turn) => {
        const isClosed = closed.has(turn.turn);
        const tIn = turn.steps.reduce((n, st) => n + (st.in || 0), 0);
        const tOut = turn.steps.reduce((n, st) => n + (st.out || 0), 0);
        const tCache = turn.steps.reduce((n, st) => n + (st.cache || 0), 0);
        const tThink = turn.steps.reduce((n, st) => n + (st.thinking || 0), 0);
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
              jsx("span", { children: "Turn " + turn.turn })
            ] })),
            tdL(jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: turn.steps.length + " step" + (turn.steps.length > 1 ? "s" : "") })),
            tdR(fmtC(tIn), { style: { fontWeight: 700 } }),
            tdR(fmtC(tOut), { style: { fontWeight: 700 } }),
            tdR(fmtC(tCache), { style: { fontWeight: 700 } }),
            tdR(tThink ? fmtC(tThink) : "\u2014", { style: { fontWeight: 700, color: tThink ? "#c084fc" : void 0 } })
          ]
        }, "turn" + turn.turn);
        if (isClosed) return [header];
        return [header, ...turn.steps.map(stepCell)];
      })
    ] });
  };
  var estimatedToolTable = (toolTokens) => jsx("table", { className: "tg-table", style: { fontSize: 12.5 }, children: [
    jsx("tr", { children: [thL("Tool"), thR("Calls"), thR("Payload"), thR("Thinking")] }),
    ...(toolTokens || []).map((t) => jsxs("tr", { className: "tg-tr", children: [
      tdL(t.tool, { style: { fontFamily: "monospace", fontSize: 11 } }),
      tdR(String(t.calls)),
      tdR(fmtC(t.total), { style: { fontWeight: 600 } }),
      tdR(t.reasoning ? fmtC(t.reasoning) : "\u2014", { style: { color: t.reasoning ? "#c084fc" : void 0 } })
    ] }, t.tool))
  ] });
  var glance = (label, value, color, total = false) => jsxs("div", { className: "tg-card tg-stat" + (total ? " tg-stat-total" : ""), style: { padding: "14px 16px" }, children: [
    jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
      jsx("span", { className: "tg-stat-dot", style: { background: color } }),
      jsx("span", { className: "tg-label", style: { fontSize: 11.5 }, children: label })
    ] }),
    jsx("div", { className: "tg-stat-value tg-num", style: { fontSize: total ? 24 : 21, marginTop: 5 }, children: fmtC(value) })
  ] });
  var TokenDrawerBody = ({ s }) => {
    const hasSteps = !!(s.stepTree && s.stepTree.length);
    const tot = sessionTokens(s);
    const stepRows = (() => {
      const rows = [];
      let i = 0;
      for (const t of s.stepTree || []) for (const st of t.steps || []) {
        i += 1;
        rows.push({ cat: "S" + i, turn: "Turn " + t.turn, tool: (st.tools || []).slice(0, 3).join(", "), in: st.in ?? 0, out: st.out ?? 0, cache: st.cache ?? 0, think: st.thinking ?? 0 });
      }
      return rows;
    })();
    return jsxs("div", { children: [
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
      jsx("div", { className: "tg-drawer-sec", children: "Token overview \u2014 per step (in / out / cache / think)" }),
      hasSteps ? jsx(AmBarChart, {
        data: stepRows,
        categoryField: "cat",
        groupField: "turn",
        subField: "tool",
        kind: "area",
        stacked: true,
        smooth: true,
        unit: "tok",
        series: TOKEN_SERIES,
        height: 240
      }) : null,
      jsx(Collapse, {
        label: "Show per-turn & step token table",
        children: hasSteps ? jsx("div", { className: "tg-scrollable", children: jsx(TurnStepTable, { steps: s.stepTree }) }) : s.toolTokens && s.toolTokens.length ? estimatedToolTable(s.toolTokens) : jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No per-step token data for this session yet." })
      }),
      jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 6 }, children: "In/Out/Cache = the LLM context tokens the session moved (cache = read + write). Thinking = reasoning tokens (\u2248 estimated from reasoning text when the provider reports 0). Tools = estimated tokens of the tool-call arguments (chars/4). Each turn in the table shows its own column totals." })
    ] });
  };
  var tokenTreeDrawer = (s) => {
    const m = s.meta || {};
    const stepCount = s.events ? s.events.steps || 0 : s.stepTree ? s.stepTree.reduce((n, t) => n + t.steps.length, 0) : 0;
    const meta = [
      ["Project", s.cwd],
      ["Turns", s.turns || null],
      ["Steps", stepCount || null],
      ["Models", s.modelMix],
      ["LLM time", s.llmMs ? fmtMs(s.llmMs) : null],
      ["Speed", s.tokPerSec != null ? s.tokPerSec + " tok/s" : null],
      ["Last model", m.lastUsedModel ? m.lastUsedModel.model + " \xB7 " + (m.lastUsedModel.provider || "?") : null]
    ];
    return jsxs("div", { className: "tg-drawer-inner", children: [
      metaGrid(meta),
      jsx(TokenDrawerBody, { s })
    ] });
  };
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
  var CombinedStepTable = ({ steps, defaultClosed = false, compactions, onCompaction }) => {
    const [closed, setClosed] = React.useState(() => defaultClosed ? new Set((steps || []).map((t) => t.turn)) : /* @__PURE__ */ new Set());
    const toggle = (turn) => setClosed((p) => {
      const n = new Set(p);
      if (n.has(turn)) n.delete(turn);
      else n.add(turn);
      return n;
    });
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
    return jsx("table", { className: "tg-table", style: { fontSize: 12.5 }, children: [
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
              jsx("span", { children: "Turn " + turn.turn })
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
    ] });
  };
  var CompactionTable = ({ s, defaultClosed = false }) => {
    const [compOpen, setCompOpen] = React.useState(null);
    return jsxs("div", { children: [
      jsx("div", { className: "tg-scrollable", children: jsx(CombinedStepTable, { steps: s.stepTree, defaultClosed, compactions: s.compactionEvents, onCompaction: setCompOpen }) }),
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
    const REGIME_COLORS = ["#e5e7eb", "#f87171", "#fb923c", "#a3e635", "#38bdf8", "#f43f5e", "#d946ef", "#94a3b8"];
    const PERF_METRICS = [
      { key: "in", name: "in", color: "#4ade80", unit: "tok" },
      { key: "out", name: "out", color: "#94a3b8", unit: "tok" },
      { key: "thinking", name: "thinking", color: "#c084fc", unit: "tok", radius: 2 },
      { key: "cache", name: "cache", color: "#94a3b8", unit: "tok" },
      { key: "pf", name: "prefill", color: "#fb923c", unit: "tok/s" },
      { key: "dc", name: "decode", color: "#facc15", unit: "tok/s" }
    ];
    const tipFor = (r) => {
      const tok = [];
      if (r.in != null) tok.push("in " + fmtC(r.in));
      if (r.out != null) tok.push("out " + fmtC(r.out));
      if (r.cache != null) tok.push("cache " + fmtC(r.cache));
      if (r.thinking != null) tok.push("think" + (r.thinkEst ? "\u2248" : "") + " " + fmtC(r.thinking));
      const spd = [];
      if (r.pf != null) spd.push("prefill " + r.pf + " tok/s");
      if (r.dc != null) spd.push("decode " + r.dc + " tok/s");
      const L = [r.label + " \xB7 ctx " + fmtC(r.ctx)];
      if (tok.length) L.push(tok.join(" \xB7 "));
      if (spd.length) L.push(spd.join(" \xB7 "));
      return L.join("\n");
    };
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
      row.tip = tipFor(row);
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
      perfSeries.push({ key: "ctx", label: name, color: c, unit: "ctx", axis: 0, regime: r, line: true, fill: true, data: lineRows });
      for (const m2 of PERF_METRICS) {
        perfSeries.push({ key: m2.key, label: m2.name, color: m2.color, unit: m2.unit, axis: 1, regime: r, line: true, data: rows });
      }
    });
    const perfTipRows = regimeKeys.flatMap((r) => regimeRows[r]);
    const perfRules = (s.compactionEvents || []).filter((c) => c.contextBefore != null && c.afterTurn != null && c.afterStep != null && stepG[c.afterTurn + ":" + c.afterStep] != null).map((c) => ({
      // x: stepG[c.afterTurn + ":" + c.afterStep],
      // label: "✂ C" + c.index,
      // tip: "Compaction " + c.index + " · after Turn " + c.afterTurn + " · Step " + c.afterStep + " · context " + fmtC(c.contextBefore) + " tok",
      // color: "#f472b6",
      // windows: [c.index - 1, c.index] as [number, number],
    }));
    const perfHas = perfSeries.length > 0;
    const meta = [
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
      perfHas ? jsxs("div", { style: { marginBottom: 14 }, children: [
        jsxs("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }, children: [
          jsx("div", { className: "tg-drawer-sec", style: { marginBottom: 0 }, children: "Performance & context \u2014 over steps" }),
          jsx("div", { className: "tg-faint", style: { fontSize: 10 }, children: "left = context (linear) \xB7 right = log (dots)" })
        ] }),
        jsx(AmBarChart, {
          data: [],
          kind: "scatter",
          xField: "g",
          labelField: "label",
          xLabel: "step",
          xUnit: "",
          xStep: Math.max(1, Math.round(gIdx / 12)),
          series: perfSeries,
          rules: perfRules,
          legendChips: true,
          chips: perfChips,
          metricChips: PERF_METRICS.map((m2) => ({ name: m2.name + " \xB7 " + m2.unit, color: m2.color, k: m2.key })),
          logAxes: [1],
          hideAxisLabels: [1],
          tipField: "tip",
          tipData: perfTipRows,
          tipAxis: 1,
          xMinControl: true,
          xMinLabel: "x min (step)",
          xMinStep: 1,
          height: 400
        }),
        jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 6 }, children: "One chart for every compaction regime \u2014 x = step (session time; the shared axis auto-scales to the visible data, or pin its minimum with the x-min input). The context filling up is shown as filled area lines: each window's line (left axis = context size) rises step by step as the context fills, then drops at its \u2702 compaction to the next window's starting context \u2014 the session's context sawtooth, in the window's color. Every step also plots as lines on the right log axis, one color per metric \u2014 in / out / thinking / cache (tokens) and prefill / decode (tok/s); hover any line for that step's full stats in one box. Click a window chip to remove or restore a whole window: its lines, its context area and the \u2702 boundary lines it bounds all hide with it, and the x-axis rescales to the remaining windows. Each \u2702 line marks a compaction, drawn at the step after which it ran: windows left of \u2702 C1 ran before compaction 1, between \u2702 C1 and \u2702 C2 after it, and so on." })
      ] }) : null,
      s.stepTree && s.stepTree.length ? jsxs("div", { children: [
        jsx("div", { className: "tg-drawer-sec", children: "Per turn & step \u2014 tokens + speed (combined)" }),
        jsx(CompactionTable, { s, defaultClosed: !!opts.defaultClosed }),
        jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 6 }, children: "Each step row is one LLM step: the tools it called and the context tokens it moved (In/Out/Cache/Think) alongside its timing (TTFT / Prefill / Decode) and its Ctx \u2014 the context-window allocation at that step (System / Tools / Messages, chars/4 estimate of the trajectory content) with the total prompt size against the model's window. \u2702 COMPACTED rows mark where a compaction ran between turns (\u2702 COMPACTING\u2026 = one still in progress, not a failure) \u2014 click one for its status, duration, tokens removed and the generated summary (\u2702 prefix on a Ctx cell = that step ran after a compaction reset). Turn header shows the turn's token column totals; its speed columns use total tokens \xF7 total time (same math as the session row) while TTFT / decode time are per-step averages. Prefill/decode speeds use the trajectory's own timestamps (TTFT includes network + queue, so prefill is a lower bound). Thinking = reasoning tokens (\u2248 estimated from the reasoning text when the provider reports 0)." })
      ] }) : null
    ] });
  };

  // client/panels.tsx
  var realModelTable = (byModel) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
    jsx("tr", { children: [thL("Model"), thL("Kind"), thR("Sessions"), thR("In"), thR("Out"), thR("CacheR"), thR("Speed"), thR("Cost")] }),
    ...(byModel || []).map((m) => jsxs("tr", {
      className: "tg-tr",
      children: [
        tdL(m.label, { style: { maxWidth: 220, whiteSpace: "normal", wordBreak: "break-word", fontWeight: 600 }, title: m.label }),
        tdL(jsx("span", { className: "tg-kind", style: { color: m.kind === "corp" ? "#f87171" : "#34d399" }, children: m.kind === "corp" ? "corp" : "local" })),
        tdR(String(m.sessions)),
        tdR(fmtC(m.uncachedInputTokens), { title: fmt(m.uncachedInputTokens) }),
        tdR(fmtC(m.outputTokens), { title: fmt(m.outputTokens) }),
        tdR(fmtC(m.cacheReadTokens), { title: fmt(m.cacheReadTokens) }),
        tdR(m.tokPerSec != null ? m.tokPerSec + " tok/s" : "\u2014", { title: "streamed output tokens per second of decode time (trajectory chunk timestamps)" }),
        tdR(m.cost != null ? money(m.cost) : "unpriced", { style: { fontWeight: 700, color: m.cost != null ? "#f8fafc" : "#fbbf24" } })
      ]
    }, m.model))
  ] }) });
  var perfModelTable = (rows) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
    jsx("tr", { children: [thL("Model"), thL("Kind"), thR("Steps"), thR("Streamed"), thR("Decode"), thR("New ctx"), thR("Prefill"), thR("Avg TTFT"), thR("Avg context")] }),
    ...(rows || []).map((m) => jsxs("tr", {
      className: "tg-tr",
      children: [
        tdL(m.label, { style: { maxWidth: 220, whiteSpace: "normal", wordBreak: "break-word", fontWeight: 600 }, title: m.label }),
        tdL(jsx("span", { className: "tg-kind", style: { color: m.kind === "corp" ? "#f87171" : "#34d399" }, children: m.kind === "corp" ? "corp" : "local" })),
        tdR(String(m.steps)),
        tdR(fmtC(m.decodeTokens), { title: fmt(m.decodeTokens) + " streamed output tokens" }),
        tdR(m.tokPerSec != null ? m.tokPerSec + " tok/s" : "\u2014", { style: { fontWeight: 700 }, title: "streamed output tokens \xF7 decode time (first\u2192last chunk)" }),
        tdR(fmtC(m.prefillTokens), { title: fmt(m.prefillTokens) + " new (uncached) input tokens" }),
        tdR(m.promptTokPerSec != null ? m.promptTokPerSec + " tok/s" : "\u2014", { style: { fontWeight: 700 }, title: "new (uncached) input tokens \xF7 TTFT (request\u2192first token). TTFT includes network + queue, so this is a lower bound on true prefill speed." }),
        tdR(m.avgTtftMs != null ? fmtMs(m.avgTtftMs) : "\u2014", { title: "average time from request to first token" }),
        tdR(m.avgContext != null ? fmtC(m.avgContext) : "\u2014", { title: "average full prompt size per step (uncached + cached)" })
      ]
    }, m.model))
  ] }) });
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
    return jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
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
  var comparisonTable = (comparison) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
    jsx("tr", { children: [thL("Model"), thR("$/M in"), thR("$/M out"), thR("$/M cacheR"), thR("Cost"), thR("You save")] }),
    ...(comparison || []).map((c) => jsxs("tr", {
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
  var sessionTable = (bySession, openId, onToggle) => TgTable({
    columns: sessionCostColumns,
    rows: bySession || [],
    rowKey: (s) => s.id,
    expandedId: openId,
    onToggle,
    drawer: sessionDrawer,
    empty: jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No sessions recorded yet." }),
    rowClass: (s) => s.archived ? "tg-archived" : ""
  });
  var dayTable = (byDay) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
    jsx("tr", { children: [thL("Day"), thR("Sessions"), thR("Input"), thR("Output"), thR("Cache read"), thR("Cache write"), thR("Total"), thR("Cost")] }),
    ...(byDay || []).map((d) => jsxs("tr", { className: "tg-tr", children: [
      tdL(d.date, { style: { fontWeight: 600 } }),
      tdR(String(d.sessions)),
      tdR(fmtC(d.uncachedInputTokens), { title: fmt(d.uncachedInputTokens) }),
      tdR(fmtC(d.outputTokens), { title: fmt(d.outputTokens) }),
      tdR(fmtC(d.cacheReadTokens), { title: fmt(d.cacheReadTokens) }),
      tdR(fmtC(d.cacheWriteTokens), { title: fmt(d.cacheWriteTokens) }),
      tdR(fmtC(d.allTokens), { style: { fontWeight: 700 }, title: fmt(d.allTokens) }),
      tdR(d.cost != null ? money(d.cost) : "\u2014", { style: { fontWeight: 600, color: "#fde68a" } })
    ] }, d.date))
  ] }) });
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
      const rows = (bySession || []).filter((s) => s.stepTree && s.stepTree.length);
      return selDay ? rows.filter((s) => s.date === selDay) : rows;
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
  var runChart = (g) => jsx(AmBarChart, {
    data: g.runs.map((r) => ({
      cat: shortId(r.id),
      decode: r.decode ?? 0,
      prefill: r.prefill ?? 0
    })),
    categoryField: "cat",
    hideCategoryLabels: true,
    // same model on every bar — the axis would only repeat itself
    series: [
      { key: "decode", label: "Decode", color: "#38bdf8", unit: "tok/s", axis: 0 },
      { key: "prefill", label: "Prefill", color: "#2dd4bf", unit: "tok/s", axis: 1 }
    ],
    height: 220
  });
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
      jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
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
          jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
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
        jsx("div", { className: "tg-faint", style: { fontSize: 11, lineHeight: 1.6 }, children: "Sessions are grouped by the model that served them, so a model is only ever compared against itself. Only single-model sessions are counted here \u2014 sessions that switched models are held out in the Mix drawer at the bottom, where a blended rate can't distort a model's average. Expand a model for its aggregate token performance and allocation, and a per-session speed chart \u2014 the chart carries no axis labels because every bar is the same model: hover a bar for the session id and its speeds. Leader = most tokens." })
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
              jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Decode on the left axis, prefill on the right (prefill runs an order of magnitude faster, so they must not share a scale). No category labels: hover any bar to read the session id and its speeds." }),
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

  // client/hooks.ts
  var activityRef = { open: null };
  var usageFingerprint = (u) => {
    if (!u) return "";
    const t = u.sources && u.sources.trajectories || {};
    return JSON.stringify({
      tok: u.totals && u.totals.allTokens || 0,
      files: t.files || 0,
      wu: t.withUsage || 0,
      rec: t.usageRecords || 0,
      wmt: t.withModelTimeline || 0,
      n: Array.isArray(u.sessions) ? u.sessions.length : 0,
      comp: u.compactionSig || "",
      stops: u.events && u.events.userStops || 0
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
          setData(cached.usage);
          setBreakdown(cached.breakdown ?? null);
          setPerf(cached.perf ?? null);
          setError(null);
          setLoading(false);
        }
        const u = await request("/usage");
        sawData = true;
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

  // client/activity.tsx
  function TokenGobblerSettings(props) {
    const close = props && props.close;
    const { data, error, loading, refreshing, loadData, reprocess, reprocessing, reprocessMsg } = useGobblerData();
    if (loading) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsx("div", { style: { padding: 24, color: "#94a3b8", fontSize: 14 }, children: "Counting the gobbled tokens\u2026" })] });
    if (error && !data) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsxs("div", { style: { padding: 24 }, children: [jsx("div", { style: { fontWeight: 700 }, children: "Couldn't load token usage" }), jsx("div", { style: { color: "#f87171", marginTop: 6, fontSize: 13 }, children: error })] })] });
    if (!data) return jsxs("div", { className: "tg-root", children: [jsx("style", { children: CSS }), jsx("div", { style: { padding: 24, color: "#94a3b8" }, children: "No data." })] });
    const t = data.totals;
    const wfh = data.split && data.split.wfh;
    const refLabel = wfh && wfh.referenceLabel || "corp";
    const ev = data.events || null;
    const dec = data.decode;
    const byModel = data.byModel || [];
    const fastest = byModel.filter((m) => m.tokPerSec != null).sort((a, b) => b.tokPerSec - a.tokPerSec)[0] || null;
    const sec = (label) => jsx("div", { className: "tg-sec", children: label });
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
        jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
          sec("\u{1F4B0} Cost \u2014 what it adds up to"),
          jsxs("div", { className: "tg-card tg-hero", children: [
            jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }, children: [
              jsx("div", { className: "tg-label", children: "What you actually ran" }),
              data.actualSavings > 0 ? jsx("span", { className: "tg-badge", children: "\u{1F4B0} Home lab saved " + money(data.actualSavings) }) : null
            ] }),
            jsx("div", { className: "tg-hero-value tg-num", style: { color: "#f8fafc" }, children: money(data.actual.cost) }),
            jsx("div", { style: { color: "#94a3b8", fontSize: 12, marginTop: 9, lineHeight: 1.5 }, children: data.actual.note })
          ] }),
          wfhCard
        ] }),
        jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
          sec("\u{1FA99} Tokens \u2014 everything metered"),
          jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }, children: [
            statCard("Input (uncached)", t.uncachedInputTokens, "#60a5fa", false),
            statCard("Output", t.outputTokens, "#a78bfa", false),
            statCard("Cache read", t.cacheReadTokens, "#2dd4bf", false),
            statCard("Cache write", t.cacheWriteTokens, "#f472b6", false),
            statCard("Total tokens", t.allTokens, "#fbbf24", true)
          ] })
        ] }),
        dec && dec.tokPerSec != null ? jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
          sec("\u26A1 Speed \u2014 how fast it ran"),
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
        ] }) : null,
        ev ? jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
          sec("\u{1F4CA} Activity \u2014 what actually happened"),
          jsx("div", { className: "tg-chipgrid", children: [
            chip("Sessions", fmt(data.sources.projcache.sessions), "#60a5fa"),
            chip("LLM steps", fmt(ev.steps || 0), "#60a5fa"),
            chip("Tool calls", fmt((ev.toolCalls || 0) + (ev.toolSubCalls || 0)), "#a78bfa"),
            chip("Your messages", fmt(ev.userMessages || 0), "#34d399"),
            chip("Assistant msgs", fmt(ev.assistantMessages || 0), "#2dd4bf"),
            chip("Turns", fmt(ev.turns || 0), "#fbbf24"),
            chip("Compactions", fmt(ev.compactions || 0), "#f472b6")
          ] })
        ] }) : null,
        jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: 2 }, children: "sources: " + data.sources.projcache.sessions + " sessions (" + data.sources.projcache.nonZero + " with usage) \xB7 " + data.sources.trajectories.files + " trajectories (" + data.sources.trajectories.withUsage + " with per-turn usage, " + data.sources.trajectories.withModelTimeline + " with model events" + (data.sources.trajectories.cache ? " \xB7 parse cache " + data.sources.trajectories.cache.hits + " hits / " + data.sources.trajectories.cache.recomputed + " recomputed" : "") + ")" })
      ]
    });
  }
  function TokenGobblerModal({ onClose, initialTab, initialDay }) {
    const { data, breakdown, perf, error, loading, refreshing, loadData, reprocess, reprocessing, reprocessMsg } = useGobblerData();
    const [tab, setTab] = React.useState(initialTab || "events");
    const [openSession, setOpenSession] = React.useState(null);
    const [openToken, setOpenToken] = React.useState(null);
    const [pageState, setPageState] = React.useState({});
    const pageFor = (k) => pageState[k] || 0;
    const setPageFor = (k) => (p) => setPageState((s) => ({ ...s, [k]: p }));
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
      const bySession = breakdown && breakdown.bySession || [];
      const byDay = breakdown && breakdown.byDay || [];
      const events = data.events || breakdown && breakdown.events || null;
      const tools = data.tools || breakdown && breakdown.tools || [];
      const eventsTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 12 }, children: "Activity by event type" }),
          eventChips(events)
        ] }),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 12 }, children: "Top tools (what actually ran)" }),
          toolTable(tools, true)
        ] })
      ] });
      const modelsTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 22 }, children: [
        jsxs("div", { children: [jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "What you actually ran (real mix)" }), realModelTable(data.byModel)] }),
        jsxs("div", { children: [jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "What it would cost the corp" }), comparisonTable(data.comparison)] })
      ] });
      const sessionsTab = sessionTable(bySession, openSession, setOpenSession);
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
      const wfh = data.split && data.split.wfh || { sessions: 0, tokens: 0, cost: 0, corpCost: null, saved: null, referenceLabel: null };
      const cop = data.split && data.split.corp || { sessions: 0, tokens: 0, cost: 0 };
      const sv = data.savings;
      const refLabel = wfh.referenceLabel || "corp";
      const costTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
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
        ] }),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Cost by day" }),
          dayTable(byDay)
        ] }),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Cost by session" }),
          sessionTable(bySession, openSession, setOpenSession)
        ] })
      ] });
      const performanceTabEl = perf === void 0 ? jsx("div", { style: { padding: 40, color: "#94a3b8", textAlign: "center" }, children: "Counting the gobbled tokens\u2026" }) : perf === null ? jsx("div", { style: { padding: 40, color: "#94a3b8", textAlign: "center" }, children: "Performance data unavailable \u2014 restart the web server (dsh web) to enable the Performance tab." }) : perf && perf.__error ? jsx("div", { style: { padding: 40, color: "#f87171", textAlign: "center" }, children: "Performance data failed to load: " + perf.__error }) : jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
        badgeGrid([
          costCard("Decode speed (avg)", perf.totals.decode.tokPerSec != null ? perf.totals.decode.tokPerSec + " tok/s" : "\u2014", fmtC(perf.totals.decode.tokens) + " streamed tokens \xB7 " + fmtMs(perf.totals.decode.ms), "#fbbf24"),
          costCard("Prompt processing (avg)", perf.totals.prefill.tokPerSec != null ? perf.totals.prefill.tokPerSec + " tok/s" : "\u2014", fmtC(perf.totals.prefill.tokens) + " new ctx tokens \xB7 " + fmtMs(perf.totals.prefill.ms) + " of TTFT" + (perf.totals.prefill.avgTtftMs != null ? " \xB7 avg " + fmtMs(perf.totals.prefill.avgTtftMs) : ""), "#2dd4bf")
        ]),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "Performance by model" }),
          jsx(AmBarChart, {
            data: (perf.byModel || []).map((m) => ({ cat: m.label, decode: m.tokPerSec ?? 0, prefill: m.promptTokPerSec ?? 0 })),
            categoryField: "cat",
            series: [
              { key: "decode", label: "Decode", color: "#38bdf8", unit: "tok/s", axis: 0 },
              { key: "prefill", label: "Prefill", color: "#2dd4bf", unit: "tok/s", axis: 0 }
            ],
            height: 240
          }),
          jsx(Collapse, { label: "Show model table", children: perfModelTable(perf.byModel) })
        ] }),
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 10 }, children: "All steps \u2014 expand a session to see its turn/step tree with tool calls + prefill/decode" }),
          SessionTable({
            columns: { turns: true, runtime: false, total: false },
            rows: bySession.filter((s) => s.steps && s.steps.length),
            expandedId: openSession,
            onToggle: setOpenSession,
            drawer: perfDrawer,
            page: pageFor("perfTree"),
            setPage: setPageFor("perfTree"),
            pageSize: 25,
            empty: jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No per-step timing yet \u2014 sessions with per-turn usage will appear here." })
          })
        ] }),
        jsx("div", { className: "tg-faint", style: { fontSize: 11, lineHeight: 1.6 }, children: "Decode = streamed output tokens \xF7 decode time (first\u2192last chunk). Prefill = new (uncached) input tokens \xF7 TTFT (request\u2192first token) \u2014 TTFT includes network + queue, so prefill speed is a lower bound on the model's true prompt-processing rate. Cached context is served from the provider's cache and isn't counted as new work. Only sessions with per-turn usage carry timing." })
      ] });
      const tokenModelRows = (data.byModel || []).slice(0, 10).map((m) => ({
        label: m.label,
        in: m.uncachedInputTokens ?? 0,
        out: m.outputTokens ?? 0,
        cache: (m.cacheReadTokens ?? 0) + (m.cacheWriteTokens ?? 0),
        think: m.reasoningTokens ?? 0
      }));
      const tokensTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
        tokenModelRows.length ? jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 4 }, children: "Token spend by model \u2014 top 10 (all sessions)" }),
          jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Top 10 models by total tokens. Each model's in / out / cache / thinking summed across every session. Thinking = reasoning tokens (exact-usage sessions only); it is a subdivision of Out, shown separately for insight." }),
          jsx(TokenSpendChart, { rows: tokenModelRows, horizontal: true, hideCategoryLabels: true, height: Math.min(440, 150 + tokenModelRows.length * 22) })
        ] }) : null,
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 4 }, children: "Token breakdown \u2014 per turn & step" }),
          jsx("div", { className: "tg-faint", style: { fontSize: 11 }, children: "Each row is a session; click to expand it. The drawer shows a summary + the breakdown per turn \u2192 step \u2014 every turn is a collapsible row, each LLM step a row showing the tools it called and the context tokens it moved (in / out / cache)." })
        ] }),
        SessionTable({
          columns: { decode: false, prefill: false, runtime: false },
          rows: bySession.filter((s) => s.toolTokens && s.toolTokens.length),
          expandedId: openToken,
          onToggle: setOpenToken,
          drawer: tokenTreeDrawer,
          page: pageFor("tokSess"),
          setPage: setPageFor("tokSess"),
          pageSize: 25,
          empty: jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No per-step token data yet \u2014 appears once sessions record per-turn usage." })
        }),
        jsx("div", { className: "tg-faint", style: { fontSize: 11, lineHeight: 1.6 }, children: "Tokens = the LLM step's full context attribution for the tools called in that step. Thinking = reasoning tokens (\u2248 estimated from reasoning text when the provider reports 0)." })
      ] });
      const combined = (() => {
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
        const overTime = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 20 }, children: [
          jsxs("div", { children: [
            // jsx("div", { className: "tg-label", style: { marginBottom: 8 }, children: "📈 Over time — token usage" }),
            jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Daily totals of the token badges (In / Out / Cache / Think / Total) across every session." }),
            jsx(AmBarChart, {
              data: daySeries2,
              categoryField: "date",
              kind: "line",
              smooth: true,
              log: true,
              unit: "tok",
              series: [
                { key: "in", label: "In", color: "#60a5fa", unit: "tok", axis: 0 },
                { key: "out", label: "Out", color: "#a78bfa", unit: "tok", axis: 0 },
                { key: "cache", label: "Cache", color: "#2dd4bf", unit: "tok", axis: 0 },
                { key: "think", label: "Think", color: "#c084fc", unit: "tok", axis: 0 },
                { key: "total", label: "Total", color: "#fbbf24", unit: "tok", axis: 0 }
              ],
              height: 220
            })
          ] }),
          jsxs("div", { children: [
            jsx("div", { className: "tg-label", style: { marginBottom: 8 }, children: "\u{1F4C8} Over time \u2014 speed" }),
            jsx("div", { className: "tg-faint", style: { fontSize: 11, marginBottom: 8 }, children: "Daily decode & prefill speed (tok/s) and average TTFT (seconds)." }),
            jsx(AmBarChart, {
              data: daySeries2,
              categoryField: "date",
              kind: "line",
              smooth: true,
              unit: "tok/s",
              series: [
                { key: "decode", label: "Decode", color: "#38bdf8", unit: "tok/s", axis: 0 },
                { key: "prefill", label: "Prefill", color: "#2dd4bf", unit: "tok/s", axis: 0 },
                { key: "ttft", label: "Avg TTFT", color: "#fbbf24", unit: "s", axis: 1 }
              ],
              height: 190
            })
          ] })
        ] });
        return jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 24 }, children: [
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
              empty: jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "12px 4px" }, children: "No combined per-step data yet \u2014 appears once sessions record per-turn usage." })
            })
          ] })
        ] });
      })();
      const runsTab = jsx(RunsTab, { bySession });
      body = tab === "events" ? eventsTab : tab === "cost" ? costTab : tab === "models" ? modelsTab : tab === "performance" ? performanceTabEl : tab === "tokens" ? tokensTab : tab === "combined" ? combined : tab === "runs" ? runsTab : tab === "daily" ? jsx(DailyTab, { bySession, initialDay }) : tab === "pricing" ? pricingTabEl : sessionsTab;
    }
    return jsxs("div", { className: "tg-modal-overlay", role: "presentation", children: [
      jsx("div", { className: "tg-modal-mask", "aria-hidden": "true", onClick: onClose }),
      jsxs("div", { className: "tg-modal-panel", role: "dialog", "aria-modal": "true", children: [
        jsxs("div", { className: "tg-modal-header", children: [
          jsxs("div", { children: [
            jsx("div", { style: { fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }, children: "\u{1F983} Token Gobbler \u2014 activity" }),
            jsx("div", { style: { color: "#94a3b8", marginTop: 2, fontSize: 12 }, children: "Events, tools, models and sessions across your whole DSH home." })
          ] }),
          jsxs("div", { style: { display: "flex", gap: 8 }, children: [
            jsx("button", { className: "tg-ghost", onClick: () => loadData(), disabled: refreshing, children: refreshing ? "Refreshing\u2026" : "\u21BB Refresh" }),
            jsx("button", { className: "tg-reprocess", onClick: () => reprocess(), disabled: reprocessing || refreshing, children: reprocessing ? "Reprocessing\u2026" : "\u267B Reprocess" }),
            jsx("button", { className: "tg-close", onClick: onClose, "aria-label": "Close", children: "\u2715" })
          ] })
        ] }),
        reprocessMsg ? jsx("div", { className: "tg-faint", style: { fontSize: 11, padding: "0 20px 10px" }, children: reprocessMsg }) : null,
        jsx("div", { className: "tg-seg", style: { margin: "0 20px 16px" }, children: [segBtn(tab, setTab, "events", "Events"), segBtn(tab, setTab, "cost", "Cost"), segBtn(tab, setTab, "models", "Models"), segBtn(tab, setTab, "performance", "Performance"), segBtn(tab, setTab, "tokens", "Tokens"), segBtn(tab, setTab, "combined", "Combined (wip)"), segBtn(tab, setTab, "runs", "Runs"), segBtn(tab, setTab, "daily", "Daily"), segBtn(tab, setTab, "sessions", "Sessions"), segBtn(tab, setTab, "pricing", "Pricing")] }),
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

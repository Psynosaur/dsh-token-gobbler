(() => {
  // client/token-gobbler.css
  var token_gobbler_default = "/* token-gobbler \xB7 scoped styles */\n\n/* \u2500\u2500 base \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-root,.tg-modal-overlay{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e5e7eb;line-height:1.45}\n.tg-root *,.tg-modal-overlay *{box-sizing:border-box}\n.tg-num{font-variant-numeric:tabular-nums;font-feature-settings:'tnum'}\n\n/* \u2500\u2500 cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-card{background:linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015));border:1px solid rgba(255,255,255,0.08);border-radius:14px}\n.tg-label{font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#94a3b8}\n.tg-faint{color:#64748b}\n.tg-sec{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#64748b}\n.tg-muted{color:#94a3b8}\n\n/* \u2500\u2500 stat cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-stat{padding:14px 16px;transition:border-color .15s ease,transform .15s ease}\n.tg-stat:hover{border-color:rgba(255,255,255,0.2);transform:translateY(-2px)}\n.tg-stat-dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex:none}\n.tg-stat-value{font-size:22px;font-weight:700;margin-top:7px;letter-spacing:-0.01em}\n.tg-stat-total{border-color:rgba(251,191,36,0.35);background:linear-gradient(180deg,rgba(251,191,36,0.10),rgba(255,255,255,0.02))}\n.tg-stat-total .tg-stat-value{color:#fbbf24;font-size:24px}\n\n/* \u2500\u2500 hero / WFH \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-hero{padding:18px 20px;background:linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.1)}\n.tg-hero-value{font-size:34px;font-weight:800;letter-spacing:-0.02em;margin-top:2px}\n.tg-wfh{padding:18px 20px;background:linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.02));border:1px solid rgba(16,185,129,0.32)}\n.tg-wfh-value{font-size:28px;font-weight:800;letter-spacing:-0.02em;margin-top:2px;color:#34d399}\n.tg-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:5px 11px;border-radius:999px;background:rgba(16,185,129,0.16);border:1px solid rgba(16,185,129,0.35);color:#34d399;white-space:nowrap}\n\n/* \u2500\u2500 segmented control \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-seg{display:inline-flex;gap:3px;padding:3px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px}\n.tg-seg-btn{font-size:12px;font-weight:600;padding:5px 13px;border-radius:7px;border:none;cursor:pointer;color:#94a3b8;background:transparent;transition:background .15s ease,color .15s ease}\n.tg-seg-btn:hover{color:#e5e7eb}\n.tg-seg-btn.active{background:rgba(251,191,36,0.16);color:#fde68a}\n\n/* \u2500\u2500 tables \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-table{width:100%;border-collapse:separate;border-spacing:0;font-size:13px}\n.tg-th{text-align:left;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#94a3b8;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.12);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}\n.tg-sticky .tg-th{position:sticky;top:0;z-index:2;background:#0d1524}\n.tg-th-r{text-align:right}\n.tg-td{padding:11px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:#e5e7eb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}\n.tg-td-r{text-align:right}\n.tg-tr{transition:background .12s ease}\n.tg-tr:hover{background:rgba(255,255,255,0.03)}\n.tg-tr:last-child .tg-td{border-bottom:none}\n.tg-kind{font-size:12px;font-weight:600}\n\n/* \u2500\u2500 scroll containers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-scroll{overflow-x:auto}\n.tg-scroll::-webkit-scrollbar{height:8px}\n.tg-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:4px}\n.tg-scroll::-webkit-scrollbar-track{background:transparent}\n.tg-tscroll{overflow:visible}\n\n/* \u2500\u2500 buttons \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-refresh{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;padding:7px 14px;border-radius:9px;cursor:pointer;border:1px solid rgba(251,191,36,0.4);background:rgba(251,191,36,0.12);color:#fde68a;transition:background .15s ease,transform .1s ease,border-color .15s ease;white-space:nowrap}\n.tg-refresh:hover{background:rgba(251,191,36,0.2);border-color:rgba(251,191,36,0.6)}\n.tg-refresh:active{transform:scale(0.97)}\n.tg-refresh:disabled{opacity:0.55;cursor:default}\n.tg-reprocess{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;padding:7px 14px;border-radius:9px;cursor:pointer;border:1px solid rgba(167,139,250,0.4);background:rgba(167,139,250,0.12);color:#c4b5fd;transition:background .15s ease,transform .1s ease,border-color .15s ease;white-space:nowrap}\n.tg-reprocess:hover{background:rgba(167,139,250,0.22);border-color:rgba(167,139,250,0.6)}\n.tg-reprocess:active{transform:scale(0.97)}\n.tg-reprocess:disabled{opacity:0.55;cursor:default}\n.tg-ghost{font-size:12px;font-weight:600;padding:7px 12px;border-radius:9px;cursor:pointer;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:#cbd5e1;transition:background .15s ease,border-color .15s ease;white-space:nowrap}\n.tg-ghost:hover{background:rgba(255,255,255,0.09);border-color:rgba(255,255,255,0.24)}\n.tg-ghost:disabled{opacity:0.55;cursor:default}\n\n/* \u2500\u2500 FAB \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-fab{position:fixed;bottom:22px;right:22px;z-index:1;width:46px;height:46px;border-radius:50%;border:1px solid rgba(251,191,36,0.45);background:rgba(20,16,8,0.82);backdrop-filter:blur(8px);box-shadow:0 8px 24px rgba(0,0,0,0.45);cursor:pointer;font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;transition:transform .12s ease,background .15s ease,border-color .15s ease}\n.tg-fab:hover{transform:scale(1.06);background:rgba(40,30,12,0.9);border-color:rgba(251,191,36,0.7)}\n.tg-fab:active{transform:scale(0.97)}\n\n/* \u2500\u2500 modal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-modal-overlay{position:fixed;inset:0;z-index:2;display:flex;align-items:center;justify-content:center}\n.tg-modal-mask{position:absolute;inset:0;background:rgba(2,6,12,0.62);backdrop-filter:blur(3px)}\n.tg-modal-panel{position:relative;z-index:1;width:min(1180px,calc(100vw - 48px));height:min(860px,calc(100vh - 48px));background:linear-gradient(180deg,#0e1626,#0b111d);border:1px solid rgba(255,255,255,0.1);border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,0.6);display:flex;flex-direction:column;overflow:hidden;color:#e5e7eb}\n.tg-modal-header{flex:none;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:18px 20px 14px;border-bottom:1px solid rgba(255,255,255,0.07)}\n.tg-close{cursor:pointer;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:#cbd5e1;font-size:14px;display:flex;align-items:center;justify-content:center;transition:background .15s ease,border-color .15s ease,color .15s ease}\n.tg-close:hover{background:rgba(248,113,113,0.18);border-color:rgba(248,113,113,0.4);color:#fca5a5}\n.tg-modal-body{flex:1;min-height:0;overflow:auto;padding:20px}\n.tg-modal-body::-webkit-scrollbar{width:10px;height:8px}\n.tg-modal-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:5px}\n\n/* \u2500\u2500 chips \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-chipgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}\n.tg-chip{display:flex;align-items:center;gap:8px;padding:11px 13px;background:linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015));border:1px solid rgba(255,255,255,0.08);border-radius:12px}\n.tg-chip-label{font-size:12px;color:#94a3b8;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.tg-chip-value{font-size:16px;font-weight:700;color:#f1f5f9}\n.tg-bar{height:8px;border-radius:4px;background:linear-gradient(90deg,#f59e0b,#fbbf24);min-width:2px}\n\n/* \u2500\u2500 rows / chevrons \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-row-btn{cursor:pointer}\n.tg-chev{display:inline-block;width:14px;font-size:10px;color:#64748b;transition:transform .15s ease}\n.tg-chev.open{transform:rotate(90deg);color:#fbbf24}\n\n/* \u2500\u2500 drawer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-drawer-row{background:rgba(255,255,255,0.02)}\n.tg-drawer-inner{padding:16px 18px 18px 42px;display:flex;flex-direction:column;gap:16px;width:100%;min-width:0;max-width:100%;box-sizing:border-box}\n/* scrollable sub-tables inside drawers (per-step, tool payload, etc.) */\n.tg-scrollable{max-height:320px;overflow-y:auto;overscroll-behavior:contain;border-radius:8px}\n.tg-scrollable::-webkit-scrollbar{width:7px}\n.tg-scrollable::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.10);border-radius:4px}\n.tg-scrollable::-webkit-scrollbar-track{background:transparent}\n.tg-group td{padding:8px 12px 4px;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#64748b;border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);position:sticky;top:0}\n.tg-meta-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}\n.tg-meta{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:9px;padding:8px 10px;min-width:0}\n.tg-meta-k{font-size:10px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#64748b}\n.tg-meta-v{font-size:12.5px;color:#e5e7eb;margin-top:3px;word-break:break-word}\n.tg-drawer-sec{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#94a3b8;margin-bottom:8px}\n.tg-drawer-sub{font-size:11px;font-weight:600;color:#64748b;margin-bottom:6px}\n.tg-turn{border-left:2px solid rgba(251,191,36,0.45);padding:6px 12px;margin-bottom:8px;background:rgba(255,255,255,0.02);border-radius:0 8px 8px 0}\n.tg-turn-p{font-size:12.5px;color:#e5e7eb;font-weight:600;word-break:break-word}\n.tg-turn-r{font-size:12px;color:#94a3b8;margin-top:4px;line-height:1.5;word-break:break-word}\n\n/* \u2500\u2500 inputs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-input{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:7px;color:#e5e7eb;font-size:12.5px;padding:6px 8px;font-variant-numeric:tabular-nums;min-width:0}\n.tg-input:focus{outline:none;border-color:rgba(251,191,36,0.55)}\n.tg-input-num{text-align:right;-webkit-appearance:none;-moz-appearance:textfield;appearance:textfield}\n/* hide number spinners \u2014 they reserve a box that crowds the right-aligned value */\n.tg-input-num::-webkit-outer-spin-button,.tg-input-num::-webkit-inner-spin-button{-webkit-appearance:none;appearance:none;margin:0}\n.tg-input-label{width:100%}\n.tg-input-id{width:100%;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:#94a3b8}\n\n/* \u2500\u2500 pricing rate field (2-col grid inside a card) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-rate-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px}\n.tg-rate-field{display:flex;flex-direction:column;gap:4px;min-width:0}\n.tg-rate-field input{width:100%;min-width:0}\n\n/* \u2500\u2500 perf bar chart (reusable metricBars) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* (metricBars was replaced by amCharts \u2014 see client/amchart.tsx. These legacy\n   classes are kept only as a fallback and for the simple tool-share bar.) */\n/* .tg-chart is width:100% + min/max-width:0 so a chart with hundreds of bars\n   never expands its parent (the drawer <td> / modal) \u2014 the bars scroll inside\n   .tg-barchart instead. Legend is a bullet list outside the chart. */\n.tg-chart{display:flex;flex-direction:column;gap:8px;width:100%;min-width:0;max-width:100%}\n.tg-barchart{display:flex;align-items:flex-end;gap:3px;overflow-x:auto;width:100%;min-width:0;max-width:100%;padding:0 2px 2px}\n.tg-barchart::-webkit-scrollbar{height:7px}\n.tg-barchart::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.10);border-radius:4px}\n.tg-barstep{display:flex;flex-direction:column;align-items:center;gap:2px;flex:none;min-width:24px}\n.tg-bararea{height:150px;display:flex;align-items:flex-end;gap:2px}\n.tg-bar{width:9px;border-radius:2px 2px 0 0;min-height:2px}\n.tg-bar-decode{background:#38bdf8}\n.tg-bar-prefill{background:#2dd4bf}\n.tg-bar-in{background:#60a5fa}\n.tg-bar-out{background:#a78bfa}\n.tg-bar-cache{background:#2dd4bf}\n.tg-bar-think{background:#c084fc}\n.tg-barstep-x{font-size:9px;color:#64748b;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}\n.tg-barstep-sub{font-size:8px;color:#64748b;max-width:56px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.tg-legend{list-style:disc;margin:0;padding-left:20px;font-size:11px;color:#94a3b8;display:flex;flex-direction:column;gap:3px}\n.tg-legend-i{display:flex;align-items:center;gap:6px}\n.tg-legend-dot{width:10px;height:10px;border-radius:2px;display:inline-block;flex:none}\n\n/* \u2500\u2500 amCharts column chart (reusable AmBarChart) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* amCharts renders an SVG sized to its container; the container is width:100%\n   and min-width:0, so a chart with hundreds of categories stays inside the\n   drawer <td> / modal instead of pushing it wide. */\n.tg-amchart{width:100%;min-width:0;max-width:100%;position:relative;border-radius:10px;overflow:hidden}\n.tg-amchart-err{display:flex;align-items:center;justify-content:center;color:#f87171;font-size:12.5px;padding:12px}\n/* wrapper so the turn chips sit above the chart without widening it */\n.tg-amchart-wrap{width:100%;min-width:0;max-width:100%;display:flex;flex-direction:column;gap:8px}\n/* turn chips \u2014 one per turn; click to zoom the chart to that turn */\n.tg-turn-chips{display:flex;flex-wrap:wrap;gap:6px}\n.tg-turn-chip{font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#94a3b8;cursor:pointer;white-space:nowrap;transition:background .12s ease,color .12s ease,border-color .12s ease}\n.tg-turn-chip:hover{background:rgba(255,255,255,0.1);color:#e5e7eb}\n.tg-turn-chip.active{background:rgba(251,191,36,0.16);color:#fde68a;border-color:rgba(251,191,36,0.4)}\n\n/* \u2500\u2500 collapse (reusable) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.tg-collapse{display:flex;flex-direction:column;gap:8px}\n.tg-collapse-head{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:#cbd5e1;padding:6px 11px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;width:fit-content;transition:background .12s ease,border-color .12s ease}\n.tg-collapse-head:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.18)}\n\n/* \u2500\u2500 misc \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n/* delete button \u2014 same height & radius as the corp/local <select> (.tg-input) so they\n   sit level in the card-header flex row. padding:6px 11px + line-height:1.45 \u2248 30px. */\n.tg-del{cursor:pointer;color:#64748b;font-size:12.5px;line-height:1.45;padding:6px 11px;border-radius:7px;border:1px solid rgba(255,255,255,0.1);background:transparent;transition:color .12s ease,border-color .12s ease,background .12s ease}\n.tg-del:hover{color:#fca5a5;border-color:rgba(248,113,113,0.4);background:rgba(248,113,113,0.10)}\n.tg-flash-ok{color:#34d399;font-size:12.5px;font-weight:600}\n.tg-flash-err{color:#f87171;font-size:12.5px;font-weight:600}\n.tg-refrow{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:14px 16px}\n.tg-kind-badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;white-space:nowrap}\n";

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
    { key: "compactions", label: "Compactions", color: "#f472b6" },
    { key: "retries", label: "LLM retries", color: "#fb923c" },
    { key: "approvals", label: "Approvals", color: "#f87171" },
    { key: "todos", label: "Todo writes", color: "#a3e635" },
    { key: "commands", label: "Commands", color: "#38bdf8" }
  ];
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
    const { columns, rows, rowKey, expandedId, onToggle, drawer, page = 0, setPage, pageSize = 0, groupBy, empty, compact } = opts;
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
        className: "tg-tr" + (hasDrawer ? " tg-row-btn" : "") + (compact ? " tg-compact" : ""),
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
      return [rowEl, jsx("tr", { className: "tg-drawer-row", children: jsx("td", { colSpan, style: { padding: 0, borderBottom: "1px solid rgba(255,255,255,0.08)", minWidth: 0, width: "100%", boxSizing: "border-box" }, children: drawer(r) }) }, key + "-drawer")];
    };
    return jsxs("div", { className: "tg-tscroll", children: [
      jsxs("table", { className: "tg-table tg-sticky", style: hasDrawer ? { tableLayout: "fixed", width: "100%" } : void 0, children: [
        jsx("tr", { children: [hasDrawer ? thL("") : null, ...columns.map((c) => c.align === "r" ? thR(c.label) : thL(c.label))] }),
        ...groups.flatMap((g) => g.label ? [jsx("tr", { className: "tg-group", children: jsx("td", { colSpan, children: g.label }) }, g.label + "-g")] : []),
        ...pageRows.flatMap(renderRow)
      ] }),
      pageSize > 0 && totalPages > 1 ? jsxs("div", { className: "tg-pager", style: { display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" }, children: [
        jsx("button", { className: "tg-ghost", disabled: safePage <= 0, onClick: () => setPage && setPage(safePage - 1), children: "\u2039 Prev" }),
        jsx("span", { className: "tg-faint", style: { fontSize: 12 }, children: safePage + 1 + " / " + totalPages + " \xB7 " + total + " rows" }),
        jsx("button", { className: "tg-ghost", disabled: safePage >= totalPages - 1, onClick: () => setPage && setPage(safePage + 1), children: "Next \u203A" })
      ] }) : null
    ] });
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
  var sig = (p) => p.categoryField + "|n" + p.data.length + "|" + p.series.map((s) => s.key + ":" + s.color + ":" + (s.axis || 0)).join(",") + "|k" + (p.kind || "column") + "|sm" + (p.smooth ? 1 : 0) + "|st" + (p.stacked ? 1 : 0) + "|lg" + (p.log ? 1 : 0) + "|h" + (p.height ?? 260) + "|g" + (p.groupField || "") + "|" + p.data.map((r) => r[p.groupField]).join(",") + // full per-cell fingerprint (not just the grand total) so a refresh that keeps the
  // total but redistributes values across rows/series still rebuilds the chart.
  "|v" + p.data.map((r) => p.series.map((s) => Number(r[s.key]) || 0).join(".")).join(",");
  var AmBarChart = (props) => {
    const ref = React.useRef(null);
    const axisRef = React.useRef(null);
    const [err, setErr] = React.useState(false);
    const [errMsg, setErrMsg] = React.useState("");
    const [active, setActive] = React.useState(null);
    const key = sig(props);
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
    React.useEffect(() => {
      let root;
      let disposed = false;
      loadAmCharts().then((w) => {
        if (disposed || !ref.current) return;
        const am5 = w.am5, am5xy = w.am5xy;
        root = am5.Root.new(ref.current);
        root.setThemes([w.am5themes_Dark.new(root), w.am5themes_Animated.new(root)]);
        const chart = root.container.children.push(am5xy.XYChart.new(root, { panY: false, layout: root.verticalLayout }));
        const catAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, { renderer: am5xy.AxisRendererX.new(root, {}), categoryField: props.categoryField }));
        catAxis.data.setAll(props.data);
        catAxis.get("renderer").grid.template.set("strokeOpacity", 0);
        catAxis.get("renderer").labels.template.setAll({ fontSize: 10, maxWidth: 100, wrap: true, textAlign: "center" });
        if (props.rotateCategories) catAxis.get("renderer").labels.template.set("rotation", -45);
        axisRef.current = catAxis;
        const maxAxis = props.series.reduce((m, s) => Math.max(m, s.axis || 0), 0);
        const yAxes = [];
        for (let a = 0; a <= maxAxis; a++) {
          const settings = {
            renderer: am5xy.AxisRendererY.new(root, a === 0 ? {} : { opposite: true })
          };
          if (props.log) {
            settings.logarithmic = true;
            settings.treatZeroAs = 1;
          } else {
            settings.min = 0;
          }
          yAxes.push(chart.yAxes.push(am5xy.ValueAxis.new(root, settings)));
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
          const base = {
            name: s.label,
            xAxis: catAxis,
            yAxis: yAxes[s.axis || 0],
            valueYField: s.key,
            categoryXField: props.categoryField,
            stacked: !!props.stacked
          };
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
          parts.push("{categoryX}", "{name}", "{valueY}" + (unit ? " " + unit : ""));
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
            ser.columns.template.set("width", am5.percent(props.stacked ? 90 : 60));
          }
          ser.data.setAll(props.data);
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
    if (!props.data || !props.data.length) return null;
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
      jsx("div", { ref, className: "tg-amchart", style: { height: (props.height ?? 260) + "px" } })
    ] });
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
  var Collapse = ({ label, children, defaultOpen }) => {
    const [open, setOpen] = React.useState(!!defaultOpen);
    return jsxs("div", { className: "tg-collapse", children: [
      jsx("button", { className: "tg-collapse-head", onClick: () => setOpen((o) => !o), children: [
        jsx("span", { className: "tg-chev" + (open ? " open" : ""), children: "\u25B6" }),
        jsx("span", { children: label })
      ] }),
      open ? jsx("div", { className: "tg-collapse-body", children }) : null
    ] });
  };
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
            tdR(""),
            tdR(""),
            tdR(""),
            tdR("")
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
  var tokenTreeDrawer = (s) => {
    const m = s.meta || {};
    const stepCount = s.events ? s.events.steps || 0 : s.stepTree ? s.stepTree.reduce((n, t) => n + t.steps.length, 0) : 0;
    const meta = [
      ["Project", s.cwd],
      ["Turns", s.turns || null],
      ["Steps", stepCount || null],
      ["Models", s.modelMix],
      ["Total", s.allTokens ? fmtC(s.allTokens) + " tokens" : null],
      ["LLM time", s.llmMs ? fmtMs(s.llmMs) : null],
      ["Speed", s.tokPerSec != null ? s.tokPerSec + " tok/s" : null],
      ["Last model", m.lastUsedModel ? m.lastUsedModel.model + " \xB7 " + (m.lastUsedModel.provider || "?") : null]
    ];
    return jsxs("div", { className: "tg-drawer-inner", children: [
      metaGrid(meta),
      jsxs("div", { children: [
        jsx("div", { className: "tg-drawer-sec", children: "Token overview \u2014 per step (in / out / cache / think)" }),
        s.stepTree && s.stepTree.length ? jsx(AmBarChart, {
          data: (() => {
            const rows = [];
            let i = 0;
            for (const t of s.stepTree) for (const st of t.steps || []) {
              i += 1;
              rows.push({ cat: "S" + i, turn: "Turn " + t.turn, tool: (st.tools || []).slice(0, 3).join(", "), vIn: st.in ?? 0, vOut: st.out ?? 0, cache: st.cache ?? 0, think: st.thinking ?? 0 });
            }
            return rows;
          })(),
          categoryField: "cat",
          groupField: "turn",
          subField: "tool",
          kind: "area",
          stacked: true,
          smooth: true,
          unit: "tok",
          series: [
            { key: "vIn", label: "In", color: "#60a5fa", unit: "tok" },
            { key: "vOut", label: "Out", color: "#a78bfa", unit: "tok" },
            { key: "cache", label: "Cache", color: "#2dd4bf", unit: "tok" },
            { key: "think", label: "Think", color: "#c084fc", unit: "tok" }
          ],
          height: 240
        }) : null,
        jsx(Collapse, {
          label: "Show per-turn & step token table",
          children: s.stepTree && s.stepTree.length ? jsx("div", { className: "tg-scrollable", children: jsx(TurnStepTable, { steps: s.stepTree }) }) : s.toolTokens && s.toolTokens.length ? estimatedToolTable(s.toolTokens) : jsx("div", { className: "tg-muted", style: { fontSize: 13, padding: "8px 4px" }, children: "No per-step token data for this session yet." })
        }),
        jsx("div", { className: "tg-faint", style: { fontSize: 10, marginTop: 6 }, children: "Each turn expands to its steps. In/Out/Cache = the context tokens the LLM step moved. Think = reasoning tokens (\u2248 estimated from reasoning text when the provider reports 0)." })
      ] })
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
  var sessionTable = (bySession, openId, onToggle) => jsx("div", { className: "tg-tscroll", children: jsxs("table", { className: "tg-table tg-sticky", children: [
    jsx("tr", { children: [thL(""), thL("Date"), thL("Session"), thL("Models used"), thR("Steps"), thR("Tools"), thR("In"), thR("Out"), thR("CacheR"), thR("Total"), thR("Cost")] }),
    ...(bySession || []).flatMap((s) => {
      const open = openId === s.id;
      const row = jsxs("tr", {
        className: "tg-tr tg-row-btn",
        style: open ? { background: "rgba(251,191,36,0.05)" } : void 0,
        onClick: () => {
          onToggle(open ? null : s.id);
        },
        children: [
          tdL(jsx("span", { className: "tg-chev" + (open ? " open" : ""), children: "\u25B6" })),
          tdL(s.date),
          tdL(s.title || s.cwd || s.id, { style: { maxWidth: 180, whiteSpace: "normal", wordBreak: "break-word" }, title: s.title || s.cwd || s.id }),
          tdL(s.modelMix, { style: { maxWidth: 200, whiteSpace: "normal", wordBreak: "break-word", fontSize: 12, color: "#94a3b8" }, title: (s.models || []).map((m) => (m.label || m.key) + " \xD7" + m.steps).join("\n") }),
          tdR(s.events ? String(s.events.steps || 0) : "\u2014"),
          tdR(s.events ? String((s.events.toolCalls || 0) + (s.events.toolSubCalls || 0)) : "\u2014"),
          tdR(fmtC(s.uncachedInputTokens), { title: fmt(s.uncachedInputTokens) }),
          tdR(fmtC(s.outputTokens), { title: fmt(s.outputTokens) }),
          tdR(fmtC(s.cacheReadTokens), { title: fmt(s.cacheReadTokens) }),
          tdR(fmtC(s.allTokens), { style: { fontWeight: 700 }, title: fmt(s.allTokens) }),
          tdR(s.cost != null ? money(s.cost) : "\u2014", { style: { fontWeight: 600, color: "#fde68a" } })
        ]
      }, s.id);
      if (!open) return [row];
      return [row, jsx("tr", { className: "tg-drawer-row", children: jsx("td", { colSpan: 11, style: { padding: 0, borderBottom: "1px solid rgba(255,255,255,0.08)" }, children: sessionDrawer(s) }) }, s.id + "-drawer")];
    })
  ] }) });
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
    const patchModel = (id, patch) => p.setDraft((x) => x ? { ...x, models: x.models.map((m) => m.id === id ? { ...m, ...patch } : m) } : x);
    const removeModel = (id) => p.setDraft((x) => {
      if (!x) return x;
      const models = x.models.filter((m) => m.id !== id);
      let referenceModel = x.referenceModel;
      if (referenceModel === id) referenceModel = (models.find((m) => !m.local) || {}).id || null;
      return { ...x, models, referenceModel };
    });
    const refOptions = d.models.filter((m) => !m.local);
    return jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
      jsxs("div", { className: "tg-card tg-refrow", children: [
        jsx("div", { style: { flex: 1, minWidth: 240 }, children: [
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
        jsx("button", { className: "tg-refresh", onClick: p.onSave, disabled: p.saving, children: p.saving ? "Saving\u2026" : "\u{1F4BE} Save rates" }),
        p.saveMsg ? jsx("span", { className: p.saveMsg.kind === "ok" ? "tg-flash-ok" : "tg-flash-err", children: p.saveMsg.text }) : null
      ] }),
      jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", children: "Rate cards \u2014 $ per 1M tokens" }),
          jsx("div", { className: "tg-faint", style: { fontSize: 11, marginTop: 2 }, children: "Saved to " + (p.pricingPath || "your DSH home") + " \xB7 " + (d.fromFile ? "custom table (file)" : d.seeded ? "seeded from your trajectories (not saved yet)" : "built-in table (not saved yet)") })
        ] }),
        jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
          jsx("button", { className: "tg-reprocess", onClick: p.onDiscover, disabled: p.discovering, children: p.discovering ? "Scanning\u2026" : "\u{1F50E} Scan trajectories for local models" }),
          p.discoverMsg ? jsx("span", { className: "tg-faint", style: { fontSize: 11 }, children: p.discoverMsg }) : null
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

  // client/hooks.ts
  var activityRef = { open: null };
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
      try {
        const missing = (e) => e && e.status === 404 ? null : { __error: e instanceof Error ? e.message : String(e) };
        const [u, b, p] = await Promise.all([request("/usage"), request("/breakdown").catch(missing), request("/performance").catch(missing)]);
        setData(u);
        setBreakdown(b);
        setPerf(p);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
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
  function TokenGobblerModal({ onClose, initialTab }) {
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
        setDraft({ referenceModel: p.referenceModel, models: p.models, fromFile: p.fromFile, seeded: p.seeded });
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
        const saved = await request("/pricing", { referenceModel: draft.referenceModel, models });
        setPricingData(saved);
        setDraft({ referenceModel: saved.referenceModel, models: saved.models, fromFile: true, seeded: false });
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
          const rows = add.map((lp) => ({ id: lp.id, label: humanizeModel(lp.id), provider: lp.provider || null, input: lp.input || 0, output: lp.output || 0, cacheRead: lp.cacheRead || 0, cacheWrite: lp.cacheWrite || 0, estimated: false, local: true, corp: false }));
          setDraft((d) => d ? { ...d, models: [...d.models, ...rows] } : d);
        }
        setDiscoverMsg(add.length ? "Added " + add.length + " local model" + (add.length > 1 ? "s" : "") + " from trajectories." : "No new local models found \u2014 all already listed.");
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
        jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }, children: [
          costCard("WFH compute (local)", money(wfh.cost), fmt(wfh.sessions) + " sessions \xB7 " + fmtC(wfh.tokens) + " tokens", "#34d399"),
          costCard("Corp (billed)", money(cop.cost), fmt(cop.sessions) + " sessions \xB7 " + fmtC(cop.tokens) + " tokens", "#f87171"),
          costCard("Total actual", money(data.actual.cost), "priced from " + data.actual.source, "#fbbf24"),
          costCard("WFH savings", money(wfh.saved != null ? wfh.saved : 0), "local tokens at " + refLabel + " rates vs home lab", "#34d399")
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
        jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }, children: [
          costCard("Decode speed (avg)", perf.totals.decode.tokPerSec != null ? perf.totals.decode.tokPerSec + " tok/s" : "\u2014", fmtC(perf.totals.decode.tokens) + " streamed tokens \xB7 " + fmtMs(perf.totals.decode.ms), "#fbbf24"),
          costCard("Prompt processing (avg)", perf.totals.prefill.tokPerSec != null ? perf.totals.prefill.tokPerSec + " tok/s" : "\u2014", fmtC(perf.totals.prefill.tokens) + " new ctx tokens \xB7 " + fmtMs(perf.totals.prefill.ms) + " of TTFT" + (perf.totals.prefill.avgTtftMs != null ? " \xB7 avg " + fmtMs(perf.totals.prefill.avgTtftMs) : ""), "#2dd4bf")
        ] }),
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
          TgTable({
            columns: [
              { key: "date", label: "Date" },
              { key: "title", label: "Session", render: (s) => s.title || s.cwd || s.id },
              { key: "modelMix", label: "Models" },
              { key: "turns", label: "Turns", align: "r", render: (s) => (s.stepTree || []).length || "\u2014" },
              { key: "steps", label: "Steps", align: "r", render: (s) => (s.steps || []).length },
              { key: "tokPerSec", label: "Decode", align: "r", render: (s) => s.tokPerSec != null ? s.tokPerSec + " tok/s" : "\u2014" },
              { key: "prefillPerSec", label: "Prefill", align: "r", render: (s) => {
                const steps = s.steps || [];
                let tok = 0, ms = 0;
                for (const st of steps) {
                  tok += st.in || 0;
                  ms += st.ttftMs || 0;
                }
                return ms > 0 ? Math.round(tok / (ms / 1e3) * 10) / 10 + " tok/s" : "\u2014";
              }, props: (s) => ({ title: "prompt processing = new (uncached) input tokens \xF7 TTFT across all " + (s.steps || []).length + " step(s)" }) }
            ],
            rows: bySession.filter((s) => s.steps && s.steps.length),
            rowKey: (s) => s.id,
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
      const tokensTab = jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
        jsxs("div", { children: [
          jsx("div", { className: "tg-label", style: { marginBottom: 4 }, children: "Token breakdown \u2014 per turn & step" }),
          jsx("div", { className: "tg-faint", style: { fontSize: 11 }, children: "Each row is a session; click to expand it. The drawer shows a summary + the breakdown per turn \u2192 step \u2014 every turn is a collapsible row, each LLM step a row showing the tools it called and the context tokens it moved (in / out / cache)." })
        ] }),
        TgTable({
          columns: [
            { key: "date", label: "Date" },
            { key: "title", label: "Session", render: (s) => s.title || s.cwd || s.id },
            { key: "modelMix", label: "Models", render: (s) => s.modelMix },
            { key: "steps", label: "Steps", align: "r", render: (s) => s.events ? s.events.steps || 0 : "\u2014" },
            { key: "allTokens", label: "Total", align: "r", render: (s) => fmtC(s.allTokens), props: { style: { fontWeight: 600 } } }
          ],
          rows: bySession.filter((s) => s.toolTokens && s.toolTokens.length),
          rowKey: (s) => s.id,
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
      body = tab === "events" ? eventsTab : tab === "cost" ? costTab : tab === "models" ? modelsTab : tab === "performance" ? performanceTabEl : tab === "tokens" ? tokensTab : tab === "pricing" ? pricingTabEl : sessionsTab;
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
        jsx("div", { className: "tg-seg", style: { margin: "0 20px 16px" }, children: [segBtn(tab, setTab, "events", "Events"), segBtn(tab, setTab, "cost", "Cost"), segBtn(tab, setTab, "models", "Models"), segBtn(tab, setTab, "performance", "Performance"), segBtn(tab, setTab, "tokens", "Tokens"), segBtn(tab, setTab, "sessions", "Sessions"), segBtn(tab, setTab, "pricing", "Pricing")] }),
        jsx("div", { className: "tg-modal-body", children: body })
      ] })
    ] });
  }
  function TokenGobblerOverlay() {
    const [open, setOpen] = React.useState(false);
    const [openTab, setOpenTab] = React.useState("events");
    React.useEffect(() => {
      activityRef.open = (tab) => {
        if (tab) setOpenTab(tab);
        setOpen(true);
      };
      return () => {
        activityRef.open = null;
      };
    }, []);
    return jsxs(React.Fragment, { children: [
      jsx("style", { children: CSS }),
      jsx("button", { className: "tg-fab", onClick: () => {
        setOpenTab("events");
        setOpen(true);
      }, title: "Token Gobbler \u2014 activity", "aria-label": "Open Token Gobbler activity", children: "\u{1F983}" }),
      open ? jsx(TokenGobblerModal, { onClose: () => setOpen(false), initialTab: openTab }) : null
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

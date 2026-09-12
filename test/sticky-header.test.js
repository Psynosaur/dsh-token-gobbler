// token-gobbler · test/sticky-header.test.js
// Guards the sticky-table-header scoping. `position: sticky` resolves against the
// nearest SCROLLING ancestor, so a sticky table in an unbounded container pins
// itself to the modal body and hovers over every drawer's content as it scrolls
// past — the reported bug. The CSS therefore only pins a header inside a bounded
// scroll container, and TgTable only marks a table sticky while no drawer row is
// open (with a drawer open the table is split by it, so a pinned header would sit
// on top of the drawer).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repo = new URL("..", import.meta.url).pathname;
const read = (p) => readFileSync(join(repo, p), "utf8");

/** Crude but sufficient CSS rule splitter (no nested at-rules in this file's table section). */
function rules(css) {
  const out = [];
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, ""); // drop comments so they don't join selectors
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(stripped))) out.push({ selector: m[1].trim().replace(/\s+/g, " "), body: m[2].trim() });
  return out;
}

const CSS = read("client/token-gobbler.css");
const RULES = rules(CSS);
const bodyOf = (needle) => RULES.filter((r) => r.selector.includes(needle));

test("css: a sticky header is only pinned inside a BOUNDED scroll container", () => {
  const sticky = RULES.filter((r) => /\.tg-th/.test(r.selector) && /position\s*:\s*sticky/.test(r.body));
  assert.ok(sticky.length, "some rule pins .tg-th");
  for (const r of sticky) {
    const parts = r.selector.split(",").map((s) => s.trim());
    for (const p of parts) {
      // Every selector that pins a header must be scoped through a scroll
      // container (`X > .tg-sticky .tg-th`), never a bare `.tg-sticky .tg-th`.
      assert.match(p, />\s*\.tg-sticky\s+\.tg-th$/, "header pinned only under a scoped container: " + p);
      const container = p.split(">")[0].trim();
      assert.ok([".tg-tscroll", ".tg-vscroll", ".tg-scrollable", ".tg-field-scroll"].includes(container), "known scroll container: " + container);
    }
  }
});

test("css: every sticky-capable container is height-bounded (so a header cannot escape)", () => {
  const bounded = {
    ".tg-vscroll": /max-height/,
    ".tg-field-scroll": /max-height/,
    ".tg-scrollable": /max-height/,
  };
  for (const [sel, re] of Object.entries(bounded)) {
    const r = RULES.find((x) => x.selector === sel);
    assert.ok(r, "rule exists: " + sel);
    assert.match(r.body, re, sel + " is height-bounded");
    assert.match(r.body, /overflow-y\s*:\s*auto/, sel + " scrolls");
  }
  // The unbounded wrapper is horizontal-free: it must NOT itself pin anything.
  const ts = RULES.find((x) => x.selector === ".tg-tscroll");
  assert.match(ts.body, /overflow\s*:\s*visible/);
});

test("tg-table: TgTable only marks the table sticky while no drawer row is open", () => {
  const src = read("client/table.tsx");
  assert.match(src, /const openRow = hasDrawer && expandedId != null;/, "open state computed once");
  assert.match(src, /className: "tg-table" \+ \(openRow \? "" : " tg-sticky"\)/, "sticky is conditional on no open drawer");
  assert.match(src, /className: "tg-tscroll" \+ \(openRow \? "" : " tg-vscroll"\)/, "bounded only while the list scrolls on its own");
});

test("rendered table markup: an open drawer removes tg-sticky, a closed one keeps it and is bounded", async () => {
  const entry = join(repo, "test", "drawers-render.entry.tsx");
  const outfile = join(mkdtempSync(join(tmpdir(), "tg-sticky-")), "table.mjs");
  // Bundle table.tsx through a tiny shim entry so we can call TgTable directly.
  const shim = join(tmpdir(), "tg-table-entry.tsx");
  execFileSync(join(repo, "node_modules", ".bin", "esbuild"), [entry, "--bundle", "--format=esm", "--platform=node", "--outfile=" + outfile, "--log-level=warning"], { cwd: repo });
  assert.ok(shim && outfile, "bundled");
  const mod = await import(outfile);
  assert.ok(mod.TgTable, "TgTable exported for the test");
  globalThis.React = { createElement: (t, p, ...c) => ({ type: t, props: p || {}, children: c }), Fragment: "F", useState: (i) => [typeof i === "function" ? i() : i, () => {}], useMemo: (f) => f(), useRef: (i) => ({ current: i }), useEffect: () => {}, useCallback: (f) => f };
  const jsx = (type, props) => ({ type, props: props || {} });
  globalThis.jsx = jsx; globalThis.jsxs = jsx;

  const columns = [{ key: "a", label: "A" }];
  const rows = [{ id: "x", a: 1 }, { id: "y", a: 2 }];
  const opts = { columns, rows, rowKey: (r) => r.id, drawer: () => jsx("div", { children: "drawer" }) };

  const walk = (node, fn) => {
    if (node == null) return;
    if (Array.isArray(node)) { node.forEach((n) => walk(n, fn)); return; }
    if (typeof node !== "object") return;
    if (typeof node.type === "function") { walk(node.type(node.props), fn); return; }
    fn(node);
    walk(node.props && node.props.children, fn);
  };
  const classes = (el) => { const out = []; walk(el, (n) => { if (typeof n.type === "string" && n.props && typeof n.props.className === "string") out.push(n.props.className); }); return out; };
  const findClass = (el, needle) => classes(el).find((c) => c.split(" ").includes(needle)) || null;

  const closed = mod.TgTable({ ...opts, expandedId: null });
  assert.ok(findClass(closed, "tg-sticky"), "closed table is sticky");
  assert.ok(findClass(closed, "tg-vscroll"), "closed table is height-bounded (header cannot escape)");

  const open = mod.TgTable({ ...opts, expandedId: "x" });
  assert.equal(findClass(open, "tg-sticky"), null, "open drawer drops the sticky header");
  assert.equal(findClass(open, "tg-vscroll"), null, "open drawer is not height-bounded, so drawer content flows");
});

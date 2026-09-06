// token-gobbler · client/markdown.tsx
// Minimal, dependency-free Markdown renderer for the compaction summary popup.
// Builds React elements directly (no innerHTML → no XSS surface) and covers the
// subset LLM-generated summaries actually use: headings, horizontal rules,
// fenced code blocks, blockquotes, bulleted/numbered lists (nested by indent),
// pipe tables, paragraphs, and inline code / bold / italic / strikethrough /
// links.

type Item = { indent: number; ordered: boolean; text: string };

// Inline elements: `code`, **bold**, *italic*, ~~strike~~, [label](url).
// Code spans win (their contents are not parsed); scanning is left → right.
const inline = (text: string, kb: string): any[] => {
  const out: any[] = [];
  let buf = "";
  let i = 0;
  let k = 0;
  const flush = () => { if (buf) { out.push(buf); buf = ""; } };
  const tag = (el: string, inner: string) => {
    flush();
    const nk = kb + (k++);
    out.push(jsx(el, { key: nk, children: inline(inner, nk + ".") }));
  };
  while (i < text.length) {
    const ch = text[i];
    if (ch === "`") {
      const end = text.indexOf("`", i + 1);
      if (end > i) { flush(); out.push(jsx("code", { key: kb + (k++), children: text.slice(i + 1, end) })); i = end + 1; continue; }
    }
    if (ch === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end > i + 2) { tag("strong", text.slice(i + 2, end)); i = end + 2; continue; }
    }
    if (ch === "~" && text[i + 1] === "~") {
      const end = text.indexOf("~~", i + 2);
      if (end > i + 2) { tag("del", text.slice(i + 2, end)); i = end + 2; continue; }
    }
    if (ch === "*") {
      const end = text.indexOf("*", i + 1);
      if (end > i + 1) { tag("em", text.slice(i + 1, end)); i = end + 1; continue; }
    }
    if (ch === "[") {
      const close = text.indexOf("]", i + 1);
      if (close > i && text[close + 1] === "(") {
        const urlEnd = text.indexOf(")", close + 2);
        if (urlEnd > close) {
          flush();
          out.push(jsx("a", { key: kb + (k++), href: text.slice(close + 2, urlEnd), target: "_blank", rel: "noreferrer", children: text.slice(i + 1, close) }));
          i = urlEnd + 1; continue;
        }
      }
    }
    buf += ch; i++;
  }
  flush();
  return out;
};

const LIST_RE = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;

// Recursive list builder: items whose indent exceeds the current level nest
// under the previous <li>; a shallower indent ends the current list level.
const buildList = (items: Item[], start: number, indent: number, key: string): [any, number] => {
  const ordered = items[start].ordered;
  const kids: any[] = [];
  let i = start;
  while (i < items.length && items[i].indent >= indent) {
    if (items[i].indent > indent) {
      const [sub, next] = buildList(items, i, items[i].indent, key + "n");
      const prev = kids[kids.length - 1];
      if (prev) {
        const arr = Array.isArray(prev.props.children) ? prev.props.children : (prev.props.children = [prev.props.children]);
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

export const Markdown = ({ text }: { text: string }) => {
  const lines = (text || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: any[] = [];
  let key = 0;
  let para: string[] = [];
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
    // fenced code block
    if (/^\s*```/.test(line)) {
      flushPara();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // skip closing fence
      blocks.push(jsx("pre", { key: "pre" + key, children: jsx("code", { children: buf.join("\n") }) }));
      key++;
      continue;
    }
    // heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      blocks.push(jsx("h" + h[1].length, { key: "h" + key, children: inline(h[2], "h" + key + ".") }));
      key++;
      i++;
      continue;
    }
    // horizontal rule
    if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) {
      flushPara();
      blocks.push(jsx("hr", { key: "hr" + key++ }));
      i++;
      continue;
    }
    // blockquote
    if (/^>\s?/.test(line)) {
      flushPara();
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      blocks.push(jsx("blockquote", { key: "bq" + key, children: inline(buf.join(" "), "bq" + key + ".") }));
      key++;
      continue;
    }
    // list (bulleted or numbered, nested by indent)
    if (LIST_RE.test(line)) {
      flushPara();
      const items: Item[] = [];
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
    // pipe table (header row + separator row)
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      flushPara();
      const parseRow = (l: string) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const rows = [parseRow(line)];
      i += 2; // skip header + separator
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(parseRow(lines[i])); i++; }
      blocks.push(jsxs("table", { key: "t" + key, className: "tg-md-table", children: [
        jsx("thead", { key: "th", children: jsx("tr", { children: rows[0].map((c, j) => jsx("th", { key: j, children: inline(c, "t" + key + "h" + j + ".") })) }) }),
        jsx("tbody", { key: "tb", children: rows.slice(1).map((r, ri) => jsx("tr", { key: ri, children: r.map((c, j) => jsx("td", { key: j, children: inline(c, "t" + key + "r" + ri + "c" + j + ".") })) })) }),
      ] }));
      key++;
      continue;
    }
    if (!line.trim()) { flushPara(); i++; continue; }
    para.push(line.trim());
    i++;
  }
  flushPara();
  return jsx("div", { className: "tg-md", children: blocks });
};

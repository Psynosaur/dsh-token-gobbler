// token-gobbler · scripts/runtime.js
//
// The Node floor check, kept in a module that imports NOTHING zstd-dependent so it
// can run before the report pipeline is loaded. DSH trajectories are multi-frame
// zstd, which node:zlib only gained in Node 22.15 / 23.8 / 24 — on an older Node the
// static import of lib/trajectory.js fails with "does not provide an export named
// 'zstdDecompressSync'", which says nothing about what to do. This does:
//
//   import { assertNode } from "./runtime.js";
//   assertNode();                                   // exits 4 with a fix hint
//   const { collect } = await import("./census.js"); // now safe to load

/** Minimum Node for node:zlib zstdDecompressSync. */
const FLOOR = [[22, 15], [23, 8], [24, 0]];

export function assertNode() {
  const [maj, min] = String(process.versions.node).split(".").map(Number);
  const ok = FLOOR.some(([M, m]) => maj > M || (maj === M && min >= m));
  if (ok) return;
  console.error(
    `token-gobbler: Node ${process.versions.node} is too old for this script.\n` +
    `  DSH trajectories are zstd-compressed and this tool decompresses them with\n` +
    `  node:zlib, which needs Node >= 22.15 (or >= 23.8 / >= 24).\n` +
    `  Fix: install Node 24 (macOS: \`brew install node\`, or nvm: \`nvm install 24\`), then re-run.`,
  );
  process.exit(4);
}

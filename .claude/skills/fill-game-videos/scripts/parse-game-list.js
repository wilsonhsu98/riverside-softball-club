#!/usr/bin/env node
// Parses a Playwright `browser_snapshot` (accessibility-tree, YAML-like text dump)
// of the app's "盒子" (games list) page into {date, opponent, time, hasVideoIcon}
// per game.
//
// Why parse the snapshot instead of querying the DOM directly: plain
// document.querySelectorAll/innerText calls against this page have, in practice,
// failed to find content that IS visibly rendered (never fully root-caused —
// possibly something about how the app's component library manages text nodes).
// The accessibility-tree snapshot reliably captures everything, so treat it as
// the source of truth for scraping this page, and only use direct DOM
// evaluation for the edit workflow (clicking icons, filling the tag input),
// where it has been verified to work.
//
// Usage: node parse-game-list.js <snapshot.txt> [output.json]
// The <snapshot.txt> is the file path Playwright's browser_snapshot saves to
// when its inline output exceeds the token limit (always true for a
// multi-year "career" game list — expect 2000+ lines).

const fs = require('fs');

const inputPath = process.argv[2];
const outputPath = process.argv[3];
if (!inputPath) {
  console.error('Usage: node parse-game-list.js <snapshot.txt> [output.json]');
  process.exit(1);
}

const lines = fs.readFileSync(inputPath, 'utf8').split('\n');

function indentOf(line) {
  const m = line.match(/^(\s*)-/);
  return m ? m[1].length : -1;
}

// Each date header looks like `        - text: "20260815"` with two preceding
// sibling entries (one per game played that day) at the same indent level as
// the date line's own `-` marker minus 2.
const dateGroups = [];
for (let i = 0; i < lines.length; i++) {
  const dateMatch = lines[i].match(/text:\s*"(\d{8})"/);
  if (!dateMatch) continue;
  const dateIndent = indentOf(lines[i]);
  let groupStart = i;
  for (let j = i - 1; j >= 0; j--) {
    const ind = indentOf(lines[j]);
    if (ind === dateIndent - 2 && /- generic \[ref=\S+\]:\s*$/.test(lines[j])) {
      groupStart = j;
      break;
    }
    if (ind !== -1 && ind < dateIndent - 2) break;
  }
  dateGroups.push({ date: dateMatch[1], startLine: groupStart, endLine: i });
}

function parseEntry(startIdx, endIdx, baseIndent) {
  const sub = [];
  for (let k = startIdx + 1; k <= endIdx; k++) {
    const ind = indentOf(lines[k]);
    if (ind <= baseIndent) break;
    sub.push(lines[k]);
  }
  const fieldIndent = baseIndent + 2;
  const fields = [];
  let hasVideoIcon = false;
  for (let k = 0; k < sub.length; k++) {
    const l = sub[k];
    if (indentOf(l) !== fieldIndent) continue;
    const simple = l.match(/- generic \[ref=\S+\]:\s*(.*)$/);
    if (simple && simple[1].trim() !== '') {
      fields.push(simple[1].trim());
    } else {
      // A wrapped field (empty value on this line, nested children below) only
      // occurs for the win/loss-letter field, and only when a video is
      // attached: the video-camera icon renders as an extra sibling node next
      // to the letter. So reaching this branch at all IS the video-icon signal.
      let nestedText = null;
      for (let m = k + 1; m < sub.length; m++) {
        const ind2 = indentOf(sub[m]);
        if (ind2 <= fieldIndent) break;
        const t = sub[m].match(/text:\s*(\S.*)$/);
        if (t) nestedText = t[1].trim();
      }
      hasVideoIcon = true;
      fields.push(nestedText || '');
    }
  }
  return { fields, hasVideoIcon };
}

const games = [];
for (const g of dateGroups) {
  const containerIndent = indentOf(lines[g.startLine]);
  const entryIndent = containerIndent + 2;
  const entryStarts = [];
  for (let k = g.startLine + 1; k < g.endLine; k++) {
    if (indentOf(lines[k]) === entryIndent && /\[cursor=pointer\]:\s*$/.test(lines[k])) {
      entryStarts.push(k);
    }
  }
  for (let idx = 0; idx < entryStarts.length; idx++) {
    const start = entryStarts[idx];
    const end = (idx + 1 < entryStarts.length) ? entryStarts[idx + 1] - 1 : g.endLine - 1;
    const { fields, hasVideoIcon } = parseEntry(start, end, entryIndent);
    const [result, opponent, time] = fields;
    games.push({ date: g.date, result, opponent, time: time || null, hasVideoIcon });
  }
}

const out = JSON.stringify(games, null, 2);
if (outputPath) {
  fs.writeFileSync(outputPath, out);
  const missing = games.filter(g => !g.hasVideoIcon).length;
  console.log(`Parsed ${games.length} games across ${dateGroups.length} dates (${missing} missing a video). Written to ${outputPath}`);
} else {
  console.log(out);
}

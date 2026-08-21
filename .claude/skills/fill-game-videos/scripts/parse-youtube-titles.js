#!/usr/bin/env node
// Parses raw YouTube video entries scraped from a channel's /videos tab into
// {date, teamA, teamB, videoIds[]} groups.
//
// Input: a JSON file containing either
//   - {"entries": [[videoId, ariaLabel], ...]}   (array of [id, label] pairs), or
//   - [[videoId, ariaLabel], ...]                (bare array), or
//   - {"<videoId>": "<ariaLabel>", ...}          (object map)
// (this is exactly the shape produced by the scrape snippet in SKILL.md)
//
// Output: writes {totalRaw, totalParsed, totalSkipped, totalGroups, groups, skipped}
// to the given output path (or stdout if omitted).
//
// Usage: node parse-youtube-titles.js <input.json> [output.json]

const fs = require('fs');

const inputPath = process.argv[2];
const outputPath = process.argv[3];
if (!inputPath) {
  console.error('Usage: node parse-youtube-titles.js <input.json> [output.json]');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
let entries;
if (Array.isArray(raw)) entries = raw;
else if (Array.isArray(raw.entries)) entries = raw.entries;
else entries = Object.entries(raw);

function cleanTeam(s) {
  return s.replace(/[\s_]+/g, ' ').trim();
}

const parsed = [];
const skipped = [];

for (const [id, label] of entries) {
  // Leading date: 4-digit year + 2-digit month + 2-digit day, loosely separated
  // by spaces/underscores (older titles use "2018 0421", newer ones "20260815").
  const dateMatch = label.match(/^\s*(\d{4})[\s_]*(\d{2})(\d{2})[\s_]/);
  if (!dateMatch) { skipped.push({ id, label, reason: 'no-date' }); continue; }
  const date = dateMatch[1] + dateMatch[2] + dateMatch[3];
  let rest = label.slice(dateMatch[0].length);

  // Strip trailing duration text and any lone trailing part-number
  // ("2018 0421 TeamA / TeamB 2 28分鐘" -> "TeamA / TeamB").
  rest = rest.replace(/\(?不完整\)?/g, '');
  rest = rest.replace(/\s*\d+\s*小時(\s*\d+\s*分鐘)?(\s*\d+\s*秒)?\s*$/, '');
  rest = rest.replace(/\s*\d+\s*分鐘(\s*\d+\s*秒)?\s*$/, '');
  rest = rest.replace(/\s*\d+\s*秒\s*$/, '');
  rest = rest.trim();
  rest = rest.replace(/\s+\d+$/, '');

  // Separator varies by era: "_VS_", " VS ", "/", or (oldest titles) just a
  // run of 2+ spaces with no token at all.
  let sep = null;
  if (/_VS_/i.test(rest)) sep = /_VS_/i;
  else if (/\sVS\s/i.test(rest)) sep = /\sVS\s/i;
  else if (/\//.test(rest)) sep = /\//;
  else if (/\s{2,}/.test(rest)) sep = /\s{2,}/;
  if (!sep) { skipped.push({ id, label, reason: 'no-separator', rest }); continue; }

  const parts = rest.split(sep);
  if (parts.length !== 2) { skipped.push({ id, label, reason: 'split-count-' + parts.length, rest }); continue; }

  const [teamA, teamB] = parts.map(cleanTeam);
  if (!teamA || !teamB) { skipped.push({ id, label, reason: 'empty-team' }); continue; }
  if (/^(XXX|\?\?)$/i.test(teamA) || /^(XXX|\?\?)$/i.test(teamB)) {
    skipped.push({ id, label, reason: 'placeholder-team' });
    continue;
  }

  parsed.push({ id, date, teamA, teamB });
}

// A single real game is often uploaded as several clips (parts, camera angles) —
// group them by {date, sorted team pair} so downstream matching treats them as one game.
const groups = new Map();
for (const p of parsed) {
  const key = p.date + '|' + [p.teamA, p.teamB].sort().join('|');
  if (!groups.has(key)) groups.set(key, { date: p.date, teamA: p.teamA, teamB: p.teamB, videoIds: [] });
  groups.get(key).videoIds.push(p.id);
}

const result = {
  totalRaw: entries.length,
  totalParsed: parsed.length,
  totalSkipped: skipped.length,
  totalGroups: groups.size,
  groups: Array.from(groups.values()),
  skipped,
};

const out = JSON.stringify(result, null, 2);
if (outputPath) {
  fs.writeFileSync(outputPath, out);
  console.log(`Parsed ${result.totalParsed}/${result.totalRaw} videos into ${result.totalGroups} game groups (${result.totalSkipped} skipped). Written to ${outputPath}`);
} else {
  console.log(out);
}

#!/usr/bin/env node
// Matches games missing a video (from parse-game-list.js) against parsed
// YouTube upload groups (from parse-youtube-titles.js).
//
// A game's opponent is matched against whichever side of the YouTube title's
// team pair is NOT one of the app team's own historical name aliases (see
// --aliases). Exact matches (after normalizing case/whitespace/punctuation)
// are applied automatically; near-misses (edit distance 1, e.g. a single
// swapped hanzi like 振翔智財 vs 振祥智財) are surfaced separately because
// they need a human to confirm they're really the same team before writing
// to production data.
//
// Usage:
//   node match-games.js <games.json> <youtube-groups.json> <output.json> \
//     --aliases "OldStar,萬國通路,趨勢科技,TrendMicro,ZAP,謹盛會計師"
//
// <games.json> is the array parse-game-list.js writes (or wrap it under
// {"games": [...]} — both shapes are accepted).
// <youtube-groups.json> is the {groups: [...]} object parse-youtube-titles.js writes.
// Get the alias list from the app's "使用隊名" filter chips on the games list
// page for the target team — that's the authoritative source, not a guess.

const fs = require('fs');

const args = process.argv.slice(2);
const aliasFlagIdx = args.indexOf('--aliases');
const aliases = aliasFlagIdx !== -1 ? args[aliasFlagIdx + 1].split(',').map(s => s.trim()) : [];
const positional = args.filter((a, i) => i !== aliasFlagIdx && i !== aliasFlagIdx + 1);
const [gamesPath, ytPath, outputPath] = positional;

if (!gamesPath || !ytPath) {
  console.error('Usage: node match-games.js <games.json> <youtube-groups.json> [output.json] --aliases "Name1,Name2,..."');
  process.exit(1);
}
if (!aliases.length) {
  console.error('Warning: no --aliases given. Every YouTube group will be treated as a candidate for every game, which will produce far more false matches. Pass the target team\'s "使用隊名" chip values.');
}

const gamesRaw = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));
const games = Array.isArray(gamesRaw) ? gamesRaw : gamesRaw.games;
const yt = JSON.parse(fs.readFileSync(ytPath, 'utf8'));

const missing = games.filter(g => !g.hasVideoIcon);

function isAlias(name) {
  const n = name.toLowerCase().replace(/[\s_./()]/g, '');
  return aliases.some(a => n.includes(a.toLowerCase().replace(/[\s_./()]/g, '')));
}

function normalize(s) {
  return s.toLowerCase().replace(/[\s_./()]/g, '');
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

const byDate = new Map();
for (const g of yt.groups) {
  if (!byDate.has(g.date)) byDate.set(g.date, []);
  byDate.get(g.date).push(g);
}

const results = [];
for (const game of missing) {
  const candidates = byDate.get(game.date) || [];
  const oppNorm = normalize(game.opponent);
  let exact = null, fuzzy = null, fuzzyDist = Infinity;
  for (const c of candidates) {
    const aIsAlias = isAlias(c.teamA);
    const bIsAlias = isAlias(c.teamB);
    if (aliases.length && !aIsAlias && !bIsAlias) continue; // neither side is our team; irrelevant video
    const other = aIsAlias ? c.teamB : c.teamA;
    const otherNorm = normalize(other);
    if (otherNorm === oppNorm) { exact = { group: c, other }; break; }
    const dist = levenshtein(otherNorm, oppNorm);
    if (dist <= 1 && dist < fuzzyDist) { fuzzy = { group: c, other }; fuzzyDist = dist; }
  }
  results.push({ game, exact, fuzzy });
}

const exactMatches = results.filter(r => r.exact);
const fuzzyMatches = results.filter(r => !r.exact && r.fuzzy);
const noMatches = results.filter(r => !r.exact && !r.fuzzy);

const summary = {
  missingTotal: missing.length,
  exactCount: exactMatches.length,
  fuzzyCount: fuzzyMatches.length,
  noMatchCount: noMatches.length,
};

const output = { summary, exactMatches, fuzzyMatches, noMatches };

console.log(`Missing-video games: ${missing.length}`);
console.log(`  exact matches:  ${exactMatches.length}`);
console.log(`  fuzzy matches:  ${fuzzyMatches.length} (need human confirmation)`);
console.log(`  no match found: ${noMatches.length}`);
console.log('');
console.log('=== EXACT MATCHES ===');
for (const r of exactMatches) {
  console.log(`${r.game.date} ${r.game.opponent} (${r.game.time || '-'}) -> [${r.exact.group.videoIds.join(',')}]`);
}
console.log('');
console.log('=== FUZZY MATCHES (confirm before applying) ===');
for (const r of fuzzyMatches) {
  console.log(`${r.game.date} opponent="${r.game.opponent}" vs video-team="${r.fuzzy.other}" -> [${r.fuzzy.group.videoIds.join(',')}]`);
}

if (outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nFull results written to ${outputPath}`);
}

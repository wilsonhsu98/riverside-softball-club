---
name: fill-game-videos
description: Match a YouTube channel's uploaded game-recording videos to game records in this app and fill in the missing YouTube video IDs. Use this whenever the user asks to attach/fill/link/sync YouTube videos to games, mentions a teammate/videographer who films games and uploads them, or asks to find/match video IDs for games that don't have one yet — even if they don't say "skill" or name this workflow explicitly. Handles the full pipeline: scraping the channel, scraping the app's game list, matching by date + opponent, a human-confirmation checkpoint, then applying the writes via fast browser automation.
---

# Fill game videos

Some teammate films games and uploads them to a personal YouTube channel, titled
roughly `YYYYMMDD_TeamA_VS_TeamB`. This skill finds games in this app that are
missing a `youtubeVideos` value, matches them against that channel's uploads by
date + opponent name, and — after the user confirms the match list — fills in
the video ID(s) via the app's edit form.

**Never skip the confirmation checkpoint (step 5).** This writes to shared
production game data. A wrong match (e.g. a fuzzy team-name match that's
actually a different team) silently attaches the wrong footage to a game
record, and there's no batch-undo. Getting the match right matters more than
getting it done fast.

## Prerequisites

- The client dev server running at `localhost:9527` (`npm run start:client`),
  logged in as a user who manages the target team.
- A Playwright-driven browser tab (this skill leans on `browser_evaluate`
  heavily — plain DOM queries from other tools have, in this app, sometimes
  failed to find content that's visibly on screen; see the note in
  `scripts/parse-game-list.js`).
- The team code used in the app's URLs (e.g. `OldStar`) and the YouTube
  channel handle or URL. Ask for these if not given.

## 1. Get the team's name aliases

Navigate to `#/main/games/{team}` and open the "使用隊名" (team names used)
filter. Its chips are the authoritative list of every real-world sponsor name
this one team has played under across seasons (teams get renamed/re-sponsored
year to year, e.g. a team called `OldStar` in-app might show chips like
`OldStar, 萬國通路, 趨勢科技, TrendMicro, ZAP, 謹盛會計師`). You'll need this
exact list for matching in step 4 — a YouTube title's team pair usually has
ONE side being one of these aliases and the other side being the actual
opponent, and matching should happen against the opponent side only.

Don't guess this list from memory or infer it from a single game — read it
straight from the chips, since it changes as seasons pass.

## 2. Scrape the YouTube channel

Navigate to `https://www.youtube.com/@<handle>/videos`. Sort order doesn't
matter for correctness, but "最早" (oldest first) makes debugging easier since
issues tend to show up in older, less consistently-titled videos.

The page lazy-loads videos on scroll, so force-load everything with a
scroll-and-poll loop before extracting anything:

```js
async () => {
  function collect() {
    const anchors = Array.from(document.querySelectorAll('a[href*="/watch?v="][aria-label]'));
    const map = new Map();
    for (const a of anchors) {
      const idMatch = a.getAttribute('href').match(/v=([^&]+)/);
      if (idMatch) map.set(idMatch[1], a.getAttribute('aria-label'));
    }
    return map;
  }
  let lastSize = 0, stableRounds = 0;
  for (let i = 0; i < 400; i++) {
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise(r => setTimeout(r, 400));
    const size = collect().size;
    if (size === lastSize) { if (++stableRounds >= 6) break; } else { stableRounds = 0; }
    lastSize = size;
  }
  return Array.from(collect().entries());
}
```

Use `aria-label`, not `textContent`/`title` — the anchor's visible text is
often just the duration badge ("59:35"), while `aria-label` carries the full
title plus duration ("20260815_萬國通路_VS_Yilan Storm 59 分鐘").

**Always pass a `filename` to `browser_evaluate` for this call.** A channel
with a few hundred videos produces a result well past the inline token limit,
and it'll get silently redirected to a file anyway — save yourself the failed
call. Then run:

```bash
node scripts/parse-youtube-titles.js <saved-file.json> youtube-groups.json
```

This handles the inconsistent title formatting across years (different date
spacing, different separators, trailing duration/part-number text) and groups
multi-part uploads of the same game together. Skim the `skipped` array in its
output for anything that looks like a real game slipping through the cracks —
practice footage and montages are expected to skip, a real game with an
unusual title format is a parser gap worth fixing.

## 3. Scrape the app's game list

On `#/main/games/{team}`, set "查詢區間" to "生涯" (career) so the full
history is in the DOM — this app renders the whole list rather than
virtualizing it, so no further scrolling/pagination is needed once that's set.

Take a `browser_snapshot` (it will exceed the inline limit for any team with
a real history — that's expected, use the saved file path) and parse it:

```bash
node scripts/parse-game-list.js <saved-snapshot.txt> games.json
```

## 4. Match

```bash
node scripts/match-games.js games.json youtube-groups.json match-results.json \
  --aliases "OldStar,萬國通路,趨勢科技,TrendMicro,ZAP,謹盛會計師"
```

This only considers games with `hasVideoIcon: false` — games that already
have a video are left alone, which is the whole point of scraping the list
first rather than opening every game to check. It buckets results into exact
matches, fuzzy matches (single-character-off team names, needing a human
call), and no-match.

## 5. Confirm with the user — do not skip this

Show the user the full exact-match list (not just the fuzzy ones) before
writing anything, plus every fuzzy match with both spellings side by side, and
ask specifically about each fuzzy one. If there are a lot of games, it's fine
to also ask whether they want to apply everything at once or review a small
batch first — but the match list itself always needs to be shown, not just
summarized as a count.

## 6. Apply the confirmed matches

For each confirmed `{date, opponent, videoId(s)}`:

**a. Navigate to the specific game.** Do NOT construct the `#/main/games/{team}/{date}-{n}` URL
by guessing the sequence number and `browser_navigate` straight to it — an
invalid or stale hash silently falls back to whatever game was last viewed
(via this app's `localStorage.focus_game`), rather than erroring, which means
a bad guess edits the wrong game with no visible warning. Reach the game by
finding its row on the list (`browser_find` on the opponent name, disambiguating
by the date shown alongside — several opponents recur across many seasons) and
clicking through the hover-card's "觀看盒子" button. Confirm `location.hash`
in the result matches the expected date before proceeding.

**b. Run the edit in one batched call**, not a chain of individual
click/type actions. Two things make the naive approach slow and flaky enough
to be worth avoiding:

- The lock toggle (`.fa-lock` / `.fa-unlock-alt`) and edit pencil (`.fa-pencil`)
  re-render after a Vue state change, and the timing isn't fixed — polling for
  the element beats a fixed `setTimeout`.
- The "YouTube video IDs" field is a vue-tags-input whose actual `<input>` has
  `size="1"` and is 0px wide when empty. Playwright's click/type actions
  reject 0-width elements as non-actionable and will retry for 5s+ before
  failing. Set it via raw DOM instead: native value-setter, `input` event,
  then a synthetic Enter keydown to commit the tag.

```js
async () => {
  async function waitFor(sel, timeout = 4000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(sel);
      if (el) return el;
      await new Promise(r => setTimeout(r, 50));
    }
    return null;
  }
  const log = [];
  const lock = await waitFor('.fa-lock');
  if (!lock) { log.push('ERROR: lock icon not found, url=' + location.hash); return log; }
  lock.click();

  const pencil = await waitFor('.fa-pencil');
  if (!pencil) { log.push('ERROR: pencil not found'); return log; }
  pencil.click();

  const input = await waitFor('input.ti-new-tag-input');
  if (!input) { log.push('ERROR: tag input not found, url=' + location.hash); return log; }
  input.focus();
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  nativeSetter.call(input, 'PUT_VIDEO_ID_HERE'); // comma-separate if a game has multiple clips
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
  await new Promise(r => setTimeout(r, 200));

  const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '儲存');
  if (!saveBtn) { log.push('ERROR: save button not found'); return log; }
  saveBtn.click();

  const unlockIcon = await waitFor('.fa-unlock-alt', 4000);
  if (!unlockIcon) { log.push('ERROR: unlock-alt not found after save, url=' + location.hash); return log; }
  unlockIcon.click();
  log.push('done, url=' + location.hash);
  return log;
}
```

If a game already has a non-empty `youtubeVideos` value for some reason
(shouldn't happen given step 4 already filtered these out, but re-check if a
game was edited by someone else mid-session), append with a comma rather than
overwriting — set the tag input to the new ID only and let vue-tags-input add
it as an additional chip; don't clear existing chips first.

Take a screenshot after the first one or two games to sanity-check the
lock/tag/save cycle actually did what it should, then stop screenshotting —
the returned `log` array plus the final verification pass (step 7) are enough
signal for every game after that. Re-navigating with a full `browser_navigate`
page reload between every game is also unnecessary overhead; a click on the
"盒子" nav link is a same-app navigation and faster, though either works.

## 7. Verify

Re-run the scrape from step 3 and `parse-game-list.js` again, and diff the
"games with a video" count against what it was before this run. It should
have gone up by exactly the number of games you applied — if it's off, some
new unrelated game may have appeared in the schedule during the session
(check for it before assuming something broke), or a write silently failed.

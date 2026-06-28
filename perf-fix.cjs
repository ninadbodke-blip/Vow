/* ============================================================
 * Vow — one-time performance pass (Android WebView jank fix)
 * ------------------------------------------------------------
 * Run from the repo root:   node perf-fix.js
 * Then review:              git diff
 * Then build/commit.
 *
 * What it does (matches the agreed "balanced" choices):
 *   1. Removes every `backdrop-filter: blur()` / `WebkitBackdropFilter`
 *      across the app. Animating/scrolling behind these forces the WebView
 *      GPU to re-blur the page every frame — the main source of the lag.
 *   2. Keeps the look: frosted nav pills get a near-solid background so they
 *      still read as distinct surfaces; light modal scrims get a touch more
 *      opacity so the background still recedes without the blur.
 *   3. Page transition: drops the full-screen blur and shortens 0.7s -> 0.32s,
 *      keeping the gentle fade + upward drift.
 *
 * Safe to re-run; replacements only apply where the pattern still exists.
 * Line endings (LF/CRLF) are preserved.
 * ============================================================ */

const fs = require('fs');
const path = require('path');

const FILES = [
  'src/screens/Anchors.jsx',
  'src/screens/Milestones.jsx',
  'src/screens/Profile.jsx',
  'src/screens/freeHome/BuildFreeHome.jsx',
  'src/screens/freeHome/CommitFreeHome.jsx',
  'src/screens/freeHome/DailyCheckin.jsx',
  'src/screens/freeHome/EndureFreeHome.jsx',
  'src/screens/freeHome/JournalTile.jsx',
  'src/screens/freeHome/NoticeFreeHome.jsx',
  'src/screens/freeHome/QuickLogModal.jsx',
  'src/screens/freeHome/ReclaimFreeHome.jsx',
  'src/screens/freeHome/ReflectFreeHome.jsx',
  'src/screens/freeHome/StageWayfinder.jsx',
  'src/screens/home/HomeShell.jsx',
  'src/screens/onboarding/AddictionPicker.jsx',
  'src/screens/vowPath/BuildOverview.jsx',
  'src/screens/vowPath/CommitOverview.jsx',
  'src/screens/vowPath/EndureOverview.jsx',
  'src/screens/vowPath/NoticeOverview.jsx',
  'src/screens/vowPath/ReclaimOverview.jsx',
  'src/screens/vowPath/ReflectOverview.jsx',
  'src/screens/vowPath/VowPathPaywall.jsx',
];

// A line that is ONLY one-or-more backdrop-filter declarations -> remove the whole line.
const LINE_ONLY = /^[ \t]*(?:(?:WebkitBackdropFilter|backdropFilter)\s*:\s*'blur\([^)]*\)'\s*,[ \t]*)+\r?\n/gm;
// A backdrop-filter declaration embedded inside a line with other props -> remove just it.
const INLINE = /(?:WebkitBackdropFilter|backdropFilter)\s*:\s*'blur\([^)]*\)'\s*,?[ \t]*/g;

let totalRemoved = 0;
let filesChanged = 0;

for (const rel of FILES) {
  const fp = path.resolve(rel);
  if (!fs.existsSync(fp)) { console.log('  SKIP (not found): ' + rel); continue; }
  let s = fs.readFileSync(fp, 'utf8');
  const before = s;
  const count = (s.match(INLINE) || []).length;

  s = s.replace(LINE_ONLY, '');
  s = s.replace(INLINE, '');
  // Frosted nav pills: translucent + blur -> near-solid (keeps the dark frosted look).
  s = s.split("background: 'rgba(38, 26, 16, 0.42)',").join("background: 'rgba(38, 26, 16, 0.82)',");
  // Light modal scrims: a touch more opacity so the background still recedes without blur.
  s = s.split('rgba(40,25,15,0.45)').join('rgba(40,25,15,0.55)');

  if (s !== before) {
    fs.writeFileSync(fp, s);
    filesChanged++;
    totalRemoved += count;
    console.log('  ' + rel + '  (removed ' + count + ' backdrop-filter decl' + (count === 1 ? '' : 's') + ')');
  }
}

// ---- Page transition: drop full-screen blur + shorten ----
const ptp = path.resolve('src/components/PageTransition.jsx');
if (fs.existsSync(ptp)) {
  let s = fs.readFileSync(ptp, 'utf8');
  const before = s;
  s = s.replace('const USE_BLUR = true', 'const USE_BLUR = false');
  s = s.replace('duration: 0.7,', 'duration: 0.32,');
  if (s !== before) {
    fs.writeFileSync(ptp, s);
    console.log('  src/components/PageTransition.jsx  (blur off, duration 0.7 -> 0.32)');
  }
}

console.log('\nDone. ' + filesChanged + ' files updated, ' + totalRemoved + ' backdrop-filter declarations removed.');
console.log('Next: git diff   ->   verify   ->   commit');

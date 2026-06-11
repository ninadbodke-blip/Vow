// ============================================================
// VOW TREE ENGINE — pure module, no React, no DOM.
// ============================================================
// buildTree(seed, count, newSince) renders the tree at `count`
// check-ins as an SVG string, deterministically:
//   • continuous skeleton (trunk → boughs → branches → twigs),
//     trunk ring-thickening every 12 days
//   • every leaf grows on real wood; its home branch is fixed at
//     birth and never changes; more leaflets per check-in as the
//     tree matures (1–2 young, 2–3 grown, 3–4 elder)
//   • the seed sinks back into the earth by check-in ~24
//   • vines, birds, fallen leaves arrive in the elder months
//
// Performance: settled leaves are batched into ONE compound
// <path> per tone, so day 400 is ~a few dozen DOM nodes, not a
// thousand. Leaves newer than `newSince` are returned separately
// in `fresh` so the UI can animate them in (GSAP).
//
// Returns { html, fresh: [{ d, fill, outline, ox, oy }] }.
// Coordinate frame: 240 wide; ground line at GROUND_Y = 213.
// ============================================================

export const MAX_GROWTH = 400
export const GROUND_Y = 213

function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;var t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function hashStr(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}

var C = {
  ink:'#3A2A1C', bark:'#82603F', barkDark:'#5F4429', stem:'#6B8050',
  deep:'#5F7048', mid:'#74875A', light:'#93A36B', pale:'#ACB97E',
  goldgreen:'#B2A45E', gold:'#C9A85C',
  wash:'#DCC9A6', mound:'#B89B72', stone:'#C4B49A',
}
var f1 = function(n){ return Number(n.toFixed(1)) }
var clamp01 = function(x){ return x < 0 ? 0 : x > 1 ? 1 : x }
function ss(a, b, x){ var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t) }
function lerp(a, b, t){ return a + (b - a) * t }
function mixHex(h1, h2, t){
  var p = function(h){ return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)] }
  var a = p(h1), b = p(h2)
  var c = a.map(function(v,i){ return Math.round(lerp(v, b[i], t)) })
  return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'
}
function kf(frames, count){
  if (count <= frames[0][0]) return frames[0].slice(1)
  for (var i = 1; i < frames.length; i++) {
    if (count <= frames[i][0]) {
      var t = ss(frames[i-1][0], frames[i][0], count)
      return frames[i].slice(1).map(function(v, j){ return lerp(frames[i-1][j+1], v, t) })
    }
  }
  return frames[frames.length-1].slice(1)
}
function alongSpine(spine, t){
  var segs = spine.length - 1
  var st = Math.min(segs - 1e-6, Math.max(0, t * segs))
  var i = Math.floor(st), f = st - i
  return [lerp(spine[i][0], spine[i+1][0], f), lerp(spine[i][1], spine[i+1][1], f)]
}
function dirAt(spine, t){
  var segs = spine.length - 1
  var i = Math.min(segs - 1, Math.max(0, Math.floor(t * segs)))
  var dx = spine[i+1][0] - spine[i][0], dy = spine[i+1][1] - spine[i][1]
  var L = Math.hypot(dx, dy) || 1
  return [dx / L, dy / L]
}
function ribbon(spine, widths) {
  var L = [], R = []
  for (var i = 0; i < spine.length; i++) {
    var p = spine[i]
    var q = spine[Math.min(i + 1, spine.length - 1)]
    var o = spine[Math.max(i - 1, 0)]
    var dx = q[0] - o[0], dy = q[1] - o[1]
    var len = Math.hypot(dx, dy) || 1
    var nx = -dy / len, ny = dx / len
    var w = Math.max(0.3, widths[i]) / 2
    L.push([p[0] + nx * w, p[1] + ny * w])
    R.push([p[0] - nx * w, p[1] - ny * w])
  }
  var side = function(pts){ return pts.map(function(p, i){ return i === 0 ? 'L' + f1(p[0]) + ' ' + f1(p[1]) :
    'Q' + f1((pts[i-1][0]+p[0])/2) + ' ' + f1((pts[i-1][1]+p[1])/2) + ' ' + f1(p[0]) + ' ' + f1(p[1]) }).join(' ') }
  var Rr = R.slice().reverse()
  return 'M' + f1(L[0][0]) + ' ' + f1(L[0][1]) + ' ' + side(L).slice(1) + ' L' + f1(Rr[0][0]) + ' ' + f1(Rr[0][1]) + ' ' + side(Rr).slice(1) + ' Z'
}

// leaf path with the rotation BAKED into coordinates → batchable
function leafPathD(x, y, len, rotDeg, variant) {
  var r = rotDeg * Math.PI / 180, cos = Math.cos(r), sin = Math.sin(r)
  var T = function(px, py){ return f1(px * cos - py * sin + x) + ' ' + f1(px * sin + py * cos + y) }
  var c1x = len * (variant === 1 ? 0.42 : 0.48), c1y = -len * (variant === 1 ? 0.52 : 0.36)
  var c2x = len * (variant === 1 ? 0.4 : 0.44),  c2y =  len * (variant === 1 ? 0.4 : 0.24)
  return 'M' + T(0, 0) + ' Q ' + T(c1x, c1y) + ' ' + T(len, -len * (variant === 1 ? 0.04 : 0.05)) + ' Q ' + T(c2x, c2y) + ' ' + T(0, 0) + ' Z'
}
function leafEl(x, y, len, rot, fill, outline, opacity, variant) {
  var d = leafPathD(x, y, len, rot, variant)
  var vein = ''
  if (outline && len > 9) {
    var r = rot * Math.PI / 180, cos = Math.cos(r), sin = Math.sin(r)
    var T = function(px, py){ return f1(px * cos - py * sin + x) + ' ' + f1(px * sin + py * cos + y) }
    vein = '<path d="M' + T(len*0.12, -len*0.02) + ' L' + T(len*0.82, -len*0.05) + '" stroke="rgba(58,42,28,0.3)" stroke-width="0.6" fill="none"/>'
  }
  return '<path d="' + d + '" fill="' + fill + '"' +
    (outline ? ' stroke="' + C.deep + '" stroke-width="0.8" stroke-linejoin="round"' : '') +
    (opacity != null && opacity < 1 ? ' opacity="' + f1(opacity) + '"' : '') + '/>' + vein
}

function grass(x, y, o){ return '<g stroke="' + C.deep + '" stroke-width="1.1" stroke-linecap="round" fill="none" opacity="' + f1(0.8*o) + '">' +
  '<path d="M' + x + ' ' + y + ' q-1.5 -4 -3.5 -5.5"/><path d="M' + x + ' ' + y + ' q0.3 -5 0 -7"/><path d="M' + x + ' ' + y + ' q1.8 -3.5 3.8 -5"/></g>' }
function stoneEl(x, y, r, o){ return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + f1(r) + '" ry="' + f1(r*0.62) + '" fill="' + C.stone + '" stroke="' + C.ink + '" stroke-width="0.8" opacity="' + f1(0.85*o) + '"/>' }
// Birds are no longer baked into the static art — TreeHero animates them
// live from this schedule (gliding flight, wing-flap), still earned by growth.
export const BIRD_SCHEDULE = [
  { b: 150, y: 58, sc: 0.9, dur: 36, delay: 0 },
  { b: 300, y: 44, sc: 0.7, dur: 52, delay: 9 },
]
function seedShape(x, y, rot, sc){ return '<g transform="translate(' + f1(x) + ' ' + f1(y) + ') rotate(' + f1(rot) + ') scale(' + f1(sc) + ')">' +
  '<ellipse rx="9.5" ry="7" fill="#6E4E2F" stroke="' + C.ink + '" stroke-width="1.3"/>' +
  '<path d="M-7 -1 Q0 3 7 -1.5" stroke="' + C.ink + '" stroke-width="0.9" fill="none" opacity="0.7"/>' +
  '<path d="M-4 -4 Q0 -5.5 3.5 -4" stroke="#9C7A52" stroke-width="1.4" fill="none" opacity="0.9"/></g>' }

// ---------------- skeleton (ground line at 213) ----------------
function trunkBulk(count){
  var steps = Math.floor(count / 12), acc = 0
  for (var k = 1; k <= steps; k++) acc += ss(k * 12, k * 12 + 3, count)
  return 1 + 0.0205 * acc
}
var TRUNK = [
  [1,   120,213, 119,206, 120.8,198.5, 121.5,191,   2.7,2.4,2,1.5],
  [4,   120,213, 119,205, 120.7,196, 121.2,188,     2.9,2.6,2.1,1.6],
  [7,   120,213, 119,204, 120.5,195, 120,187,       3.2,2.8,2.3,1.7],
  [21,  120,213, 118.5,199, 120.5,185, 119.5,172,   5.4,4.3,3.4,2.4],
  [60,  120,213, 118,195, 121,179, 119.5,165,       7.2,5.6,4.3,3.1],
  [150, 120,213, 117.5,193, 121,175, 119,159,       10,7.6,5.6,4],
  [300, 120,213, 116,191, 122,173, 118.5,154,       13.5,10,7.5,5.2],
  [400, 120,213, 115,191, 123,172, 118,151,         16.5,12,9,6.2],
]
var BOUGHS = [
  { birth:6, full:18, frames:[
    [7,   119.8,196, 116.5,191, 114,187,   1.4,1.1,0.8],
    [21,  119.5,175, 113,166,  108,158,    2.6,1.8,1.2],
    [60,  119.5,171, 108,157,  101,148,    3.4,2.2,1.3],
    [150, 119,167,  102,149,  92,139,      5,3.2,1.8],
    [300, 117,163,  96,143,   83,130,      6.6,4.2,2.2],
    [400, 115,165,  91,143,   76,129,      8.4,5.3,2.6]]},
  { birth:9, full:21, frames:[
    [10,  120,192,  123.5,187.5, 126,184,  1.4,1.1,0.8],
    [21,  120,179,  127,169,  132,161,     2.4,1.7,1.1],
    [60,  120,173,  132,159,  139,149,     3.4,2.2,1.3],
    [150, 121,169,  139,151,  148,140,     5,3.2,1.8],
    [300, 123,165,  145,144,  157,130,     6.6,4.2,2.2],
    [400, 125,166.5, 150,143, 165,129,     8.4,5.3,2.6]]},
  { birth:13, full:26, frames:[
    [14,  120,189,  119.6,185, 120.3,181,  1.3,1.0,0.7],
    [21,  120,177,  119.5,170, 120.5,163,  2.2,1.5,1.0],
    [60,  120,167,  118.8,156, 118,145,    3.6,2.4,1.6],
    [150, 120,161,  118.8,149, 118,137,    4.4,2.9,2.0],
    [300, 119,155,  118,140,  117,125,     5.6,3.6,2.6],
    [400, 119.5,155, 120.4,139, 121,122,   7.4,4.6,3.4]]},
]
var ROOTS = [
  { birth:46, full:78, frames:[[60, 112,213, 107,214.6, 103,216.2, 3.6,2.2,1.2],[150, 110,213, 104,215.2, 98,217.5, 6,3.4,1.6],[300, 107,213, 99,215.4, 92,218, 8,4.4,2],[400, 104.5,213, 94.5,215.8, 85.5,218.8, 10.4,5.6,2.3]]},
  { birth:52, full:84, frames:[[60, 128,213, 133,214.8, 137,216.6, 3.6,2.2,1.2],[150, 130,213, 136,215.4, 142,218, 6,3.4,1.6],[300, 133,213, 140.5,215.6, 148,218.5, 8,4.4,2],[400, 136,213, 146,216, 155.5,219.3, 10.4,5.6,2.3]]},
  { birth:140, full:175, frames:[[150, 120,214, 119,216.4, 118,220, 5.5,3.4,2],[300, 119.5,214, 116.5,216.6, 113.5,221, 7.5,4.4,2.6],[400, 119,214, 115.5,217, 112.5,221.4, 8.8,5.4,3]]},
]
var SECS = [
  { p:0, t:0.55, ang:-42, bow: 1, b:26 }, { p:0, t:0.8,  ang: 26, bow:-1, b:44 }, { p:0, t:0.97, ang: -6, bow: 1, b:70 },
  { p:1, t:0.55, ang: 42, bow:-1, b:30 }, { p:1, t:0.8,  ang:-26, bow: 1, b:52 }, { p:1, t:0.97, ang:  6, bow:-1, b:78 },
  { p:2, t:0.6,  ang:-34, bow: 1, b:36 }, { p:2, t:0.62, ang: 36, bow:-1, b:40 }, { p:2, t:0.97, ang:  3, bow: 1, b:88 },
]
var SECLEN = [[30,9],[100,20],[200,28],[400,36]]
var TWIGS = [
  { p:0, t:0.6, ang:-30, b:66 }, { p:0, t:0.95, ang: 22, b:118 },
  { p:1, t:0.6, ang: 28, b:84 }, { p:1, t:0.95, ang:-20, b:140 },
  { p:2, t:0.7, ang:-26, b:112 },
  { p:3, t:0.6, ang: 30, b:70 }, { p:3, t:0.95, ang:-22, b:126 },
  { p:4, t:0.6, ang:-28, b:92 }, { p:4, t:0.95, ang: 20, b:148 },
  { p:5, t:0.7, ang: 26, b:120 },
  { p:6, t:0.65, ang:-26, b:96 }, { p:7, t:0.65, ang: 26, b:104 },
  { p:8, t:0.7, ang:-18, b:150 }, { p:8, t:0.92, ang: 20, b:168 },
]
var TWIGLEN = [[80,6],[160,12],[300,17],[400,21]]

function boughGeom(def, count, bulk){
  if (count < def.birth) return null
  var grow = ss(def.birth, def.full, count)
  var v = kf(def.frames, count)
  var full = [[v[0],v[1]],[v[2],v[3]],[v[4],v[5]]]
  var o = full[0]
  var spine = full.map(function(p){ return [lerp(o[0], p[0], grow), lerp(o[1], p[1], grow)] })
  var widths = [v[6],v[7],v[8]].map(function(w){ return w * (0.45 + 0.55 * grow) * (1 + 0.6 * (bulk - 1)) })
  return { spine: spine, widths: widths, grow: grow }
}
function childGeom(parent, def, count, lenKf, wfac, bulk){
  if (!parent || count < def.b) return null
  var g = ss(def.b, def.b + 24, count)
  if (parent.grow < def.t * 0.9) return null
  var at = alongSpine(parent.spine, Math.min(0.98, def.t))
  var d = dirAt(parent.spine, Math.min(0.98, def.t))
  var rad = def.ang * Math.PI / 180
  var dx = d[0] * Math.cos(rad) - d[1] * Math.sin(rad)
  var dy = d[0] * Math.sin(rad) + d[1] * Math.cos(rad)
  var len = kf(lenKf, count)[0] * g
  if (len < 1.5) return null
  var p2 = [at[0] + dx * len, at[1] + dy * len]
  var mid = [at[0] + dx * len * 0.5 - dy * (def.bow || 1) * len * 0.14, at[1] + dy * len * 0.5 + dx * (def.bow || 1) * len * 0.14]
  var wAt = parent.widths[Math.min(2, Math.round(def.t * 2))]
  var w0 = Math.max(0.7, wAt * 0.62) * wfac * (1 + 0.35 * (bulk - 1))
  return { spine: [at, mid, p2], widths: [w0, w0 * 0.6, w0 * 0.32], grow: g }
}
function drawPiece(g, fill, strokeScale){
  if (!g) return ''
  return '<path d="' + ribbon(g.spine, g.widths) + '" fill="' + fill + '" stroke="' + C.ink + '" stroke-width="' + f1(0.85 * Math.min(1, (strokeScale||1))) + '" stroke-linejoin="round"/>'
}

// fixed registry: a leaf's home is picked from wood available at ITS
// birth, so the choice is stable for life
var PIECES = []
;(function(){
  var i
  for (i = 0; i < BOUGHS.length; i++) PIECES.push({ kind:'bough', idx:i, avail: BOUGHS[i].birth + Math.round((BOUGHS[i].full - BOUGHS[i].birth) * 0.35), w:1 })
  for (i = 0; i < SECS.length; i++) PIECES.push({ kind:'sec', idx:i, avail: SECS[i].b + 8, w:2 })
  for (i = 0; i < TWIGS.length; i++) PIECES.push({ kind:'twig', idx:i, avail: TWIGS[i].b + 7, w:3 })
})()
function homeForLeaf(n, r){
  var elig = []
  for (var i = 0; i < PIECES.length; i++) if (PIECES[i].avail <= n) for (var w = 0; w < PIECES[i].w; w++) elig.push(PIECES[i])
  if (elig.length === 0) return PIECES[0]
  return elig[Math.floor(r * elig.length)]
}

var VINEPICKS = [ { piece:'sec', i:2, b:150 }, { piece:'sec', i:5, b:195 }, { piece:'twig', i:9, b:245 }, { piece:'twig', i:13, b:330 } ]
var GRASSP = [ {x:96,y:212,b:22},{x:152,y:212,b:34},{x:74,y:213,b:64},{x:166,y:213,b:96},{x:58,y:214,b:158},{x:182,y:214,b:230},{x:120,y:218,b:306} ]
var STONES = [ {x:146,y:212,r:4,b:0},{x:178,y:214,r:4.5,b:66},{x:46,y:215,r:5,b:154},{x:198,y:215,r:4,b:308} ]
var FALLEN = [ {b:190,x:100,y:209},{b:240,x:138,y:211},{b:285,x:88,y:212},{b:330,x:150,y:209.5},{b:370,x:112,y:211.5} ]

export function stageNameFor(count){
  var labels = [[0,'Seed'],[1,'Sprout'],[7,'Sapling'],[21,'Young tree'],[60,'Mature tree'],[150,'Great tree'],[300,'Ancient tree']]
  var n = 'Seed'
  for (var i = 0; i < labels.length; i++) if (count >= labels[i][0]) n = labels[i][1]
  return n
}

export function buildTree(seed, count, newSince) {
  count = Math.max(0, Math.min(MAX_GROWTH, Math.round(count)))
  newSince = Math.max(0, Math.min(count, newSince == null ? count : newSince))
  var uSeed = hashStr(String(seed))
  var bulk = trunkBulk(count)
  var s = ''
  var fresh = []
  var batches = {}   // tone|region → compound path d (settled leaves); region
  var batchOrder = []   // = left/center/right of the canopy, so the breeze can
  var batchAdd = function(tone, x, d){   // flutter each patch independently
    var region = x < 102 ? 'l' : x > 138 ? 'r' : 'c'
    var key = tone + '|' + region
    if (!batches[key]) { batches[key] = ''; batchOrder.push(key) }
    batches[key] += d + ' '
  }

  // ground
  var washRx = kf([[0,28],[21,36],[60,46],[150,58],[300,68],[400,80]], count)[0]
  var moundR = kf([[0,20],[21,16],[60,24],[150,30],[300,38],[400,44]], count)[0]
  s += '<ellipse cx="120" cy="' + (GROUND_Y) + '" rx="' + f1(washRx) + '" ry="7.5" fill="' + C.wash + '" opacity="0.8"/>'
  s += '<ellipse cx="120" cy="' + (GROUND_Y - 2) + '" rx="' + f1(moundR) + '" ry="5.2" fill="' + C.mound + '" opacity="0.6"/>'
  s += '<path d="M' + f1(120-washRx) + ' ' + GROUND_Y + ' Q120 ' + (GROUND_Y - 5.5) + ' ' + f1(120+washRx) + ' ' + GROUND_Y + '" stroke="rgba(58,42,28,0.35)" stroke-width="1" fill="none"/>'
  var i
  for (i = 0; i < STONES.length; i++) if (count >= STONES[i].b) s += stoneEl(STONES[i].x, STONES[i].y, STONES[i].r, ss(STONES[i].b, STONES[i].b+6, count))
  for (i = 0; i < GRASSP.length; i++) if (count >= GRASSP[i].b) s += grass(GRASSP[i].x, GRASSP[i].y, ss(GRASSP[i].b, GRASSP[i].b+6, count))

  // the seed — fully back in the earth by ~24
  var seedSink = ss(2, 26, count)
  var seedOp = 1 - ss(8, 26, count)
  if (seedOp > 0.04) s += '<g opacity="' + f1(seedOp) + '">' + seedShape(lerp(120,116,seedSink), lerp(204,212.5,seedSink), lerp(-16,-38,seedSink), lerp(1,0.58,seedSink)) + '</g>'
  if (count >= 1 && count <= 9) s += '<path d="M110 191 l-2.5 -3 M131 190 l2.6 -2.8" stroke="' + C.gold + '" stroke-width="1.3" stroke-linecap="round" opacity="' + f1(1 - ss(6,9,count)) + '"/>'

  var boughs = [], secs = [], twigs = []
  if (count >= 1) {
    for (i = 0; i < ROOTS.length; i++) s += drawPiece(boughGeom(ROOTS[i], count, 1 + 0.8*(bulk-1)), C.bark, ss(ROOTS[i].birth, ROOTS[i].birth+18, count))
    var tv = kf(TRUNK, count)
    var tSpine = [[tv[0],tv[1]],[tv[2],tv[3]],[tv[4],tv[5]],[tv[6],tv[7]]]
    var tW = [tv[8],tv[9],tv[10],tv[11]].map(function(w){ return w * bulk })
    var trunkFill = mixHex(C.stem, C.bark, ss(6, 22, count))
    s += '<path d="' + ribbon(tSpine, tW) + '" fill="' + trunkFill + '" stroke="' + C.ink + '" stroke-width="' + f1(lerp(0.6,0.9,ss(4,16,count))) + '" stroke-linejoin="round"/>'
    if (count >= 40) {
      var bl = ss(40, 70, count)
      s += '<path d="M117 205 Q118.5 198 118 191" stroke="' + C.barkDark + '" stroke-width="1" fill="none" opacity="' + f1(0.65*bl) + '"/>' +
           '<path d="M122.5 202 Q121.5 195 121.8 189" stroke="' + C.barkDark + '" stroke-width="1" fill="none" opacity="' + f1(0.65*bl) + '"/>'
      if (count >= 170) s += '<path d="M114.5 203 Q116 196 115.8 190" stroke="' + C.barkDark + '" stroke-width="1" fill="none" opacity="' + f1(0.65*ss(170,210,count)) + '"/>'
    }
    for (i = 0; i < BOUGHS.length; i++) {
      boughs[i] = boughGeom(BOUGHS[i], count, bulk)
      s += drawPiece(boughs[i], trunkFill, ss(BOUGHS[i].birth, BOUGHS[i].birth+16, count) * 1.6)
    }
    for (i = 0; i < SECS.length; i++) {
      secs[i] = childGeom(boughs[SECS[i].p], SECS[i], count, SECLEN, 1, bulk)
      s += drawPiece(secs[i], C.bark, 0.9)
    }
    for (i = 0; i < TWIGS.length; i++) {
      twigs[i] = childGeom(secs[TWIGS[i].p], TWIGS[i], count, TWIGLEN, 0.7, bulk)
      s += drawPiece(twigs[i], C.bark, 0.7)
    }
    if (count <= 16) s += '<circle cx="' + f1(tv[6]) + '" cy="' + f1(tv[7]-1.5) + '" r="2" fill="' + C.deep + '" opacity="' + f1(1 - ss(11,16,count)) + '"/>'
  }

  var geomOf = function(home){
    var g = home.kind === 'bough' ? boughs[home.idx] : home.kind === 'sec' ? secs[home.idx] : twigs[home.idx]
    if (g) return g
    if (home.kind === 'twig') g = secs[TWIGS[home.idx].p]
    if (!g && home.kind !== 'bough') g = boughs[home.kind === 'sec' ? SECS[home.idx].p : SECS[TWIGS[home.idx].p].p]
    return g || boughs[0] || null
  }
  var emitLeaf = function(n, x, y, len, rot, tone, outline, opacity, variant){
    if (n > newSince && opacity >= 0.98) {
      fresh.push({ d: leafPathD(x, y, len, rot, variant), fill: tone, outline: !!outline, ox: f1(x), oy: f1(y) })
    } else if (opacity >= 0.98 && !outline) {
      batchAdd(tone, x, leafPathD(x, y, len, rot, variant))
    } else {
      s += leafEl(x, y, len, rot, tone, outline, opacity, variant)
    }
  }

  for (var n = 1; n <= count; n++) {
    var rl = mulberry32((uSeed ^ (n * 2654435761)) >>> 0)
    var pop = 0.55 + 0.45 * ss(n, n + 1.6, count)
    if (n <= 6) {
      var fade = 1 - ss(20 + n*2, 30 + n*2, count)
      if (fade <= 0.02) continue
      var tv2 = kf(TRUNK, count)
      var tSp2 = [[tv2[0],tv2[1]],[tv2[2],tv2[3]],[tv2[4],tv2[5]],[tv2[6],tv2[7]]]
      var FRACS = [0.7, 0.8, 0.52, 0.62, 0.4, 0.5]
      var pt = alongSpine(tSp2, FRACS[n-1])
      var sideL = n % 2 === 1
      var sz = (n <= 2 ? 16 + rl()*3 : 11 + rl()*3.5) * pop
      emitLeaf(n, pt[0] + (sideL ? -1.2 : 1.2), pt[1], sz, (sideL ? -156 : -24) + (rl()-0.5)*16, sideL ? C.light : C.mid, true, fade, n % 2)
    } else {
      var home = homeForLeaf(n, rl())
      var g2 = geomOf(home)
      if (!g2) continue
      var frac = (home.kind === 'bough' ? 0.66 + rl() * 0.34 : 0.55 + rl() * 0.45)
      var eff = Math.min(frac, g2.grow * 0.98 + 0.02)
      var p2 = alongSpine(g2.spine, eff)
      var d2 = dirAt(g2.spine, eff)
      var side2 = rl() < 0.5 ? 1 : -1
      var off2 = 1.2 + rl() * 2.4
      var px = p2[0] - d2[1] * side2 * off2 + d2[0] * rl() * 2.5
      var py = p2[1] + d2[0] * side2 * off2 + d2[1] * rl() * 2.5
      var baseRot = Math.atan2(d2[1], d2[0]) * 180 / Math.PI + side2 * (46 + rl() * 34)
      var juvenile = n <= 20
      var fade2 = juvenile ? 1 - ss(34 + n*1.2, 44 + n*1.2, count) : 1
      if (fade2 <= 0.02) continue
      var t2 = rl()
      var tone = juvenile ? [C.light, C.mid, C.pale][n % 3]
        : t2 < 0.42 ? C.light : t2 < 0.66 ? C.mid : t2 < 0.82 ? C.pale : t2 < 0.94 ? C.deep : (n >= 150 ? C.goldgreen : C.deep)
      var sz2 = (juvenile ? 10 + rl() * 3.5 : 8 + rl() * 4.2) * pop
      emitLeaf(n, px, py, sz2, baseRot, tone, juvenile, fade2, n % 2)
      if (!juvenile) {
        var extra = n < 60 ? (rl() < 0.55 ? 1 : 0)
                  : n < 150 ? 1 + (rl() < 0.5 ? 1 : 0)
                  : 2 + (rl() < 0.45 ? 1 : 0)
        for (var e = 0; e < extra; e++) {
          var t3 = rl()
          var tone2 = t3 < 0.45 ? C.pale : t3 < 0.8 ? C.light : (n >= 150 && t3 > 0.96 ? C.goldgreen : C.mid)
          emitLeaf(n, px + (rl()-0.5)*4.5, py + (rl()-0.5)*4.5, sz2 * (0.5 + rl()*0.25),
                   baseRot + (e % 2 ? -1 : 1) * (24 + rl()*38), tone2, false, fade2, (n + e + 1) % 2)
        }
      }
    }
  }

  // settled leaves, batched: one compound path per tone-and-region patch
  for (i = 0; i < batchOrder.length; i++) {
    var bk = batchOrder[i]
    s += '<path class="vow-canopy" d="' + batches[bk].trim() + '" fill="' + bk.split('|')[0] + '"/>'
  }

  for (i = 0; i < FALLEN.length; i++) {
    if (count < FALLEN[i].b) continue
    var fo = ss(FALLEN[i].b, FALLEN[i].b + 8, count)
    s += leafEl(FALLEN[i].x, FALLEN[i].y, 6.5, i % 2 ? 8 : 172, i % 2 ? C.gold : C.pale, false, 0.8 * fo, i % 2)
  }
  for (i = 0; i < VINEPICKS.length; i++) {
    if (count < VINEPICKS[i].b) continue
    var host = VINEPICKS[i].piece === 'sec' ? secs[VINEPICKS[i].i] : twigs[VINEPICKS[i].i]
    if (!host) continue
    var vg = ss(VINEPICKS[i].b, VINEPICKS[i].b + 20, count)
    var tip = host.spine[2]
    var vl = f1((26 + i * 5) * vg)
    s += '<g class="vow-vine">'
    s += '<path d="M' + f1(tip[0]) + ' ' + f1(tip[1]) + ' q2.5 ' + f1(vl*0.3) + ' -0.5 ' + f1(vl*0.6) + ' q-2.5 ' + f1(vl*0.25) + ' 0.5 ' + vl + '" stroke="' + C.deep + '" stroke-width="1.2" fill="none" opacity="' + f1(0.85*vg) + '"/>'
    if (vg > 0.5) for (var k2 = 1; k2 <= (vl > 26 ? 3 : 2); k2++) s += leafEl(tip[0] + (k2%2 ? 2.5 : -2.5), tip[1] + vl*k2/3.4, 5, k2%2 ? 30 : 150, C.light, false, vg, k2 % 2)
    s += '</g>'
  }

  return { html: s, fresh: fresh }
}
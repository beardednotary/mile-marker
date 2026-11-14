// Draws the app icon and splash sources into assets/, for capacitor-assets to resize.
//
//   node tools/make_icons.js
//
// The mark is the mile post from the roads screen: a green guide sign, white border,
// MILE over 0. It is drawn as geometry, not type, so it renders the same on any machine:
// M, I, L and E are straight strokes, and the 0 is a stadium, as on the real sign.
//
// This is a stand-in drawn to match the game. Replace the PNGs in assets/ with finished
// art (same file names and sizes) and run `npm run icons`, which resizes whatever is in
// assets/ without redrawing it. `npm run assets` redraws this stand-in first.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const GREEN = '#006747', WHITE = '#ffffff', GROUND = '#e8e4da', NIGHT = '#070707';

// The legend, in a box w wide, centred on cx, starting at y. Returns SVG.
function legend(cx, y, w) {
  const t = w * 0.058;                      // stroke of MILE
  const capH = w * 0.2, gap = w * 0.055;
  const wM = w * 0.25, wI = t, wL = w * 0.15, wE = w * 0.155;
  const total = wM + wI + wL + wE + gap * 3;
  let x = cx - total / 2;
  const y0 = y, y1 = y + capH;
  const parts = [];
  const stroke = `fill="none" stroke="${WHITE}" stroke-width="${t}" stroke-linejoin="miter" stroke-miterlimit="10"`;
  // M: clipped to cap height so the mitred peaks stay square
  const mId = 'm' + Math.round(cx) + Math.round(y);
  parts.push(`<clipPath id="${mId}"><rect x="${x}" y="${y0}" width="${wM}" height="${capH}"/></clipPath>`);
  parts.push(`<path clip-path="url(#${mId})" ${stroke} d="M${x + t / 2} ${y1 + t} V${y0 - t * 0.2} L${x + wM / 2} ${y1 - t * 0.35} L${x + wM - t / 2} ${y0 - t * 0.2} V${y1 + t}"/>`);
  x += wM + gap;
  parts.push(`<rect x="${x}" y="${y0}" width="${t}" height="${capH}" fill="${WHITE}"/>`);
  x += wI + gap;
  parts.push(`<path ${stroke} d="M${x + t / 2} ${y0} V${y1 - t / 2} H${x + wL}"/>`);
  x += wL + gap;
  parts.push(`<path ${stroke} d="M${x + wE} ${y0 + t / 2} H${x + t / 2} V${y1 - t / 2} H${x + wE}"/>`);
  parts.push(`<rect x="${x}" y="${y0 + capH / 2 - t / 2}" width="${wE * 0.86}" height="${t}" fill="${WHITE}"/>`);
  // 0
  const zt = w * 0.115, zw = w * 0.5, zh = w * 0.76, zy = y1 + w * 0.13;
  parts.push(`<rect x="${cx - zw / 2 + zt / 2}" y="${zy + zt / 2}" width="${zw - zt}" height="${zh - zt}" rx="${(zw - zt) / 2}" fill="none" stroke="${WHITE}" stroke-width="${zt}"/>`);
  return { svg: parts.join(''), height: capH + w * 0.13 + zh };
}

// A sign: green plate, white border, legend. (x, y) is the top-left of the plate.
function sign(x, y, w, h, r, border) {
  const lg = legend(x + w / 2, 0, w * 0.74);
  const top = y + (h - lg.height) / 2;
  const placed = legend(x + w / 2, top, w * 0.74);
  return `<rect x="${x - 2}" y="${y - 2}" width="${w + 4}" height="${h + 4}" rx="${r + 2}" fill="rgba(0,0,0,0.28)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${WHITE}"/>
    <rect x="${x + border}" y="${y + border}" width="${w - border * 2}" height="${h - border * 2}" rx="${r - border * 0.55}" fill="${GREEN}"/>
    ${placed.svg}`;
}

const svg = (size, body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : ''}${body}</svg>`;

// iOS icon: the plate fills the square (the system rounds the corners); the white border
// is drawn inside it so it survives the mask.
function iconOnly() {
  const S = 1024, inset = 74, bw = 30;
  const lg = legend(S / 2, 0, 500);
  const placed = legend(S / 2, (S - lg.height) / 2, 500);
  return svg(S, `<rect x="${inset}" y="${inset}" width="${S - inset * 2}" height="${S - inset * 2}" rx="150" fill="none" stroke="${WHITE}" stroke-width="${bw}"/>${placed.svg}`, GREEN);
}
// Android adaptive icon: legend only, inside the middle two-thirds, over a flat green layer.
function iconForeground() {
  const S = 1024;
  const lg = legend(S / 2, 0, 330);
  const placed = legend(S / 2, (S - lg.height) / 2, 330);
  return svg(S, placed.svg, null);
}
function splash(bg) {
  const S = 2732, w = 330, h = 520;
  return svg(S, sign((S - w) / 2, (S - h) / 2, w, h, 44, 15), bg);
}

const jobs = [
  ['icon-only.png', iconOnly()],
  ['icon-foreground.png', iconForeground()],
  ['icon-background.png', svg(1024, '', GREEN)],
  ['splash.png', splash(GROUND)],
  ['splash-dark.png', splash(NIGHT)]
];
(async () => {
  for (const [name, source] of jobs) {
    await sharp(Buffer.from(source)).png().toFile(path.join(OUT, name));
    console.log('  wrote assets/' + name);
  }
})();

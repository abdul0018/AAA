import {continueRender, delayRender, staticFile} from 'remotion';

/* Fonts are bundled locally (the sandbox browser cannot reach fonts.gstatic.com). */
const LAT = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+00D7';
const EXT = 'U+0100-02AF,U+02B0-02BA,U+02BD-02FF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const faces: Array<[string, string, string, string]> = [
  ['Unbounded', 'fonts/unbounded-latin-900-normal.woff2', '900', LAT],
  ['Unbounded', 'fonts/unbounded-latin-ext-900-normal.woff2', '900', EXT],
  ['Unbounded', 'fonts/unbounded-cyrillic-900-normal.woff2', '900', CYR],
  ['Unbounded', 'fonts/unbounded-latin-800-normal.woff2', '800', LAT],
  ['Unbounded', 'fonts/unbounded-latin-ext-800-normal.woff2', '800', EXT],
  ['Unbounded', 'fonts/unbounded-cyrillic-800-normal.woff2', '800', CYR],
  ['JBMono', 'fonts/jetbrains-mono-latin-500-normal.woff2', '500', LAT],
  ['JBMono', 'fonts/jetbrains-mono-latin-ext-500-normal.woff2', '500', EXT],
  ['JBMono', 'fonts/jetbrains-mono-cyrillic-500-normal.woff2', '500', CYR],
  ['JBMono', 'fonts/jetbrains-mono-latin-700-normal.woff2', '700', LAT],
  ['JBMono', 'fonts/jetbrains-mono-latin-ext-700-normal.woff2', '700', EXT],
  ['JBMono', 'fonts/jetbrains-mono-cyrillic-700-normal.woff2', '700', CYR],
  ['Manrope', 'fonts/Manrope-latin.woff2', '200 800', LAT],
  ['Manrope', 'fonts/Manrope-latin-ext.woff2', '200 800', EXT],
  ['Manrope', 'fonts/Manrope-cyrillic.woff2', '200 800', CYR],
];
if (typeof document !== 'undefined') {
  const h = delayRender('fonts');
  Promise.all(
    faces.map(([fam, file, weight, range]) => {
      const ff = new FontFace(fam, `url(${staticFile(file)}) format('woff2')`, {weight, unicodeRange: range});
      document.fonts.add(ff);
      return ff.load();
    }),
  )
    .catch((e) => console.warn('font load failed', e))
    .finally(() => continueRender(h));
}

export const F = {
  head: "Unbounded, 'Arial Black', sans-serif", // heavy rounded-wide headlines + big numbers
  ui: "Manrope, Inter, 'Helvetica Neue', Arial, sans-serif", // captions, handle
  mono: "JBMono, 'JetBrains Mono', ui-monospace, monospace", // labels, readouts, chapter counter
};

/** Palette sampled from the reference reels. */
export const C = {
  bg: '#1D1E22',
  grid: 'rgba(255,255,255,0.055)',
  cross: 'rgba(255,255,255,0.22)',
  white: '#F4F4F2',
  dim: 'rgba(244,244,242,0.32)',
  grey: '#8C8F98',
  orange: '#F5A524', // chapter name, stats, active progress
  yellow: '#F6C343', // headline glow line
  amber: '#E9A93A',
  red: '#F0473E',
  blue: '#6FA8FF',
  select: '#3D7BFF', // Figma-like selection box around a highlighted word
  lime: '#C8F135', // avatar
  panel: 'rgba(38,40,46,0.92)',
  panelLine: 'rgba(255,255,255,0.08)',
  ir1: '#2A1450',
  ir2: '#3E1C70',
};
export const W = 1080;
export const H = 1920;
export const FPS = 30;

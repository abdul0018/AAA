import {continueRender, delayRender, staticFile} from 'remotion';

// Manrope ExtraBold (800) is the closest free match to the reference headline font
// (geometric grotesk, flat-topped caps, tight spacing). It is bundled in public/fonts
// (variable woff2, all weights) so renders never depend on fonts.gstatic.com.
const FAMILY = 'Manrope';
const faces: Array<[string, string]> = [
  ['fonts/Manrope-latin.woff2', 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'],
  ['fonts/Manrope-latin-ext.woff2', 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF'],
  ['fonts/Manrope-cyrillic.woff2', 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116'],
];
if (typeof document !== 'undefined') {
  const handle = delayRender('Loading bundled Manrope');
  Promise.all(
    faces.map(([file, range]) => {
      const ff = new FontFace(FAMILY, `url(${staticFile(file)}) format('woff2')`, {weight: '200 800', unicodeRange: range});
      document.fonts.add(ff);
      return ff.load();
    }),
  )
    .catch((e) => console.warn('font load failed, falling back', e))
    .finally(() => continueRender(handle));
}

export const FONT = `${FAMILY}, Onest, Inter, 'Helvetica Neue', Arial, sans-serif`;

export const W = 1080;
export const H = 1920;
export const FPS = 30;

/** Colours sampled from the reference video. */
export const C = {
  bg: '#1F2121', // charcoal board
  bgEdge: '#151616', // vignette edge
  grid: 'rgba(255,255,255,0.035)', // faint 66 px grid
  ground: 'rgba(255,255,255,0.22)', // hatched ground line
  white: '#F2F1EC', // headline white (slightly warm)
  dim: 'rgba(242,241,236,0.38)', // title before it "lights up"
  sub: '#9A9C9A', // grey sub-caption ("ZARARI YO'Q")
  yellow: '#FFCC40', // accent: underline, rings, charges, glow
  yellowGlow: 'rgba(255,204,64,0.55)',
  red: '#FF4D4D', // impact word / cross mark
  redGlow: 'rgba(255,60,60,0.65)',
  blue: '#7FB8E6', // rain drops
  green: '#5BD68A',
};

/** Layout anchors on the 1080x1920 canvas (scaled from the 720x1280 reference). */
export const L = {
  titleY: 335, // vertical centre of the headline block (measured: 0.175 x H)
  handleY: 200, // tiny grey watermark
  stageY: 1060, // centre of the main illustration (0.55 x H); hero objects are 650-880 px wide
  groundY: 1290, // default ground line
  pillY: 1725, // Instagram pill
  gutter: 64,
};

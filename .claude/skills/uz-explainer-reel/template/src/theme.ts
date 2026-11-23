import {continueRender, delayRender, staticFile} from 'remotion';

// Fonts are local (public/fonts, fetched by scripts/fetch_fonts.sh): deterministic renders, no CDN/proxy issues.
export const DISPLAY = "'Unbounded', 'Montserrat', sans-serif"; // extended heavy: hook title, numbers, stamps
export const SANS = "'Montserrat', sans-serif"; // rounded geometric: captions, chips, cards
export const MONO = "'JetBrains Mono', monospace"; // small technical labels: "bob 03/10", topic, x-ray callouts

if (typeof document !== 'undefined' && !document.getElementById('reel-fonts')) {
  const handle = delayRender('Loading local fonts');
  fetch(staticFile('fonts/fonts.css'))
    .then((r) => r.text())
    .then(async (css) => {
      const style = document.createElement('style');
      style.id = 'reel-fonts';
      style.textContent = css.replace(/url\(([^)]+\.woff2)\)/g, (_m, f) => `url(${staticFile('fonts/' + f)})`);
      document.head.appendChild(style);
      const probes = ['900 40px Unbounded', '800 40px Unbounded', '700 40px Montserrat', '800 40px Montserrat', '600 40px Montserrat', 'italic 500 40px Montserrat', '500 40px "JetBrains Mono"'];
      await Promise.all(probes.map((p) => document.fonts.load(p, 'Aa Ўў Gg‘ Яя 0123')));
      continueRender(handle);
    })
    .catch((e) => {
      console.error('fonts failed, run scripts/fetch_fonts.sh', e);
      continueRender(handle);
    });
}

export const C = {
  bg: '#161618',
  bg2: '#1d1e21',
  panel: 'rgba(38,39,43,0.88)',
  track: '#2b2c30',
  red: '#B8304F', // main crimson accent (arcs, fills, progress)
  redHot: '#E0566F', // brighter crimson for text on dark / glows
  redFill: 'rgba(184,48,79,0.20)',
  white: '#F2F2F0',
  grey: '#8C8D91',
  dim: '#55565B',
};

export const W = 1080;
export const H = 1920;
export const PAD = 66; // side gutter
export const CAPTION_Y = 340; // centre line of the kinetic caption

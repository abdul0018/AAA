import {continueRender, delayRender, staticFile} from 'remotion';
// bundled Manrope for the watermark (no network fonts in sandboxes)
if (typeof document !== 'undefined') {
  const h = delayRender('font');
  const ff = new FontFace('Manrope', `url(${staticFile('fonts/Manrope-latin.woff2')}) format('woff2')`, {weight: '200 800'});
  document.fonts.add(ff);
  ff.load().catch(() => undefined).finally(() => continueRender(h));
}
export {};

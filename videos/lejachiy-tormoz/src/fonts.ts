import {continueRender, delayRender, staticFile} from 'remotion';
const faces: Array<[string, string]> = [
  ['fonts/Manrope-latin.woff2', 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2212'],
  ['fonts/Manrope-latin-ext.woff2', 'U+0100-02BA,U+02BD-02FF,U+1E00-1EFF,U+2020,U+20A0-20C0,U+2C60-2C7F,U+A720-A7FF'],
];
if (typeof document !== 'undefined') {
  const h = delayRender('fonts');
  Promise.all(faces.map(([f, r]) => { const ff = new FontFace('Manrope', `url(${staticFile(f)}) format('woff2')`, {weight: '200 800', unicodeRange: r}); document.fonts.add(ff); return ff.load(); }))
    .catch((e) => console.warn(e)).finally(() => continueRender(h));
}
export const UI = "Manrope, Inter, Arial, sans-serif";

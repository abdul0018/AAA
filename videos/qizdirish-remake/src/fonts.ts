import {continueRender, delayRender, staticFile} from 'remotion';

// Montserrat (headlines, numbers) + Oswald (captions), bundled locally: the sandbox
// browser cannot reach fonts.gstatic.com.
const faces: Array<[string, string, string, string]> = [
  ['Montserrat', 'fonts/montserrat-latin-700-normal.woff2', '700', 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2212,U+00D7'],
  ['Montserrat', 'fonts/montserrat-latin-ext-700-normal.woff2', '700', 'U+0100-02AF,U+02B0-02BA,U+02BD-02FF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'],
  ['Montserrat', 'fonts/montserrat-latin-800-normal.woff2', '800', 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2212,U+00D7'],
  ['Montserrat', 'fonts/montserrat-latin-ext-800-normal.woff2', '800', 'U+0100-02AF,U+02B0-02BA,U+02BD-02FF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'],
  ['Oswald', 'fonts/oswald-latin-600-normal.woff2', '600', 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F'],
  ['Oswald', 'fonts/oswald-latin-ext-600-normal.woff2', '600', 'U+0100-02AF,U+02B0-02BA,U+02BD-02FF,U+1E00-1EFF'],
  ['Oswald', 'fonts/oswald-latin-700-normal.woff2', '700', 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F'],
  ['Oswald', 'fonts/oswald-latin-ext-700-normal.woff2', '700', 'U+0100-02AF,U+02B0-02BA,U+02BD-02FF,U+1E00-1EFF'],
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

export const MONT = "Montserrat, 'Helvetica Neue', Arial, sans-serif";
export const OSW = "Oswald, 'Arial Narrow', Arial, sans-serif";

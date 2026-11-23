import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {MONT, OSW} from './fonts';

/* ------------------------------------------------------------------ basics */
export const FPS = 30;
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
const S = (p: string) => staticFile(p);
const BG = '#191A1F';
const YEL = '#F6B42C';
const GRN = '#4CC46E';
const RED = '#E5544B';
const BLUE = '#4DA3E8';
const CYAN = '#5FE3F5';

export type Word = {w: string; s: number; e: number};
export type WarmProps = {words: Word[]; handle: string; end: number};

const lin = (t: number, a: number, b: number, from = 0, to = 1, e = ease) => interpolate(t, [a, b], [from, to], {...cl, easing: e});
const fadeIO = (t: number, a: number, b: number, d = 0.25) => Math.min(lin(t, a, a + d), b === Infinity ? 1 : lin(t, b - d, b, 1, 0));

/* ------------------------------------------------------------------ background: charcoal, faint grid, drifting stars */
const Background: React.FC<{t: number; dim?: number}> = ({t, dim = 0}) => (
  <AbsoluteFill style={{background: BG}}>
    <AbsoluteFill
      style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.022) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.022) 2px, transparent 2px)',
        backgroundSize: '72px 72px',
      }}
    />
    {new Array(70).fill(0).map((_, i) => {
      const x = random(`sx${i}`) * 1080;
      const y0 = random(`sy${i}`) * 1920;
      const sp = 4 + random(`ss${i}`) * 10;
      const y = (y0 - t * sp + 1920 * 4) % 1920;
      const r = 1.5 + random(`sr${i}`) * 3;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + random(`st${i}`)) + i));
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: '#fff', opacity: 0.55 * tw}} />;
    })}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)'}} />
    {dim > 0 && <AbsoluteFill style={{background: '#000', opacity: dim}} />}
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ text */
type Line = {text: string; color?: string; size?: number; weight?: number};
const Headline: React.FC<{t: number; at: number; out?: number; lines: Line[]; y?: number}> = ({t, at, out = Infinity, lines, y = 150}) => {
  const op = fadeIO(t, at, out, 0.22);
  if (op <= 0) return null;
  const rise = lin(t, at, at + 0.35, 24, 0, Easing.out(Easing.cubic));
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: y, textAlign: 'center', opacity: op, transform: `translateY(${rise}px)`}}>
      {lines.map((l, i) => (
        <div key={i} style={{fontFamily: MONT, fontWeight: l.weight ?? 800, fontSize: l.size ?? 66, lineHeight: 1.12, color: l.color ?? '#fff', letterSpacing: -0.5, textShadow: '0 4px 18px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>
          {l.text}
        </div>
      ))}
    </div>
  );
};

const Caption: React.FC<{t: number; words: Word[]}> = ({t, words}) => {
  // group words into 1-2 word chunks shown from the first word's start to the next chunk
  const chunks: {text: string; s: number}[] = [];
  for (let i = 0; i < words.length; ) {
    let j = i + 1;
    if (j < words.length && words[i].w.length + words[j].w.length < 13 && words[j].s - words[i].s < 0.45 && !/[.?!,:]$/.test(words[i].w)) j++;
    chunks.push({text: words.slice(i, j).map((w) => w.w).join(' '), s: words[i].s});
    i = j;
  }
  let k = -1;
  for (let i = 0; i < chunks.length; i++) if (chunks[i].s <= t + 0.03) k = i;
  if (k < 0) return null;
  const c = chunks[k];
  const end = k + 1 < chunks.length ? chunks[k + 1].s : words[words.length - 1].e + 0.4;
  if (t > end + 0.3) return null;
  const d = t - c.s;
  const pop = interpolate(d, [0, 0.08, 0.16], [0.86, 1.05, 1], cl);
  const op = interpolate(d, [0, 0.06], [0.4, 1], cl);
  const text = c.text.replace(/[,:;]$/, '').toUpperCase();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1515, textAlign: 'center', fontFamily: OSW, fontWeight: 600, fontSize: 58, color: '#fff', letterSpacing: 0.5, opacity: op, transform: `scale(${pop})`, textShadow: '0 3px 12px rgba(0,0,0,0.8)'}}>
      {text}
    </div>
  );
};

const Watermark: React.FC = () => (
  <div style={{position: 'absolute', right: 70, top: 42, fontFamily: MONT, fontWeight: 800, fontSize: 21, letterSpacing: 1, color: 'rgba(255,255,255,0.32)'}}>AUTOPODVESKA</div>
);

const IgGlyph: React.FC<{size: number; color?: boolean}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <defs>
      <linearGradient id="igg" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#FEDA75" />
        <stop offset="0.35" stopColor="#FA7E1E" />
        <stop offset="0.6" stopColor="#D62976" />
        <stop offset="1" stopColor="#962FBF" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="40" height="40" rx="12" fill="none" stroke={color ? 'url(#igg)' : '#fff'} strokeWidth="4" />
    <circle cx="24" cy="24" r="9" fill="none" stroke={color ? 'url(#igg)' : '#fff'} strokeWidth="4" />
    <circle cx="35" cy="13" r="2.6" fill={color ? '#D62976' : '#fff'} />
  </svg>
);

const HandleTag: React.FC<{handle: string; x?: number; y?: number; op?: number}> = ({handle, x = 860, y = 470, op = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'translateX(-50%)', textAlign: 'center', opacity: op * 0.9}}>
    <IgGlyph size={44} />
    <div style={{fontFamily: OSW, fontWeight: 600, fontSize: 21, color: '#fff', marginTop: 4, whiteSpace: 'nowrap'}}>{handle.toUpperCase()}</div>
  </div>
);

const Pill: React.FC<{t: number; at: number; out?: number; text: string; x: number; y: number; border?: string; bg?: string; size?: number}> = ({t, at, out = Infinity, text, x, y, border = '#fff', bg = 'rgba(20,20,24,0.9)', size = 36}) => {
  const op = fadeIO(t, at, out, 0.18);
  if (op <= 0) return null;
  const s = interpolate(t - at, [0, 0.12, 0.22], [0.6, 1.06, 1], cl);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: op, background: bg, border: `3px solid ${border}`, borderRadius: size * 0.5, padding: `${size * 0.22}px ${size * 0.6}px`, fontFamily: MONT, fontWeight: 700, fontSize: size, color: '#fff', whiteSpace: 'nowrap'}}>
      {text}
    </div>
  );
};

const fmt = (sec: number) => {
  const s = Math.max(0, Math.floor(sec + 1e-6));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const TimerBox: React.FC<{t: number; at: number; out?: number; from: number; to: number; dur: number; x: number; y: number; color?: string; size?: number; ease2?: boolean}> = ({t, at, out = Infinity, from, to, dur, x, y, color = '#fff', size = 92, ease2}) => {
  const op = fadeIO(t, at, out, 0.18);
  if (op <= 0) return null;
  const k = lin(t, at, at + dur, 0, 1, ease2 ? Easing.in(Easing.quad) : Easing.linear);
  const v = from + (to - from) * k;
  const s = interpolate(t - at, [0, 0.12, 0.24], [0.7, 1.05, 1], cl);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: op, border: `5px solid ${color}`, borderRadius: size * 0.24, padding: `${size * 0.06}px ${size * 0.26}px`, background: 'rgba(10,10,12,0.55)', fontFamily: MONT, fontWeight: 800, fontSize: size, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2}}>
      {fmt(v)}
    </div>
  );
};

/* ------------------------------------------------------------------ props: cars, smoke, gauges */
const Smoke: React.FC<{t: number; x: number; y: number; dir?: number; n?: number; scale?: number; op?: number}> = ({t, x, y, dir = -1, n = 7, scale = 1, op = 1}) => (
  <>
    {new Array(n).fill(0).map((_, i) => {
      const life = 2.2;
      const ph = ((t + (i * life) / n) % life) / life;
      const r = (30 + ph * 120) * scale;
      const px = x + dir * ph * 120 * scale + Math.sin(i * 7 + t) * 10;
      const py = y - ph * 90 * scale;
      return <div key={i} style={{position: 'absolute', left: px - r, top: py - r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,205,215,0.33) 0%, rgba(200,205,215,0.12) 45%, transparent 70%)', opacity: op * Math.sin(ph * Math.PI) * 0.9, filter: 'blur(6px)'}} />;
    })}
  </>
);

const CarFront: React.FC<{t: number; y?: number; w?: number; op?: number; smoke?: boolean}> = ({t, y = 1120, w = 760, op = 1, smoke = true}) => {
  const h = w * (865 / 937);
  const bob = Math.sin(t * 9) * 1.2; // idling shiver
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: op}}>
      <div style={{position: 'absolute', left: 540 - w * 0.62, top: y + h * 0.43, width: w * 1.24, height: 70, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.75) 0%, transparent 70%)'}} />
      {smoke && <Smoke t={t} x={540 - w * 0.44} y={y + h * 0.3} dir={-1} />}
      {smoke && <Smoke t={t + 1.1} x={540 + w * 0.44} y={y + h * 0.3} dir={1} />}
      <Img src={S('img/cobalt_front.png')} style={{position: 'absolute', left: 540 - w / 2, top: y - h / 2 + bob, width: w}} />
      {/* own plate text over the blank plate */}
      <div style={{position: 'absolute', left: 540 - w * 0.165 + w * 0.012, top: y - h / 2 + bob + h * 0.79, width: w * 0.33, height: h * 0.066, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONT, fontWeight: 800, fontSize: w * 0.026, color: '#1b1b1b', letterSpacing: 1}}>
        AUTOPODVESKA
      </div>
    </div>
  );
};

const Road: React.FC<{t: number; y: number; speed: number}> = ({t, y, speed}) => (
  <div style={{position: 'absolute', left: 0, top: y, width: 1080, height: 44, background: 'linear-gradient(#2a2c33, #202228)', borderTop: '5px solid #4a4d57'}}>
    {new Array(14).fill(0).map((_, i) => {
      const x = ((i * 110 - t * speed) % 1540 + 1540) % 1540 - 120;
      return <div key={i} style={{position: 'absolute', left: x, top: 20, width: 56, height: 6, borderRadius: 3, background: '#555964'}} />;
    })}
  </div>
);

const CarSide: React.FC<{t: number; x: number; y: number; w: number; driving?: boolean; smoke?: boolean}> = ({t, x, y, w, driving, smoke}) => {
  const h = w * (545 / 1312);
  const bob = driving ? Math.sin(t * 13) * 1.5 : Math.sin(t * 9) * 0.8;
  return (
    <>
      {smoke && <Smoke t={t} x={x - w * 0.47} y={y + h * 0.3} dir={-1} n={6} scale={0.8} />}
      <div style={{position: 'absolute', left: x - w * 0.5, top: y + h * 0.42, width: w, height: 30, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 70%)'}} />
      <Img src={S('img/cobalt_side.png')} style={{position: 'absolute', left: x - w / 2, top: y - h / 2 + bob, width: w}} />
    </>
  );
};

const Gauge: React.FC<{t: number; at: number; x: number; y: number; value: number; color: string; label: string}> = ({t, at, x, y, value, color, label}) => {
  const op = lin(t, at, at + 0.25);
  if (op <= 0) return null;
  const k = lin(t, at + 0.1, at + 0.9, 0, value, Easing.out(Easing.back(1.4)));
  const R = 92;
  const a0 = 135, span = 270; // degrees, clockwise from +x
  const ang = ((a0 + span * k) * Math.PI) / 180;
  const arc = (from: number, to: number) => {
    const p = (d: number) => [x + R * Math.cos((d * Math.PI) / 180), y + R * Math.sin((d * Math.PI) / 180)];
    const [x1, y1] = p(from), [x2, y2] = p(to);
    return `M${x1},${y1} A${R},${R} 0 ${to - from > 180 ? 1 : 0} 1 ${x2},${y2}`;
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={x} cy={y} r={R + 14} fill="rgba(10,10,12,0.5)" stroke="#3a3c44" strokeWidth={6} />
        {k > 0.001 && <path d={arc(a0, a0 + span * k)} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />}
        <line x1={x} y1={y} x2={x + (R - 22) * Math.cos(ang)} y2={y + (R - 22) * Math.sin(ang)} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
        <circle cx={x} cy={y} r={11} fill="#fff" />
      </svg>
      <div style={{position: 'absolute', left: x, top: y + R + 50, transform: 'translateX(-50%)', fontFamily: MONT, fontWeight: 800, fontSize: 34, color: '#fff', whiteSpace: 'nowrap'}}>{label}</div>
    </div>
  );
};

const Bar: React.FC<{x: number; y: number; w: number; k: number; hot?: boolean}> = ({x, y, w, k, hot}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: 22, borderRadius: 11, border: '3px solid #555864', background: '#1d1f25', overflow: 'hidden'}}>
    <div style={{width: `${k * 100}%`, height: '100%', borderRadius: 11, background: hot ? `linear-gradient(90deg, ${BLUE}, ${BLUE} 40%, ${RED})` : BLUE}} />
  </div>
);

/* ------------------------------------------------------------------ engine cut-away (engine.png 509x929 measured) */
const EW = 509, EH = 929;
type EngineState = {pipe: number; cam: number; rings: number; fuel: number; drip: number; thin: number; run: number};
const Engine: React.FC<{t: number; x: number; y: number; w: number; st: EngineState; labels?: {moy?: number; nasos?: number; benzin?: number}}> = ({t, x, y, w, st, labels = {}}) => {
  const s = w / EW;
  const X = (v: number) => x - w / 2 + v * s;
  const Y = (v: number) => y + v * s;
  // piston stroke (engine running): crown between y 330 and 470 (image px)
  const ph = st.run > 0 ? t * 2 * Math.PI * 1.6 : 0;
  const crown = 400 + Math.cos(ph) * 70 * Math.min(1, st.run);
  const pw = 272; // piston image width in engine px
  const ps = pw / 379;
  // oil pipe path (engine px): sump right -> up the side -> over the head -> into the head
  const P = [[478, 835], [478, 22], [305, 22], [305, 62]];
  const segs = P.slice(1).map((p, i) => Math.hypot(p[0] - P[i][0], p[1] - P[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  const d = 'M' + P.map(([a, b]) => `${X(a)},${Y(b)}`).join(' L');
  const camRect = {l: 88, t: 82, r: 418, b: 182};
  const bore = {l: 108, t: 258, r: 400, b: 628};
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* glow under the sump */}
      <div style={{position: 'absolute', left: X(0), top: Y(770), width: w, height: 160 * s, background: 'radial-gradient(ellipse, rgba(246,170,40,0.35) 0%, transparent 70%)', filter: 'blur(10px)'}} />
      <Img src={S('img/engine.png')} style={{position: 'absolute', left: X(0), top: Y(0), width: w}} />
      {/* thinned oil: the sump goes pale */}
      {st.thin > 0 && (
        <div style={{position: 'absolute', left: X(25), top: Y(795), width: 470 * s, height: 72 * s, background: 'rgba(250,235,170,1)', mixBlendMode: 'screen', opacity: st.thin * 0.55, borderRadius: 8, filter: 'blur(3px)'}} />
      )}
      {/* camshaft oiled: an orange-tinted copy of the camshaft region */}
      {st.cam > 0 && (
        <Img src={S('img/engine.png')} style={{position: 'absolute', left: X(0), top: Y(0), width: w, clipPath: `inset(${camRect.t * s}px ${(EW - camRect.r) * s}px ${(EH - camRect.b) * s}px ${camRect.l * s}px)`, filter: 'sepia(1) saturate(7) hue-rotate(-12deg) brightness(1.05)', opacity: st.cam}} />
      )}
      {/* piston inside the bore */}
      <div style={{position: 'absolute', left: X(bore.l), top: Y(bore.t), width: (bore.r - bore.l) * s, height: (bore.b - bore.t) * s, overflow: 'hidden'}}>
        <Img src={S('img/piston.png')} style={{position: 'absolute', left: ((bore.r - bore.l - pw) / 2) * s, top: (crown - bore.t) * s, width: pw * s, filter: 'brightness(0.95)'}} />
        {/* oil film rings on the cylinder wall */}
        {[0, 1, 2, 3, 4].map((i) => {
          const k = interpolate(st.rings, [i / 5, (i + 1) / 5], [0, 1], cl);
          if (k <= 0) return null;
          const ry = 30 + i * 62;
          return <div key={i} style={{position: 'absolute', left: 14 * s, top: ry * s, width: (bore.r - bore.l - 28) * s, height: 34 * s, borderRadius: '50%', border: `${6 * s}px solid ${YEL}`, opacity: k * 0.95, boxShadow: `0 0 ${12 * s}px ${YEL}`}} />;
        })}
        {/* fuel droplets: spray from the injector, then fall to the bottom */}
        {st.fuel > 0 &&
          new Array(26).fill(0).map((_, i) => {
            const life = 1.1;
            const ph2 = ((t * (0.9 + random(`fd${i}`) * 0.4) + i * 0.137) % life) / life;
            const sx = (bore.r - bore.l) / 2 + (random(`fx${i}`) - 0.5) * 250 * ph2;
            const sy = 50 + ph2 * (st.drip > 0 ? 380 : 150 + random(`fy${i}`) * 80);
            return <div key={i} style={{position: 'absolute', left: sx * s, top: sy * s, width: 13 * s, height: 13 * s, borderRadius: '50%', background: CYAN, boxShadow: `0 0 ${8 * s}px ${CYAN}`, opacity: st.fuel * Math.sin(ph2 * Math.PI)}} />;
          })}
      </div>
      {/* drops falling past the crankcase into the oil */}
      {st.drip > 0 &&
        new Array(10).fill(0).map((_, i) => {
          const ph3 = ((t * 0.8 + i * 0.1) % 1);
          return <div key={i} style={{position: 'absolute', left: X(170 + random(`dx${i}`) * 170), top: Y(630 + ph3 * 190), width: 12 * s, height: 12 * s, borderRadius: '50%', background: CYAN, boxShadow: `0 0 ${8 * s}px ${CYAN}`, opacity: st.drip * Math.sin(ph3 * Math.PI)}} />;
        })}
      {/* the oil pipe */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={d} fill="none" stroke="#9a9ca3" strokeWidth={22 * s} strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#5b5d64" strokeWidth={13 * s} strokeLinejoin="round" />
        {st.pipe > 0 && (
          <path d={d} fill="none" stroke={YEL} strokeWidth={14 * s} strokeLinejoin="round" pathLength={1} strokeDasharray={`${st.pipe} 1`} style={{filter: `drop-shadow(0 0 ${8 * s}px ${YEL})`}} />
        )}
        <circle cx={X(478)} cy={Y(838)} r={13 * s} fill="#c4c6cc" stroke="#6d6f76" strokeWidth={4 * s} />
      </svg>
      {labels.moy !== undefined && <div style={{position: 'absolute', left: X(60), top: Y(880), fontFamily: MONT, fontWeight: 800, fontSize: 30, color: YEL, opacity: labels.moy}}>moy</div>}
      {labels.nasos !== undefined && <div style={{position: 'absolute', left: X(470), top: Y(880), fontFamily: MONT, fontWeight: 800, fontSize: 28, color: '#fff', opacity: labels.nasos}}>nasos</div>}
      {labels.benzin !== undefined && <div style={{position: 'absolute', left: X(-40), top: Y(270), fontFamily: MONT, fontWeight: 800, fontSize: 32, color: BLUE, opacity: labels.benzin}}>benzin</div>}
      <span style={{display: 'none'}}>{total}</span>
    </div>
  );
};

/* ------------------------------------------------------------------ scenes */
type SceneFn = (t: number, p: WarmProps) => React.ReactNode;
type SceneDef = {from: number; to: number; render: SceneFn};

export const makeScenes = (T: (w: string, n?: number) => number, end: number): SceneDef[] => {
  const tAsl = T('aslida'), tQar = T('qarang.'), tMot = T('motorni', 2), tYana = T('yana'), tSov = T('sovuq'), tOrt = T('ortiqchasi'),
    tAsr = T('asrayman'), tTur = T('turgan'), tShu = T('shuning'), tFaq = T('faqat'), tEndi = T('endi'), tGaz = T('gazda'), tOtam = T('otam'), tSiz = T('siz-chi?');
  return [
    {
      from: 0, to: tQar,
      render: (t) => (
        <>
          <CarFront t={t} />
          <Headline t={t} at={0.05} out={tAsl} lines={[{text: 'ERTALAB'}, {text: '10 DAQIQA', color: YEL}, {text: 'QIZDIRASIZMI?'}]} />
          <Pill t={t} at={T('asrayapman') - 0.1} out={tAsl} text="«motorni asrayapman»" x={500} y={520} border={GRN} size={34} />
          <TimerBox t={t} at={0.25} out={tAsl} from={0} to={599} dur={tAsl - 0.35} x={500} y={650} ease2 />
          <Headline t={t} at={tAsl} lines={[{text: 'ASLIDA'}, {text: 'BENZIN YOQYAPSIZ', color: YEL}]} y={170} />
          {t >= tAsl && <TimerBox t={t} at={tAsl} from={600} to={600} dur={1} x={380} y={650} color={RED} />}
          {t >= tAsl && <Gauge t={t} at={tAsl + 0.15} x={720} y={640} value={0.12} color={RED} label="" />}
          {t >= tAsl && <div style={{position: 'absolute', left: 720, top: 760, transform: 'translateX(-50%)', fontFamily: MONT, fontWeight: 800, fontSize: 28, color: '#fff', opacity: lin(t, tAsl + 0.2, tAsl + 0.5)}}>benzin</div>}
        </>
      ),
    },
    {
      from: tQar, to: tMot,
      render: (t) => {
        const tm = T('moy') - 0.2;
        const k = lin(t, tm, tm + 2.2, 0, 1, Easing.inOut(Easing.sin));
        return (
          <>
            <Img src={S('img/sump.png')} style={{position: 'absolute', left: 540 - 520, top: 740 + lin(t, tQar, tQar + 3.5, 30, 0), width: 1040, transform: `scale(${lin(t, tQar, tMot, 1.0, 1.08)})`}} />
            {/* honey-thick drop slowly lifting out of the oil */}
            {t > tm && (
              <div style={{position: 'absolute', left: 380, top: 960 - k * 110}}>
                <div style={{position: 'absolute', left: 30, top: 60, width: 50, height: 60 + k * 70, background: 'linear-gradient(#f7b023, #f39a12)', borderRadius: 25, filter: 'blur(1px)'}} />
                <div style={{width: 110, height: 110, borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, #ffe08a 0%, #f8b326 45%, #e48a0c 100%)', boxShadow: '0 0 30px rgba(247,176,35,0.55)'}} />
              </div>
            )}
            <Pill t={t} at={T('quyuq,')} text="sovuq moy" x={690} y={930} bg="rgba(20,20,24,0.92)" border="#3a3c44" size={34} />
            <Headline t={t} at={T('sovuqda') - 0.1} lines={[{text: 'SOVUQDA MOY'}, {text: 'ASALDEK QUYUQ', color: YEL}]} y={170} />
          </>
        );
      },
    },
    {
      from: tMot, to: tYana,
      render: (t) => {
        const tOn = T('yoqdingiz.');
        const tUp = T('yuqoriga'), tTop = T('chiqadi.') + 0.1, tBir = T('bir'), tBor = T('boradi.');
        const st: EngineState = {pipe: lin(t, tUp, tTop, 0, 1, Easing.linear), cam: lin(t, tTop, tTop + 0.6), rings: lin(t, tBir + 0.3, tBor, 0, 1, Easing.linear), fuel: 0, drip: 0, thin: 0, run: lin(t, tOn, tOn + 0.5)};
        return (
          <>
            <Engine t={t} x={560} y={430} w={560} st={st} labels={{moy: lin(t, tUp, tUp + 0.3), nasos: lin(t, tUp + 0.2, tUp + 0.5)}} />
            <TimerBox t={t} at={tOn} from={0} to={60} dur={tBor - tOn} x={190} y={720} size={58} color={t >= tBor ? GRN : '#fff'} />
            <Headline t={t} at={tMot - 0.05} out={T('yigirma-o\'ttiz') - 0.05} lines={[{text: 'MOTORNI'}, {text: 'YOQDINGIZ', color: YEL}]} y={170} />
            <Headline t={t} at={T('yigirma-o\'ttiz') - 0.05} out={tBir} lines={[{text: '20–30 soniya', color: YEL, size: 104}, {text: 'moy yuqoriga chiqadi', size: 36, weight: 700}]} y={120} />
            <Headline t={t} at={tBir} lines={[{text: '1 daqiqa', color: GRN, size: 112}, {text: 'moy butun motorga yetadi', size: 36, weight: 700}]} y={110} />
          </>
        );
      },
    },
    {
      from: tYana, to: tSov,
      render: (t) => (
        <>
          <CarFront t={t} />
          <Headline t={t} at={tYana} lines={[{text: 'YANA'}, {text: '9 DAQIQA', color: YEL}, {text: 'TURSANGIZ-CHI?'}]} />
          <TimerBox t={t} at={tYana + 0.1} from={60} to={600} dur={tSov - tYana - 0.3} x={540} y={650} color={RED} ease2 />
        </>
      ),
    },
    {
      from: tSov, to: tTur,
      render: (t) => {
        const st: EngineState = {pipe: 1, cam: 1, rings: lin(t, tAsr, tAsr + 1, 1, 0.45), fuel: lin(t, T('benzinni') - 0.2, T('benzinni') + 0.3), drip: lin(t, tOrt + 0.3, tOrt + 0.8), thin: lin(t, T('suyultiradi.') - 0.2, T('suyultiradi.') + 0.8), run: 1};
        return (
          <>
            <Engine t={t} x={560} y={430} w={560} st={st} labels={{moy: 1, benzin: lin(t, T('benzinni') - 0.3, T('benzinni'))}} />
            <Pill t={t} at={T('suyultiradi.')} text="moy suyuldi" x={800} y={1360} border={RED} size={32} />
            <Headline t={t} at={tSov} out={tOrt} lines={[{text: 'SOVUQ MOTOR'}, {text: "BENZINNI KO'P ICHADI", color: YEL}]} y={170} />
            <Headline t={t} at={tOrt} out={tAsr} lines={[{text: 'ORTIQCHASI'}, {text: 'MOYGA TUSHADI', color: YEL}]} y={170} />
            <Headline t={t} at={tAsr} lines={[{text: 'ASRAYMAN DEB,'}, {text: 'ZARAR QILASIZ', color: YEL}]} y={170} />
          </>
        );
      },
    },
    {
      from: tTur, to: tShu,
      render: (t) => {
        const tYur = T('yurayotgan');
        const k1 = lin(t, tTur + 0.3, tShu, 0.08, 0.3, Easing.linear);
        const k2 = lin(t, tYur + 0.3, T('daqiqada', 3) + 0.4, 0.08, 1, Easing.inOut(Easing.quad));
        const o2 = lin(t, tYur - 0.15, tYur + 0.2);
        return (
          <>
            <Headline t={t} at={tTur} lines={[{text: 'QAYSI BIRI'}, {text: 'TEZ ISIYDI?', color: YEL}]} y={150} />
            <div style={{position: 'absolute', left: 90, top: 470, fontFamily: MONT, fontWeight: 800, fontSize: 34, color: '#fff', opacity: lin(t, tTur, tTur + 0.3)}}>turgan mashina</div>
            <CarSide t={t} x={330} y={640} w={500} smoke />
            <Road t={0} y={760} speed={0} />
            <div style={{position: 'absolute', left: 620, top: 520, fontFamily: MONT, fontWeight: 800, fontSize: 64, color: RED, opacity: lin(t, T('yigirma') - 0.1, T('yigirma') + 0.2)}}>20 daqiqa</div>
            <div style={{position: 'absolute', left: 170, top: 880, fontFamily: MONT, fontWeight: 800, fontSize: 30, color: '#d8d8dc'}}>motor harorati</div>
            <Bar x={560} y={886} w={420} k={k1} />
            <div style={{opacity: o2}}>
              <div style={{position: 'absolute', left: 90, top: 990, fontFamily: MONT, fontWeight: 800, fontSize: 34, color: '#fff'}}>yurayotgan mashina</div>
              <CarSide t={t} x={330} y={1160} w={500} driving />
              <Road t={t} y={1280} speed={420} />
              <div style={{position: 'absolute', left: 660, top: 1040, fontFamily: MONT, fontWeight: 800, fontSize: 64, color: GRN, opacity: lin(t, T('besh') - 0.1, T('besh') + 0.2)}}>5 daqiqa</div>
              <div style={{position: 'absolute', left: 170, top: 1400, fontFamily: MONT, fontWeight: 800, fontSize: 30, color: '#d8d8dc'}}>motor harorati</div>
              <Bar x={560} y={1406} w={420} k={k2} hot />
            </div>
          </>
        );
      },
    },
    {
      from: tShu, to: tFaq,
      render: (t) => (
        <>
          <Headline t={t} at={tShu} lines={[{text: '1 daqiqa', color: GRN, size: 112}, {text: "keyin yo'lga chiqqaningiz ma'qul", size: 34, weight: 700}]} y={150} />
          <TimerBox t={t} at={tShu + 0.2} from={0} to={60} dur={T('ma\'qul.') - tShu - 0.2} x={540} y={720} color={GRN} />
          <CarSide t={t} x={lin(t, T('yo\'lga') - 0.2, tFaq + 0.5, 540, 760, Easing.in(Easing.quad))} y={1180} w={520} driving={t > T('yo\'lga')} smoke />
          <Road t={t} y={1300} speed={t > T('yo\'lga') ? 300 : 0} />
        </>
      ),
    },
    {
      from: tFaq, to: tEndi,
      render: (t) => {
        const tTez = T('tezlik'), tObr = T('oborot');
        const barOp = 1 - lin(t, tTez - 0.3, tTez);
        const k = lin(t, T('uch') - 0.2, tTez - 0.4, 0, 1, Easing.linear);
        return (
          <>
            <Headline t={t} at={tFaq} lines={[{text: '3 km', color: YEL, size: 112}, {text: 'boshida sekinroq yurganingiz yaxshi', size: 32, weight: 700}]} y={150} />
            <div style={{opacity: barOp * lin(t, tFaq + 0.1, tFaq + 0.4)}}>
              <div style={{position: 'absolute', left: 150, top: 690, width: 780, height: 18, borderRadius: 9, background: '#3a3c44'}}>
                <div style={{width: `${k * 100}%`, height: '100%', borderRadius: 9, background: YEL}} />
              </div>
              {['0 km', '1 km', '2 km', '3 km'].map((l, i) => (
                <div key={l} style={{position: 'absolute', left: 150 + (i * 780) / 3, top: 735, transform: 'translateX(-50%)', fontFamily: MONT, fontWeight: 800, fontSize: 34, color: '#fff'}}>{l}</div>
              ))}
            </div>
            <Gauge t={t} at={tTez} x={330} y={700} value={0.3} color={GRN} label="40–50 km/soat" />
            <Gauge t={t} at={tObr} x={750} y={700} value={0.45} color={YEL} label="2 500 oborot" />
            <CarSide t={t} x={540} y={1180} w={520} driving />
            <Road t={t} y={1300} speed={260} />
          </>
        );
      },
    },
    {
      from: tEndi, to: tGaz,
      render: (t) => {
        const tKun = T('kuniga'), tOy = T('oyiga'), tOlti = T('olti'), tHav = T('havoga');
        const lvl = 1 - lin(t, tHav, tHav + 1.6, 0, 0.88);
        return (
          <>
            <Headline t={t} at={tEndi} lines={[{text: 'ENDI'}, {text: 'HISOBLAYMIZ', color: YEL}]} y={170} />
            <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 44, color: '#d9d9de', opacity: lin(t, tKun - 0.1, tKun + 0.2)}}>kuniga 9 daqiqa × 30 kun</div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: lin(t, tOy, tOy + 0.25), transform: `scale(${interpolate(t - tOy, [0, 0.15, 0.3], [0.7, 1.06, 1], cl)})`}}>
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 150, color: YEL, lineHeight: 1}}>4,5 soat</div>
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 34, color: '#fff', marginTop: 8}}>bir oyda</div>
            </div>
            <div style={{opacity: lin(t, tOlti - 0.1, tOlti + 0.2)}}>
              <div style={{position: 'absolute', left: 220, top: 1010, width: 190, height: 290, borderRadius: 22, border: '6px solid #6a6c74', background: '#15161a', overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: 0, bottom: 0, width: '100%', height: `${lvl * 100}%`, background: RED}} />
              </div>
              <div style={{position: 'absolute', left: 275, top: 985, width: 80, height: 32, borderRadius: 8, border: '6px solid #6a6c74', background: '#15161a'}} />
              <div style={{position: 'absolute', left: 470, top: 1060, fontFamily: MONT, fontWeight: 800, fontSize: 104, color: RED}}>≈ 6 litr</div>
              <div style={{position: 'absolute', left: 640, top: 1195, fontFamily: MONT, fontWeight: 800, fontSize: 36, color: '#fff'}}>benzin</div>
              {t > tHav &&
                new Array(16).fill(0).map((_, i) => {
                  const ph = ((t - tHav) * 0.9 + i / 16) % 1;
                  return <div key={i} style={{position: 'absolute', left: 300 + (random(`hv${i}`) - 0.5) * 120, top: 1000 - ph * 260, width: 16, height: 16, borderRadius: 4, background: RED, opacity: Math.sin(ph * Math.PI)}} />;
                })}
            </div>
            <Pill t={t} at={tHav} text="havoga uchadi" x={315} y={1355} border={RED} size={32} />
          </>
        );
      },
    },
    {
      from: tGaz, to: tOtam,
      render: (t) => {
        const tRed = T('reduktor'), tBol = T("bo'lmasa"), tMuz = T('muzlab');
        const frost = lin(t, tMuz - 0.3, tMuz + 1.2);
        // reductor.png 688x1024 placed cover-width, shifted up; pipe line measured on the image
        const sc = 1.875, ox = -105, oy = -330;
        const P = (x: number, y: number) => [ox + x * sc, oy + y * sc];
        const [ax, ay] = P(13, 999), [bx, by] = P(654, 569);
        return (
          <>
            <AbsoluteFill style={{background: '#060607'}} />
            <Img src={S('img/reductor.png')} style={{position: 'absolute', left: ox, top: oy + lin(t, tGaz, tOtam, 0, -40, Easing.linear), width: 688 * sc, filter: `saturate(${1 - frost * 0.4}) brightness(${1 + frost * 0.08})`}} />
            <div style={{position: 'absolute', left: 0, top: oy + 1024 * sc - 220, width: 1080, height: 400, background: 'linear-gradient(transparent, #060607 60%)'}} />
            {/* fuel flowing along the pipe (benzin) */}
            {t > tRed &&
              new Array(9).fill(0).map((_, i) => {
                const ph = ((t - tRed) * 0.45 + i / 9) % 1;
                const px = ax + (bx - ax) * ph, py = ay + (by - ay) * ph - 40 + lin(t, tGaz, tOtam, 0, -40, Easing.linear);
                return <div key={i} style={{position: 'absolute', left: px - 9, top: py - 9, width: 18, height: 18, borderRadius: 9, background: YEL, boxShadow: `0 0 10px ${YEL}`, opacity: lin(t, tRed, tRed + 0.4) * (1 - frost * 0.6)}} />;
              })}
            {/* frost crystals */}
            {frost > 0 &&
              new Array(34).fill(0).map((_, i) => {
                const a = random(`fa${i}`) * Math.PI * 2, r = 120 + random(`fr${i}`) * 170;
                const k = interpolate(frost, [i / 40, i / 40 + 0.15], [0, 1], cl);
                return <div key={i} style={{position: 'absolute', left: P(372, 744)[0] + Math.cos(a) * r - 7, top: P(372, 744)[1] + Math.sin(a) * r * 0.8 - 7 - 30, width: 14, height: 14, borderRadius: 7, background: '#fff', boxShadow: '0 0 10px #cfe8ff', opacity: k}} />;
              })}
            {frost > 0 && <div style={{position: 'absolute', left: P(372, 744)[0] - 330, top: P(372, 744)[1] - 300, width: 660, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(170,215,255,0.28) 0%, transparent 65%)', opacity: frost}} />}
            <Headline t={t} at={tGaz} out={tRed} lines={[{text: 'GAZDA'}, {text: 'YURASIZMI?', color: YEL}]} y={170} />
            <Headline t={t} at={tRed} out={tBol} lines={[{text: 'REDUKTOR ISIGUNCHA'}, {text: 'BENZINDA', color: YEL}]} y={170} />
            <Headline t={t} at={tBol} lines={[{text: "BO'LMASA REDUKTOR"}, {text: 'MUZLAB QOLADI', color: YEL}]} y={170} />
          </>
        );
      },
    },
    {
      from: tOtam, to: end,
      render: (t, p) => {
        const tOut = tSiz + 1.0;
        const dim = lin(t, tOut, tOut + 0.5, 0, 0.72);
        return (
          <>
            <CarFront t={t} />
            <Headline t={t} at={tOtam} out={tSiz} lines={[{text: 'OTAM BARIBIR'}, {text: '10 DAQIQA', color: YEL}, {text: 'QIZDIRADI'}]} />
            <TimerBox t={t} at={tOtam + 0.15} out={tSiz} from={600} to={600} dur={1} x={540} y={650} color={YEL} />
            <Headline t={t} at={tSiz} lines={[{text: 'SIZ-CHI?', color: YEL, size: 120}]} y={110} />
            <AbsoluteFill style={{background: '#000', opacity: dim}} />
            {t > tOut && (
              <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', opacity: lin(t, tOut + 0.2, tOut + 0.6), transform: `scale(${interpolate(t - tOut - 0.2, [0, 0.2, 0.35], [0.6, 1.08, 1], cl)})`}}>
                <IgGlyph size={130} color />
                <div style={{fontFamily: OSW, fontWeight: 600, fontSize: 52, color: '#fff', marginTop: 14}}>{p.handle.toUpperCase()}</div>
              </div>
            )}
          </>
        );
      },
    },
  ];
};

/* ------------------------------------------------------------------ root */
export const Warmup: React.FC<WarmProps> = (p) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const T = (w: string, n = 1) => {
    let k = 0;
    for (const x of p.words) {
      if (x.w.toLowerCase().replace(/[.,:!?]+$/, '') === w.toLowerCase().replace(/[.,:!?]+$/, '')) {
        k++;
        if (k === n) return x.s;
      }
    }
    throw new Error('word not found: ' + w);
  };
  const scenes = makeScenes(T, p.end);
  const XF = 0.25; // cross-fade seconds
  const handleOp = t < T('otam') && !(t > T('turgan') - 0.3 && t < T('shuning')) ? 1 : 0;
  return (
    <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
      <Background t={t} />
      {scenes.map((sc, i) => {
        if (t < sc.from - XF || t > sc.to + XF) return null;
        const op = Math.min(i === 0 ? 1 : lin(t, sc.from - XF, sc.from + 0.02), i === scenes.length - 1 ? 1 : lin(t, sc.to - 0.02, sc.to + XF, 1, 0));
        return (
          <AbsoluteFill key={i} style={{opacity: op}}>
            {sc.render(t, p)}
          </AbsoluteFill>
        );
      })}
      <HandleTag handle={p.handle} op={handleOp} />
      <Watermark />
      <Caption t={t} words={p.words} />
    </AbsoluteFill>
  );
};

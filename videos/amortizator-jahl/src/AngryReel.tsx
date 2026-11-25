/* ANGRY rant reel: illustrated world (Scene.tsx) + audio-reactive shake / red flashes + huge punchy word captions. */
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {Street, Car, BUMP_X, L, R, roadY, INK, type CarPose} from './Scene';
import {CutawaySVG} from './Cutaway';
import {UI} from './fonts';

export type Word = {w: string; s: number; e: number};
export type AngryProps = {words: Word[]; handle: string; end: number; env: number[]};
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lin = (t: number, a: number, b: number, f = 0, to = 1, e: (x: number) => number = Easing.inOut(Easing.cubic)) => interpolate(t, [a, Math.max(a + 0.001, b)], [f, to], {...cl, easing: e});
const RED = '#FF3B2F', YEL = '#FFD23F';
const HOT = ['taqillayapti', 'balandlatyapsizmi', 'tuzalib', 'eshiting', 'eskirgan', 'sakraydi', 'havoda', 'havodagi', 'bermaydi', 'olti', 'metr', 'metrga', 'abs', 'esp', 'chayqaladi', 'sirpanib', 'hali', 'yuradi', 'xavfsizlik', 'bugunoq', 'tekshirtiring', 'qachon'];

/* ------------------------------------------------------------------ captions: 1-3 word chunks, huge, stroked, jittered */
const Captions: React.FC<{t: number; words: Word[]}> = ({t, words}) => {
  const chunks: Word[][] = []; let cur: Word[] = [];
  words.forEach((w) => { cur.push(w); const len = cur.map((x) => x.w).join(' ').length; if (/[.?!,]["]?$/.test(w.w) || cur.length >= 3 || len > 15) { chunks.push(cur); cur = []; } });
  if (cur.length) chunks.push(cur);
  let k = -1; chunks.forEach((c, i) => { if (t >= c[0].s - 0.04) k = i; });
  if (k < 0) return null;
  const c = chunks[k], endT = k + 1 < chunks.length ? chunks[k + 1][0].s : c[c.length - 1].e + 0.5;
  if (t > endT) return null;
  const d = t - c[0].s;
  const s = interpolate(d, [-0.04, 0.06, 0.14], [1.5, 0.94, 1], cl);
  const rot = (random(`r${k}`) - 0.5) * 7;
  const shout = c.some((w) => /!/.test(w.w));
  const longest = Math.max(...c.map((w) => w.w.replace(/["“”,.]/g, '').length));
  const fs = Math.min(shout ? 112 : 98, 960 / (0.66 * Math.max(longest, 1)));
  return (
    <div style={{position: 'absolute', left: 20, right: 20, top: 250, textAlign: 'center', transform: `rotate(${rot}deg) scale(${s})`}}>
      {c.map((w, i) => {
        const clean = w.w.replace(/["“”]/g, '').replace(/[,.]$/, '');
        const hot = HOT.some((h) => clean.toLowerCase().replace(/[?!]+$/, '').startsWith(h));
        const said = t >= w.s - 0.03;
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 12px', fontFamily: UI, fontWeight: 800, fontSize: fs, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: -1,
            color: hot ? (said ? YEL : '#8a7a3a') : said ? '#fff' : '#9a9a9a', WebkitTextStroke: `${shout ? 12 : 10}px #141414`, paintOrder: 'stroke fill',
            textShadow: hot && said ? `0 0 40px ${RED}` : '0 10px 0 #141414'}}>{clean}</span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ helpers */
type Cam = {cx: number; cy: number; s: number};
const World: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => {
  const half = 540 / cam.s;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(540,1230) scale(${cam.s}) translate(${-cam.cx},${-cam.cy})`}>
        <Street x0={cam.cx - half} x1={cam.cx + half} />
        {children}
      </g>
    </svg>
  );
};
const rot = (x: number) => (x / R) * (180 / Math.PI);
const P = (x: number, o: Partial<CarPose> = {}): CarPose => ({x, xr: 0, yRear: 0, yFront: 0, brake: 0, xray: 0, flash: 0, wheelRot: rot(x), ...o});

const Pop: React.FC<{t: number; at: number; out?: number; x: number; y: number; text: string; color?: string; size?: number; r?: number}> = ({t, at, out = 1e9, x, y, text, color = YEL, size = 90, r = -8}) => {
  if (t < at || t > out) return null;
  const s = interpolate(t - at, [0, 0.08, 0.18], [0.3, 1.25, 1], cl);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${r}deg) scale(${s})`, fontFamily: UI, fontWeight: 800, fontSize: size, color, WebkitTextStroke: '10px #141414', paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>{text}</div>;
};
const Stamp: React.FC<{t: number; at: number; x?: number; y: number; text: string; color?: string}> = ({t, at, x = 540, y, text, color = RED}) => {
  if (t < at) return null;
  const s = interpolate(t - at, [0, 0.1, 0.2], [2.2, 0.92, 1], cl);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(-9deg) scale(${s})`, padding: '10px 34px', border: `10px solid ${color}`, borderRadius: 20, fontFamily: UI, fontWeight: 800, fontSize: 84, color, background: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>{text}</div>;
};

/* ------------------------------------------------------------------ the reel */
export const AngryReel: React.FC<AngryProps> = ({words, handle, end, env}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const T = (w: string, n = 1) => { let k = 0; for (const x of words) if (x.w.toLowerCase().replace(/["“”]/g, '').replace(/[.,:!?]+$/, '') === w) { k++; if (k === n) return x.s; } throw new Error('word ' + w); };
  const c = [0, T('ovozini'), T('eshiting'), T("g'ildirak"), T('havodagi'), T('sinovda'), T('abs'), T('burilishda'), T('siz', 2), T('amortizator', 3), T('bugunoq'), end];
  const sc = c.findIndex((x, i) => t >= x && t < c[i + 1]);
  const cut = sc >= 0 ? t - c[sc] : 0;
  const e = env[Math.min(env.length - 1, f)] ?? 0;
  const rage = Math.max(0, e - 0.55) / 0.45; // 0..1 when he shouts
  const sh = 26 * rage + 18 * Math.max(0, 1 - cut / 0.25);
  const shx = Math.sin(t * 73) * sh, shy = Math.cos(t * 59) * sh * 0.7;
  const zoom = 1 + 0.05 * rage + interpolate(cut, [0, 0.22], [0.08, 0], cl);
  let body: React.ReactNode = null;

  if (sc === 0) { // car with a knocking shock and loud music
    const x = lin(t, 0, c[1], 250, 900, Easing.linear);
    const knock = [0.96, 1.4, 1.9, 2.5, 3.1];
    const j = knock.reduce((a, k) => a + (t > k ? 9 * Math.exp(-(t - k) * 10) * Math.sin((t - k) * 40) : 0), 0);
    body = (<>
      <World cam={{cx: x + 120, cy: -240, s: 1.2}}><Car pose={P(x, {yFront: j, yRear: j * 0.4})} /></World>
      {knock.map((k, i) => <Pop key={i} t={t} at={k} out={k + 0.5} x={700 + (i % 2) * 120} y={980 - (i % 3) * 60} text="TAQ!" color={RED} size={80} r={(i % 2 ? 10 : -10)} />)}
      {[0, 1, 2, 3].map((i) => { const ph = ((t * 0.8 + i / 4) % 1); return <div key={i} style={{position: 'absolute', left: 420 + i * 40 + Math.sin(t * 3 + i) * 30, top: 1000 - ph * 300, fontSize: 70, opacity: Math.sin(ph * Math.PI), color: '#2A2A2E'}}>♪</div>; })}
    </>);
  } else if (sc === 1) { // turning the volume up won't fix it
    const vol = lin(t, c[1], c[1] + 1.2, 0.3, 1);
    body = (
      <AbsoluteFill style={{background: '#2B2C31', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={760} height={760} viewBox="-380 -380 760 760">
          <path d="M-210,-80 L-110,-80 L20,-200 L20,200 L-110,80 L-210,80 Z" fill="#E9E5DC" stroke={INK} strokeWidth={14} strokeLinejoin="round" />
          {[0, 1, 2].map((i) => <path key={i} d={`M${80 + i * 70},-${120 + i * 50} Q${150 + i * 90},0 ${80 + i * 70},${120 + i * 50}`} fill="none" stroke={i / 3 < vol ? YEL : '#555'} strokeWidth={22} strokeLinecap="round" />)}
          <rect x={-300} y={270} width={600} height={40} rx={20} fill="#444" /><rect x={-300} y={270} width={600 * vol} height={40} rx={20} fill={RED} />
        </svg>
        <Stamp t={t} at={T('qoladimi') - 0.05} y={1450} text="TUZALMAYDI!" />
      </AbsoluteFill>
    );
  } else if (sc === 2) { // worn shock leaking
    const leak = t - (c[2] + 0.3);
    const p = 0.5 + 0.45 * Math.sin((t - c[2]) * 9), v = 0.45 * 9 * Math.cos((t - c[2]) * 9) / 4;
    body = (
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #EADCC2 0%, #A8977A 100%)'}}>
        <div style={{position: 'absolute', left: 540, top: 1230}}><CutawaySVG h={820} p={p} v={v} oil={1 - 0.45 * lin(t, c[2] + 0.4, c[3])} flow={1} leak={leak} spring t={t} /></div>
        <Stamp t={t} at={T('eskirgan') - 0.05} y={1700} text="ESKIRGAN" />
      </AbsoluteFill>
    );
  } else if (sc === 3 || sc === 4) { // wheel bounces off the road, no braking in the air
    const x = sc === 3 ? lin(t, c[3], c[4], BUMP_X - L - 160, BUMP_X - L + 40, Easing.linear) : lin(t, c[4], c[5], BUMP_X - L + 40, BUMP_X - L + 120, Easing.out(Easing.quad));
    const tt = t - c[3] - 0.5;
    const lift = tt > 0 ? Math.max(0, 70 * Math.abs(Math.sin(tt * 4.2)) * Math.exp(-tt * 0.25)) : 0;
    body = (<>
      <World cam={{cx: BUMP_X - 40, cy: -150, s: 1.6}}><Car pose={P(x, {xray: 1, liftF: lift, yFront: -lift * 0.35, brake: sc === 4 ? 1 : 0})} /></World>
      {lift > 20 && <Pop t={t} at={c[3] + 0.6} x={830} y={1290} text="HAVODA!" color={RED} size={86} r={6} />}
      {sc === 4 && <Stamp t={t} at={T('bermaydi') - 0.05} y={1600} text="TORMOZ YO'Q" />}
    </>);
  } else if (sc === 5) { // +6 m braking distance
    const brakeT = c[5] + 0.6, stop = T('uzaygan') + 0.2;
    const lane = (y: number, stopX: number, label: string, col: string) => {
      const x = lin(t, brakeT - 0.4, stop, -420, stopX, Easing.out(Easing.quad));
      return (
        <g transform={`translate(0,${y})`}>
          <rect x={-200} y={0} width={1500} height={150} fill="#4B4D53" /><rect x={-200} y={0} width={1500} height={8} fill="#5C5E65" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={i * 180} y={140} width={90} height={10} fill="#F2F0EA" opacity={0.6} />)}
          <g transform="scale(0.55)"><Car pose={P(x / 0.55 - 466, {brake: t > brakeT ? 1 : 0})} /></g>
          <text x={30} y={-150} style={{font: `800 46px ${UI}`}} fill={col} stroke="#141414" strokeWidth={8} paintOrder="stroke">{label}</text>
        </g>
      );
    };
    const extra = lin(t, stop - 0.2, stop + 0.4);
    body = (
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, background: '#EADCC2'}}>
        <line x1={560} y1={640} x2={560} y2={1600} stroke="#141414" strokeWidth={8} strokeDasharray="20 16" />
        {lane(900, 560, 'YANGI AMORTIZATOR', '#7BE07A')}
        {lane(1380, 960, 'ESKIRGAN (50%)', RED)}
        {extra > 0 && <g opacity={extra}>
          <line x1={566} y1={1250} x2={566 + 394 * extra} y2={1250} stroke={RED} strokeWidth={14} />
          <text x={760} y={1230} textAnchor="middle" style={{font: `800 110px ${UI}`}} fill={YEL} stroke="#141414" strokeWidth={12} paintOrder="stroke">+6 M</text>
        </g>}
        <text x={540} y={1720} textAnchor="middle" style={{font: `800 38px ${UI}`}} fill="#141414">80 km/soat · ishlab chiqaruvchi sinovi</text>
      </svg>
    );
  } else if (sc === 6) { // ABS / ESP warnings
    const blink = Math.floor(t * 4) % 2 === 0;
    const icon = (x: number, txt: string, at: number) => t < at ? null : (
      <g transform={`translate(${x},960)`}><circle r={150} fill="#1A1B1F" stroke={blink ? '#FFB020' : '#5a4a20'} strokeWidth={14} />
        <text y={34} textAnchor="middle" style={{font: `800 100px ${UI}`}} fill={blink ? '#FFB020' : '#5a4a20'}>{txt}</text></g>
    );
    body = <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, background: '#0F1013'}}>{icon(330, 'ABS', c[6])}{icon(750, 'ESP', T('esp'))}
      <text x={540} y={1300} textAnchor="middle" style={{font: `800 60px ${UI}`}} fill={RED}>TO'G'RI ISHLAMAYDI</text></svg>;
  } else if (sc === 7) { // rocking in the rain
    const k = Math.sin((t - c[7]) * 5);
    body = (<>
      <World cam={{cx: 900, cy: -200, s: 1.3}}><Car pose={P(lin(t, c[7], c[8], 650, 820, Easing.linear), {yFront: 14 * k, yRear: -12 * k})} /></World>
      <AbsoluteFill style={{background: 'rgba(30,40,60,0.35)'}} />
      {new Array(60).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: random(`x${i}`) * 1100 - 20, top: ((random(`y${i}`) * 1920 + t * 1600) % 1920), width: 4, height: 50, background: 'rgba(200,220,255,0.6)', transform: 'rotate(12deg)'}} />)}
    </>);
  } else if (sc === 8) { // "hali yuradi"
    body = (
      <AbsoluteFill style={{background: RED, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: UI, fontWeight: 800, fontSize: 150, color: '#fff', WebkitTextStroke: '14px #141414', paintOrder: 'stroke fill', transform: `rotate(-6deg) scale(${interpolate(cut, [0, 0.15], [1.4, 1], cl)})`, textAlign: 'center', lineHeight: 1}}>"HALI<br />YURADI"</div>
        <svg width={900} height={500} style={{position: 'absolute', top: 700}}><line x1={60} y1={440} x2={60 + 780 * lin(t, T('deysiz'), T('deysiz') + 0.25)} y2={440 - 380 * lin(t, T('deysiz'), T('deysiz') + 0.25)} stroke="#141414" strokeWidth={36} strokeLinecap="round" /></svg>
      </AbsoluteFill>
    );
  } else if (sc === 9) { // safety shield
    const s = interpolate(cut, [0, 0.15, 0.3], [0.4, 1.12, 1], cl);
    body = (
      <AbsoluteFill style={{background: '#EADCC2', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={600} height={700} viewBox="-300 -350 600 700" style={{transform: `scale(${s})`, marginTop: 220}}>
          <path d="M0,-300 L250,-200 L230,80 Q180,250 0,320 Q-180,250 -230,80 L-250,-200 Z" fill="#3B78C4" stroke={INK} strokeWidth={18} strokeLinejoin="round" />
          <path d="M-110,10 L-30,100 L130,-90" fill="none" stroke="#fff" strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" opacity={lin(t, T('xavfsizlik') - 0.1, T('xavfsizlik') + 0.2)} />
        </svg>
      </AbsoluteFill>
    );
  } else { // CTA
    const x = lin(t, c[10], end, 500, 760, Easing.linear);
    body = (<>
      <World cam={{cx: 900, cy: -220, s: 1.25}}><Car pose={P(x, {xray: 0.85})} /></World>
      <Pop t={t} at={T('qachon') - 0.05} x={540} y={1650} text="?" color={RED} size={220} r={8} />
    </>);
  }

  return (
    <AbsoluteFill style={{background: '#1A1A1D', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${shx}px,${shy}px) scale(${zoom})`}}>{body}</AbsoluteFill>
      {/* rage overlays: red vignette + flash on shouts */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(255,30,20,${0.55 * rage}) 100%)`}} />
      <AbsoluteFill style={{background: RED, opacity: 0.22 * Math.max(0, 1 - cut / 0.12) * (sc > 0 ? 1 : 0), mixBlendMode: 'multiply'}} />
      <Captions t={t} words={words} />
      <div style={{position: 'absolute', right: 36, top: 56, padding: '8px 18px', borderRadius: 14, background: 'rgba(20,20,24,0.6)', fontFamily: UI, fontWeight: 800, fontSize: 26, color: '#fff'}}>{handle}</div>
    </AbsoluteFill>
  );
};

/* 3D-skill component kit: grid board, chapter header, karaoke captions, x-ray car overlays, cards. */
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, staticFile} from 'remotion';
import {C, F} from './theme';

export const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const lin = (t: number, a: number, b: number, from = 0, to = 1, e: (x: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(t, [a, Math.max(a + 0.001, b)], [from, to], {...cl, easing: e});
export const appear = (t: number, at: number, out = Infinity, d = 0.25) => Math.min(lin(t, at, at + d), out === Infinity ? 1 : lin(t, out - d, out, 1, 0));
export const pop = (t: number, at: number) => interpolate(t - at, [0, 0.14, 0.26], [0.7, 1.05, 1], cl);
export const S = (p: string) => staticFile(p);

export type Word = {w: string; s: number; e: number};

/* ------------------------------------------------------------------ background: dark grid with "+" crosshairs and warm bokeh */
export const Board: React.FC<{t: number}> = ({t}) => {
  const step = 200, ox = 40, oy = 75;
  const crosses: React.ReactNode[] = [];
  for (let x = ox; x < 1080; x += step) for (let y = oy; y < 1920; y += step) crosses.push(
    <g key={`${x}-${y}`} stroke={C.cross} strokeWidth={2}><line x1={x - 11} y1={y} x2={x + 11} y2={y} /><line x1={x} y1={y - 11} x2={x} y2={y + 11} /></g>,
  );
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{backgroundImage: `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`, backgroundSize: `${step}px ${step}px`, backgroundPosition: `${ox - 1}px ${oy - 1}px`}} />
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '50px 50px', backgroundPosition: `${ox}px ${oy}px`}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>{crosses}</svg>
      {[[-120, 760, 520, 0.5], [1180, 1180, 560, 0.42], [-80, 1500, 420, 0.3]].map(([x, y, r, o], i) => (
        <div key={i} style={{position: 'absolute', left: x - r, top: y - r + Math.sin(t * 0.4 + i) * 20, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,165,36,0.22) 0%, rgba(245,165,36,0.06) 45%, transparent 70%)', opacity: o as number}} />
      ))}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 45%, rgba(0,0,0,0.5) 100%)'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ header: avatar, handle, subtitle, chapter n/N + name, segmented progress */
export type Chapter = {name: string; at: number};
export const Header: React.FC<{t: number; handle: string; avatar: string; subtitle: string; chapters: Chapter[]; end: number}> = ({t, handle, avatar, subtitle, chapters, end}) => {
  let k = 0;
  chapters.forEach((c, i) => { if (t >= c.at) k = i; });
  const cur = chapters[k];
  const next = k + 1 < chapters.length ? chapters[k + 1].at : end;
  const prog = lin(t, cur.at, next, 0, 1, Easing.linear);
  const sw = (1080 - 96 - 9 * 12) / chapters.length;
  const flash = interpolate(t - cur.at, [0, 0.15, 0.5], [1.25, 1.25, 1], cl);
  return (
    <>
      <div style={{position: 'absolute', left: 48, top: 70, width: 96, height: 96, borderRadius: 48, background: C.lime, boxShadow: '0 0 0 5px rgba(200,241,53,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontWeight: 900, fontSize: 30, color: '#16180f', letterSpacing: -1}}>{avatar}</div>
      <div style={{position: 'absolute', left: 166, top: 74, fontFamily: F.ui, fontWeight: 800, fontSize: 40, color: C.white}}>{handle}</div>
      <div style={{position: 'absolute', left: 168, top: 128, fontFamily: F.mono, fontWeight: 500, fontSize: 25, color: C.grey}}>{subtitle}</div>
      <div style={{position: 'absolute', right: 48, top: 80, fontFamily: F.mono, fontWeight: 500, fontSize: 25, color: C.grey, textAlign: 'right'}}>bob {String(k + 1).padStart(2, '0')}/{String(chapters.length).padStart(2, '0')}</div>
      <div style={{position: 'absolute', right: 48, top: 114, fontFamily: F.head, fontWeight: 800, fontSize: 31, color: C.orange, textAlign: 'right', transform: `scale(${flash})`, transformOrigin: 'right center'}}>{cur.name}</div>
      {chapters.map((c, i) => (
        <div key={i} style={{position: 'absolute', left: 48 + i * (sw + 12), top: 196, width: sw, height: 7, borderRadius: 4, background: '#3A3C44', overflow: 'hidden'}}>
          <div style={{width: `${i < k ? 100 : i === k ? prog * 100 : 0}%`, height: '100%', background: i < k ? '#C99A3C' : C.orange}} />
        </div>
      ))}
    </>
  );
};

/* ------------------------------------------------------------------ karaoke caption: current phrase, spoken words white, upcoming dim, highlight = red text in a blue selection box */
export const Karaoke: React.FC<{t: number; words: Word[]; highlight?: string[]; y?: number; hide?: (t: number) => boolean}> = ({t, words, highlight = [], y = 330, hide}) => {
  if (hide && hide(t)) return null;
  // chunks: break at sentence/clause ends, max 4 words or ~22 characters
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w) => {
    cur.push(w);
    const len = cur.map((x) => x.w).join(' ').length;
    const ww = w.w.replace(/["“”«»]/g, '');
    if (/[.?!:]$/.test(ww) || (/,$/.test(ww) && cur.length >= 2) || cur.length >= 4 || len > 20) { chunks.push(cur); cur = []; }
  });
  if (cur.length) chunks.push(cur);
  let ci = -1;
  chunks.forEach((c, i) => { if (t >= c[0].s - 0.05) ci = i; });
  if (ci < 0) return null;
  const c = chunks[ci];
  const endT = ci + 1 < chunks.length ? chunks[ci + 1][0].s - 0.05 : c[c.length - 1].e + 0.6;
  if (t > endT + 0.1) return null;
  const d = t - c[0].s;
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: y - 50, textAlign: 'center', opacity: interpolate(d, [-0.05, 0.08], [0, 1], cl), transform: `translateY(${interpolate(d, [-0.05, 0.15], [10, 0], cl)}px)`}}>
      {c.map((w, i) => {
        const said = t >= w.s - 0.02;
        const clean = w.w.replace(/["“”«»]/g, '');
        const hl = highlight.some((h) => clean.toLowerCase().startsWith(h.toLowerCase()));
        const base: React.CSSProperties = {display: 'inline-block', margin: '0 10px', fontFamily: F.ui, fontWeight: 800, fontSize: 66, letterSpacing: -0.5, color: said ? C.white : C.dim, textShadow: said ? '0 4px 18px rgba(0,0,0,0.5)' : 'none'};
        if (hl && said) {
          const k = lin(t, w.s - 0.02, w.s + 0.15);
          return (
            <span key={i} style={{...base, color: C.red, position: 'relative', padding: '0 8px'}}>
              {clean}
              <span style={{position: 'absolute', inset: '4px -2px 0 -2px', border: `3px solid ${C.select}`, opacity: k, background: 'rgba(61,123,255,0.10)'}} />
              {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b], j) => (
                <span key={j} style={{position: 'absolute', left: a ? undefined : -9, right: a ? -9 : undefined, top: b ? undefined : -4, bottom: b ? -9 : undefined, width: 12, height: 12, borderRadius: 6, background: '#fff', border: `3px solid ${C.select}`, opacity: k}} />
              ))}
            </span>
          );
        }
        return <span key={i} style={base}>{clean}</span>;
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ big two-tone headline (Unbounded, glowing first line) */
export const Headline: React.FC<{t: number; at: number; out?: number; lines: {text: string; color?: string}[]; y?: number; size?: number}> = ({t, at, out = Infinity, lines, y = 370, size = 112}) => {
  const op = appear(t, at, out, 0.22);
  if (op <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: op}}>
      {lines.map((l, i) => {
        const fs = Math.min(size, 1010 / (0.86 * Math.max(4, l.text.length)));
        const d = t - at - i * 0.08;
        const s = interpolate(d, [0, 0.16, 0.3], [0.82, 1.04, 1], cl);
        const glow = l.color ? `0 0 28px ${l.color}aa, 0 0 70px ${l.color}55` : '0 6px 24px rgba(0,0,0,0.55)';
        return <div key={i} style={{fontFamily: F.head, fontWeight: 900, fontSize: fs, lineHeight: 1.04, color: l.color ?? C.white, textShadow: glow, letterSpacing: -1, transform: `scale(${s})`, opacity: interpolate(d, [0, 0.1], [0, 1], cl), whiteSpace: 'nowrap'}}>{l.text}</div>;
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ x-ray car with overlays (positions in image px of the source render) */
export type XrayOverlay =
  | {type: 'pulse'; x: number; y: number; rx: number; ry: number; at: number; out?: number; color?: string}
  | {type: 'flow'; pts: [number, number][]; at: number; out?: number; color?: string}
  | {type: 'rings'; x: number; y: number; rx: number; ry: number; at: number; out?: number}
  | {type: 'marker'; x: number; y: number; at: number; out?: number; value: string; label?: string; color?: string; side?: 'left' | 'right'}
  | {type: 'laser'; x1: number; y1: number; x2: number; y2: number; at: number; out?: number};
export const XrayCar: React.FC<{t: number; src: string; iw: number; ih: number; x: number; y: number; w: number; at?: number; out?: number; cam?: {at: number; dur: number; s?: number; dx?: number; dy?: number}[]; overlays?: XrayOverlay[]}> = ({t, src, iw, ih, x, y, w, at = 0, out = Infinity, cam = [], overlays = []}) => {
  const op = appear(t, at, out, 0.3);
  if (op <= 0) return null;
  let s = 1, dx = 0, dy = 0;
  for (const c of cam) { const k = lin(t, c.at, c.at + c.dur); if (c.s !== undefined) s = s + (c.s - s) * k; if (c.dx !== undefined) dx = dx + (c.dx - dx) * k; if (c.dy !== undefined) dy = dy + (c.dy - dy) * k; }
  const sc = w / iw, h = ih * sc;
  const float = Math.sin(t * 0.9) * 4;
  const P = (px: number, py: number) => [px * sc, py * sc];
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2 + float, width: w, height: h, opacity: op, transform: `translate(${dx}px, ${dy}px) scale(${s})`, transformOrigin: '50% 50%'}}>
      <Img src={S(src)} style={{position: 'absolute', inset: 0, width: w, height: h}} />
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {overlays.map((o, i) => {
          const oo = appear(t, o.at, o.out ?? Infinity, 0.3);
          if (oo <= 0) return null;
          if (o.type === 'pulse') {
            const [cx, cy] = P(o.x, o.y);
            const k = 0.65 + 0.35 * Math.sin((t - o.at) * 5);
            return <ellipse key={i} cx={cx} cy={cy} rx={o.rx * sc} ry={o.ry * sc} fill={o.color ?? 'rgba(255,170,40,0.55)'} style={{filter: 'blur(26px)', mixBlendMode: 'screen'}} opacity={oo * k} />;
          }
          if (o.type === 'rings') {
            const [cx, cy] = P(o.x, o.y);
            return <g key={i} opacity={oo}>{[0, 1, 2, 3].map((j) => { const ph = ((t - o.at) * 0.6 + j / 4) % 1; return <ellipse key={j} cx={cx} cy={cy} rx={o.rx * sc * (0.5 + ph * 1.1)} ry={o.ry * sc * (0.5 + ph * 1.1)} fill="none" stroke={C.orange} strokeWidth={3} opacity={(1 - ph) * 0.9} style={{filter: `drop-shadow(0 0 6px ${C.orange})`}} />; })}</g>;
          }
          if (o.type === 'flow') {
            const pts = o.pts.map(([a, b]) => P(a, b));
            const d = 'M' + pts.map(([a, b]) => `${a},${b}`).join(' L');
            return (
              <g key={i} opacity={oo}>
                <path d={d} fill="none" stroke={o.color ?? '#FFB347'} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} style={{filter: 'drop-shadow(0 0 6px #ffb347)'}} />
                <path d={d} fill="none" stroke="#FFF2C8" strokeWidth={7} strokeLinecap="round" strokeDasharray="10 42" strokeDashoffset={-(t - o.at) * 260} style={{filter: 'drop-shadow(0 0 8px #ffd27a)'}} />
              </g>
            );
          }
          if (o.type === 'laser') {
            const [a, b] = P(o.x1, o.y1), [c2, d2] = P(o.x2, o.y2);
            const k = lin(t, o.at, o.at + 0.5);
            return <line key={i} x1={a} y1={b} x2={a + (c2 - a) * k} y2={b + (d2 - b) * k} stroke={C.red} strokeWidth={5} strokeLinecap="round" opacity={oo * (0.75 + 0.25 * Math.sin(t * 9))} style={{filter: `drop-shadow(0 0 10px ${C.red})`}} />;
          }
          return null;
        })}
      </svg>
      {overlays.filter((o) => o.type === 'marker').map((o, i) => {
        const m = o as Extract<XrayOverlay, {type: 'marker'}>;
        const oo = appear(t, m.at, m.out ?? Infinity, 0.2);
        if (oo <= 0) return null;
        const [cx, cy] = P(m.x, m.y);
        const left = m.side === 'left';
        return (
          <div key={`m${i}`} style={{position: 'absolute', left: cx, top: cy, opacity: oo}}>
            <div style={{position: 'absolute', left: -14, top: -14, width: 28, height: 28, borderRadius: 14, background: '#fff', boxShadow: `0 0 0 8px rgba(111,168,255,0.35), 0 0 26px ${m.color ?? C.blue}`, transform: `scale(${0.85 + 0.15 * Math.sin(t * 6)})`}} />
            <div style={{position: 'absolute', [left ? 'right' : 'left']: 30, top: -130, transform: `scale(${pop(t, m.at)})`, transformOrigin: left ? 'right bottom' : 'left bottom', textAlign: 'center'}}>
              <div style={{background: 'rgba(22,24,30,0.92)', border: `2px solid ${C.panelLine}`, borderRadius: 26, padding: '10px 26px', fontFamily: F.mono, fontWeight: 700, fontSize: 52, color: m.color ?? C.white, whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>{m.value}</div>
              {m.label && <div style={{marginTop: 10, fontFamily: F.mono, fontWeight: 500, fontSize: 26, letterSpacing: 4, color: C.blue, whiteSpace: 'nowrap'}}>{m.label}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ glass info panel */
export const Panel: React.FC<{x: number; y: number; w: number; h: number; t: number; at: number; out?: number; children: React.ReactNode}> = ({x, y, w, h, t, at, out = Infinity, children}) => {
  const op = appear(t, at, out, 0.25);
  if (op <= 0) return null;
  const rise = lin(t, at, at + 0.35, 40, 0, Easing.out(Easing.cubic));
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2 + rise, width: w, height: h, opacity: op, borderRadius: 34, background: C.panel, border: `2px solid ${C.panelLine}`, boxShadow: '0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)', overflow: 'hidden'}}>
      {children}
    </div>
  );
};

export const GaugeArc: React.FC<{t: number; at: number; value: number; size?: number; color?: string}> = ({t, at, value, size = 170, color = C.orange}) => {
  const k = lin(t, at + 0.1, at + 0.9, 0, value, Easing.out(Easing.back(1.3)));
  const R = size * 0.42, cx = size / 2, cy = size * 0.58;
  const a0 = 200, span = 140;
  const pt = (deg: number, r = R) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  const arc = (from: number, to: number) => { const [x1, y1] = pt(from), [x2, y2] = pt(to); return `M${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2}`; };
  const [nx, ny] = pt(a0 + span * k, R - 18);
  return (
    <svg width={size} height={size * 0.8}>
      <path d={arc(a0, a0 + span)} fill="none" stroke="#454852" strokeWidth={12} strokeLinecap="round" />
      {k > 0.01 && <path d={arc(a0, a0 + span * k)} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" style={{filter: `drop-shadow(0 0 6px ${color})`}} />}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={10} fill="#fff" />
    </svg>
  );
};

export const StatCard: React.FC<{t: number; at: number; out?: number; x?: number; y: number; value: string; label: string; gauge?: number}> = ({t, at, out, x = 540, y, value, label, gauge = 0.85}) => (
  <Panel t={t} at={at} out={out} x={x} y={y} w={900} h={230}>
    <div style={{position: 'absolute', left: 36, top: 36}}><GaugeArc t={t} at={at} value={gauge} /></div>
    <div style={{position: 'absolute', left: 250, top: 50, fontFamily: F.head, fontWeight: 900, fontSize: 72, color: C.orange, textShadow: `0 0 24px ${C.orange}66`, whiteSpace: 'nowrap'}}>{value}</div>
    <div style={{position: 'absolute', left: 254, top: 150, fontFamily: F.mono, fontWeight: 500, fontSize: 28, letterSpacing: 5, color: C.grey, whiteSpace: 'nowrap'}}>{label}</div>
  </Panel>
);

/* ------------------------------------------------------------------ phone chat mock */
export type ChatMsg = {at: number; from?: string; text?: string; me?: boolean; photo?: boolean; caption?: string};
const CarThumb: React.FC = () => (
  <svg width={300} height={160} viewBox="0 0 300 160">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F7C9A0" /><stop offset="0.6" stopColor="#F09A5B" /><stop offset="1" stopColor="#5B3A55" /></linearGradient></defs>
    <rect width="300" height="160" fill="url(#sky)" />
    <rect y="128" width="300" height="32" fill="#3A2C3E" />
    <path d="M28 120 L32 92 Q36 80 50 78 L92 70 Q110 52 140 50 L232 50 Q250 50 258 64 L270 86 Q276 96 276 108 L276 120 Z" fill="#F4F2EE" />
    <path d="M100 72 Q114 58 138 57 L176 57 L176 76 Z M184 57 L228 57 Q240 58 246 70 L250 78 L184 78 Z" fill="#2B2F3A" />
    <rect x="30" y="102" width="246" height="5" fill="#d9d5cf" />
    <circle cx="82" cy="122" r="17" fill="#2b2b30" /><circle cx="82" cy="122" r="9" fill="#9a9aa2" />
    <circle cx="226" cy="122" r="17" fill="#2b2b30" /><circle cx="226" cy="122" r="9" fill="#9a9aa2" />
  </svg>
);
export const PhoneChat: React.FC<{t: number; at: number; out?: number; title: string; members: string; msgs: ChatMsg[]; y?: number}> = ({t, at, out = Infinity, title, members, msgs, y = 1080}) => {
  const op = appear(t, at, out, 0.3);
  if (op <= 0) return null;
  const W2 = 560, H2 = 1080;
  const rot = Math.sin(t * 0.7) * 2.5;
  return (
    <div style={{position: 'absolute', left: 540 - W2 / 2, top: y - H2 / 2 + lin(t, at, at + 0.4, 80, 0, Easing.out(Easing.cubic)), width: W2, height: H2, opacity: op, borderRadius: 78, background: '#17181D', border: '10px solid #3B2B2E', boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 2px #5a4246', transform: `perspective(1600px) rotateY(${rot - 6}deg) rotateX(3deg)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 54, top: 40, fontFamily: F.ui, fontWeight: 800, fontSize: 28, color: '#fff'}}>21:14</div>
      <div style={{position: 'absolute', left: W2 / 2 - 70, top: 30, width: 140, height: 40, borderRadius: 20, background: '#000'}} />
      <div style={{position: 'absolute', right: 52, top: 44, width: 40, height: 20, borderRadius: 6, background: '#fff'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 96, height: 104, background: '#1F2028', borderBottom: '1px solid #2c2e38'}}>
        <div style={{position: 'absolute', left: 30, top: 34, fontFamily: F.ui, fontSize: 30, color: C.blue}}>‹</div>
        <div style={{position: 'absolute', left: 70, top: 22, width: 60, height: 60, borderRadius: 30, background: '#F2A77D', color: '#fff', fontFamily: F.ui, fontWeight: 800, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{title[0]}</div>
        <div style={{position: 'absolute', left: 146, top: 20, fontFamily: F.ui, fontWeight: 800, fontSize: 30, color: '#fff'}}>{title}</div>
        <div style={{position: 'absolute', left: 146, top: 58, fontFamily: F.ui, fontWeight: 600, fontSize: 22, color: C.grey}}>{members}</div>
      </div>
      <div style={{position: 'absolute', left: 26, right: 26, bottom: 120, display: 'flex', flexDirection: 'column', gap: 16}}>
        {msgs.map((m, i) => {
          const o = appear(t, m.at, Infinity, 0.18);
          if (o <= 0) return null;
          const s = interpolate(t - m.at, [0, 0.12, 0.22], [0.8, 1.03, 1], cl);
          return (
            <div key={i} style={{alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '86%', opacity: o, transform: `scale(${s})`, transformOrigin: m.me ? 'right bottom' : 'left bottom'}}>
              {m.photo ? (
                <div style={{background: '#4C7DE8', borderRadius: 22, padding: 8, boxShadow: '0 0 0 3px #6f9cff'}}>
                  <div style={{borderRadius: 16, overflow: 'hidden', width: 300, height: 160}}><CarThumb /></div>
                  <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 28, color: '#fff', padding: '10px 12px 4px'}}>{m.caption}</div>
                </div>
              ) : (
                <div style={{background: m.me ? '#4C7DE8' : '#2A2C35', borderRadius: 22, padding: '14px 22px'}}>
                  {m.from && <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 22, color: '#F2A15B', marginBottom: 4}}>{m.from}</div>}
                  <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 29, color: '#fff', lineHeight: 1.25}}>{m.text}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 100, background: '#1F2028', borderTop: '1px solid #2c2e38'}}>
        <div style={{position: 'absolute', left: 60, top: 32, fontFamily: F.ui, fontWeight: 600, fontSize: 26, color: '#7d808a'}}>Xabar</div>
        <div style={{position: 'absolute', right: 40, top: 24, width: 52, height: 52, borderRadius: 26, background: '#7FA8F5'}} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ 100-cell grid card */
export const Grid100: React.FC<{t: number; at: number; out?: number; y: number; header: string; steps: {at: number; n: number; big: string; sub: string; tag: string}[]}> = ({t, at, out, y, header, steps}) => {
  let st = steps[0];
  steps.forEach((s) => { if (t >= s.at) st = s; });
  const prevN = steps.indexOf(st) > 0 ? steps[steps.indexOf(st) - 1].n : 0;
  const n = Math.round(lin(t, st.at, st.at + 0.6, prevN, st.n));
  const show = t >= steps[0].at;
  return (
    <Panel t={t} at={at} out={out} x={540} y={y} w={1000} h={500}>
      <div style={{position: 'absolute', left: 40, top: 32, fontFamily: F.mono, fontWeight: 500, fontSize: 27, letterSpacing: 4, color: '#E9C46A'}}>{header}</div>
      <div style={{position: 'absolute', left: 40, top: 90, display: 'grid', gridTemplateColumns: 'repeat(10, 34px)', gap: 7}}>
        {new Array(100).fill(0).map((_, i) => {
          const row = 9 - Math.floor(i / 10), col = i % 10;
          const idx = row * 10 + col; // fill from the bottom-left
          const on = show && 99 - idx < n;
          return <div key={i} style={{width: 34, height: 34, borderRadius: 7, background: on ? C.orange : '#2E3038', boxShadow: on ? `0 0 10px ${C.orange}88` : 'none'}} />;
        })}
      </div>
      {show && (
        <div style={{position: 'absolute', left: 500, top: 120, width: 470, textAlign: 'center', opacity: lin(t, st.at, st.at + 0.25)}}>
          <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 25, letterSpacing: 4, color: C.blue}}>{st.tag}</div>
          <div style={{fontFamily: F.head, fontWeight: 900, fontSize: 150, color: C.orange, lineHeight: 1.1, textShadow: `0 0 40px ${C.orange}77`, transform: `scale(${pop(t, st.at)})`}}>{st.big}</div>
          <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 36, color: C.white}}>{st.sub}</div>
        </div>
      )}
    </Panel>
  );
};

/* ------------------------------------------------------------------ horizontal comparison bars */
export const CompareBars: React.FC<{t: number; at: number; out?: number; y: number; header: string; rows: {at: number; label: string; value: number; text: string; color?: string}[]}> = ({t, at, out, y, header, rows}) => (
  <Panel t={t} at={at} out={out} x={540} y={y} w={1000} h={190 + rows.length * 170}>
    <div style={{position: 'absolute', left: 40, top: 34, fontFamily: F.mono, fontWeight: 500, fontSize: 27, letterSpacing: 4, color: '#E9C46A'}}>{header}</div>
    <div style={{position: 'absolute', left: 40 + 0.62 * 600 + 260, top: 100, bottom: 40, width: 0, borderLeft: '3px dashed rgba(240,71,62,0.65)'}} />
    <div style={{position: 'absolute', left: 40 + 0.62 * 600 + 270, top: 92, fontFamily: F.mono, fontWeight: 700, fontSize: 22, color: C.red}}>ME'YOR</div>
    {rows.map((r, i) => {
      const o = appear(t, r.at, Infinity, 0.2);
      const k = lin(t, r.at + 0.05, r.at + 0.8, 0, r.value, Easing.out(Easing.cubic));
      const full = 0.62 * 600; // 100 % of the limit
      const wpx = Math.min(full * k / 100, 640);
      return (
        <div key={i} style={{position: 'absolute', left: 40, top: 140 + i * 170, opacity: o}}>
          <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 34, color: C.white}}>{r.label}</div>
          <div style={{position: 'absolute', left: 260, top: 8, width: wpx, height: 40, borderRadius: 12, background: r.color ?? C.orange, boxShadow: `0 0 18px ${(r.color ?? C.orange)}66`}} />
          <div style={{position: 'absolute', left: 260, top: 62, fontFamily: F.head, fontWeight: 900, fontSize: 46, color: r.color ?? C.orange, whiteSpace: 'nowrap'}}>{r.text}</div>
        </div>
      );
    })}
  </Panel>
);

/* ------------------------------------------------------------------ "not radiation" stamp */
export const NotRadiation: React.FC<{t: number; at: number; strikeAt: number; subAt: number; out?: number; y?: number; title: string; sub: string}> = ({t, at, strikeAt, subAt, out, y = 1050, title, sub}) => {
  const k = lin(t, strikeAt, strikeAt + 0.3);
  const blade = (a: number) => {
    const r1 = 46, r2 = 150, a1 = ((a - 30) * Math.PI) / 180, a2 = ((a + 30) * Math.PI) / 180;
    return `M${Math.cos(a1) * r1},${Math.sin(a1) * r1} L${Math.cos(a1) * r2},${Math.sin(a1) * r2} A${r2},${r2} 0 0 1 ${Math.cos(a2) * r2},${Math.sin(a2) * r2} L${Math.cos(a2) * r1},${Math.sin(a2) * r1} A${r1},${r1} 0 0 0 ${Math.cos(a1) * r1},${Math.sin(a1) * r1}Z`;
  };
  return (
    <Panel t={t} at={at} out={out} x={540} y={y} w={900} h={780}>
      <svg width={900} height={460} viewBox="-450 -230 900 460" style={{position: 'absolute', left: 0, top: 30}}>
        <circle r={190} fill="none" stroke="#3A3C44" strokeWidth={6} />
        {[-90, 30, 150].map((a) => <path key={a} d={blade(a)} fill={C.amber} opacity={0.9} />)}
        <circle r={30} fill={C.amber} />
        <line x1={-160} y1={160} x2={-160 + 320 * k} y2={160 - 320 * k} stroke={C.red} strokeWidth={26} strokeLinecap="round" style={{filter: `drop-shadow(0 0 14px ${C.red})`}} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontFamily: F.head, fontWeight: 900, fontSize: 70, color: C.white, opacity: lin(t, strikeAt, strikeAt + 0.25)}}>{title}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: F.mono, fontWeight: 500, fontSize: 30, letterSpacing: 2, color: C.blue, opacity: lin(t, subAt, subAt + 0.3)}}>{sub}</div>
    </Panel>
  );
};

/* ------------------------------------------------------------------ thermal camera panel (seated figure) */
export const Thermal: React.FC<{t: number; at: number; out?: number; y?: number; heatAt?: number; tempFrom: number; tempTo?: number; tempAt?: number; tempDur?: number; tag?: string; tagAt?: number}> = ({t, at, out, y = 1060, heatAt, tempFrom, tempTo, tempAt = 0, tempDur = 1.5, tag, tagAt = 0}) => {
  const heat = heatAt !== undefined ? lin(t, heatAt, heatAt + 2.5) : 0;
  const temp = tempTo !== undefined ? tempFrom + (tempTo - tempFrom) * lin(t, tempAt, tempAt + tempDur, 0, 1, Easing.linear) : tempFrom;
  const hot = temp >= 36.5;
  const body = '#F7A23B';
  return (
    <Panel t={t} at={at} out={out} x={540} y={y} w={1020} h={1020}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 45% 55%, ${C.ir2} 0%, ${C.ir1} 70%)`}} />
      <div style={{position: 'absolute', left: 36, top: 30, fontFamily: F.mono, fontWeight: 500, fontSize: 27, letterSpacing: 3, color: '#E6E0F5'}}><span style={{color: C.red}}>●</span> IR · TEPLOVIZOR</div>
      {/* temperature scale */}
      <div style={{position: 'absolute', right: 40, top: 110, width: 22, height: 760, borderRadius: 11, background: 'linear-gradient(#FFFFFF, #FFE27A 18%, #F7A23B 40%, #E2513C 58%, #8D2C8C 78%, #3E1C70)'}} />
      <div style={{position: 'absolute', right: 74, top: 96, fontFamily: F.mono, fontSize: 24, color: '#E6E0F5'}}>40°</div>
      <div style={{position: 'absolute', right: 74, top: 850, fontFamily: F.mono, fontSize: 24, color: '#E6E0F5'}}>24°</div>
      {/* figure */}
      <svg width={1020} height={1020} style={{position: 'absolute', inset: 0}}>
        <defs><filter id="ir" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter></defs>
        <g filter="url(#ir)">
          <path d="M210 360 L250 360 L300 690 L250 700 Z" fill="#6A2FA0" />
          <rect x="190" y="700" width="380" height="16" rx="8" fill="#5A2A8F" opacity={0.8} />
          {heat > 0 && <ellipse cx={330} cy={640} rx={170 + 40 * heat} ry={50 + 20 * heat} fill="#FF6A3A" opacity={0.8 * heat} />}
          <circle cx={310} cy={290} r={68} fill={body} />
          <path d="M255 370 Q310 350 350 380 L370 620 L265 640 Z" fill={body} />
          <path d="M330 420 L520 470 L540 440 L350 380 Z" fill={body} />
          <path d="M270 600 L470 590 L480 650 L280 670 Z" fill={hot ? '#FFB347' : body} />
          <path d="M440 600 L560 860 L620 860 L500 590 Z" fill={body} />
          <path d="M540 850 L660 850 L660 885 L540 885 Z" fill={body} />
        </g>
        <line x1={540} y1={460} x2={590} y2={340} stroke="#9A86C9" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
        <line x1={640} y1={860} x2={680} y2={760} stroke="#9A86C9" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
        {/* crosshair box on the pelvis */}
        <g stroke={hot ? '#FF8A6A' : '#fff'} strokeWidth={4} fill="none" opacity={lin(t, at + 0.3, at + 0.6)}>
          <path d="M300 590 h-18 v18 M366 590 h18 v18 M300 680 h-18 v-18 M366 680 h18 v-18" />
          <path d="M333 622 v24 M321 634 h24" />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 404, top: 600, padding: '10px 22px', borderRadius: 12, background: 'rgba(20,12,34,0.8)', fontFamily: F.mono, fontWeight: 700, fontSize: 54, color: hot ? '#FF8A6A' : '#fff', opacity: lin(t, at + 0.4, at + 0.7), boxShadow: hot ? '0 0 30px rgba(255,90,60,0.45)' : 'none'}}>
        {temp.toFixed(1).replace('.', ',')} °C
      </div>
      {tag && <div style={{position: 'absolute', left: 36, bottom: 40, padding: '10px 22px', borderRadius: 14, border: `2px solid ${C.orange}`, fontFamily: F.mono, fontWeight: 700, fontSize: 28, letterSpacing: 2, color: C.orange, opacity: lin(t, tagAt, tagAt + 0.3)}}>{tag}</div>}
    </Panel>
  );
};

/* ------------------------------------------------------------------ tip cards: a switch that turns off, a break timer */
export const SwitchCard: React.FC<{t: number; at: number; offAt: number; y: number; title: string; sub: string}> = ({t, at, offAt, y, title, sub}) => {
  const k = lin(t, offAt, offAt + 0.3);
  return (
    <Panel t={t} at={at} x={540} y={y} w={900} h={270}>
      <div style={{position: 'absolute', left: 44, top: 52, fontFamily: F.head, fontWeight: 900, fontSize: 46, color: C.white}}>{title}</div>
      <div style={{position: 'absolute', left: 46, top: 140, fontFamily: F.mono, fontWeight: 500, fontSize: 27, letterSpacing: 3, color: C.grey}}>{sub}</div>
      <div style={{position: 'absolute', right: 50, top: 75, width: 190, height: 100, borderRadius: 50, background: k < 0.5 ? C.orange : '#3A3C44', boxShadow: k < 0.5 ? `0 0 30px ${C.orange}88` : 'none'}}>
        <div style={{position: 'absolute', top: 10, left: 10 + 90 * (1 - k), width: 80, height: 80, borderRadius: 40, background: '#fff'}} />
      </div>
      <div style={{position: 'absolute', right: 50, top: 186, width: 190, textAlign: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: 30, color: k < 0.5 ? C.orange : C.grey}}>{k < 0.5 ? 'ON' : 'OFF'}</div>
    </Panel>
  );
};
export const TimerCard: React.FC<{t: number; at: number; y: number; title: string; sub: string}> = ({t, at, y, title, sub}) => {
  const ang = ((t - at) * 120) % 360;
  return (
    <Panel t={t} at={at} x={540} y={y} w={900} h={270}>
      <div style={{position: 'absolute', left: 44, top: 52, fontFamily: F.head, fontWeight: 900, fontSize: 46, color: C.white}}>{title}</div>
      <div style={{position: 'absolute', left: 46, top: 140, fontFamily: F.mono, fontWeight: 500, fontSize: 27, letterSpacing: 3, color: C.grey}}>{sub}</div>
      <svg width={150} height={150} style={{position: 'absolute', right: 70, top: 50}}>
        <circle cx={75} cy={75} r={62} fill="none" stroke={C.orange} strokeWidth={9} style={{filter: `drop-shadow(0 0 8px ${C.orange})`}} />
        <line x1={75} y1={75} x2={75 + 44 * Math.sin((ang * Math.PI) / 180)} y2={75 - 44 * Math.cos((ang * Math.PI) / 180)} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
        <line x1={75} y1={75} x2={75} y2={42} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
        <circle cx={75} cy={75} r={8} fill="#fff" />
      </svg>
    </Panel>
  );
};

export const Pill: React.FC<{t: number; at: number; out?: number; x?: number; y: number; text: string; color?: string}> = ({t, at, out = Infinity, x = 540, y, text, color = C.red}) => {
  const o = appear(t, at, out, 0.2);
  if (o <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${pop(t, at)})`, opacity: o, padding: '14px 30px', borderRadius: 40, border: `3px solid ${color}`, background: 'rgba(20,20,26,0.9)', fontFamily: F.ui, fontWeight: 800, fontSize: 36, color: '#fff', whiteSpace: 'nowrap'}}>{text}</div>;
};

export const Label: React.FC<{t: number; at: number; out?: number; x?: number; y: number; text: string; color?: string; size?: number}> = ({t, at, out = Infinity, x = 540, y, text, color = C.blue, size = 28}) => {
  const o = appear(t, at, out, 0.25);
  if (o <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, transform: 'translateX(-50%)', opacity: o, fontFamily: F.mono, fontWeight: 500, fontSize: size, letterSpacing: 4, color, whiteSpace: 'nowrap'}}>{text}</div>;
};

export const Sparks: React.FC<{t: number}> = ({t}) => (
  <>{new Array(26).fill(0).map((_, i) => { const x = random(`p${i}`) * 1080; const y = (random(`q${i}`) * 1920 - t * (8 + random(`r${i}`) * 14) + 3840) % 1920; return <div key={i} style={{position: 'absolute', left: x, top: y, width: 3, height: 3, borderRadius: 2, background: '#fff', opacity: 0.25}} />; })}</>
);

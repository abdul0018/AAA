import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, FPS, L, W} from './theme';
import type {Anim, Box, Charges, Counter, Glow, Ground, Inset, Layer, Mark, Rain, Title} from './types';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const sec = (s: number) => Math.round(s * FPS);
export const src = (s: string) => (/^(https?:|data:)/.test(s) ? s : staticFile(s));

/** 0→1 over `dur` frames after `at`, 1→0 over `outDur` frames after `out`. */
export const presence = (f: number, at: number, out?: number, inDur = 8, outDur = 7) => {
  const a = interpolate(f, [sec(at), sec(at) + inDur], [0, 1], clamp);
  const b = out === undefined ? 1 : interpolate(f, [sec(out), sec(out) + outDur], [1, 0], clamp);
  return Math.min(a, b);
};

const shakeOffset = (f: number, times?: number[], amp = 14) => {
  if (!times) return {x: 0, y: 0};
  for (const t of times) {
    const d = f - sec(t);
    if (d >= 0 && d < 12) {
      const k = (1 - d / 12) * amp;
      return {x: Math.sin(d * 2.7) * k, y: Math.cos(d * 3.3) * k * 0.6};
    }
  }
  return {x: 0, y: 0};
};
export const useShake = (times?: number[], amp?: number) => shakeOffset(useCurrentFrame(), times, amp);

/* ------------------------------------------------------------------ background */

export const Board: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: C.bg,
      backgroundImage: `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`,
      backgroundSize: '66px 66px',
      backgroundPosition: '-2px -2px',
    }}
  >
    <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 65% at 50% 45%, rgba(255,255,255,0.035) 0%, transparent 60%, ${C.bgEdge} 140%)`}} />
  </AbsoluteFill>
);

/** Thin ground line with diagonal hatching underneath (like a technical drawing). */
export const GroundLine: React.FC<Ground> = ({y, x0 = 150, x1 = 930, at = 0}) => {
  const f = useCurrentFrame();
  const op = presence(f, at);
  const hatches = [];
  for (let x = x0 + 8; x < x1; x += 26) hatches.push(<line key={x} x1={x} y1={y + 6} x2={x - 12} y2={y + 26} />);
  return (
    <svg width={W} height={1920} style={{position: 'absolute', inset: 0, opacity: op}}>
      <g stroke={C.ground} strokeWidth={3} strokeLinecap="round">
        <line x1={x0} y1={y} x2={x1} y2={y} />
        {hatches}
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ branding */

export const Handle: React.FC<{handle: string; pos?: 'left' | 'center' | 'right'}> = ({handle, pos = 'center'}) => {
  const left = pos === 'left' ? 150 : pos === 'right' ? 930 : 540;
  return (
    <div style={{position: 'absolute', top: L.handleY - 14, left, transform: 'translateX(-50%)', fontFamily: FONT, fontWeight: 700, fontSize: 22, color: 'rgba(255,255,255,0.28)'}}>
      {handle}
    </div>
  );
};

export const IgPill: React.FC<{handle: string; opacity: number}> = ({handle, opacity}) => (
  <div
    style={{
      position: 'absolute', top: L.pillY, left: '50%', transform: 'translate(-50%,-50%)', opacity,
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderRadius: 999,
      background: 'rgba(0,0,0,0.45)', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#fff',
    }}
  >
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="#fff" stroke="none" />
    </svg>
    {handle}
  </div>
);

/* ------------------------------------------------------------------ typography */

/** Headline: lights up from dim grey to white, rises 12 px, de-blurs; optional yellow underline grows from the left. */
export const TitleText: React.FC<Title> = ({text, at, out, size, underline, color = 'white', kicker, sub, subAt, y = L.titleY}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lines = text.toUpperCase().split('\n');
  const fs = size ?? (lines.length > 1 ? 84 : 88);
  const d = f - sec(at);
  const vis = presence(f, at, out, 3, 6);
  if (vis <= 0) return null;
  const light = interpolate(d, [0, 7], [0, 1], clamp);
  const rise = interpolate(d, [0, 8], [12, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const blur = interpolate(d, [0, 6], [6, 0], clamp);
  const ul = spring({frame: Math.max(0, d - 4), fps, config: {damping: 200, stiffness: 120}});
  const red = color === 'red';
  const punch = red ? interpolate(spring({frame: Math.max(0, d), fps, config: {damping: 9, stiffness: 260}}), [0, 1], [1.5, 1]) : 1;
  const ink = red ? '#FBEDED' : C.white;
  const textColor = `color-mix(in srgb, ${ink} ${Math.round(light * 100)}%, ${C.dim})`;
  const glow = red ? `0 0 18px ${C.redGlow}, 0 0 42px ${C.redGlow}` : '0 2px 0 rgba(0,0,0,0.25)';
  const subOp = sub ? presence(f, subAt ?? at + 0.4, out, 8, 6) : 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: `translateY(-50%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: vis, fontFamily: FONT}}>
      {kicker && (
        <div style={{fontWeight: 800, fontSize: fs * 0.52, color: textColor, letterSpacing: '-0.01em', marginBottom: 4, filter: `blur(${blur}px)`, transform: `translateY(${rise}px)`}}>
          {kicker.toUpperCase()}
        </div>
      )}
      <div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${rise}px) scale(${punch})`}}>
        {lines.map((ln, i) => (
          <div key={i} style={{fontWeight: 800, fontSize: fs, lineHeight: 1.08, letterSpacing: '-0.015em', color: textColor, textShadow: glow, filter: `blur(${blur}px)`, whiteSpace: 'nowrap'}}>
            {ln}
          </div>
        ))}
        {underline && <div style={{alignSelf: 'stretch', height: 8, marginTop: 10, borderRadius: 4, background: C.yellow, transformOrigin: 'left center', transform: `scaleX(${ul})`}} />}
      </div>
      {sub && (
        <div style={{marginTop: 14, fontWeight: 800, fontSize: fs * 0.36, color: C.sub, letterSpacing: '0.01em', opacity: subOp}}>{sub.toUpperCase()}</div>
      )}
    </div>
  );
};

const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Big number that counts (ease-out), with soft white glow — "3 → 10 000 VOLT". */
export const CounterText: React.FC<Counter> = ({at, dur, from, to, prefix = '', suffix = '', out, sub, subAt, glow = true, y = L.titleY}) => {
  const f = useCurrentFrame();
  const vis = presence(f, at, out, 4, 6);
  if (vis <= 0) return null;
  const p = interpolate(f, [sec(at), sec(at + dur)], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const v = from + (to - from) * p;
  const subOp = sub ? presence(f, subAt ?? at + dur, out, 8, 6) : 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: FONT, opacity: vis}}>
      <div style={{fontWeight: 800, fontSize: 88, letterSpacing: '-0.015em', color: C.white, textShadow: glow ? '0 0 22px rgba(255,255,240,0.45)' : undefined, fontVariantNumeric: 'tabular-nums'}}>
        {prefix}
        {fmt(v)}
        {suffix}
      </div>
      {sub && <div style={{marginTop: 6, fontWeight: 800, fontSize: 32, color: C.sub, opacity: subOp}}>{sub.toUpperCase()}</div>}
    </div>
  );
};

/* ------------------------------------------------------------------ illustration layers */

const enter = (anim: Anim, p: number, sp: number) => {
  // p = eased 0..1 progress, sp = spring 0..1
  switch (anim) {
    case 'pop':
      return {op: Math.min(1, p * 2), dx: 0, dy: 0, s: interpolate(sp, [0, 1], [0.6, 1])};
    case 'slideLeft':
      return {op: Math.min(1, p * 3), dx: interpolate(p, [0, 1], [-700, 0]), dy: 0, s: 1};
    case 'slideRight':
      return {op: Math.min(1, p * 3), dx: interpolate(p, [0, 1], [700, 0]), dy: 0, s: 1};
    case 'slideUp':
      return {op: p, dx: 0, dy: interpolate(p, [0, 1], [90, 0]), s: 1};
    case 'drop':
      return {op: p, dx: 0, dy: interpolate(p, [0, 1], [-70, 0]), s: 1};
    case 'walkIn':
      return {op: Math.min(1, p * 4), dx: interpolate(p, [0, 1], [-520, 0]), dy: p < 1 ? -Math.abs(Math.sin(p * Math.PI * 6)) * 10 : 0, s: 1};
    case 'zoomOut':
      return {op: p, dx: 0, dy: 0, s: interpolate(p, [0, 1], [1.7, 1])};
    case 'fade':
      return {op: p, dx: 0, dy: 0, s: interpolate(p, [0, 1], [1.03, 1])};
    default:
      return {op: 1, dx: 0, dy: 0, s: 1};
  }
};

export const LayerImg: React.FC<Layer> = (l) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = l.at ?? 0;
  const d = f - sec(at);
  if (d < 0) return null;
  const anim = l.anim ?? 'fade';
  const dur = Math.max(1, sec(l.animDur ?? 0.45));
  const p = interpolate(d, [0, dur], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const sp = spring({frame: d, fps, config: {damping: 12, stiffness: 180}});
  const e = enter(anim, p, sp);
  const outOp = l.out === undefined ? 1 : interpolate(f, [sec(l.out), sec(l.out) + 7], [1, 0], clamp);
  if (outOp <= 0) return null;

  let x = l.x ?? 540;
  let y = l.y ?? L.stageY;
  let w = l.w;
  for (const m of l.moves ?? []) {
    const k = interpolate(f, [sec(m.at), sec(m.at + m.dur)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
    if (m.x !== undefined) x = x + (m.x - x) * k;
    if (m.y !== undefined) y = y + (m.y - y) * k;
    if (m.w !== undefined) w = w + (m.w - w) * k;
  }
  const sh = shakeOffset(f, l.shakeAt, 8);
  const g = l.glow;
  const gOp = g ? presence(f, g.at, g.out, 10, 10) * (0.85 + 0.15 * Math.sin(f * 0.5)) : 0;
  return (
    <>
      {g && gOp > 0 && (
        <div
          style={{
            position: 'absolute', left: x + (g.dx ?? 0), top: y + (g.dy ?? 0), width: (g.r ?? w * 0.8) * 2, height: (g.r ?? w * 0.8) * 2,
            transform: 'translate(-50%,-50%)', borderRadius: '50%', opacity: gOp * outOp, zIndex: (l.z ?? 1) - 1,
            background: `radial-gradient(circle, ${g.color ?? C.yellowGlow} 0%, rgba(255,204,64,0.18) 38%, transparent 70%)`,
          }}
        />
      )}
      <Img
        src={src(l.src)}
        style={{
          position: 'absolute', left: x + e.dx + sh.x, top: y + e.dy + sh.y, width: w, zIndex: l.z ?? 1,
          transform: `translate(-50%,-50%) scale(${e.s}) ${l.flip ? 'scaleX(-1)' : ''}`,
          opacity: e.op * outOp * (l.opacity ?? 1), filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.35))',
        }}
      />
    </>
  );
};

/* ------------------------------------------------------------------ physics-explainer overlays */

/** Yellow radial glow ("energy", "charge", "heat"). */
export const GlowSpot: React.FC<Glow> = ({at, out, x, y, r, color = C.yellowGlow, flicker = true}) => {
  const f = useCurrentFrame();
  const op = presence(f, at, out, 12, 10) * (flicker ? 0.82 + 0.18 * Math.sin(f * 0.55) * Math.sin(f * 0.23) : 1);
  if (op <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, transform: 'translate(-50%,-50%)', borderRadius: '50%', opacity: op, zIndex: 0, background: `radial-gradient(circle, ${color} 0%, rgba(255,204,64,0.16) 40%, transparent 70%)`}} />
  );
};

/** Little yellow "−" (or "+") discs that pop in one by one and wander — static charge, particles, molecules. */
export const ChargeField: React.FC<Charges> = ({at, out, x, y, w, h, count = 12, sign = '-', stagger = 0.05, drift = 6, flowTo}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const vis = presence(f, at, out, 1, 8);
  if (vis <= 0) return null;
  const R = 15;
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const seed = `chg-${x}-${y}-${i}`;
        let px = x + (random(seed + 'x') - 0.5) * w;
        let py = y + (random(seed + 'y') - 0.5) * h;
        const d = f - sec(at + i * stagger);
        if (d < 0) return null;
        const s = spring({frame: d, fps, config: {damping: 10, stiffness: 220}});
        px += Math.sin(f / 9 + i) * drift;
        py += Math.cos(f / 11 + i * 1.7) * drift;
        let fo = 1;
        if (flowTo) {
          const k = interpolate(f, [sec(flowTo.at + i * 0.02), sec(flowTo.at + flowTo.dur + i * 0.02)], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
          px += (flowTo.x - px) * k;
          py += (flowTo.y - py) * k;
          fo = 1 - interpolate(k, [0.85, 1], [0, 1], clamp);
        }
        return (
          <div key={i} style={{position: 'absolute', left: px, top: py, width: R * 2, height: R * 2, transform: `translate(-50%,-50%) scale(${s})`, borderRadius: '50%', background: C.yellow, boxShadow: `0 0 10px ${C.yellowGlow}`, opacity: vis * fo, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 13, height: 3.5, borderRadius: 2, background: '#3A2E00'}} />
            {sign === '+' && <div style={{position: 'absolute', width: 3.5, height: 13, borderRadius: 2, background: '#3A2E00'}} />}
          </div>
        );
      })}
    </>
  );
};

/** Circular magnifier inset with yellow ring + dotted leader line to the detail it explains. */
export const InsetCircle: React.FC<Inset> = ({src: s, at, out, x, y, r, zoom = 1, focusX = 0.5, focusY = 0.5, target}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d = f - sec(at);
  if (d < 0) return null;
  const sp = spring({frame: d, fps, config: {damping: 13, stiffness: 170}});
  const op = presence(f, at, out, 5, 7);
  const line = interpolate(d, [4, 16], [0, 1], clamp);
  return (
    <>
      {target && (
        <svg width={W} height={1920} style={{position: 'absolute', inset: 0, opacity: op, zIndex: 29}}>
          <line x1={x} y1={y + r} x2={x + (target.x - x) * line} y2={y + r + (target.y - y - r) * line} stroke={C.white} strokeOpacity={0.7} strokeWidth={3} strokeDasharray="2 9" strokeLinecap="round" />
        </svg>
      )}
      <div style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, transform: `translate(-50%,-50%) scale(${sp})`, opacity: op, borderRadius: '50%', border: `6px solid ${C.yellow}`, overflow: 'hidden', background: '#2A2C2C', boxShadow: '0 12px 30px rgba(0,0,0,0.45)', zIndex: 30}}>
        <Img src={src(s)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${focusX * 100}% ${focusY * 100}%`, transform: `scale(${zoom})`}} />
      </div>
    </>
  );
};

/** Drawn check (white), cross (red), bobbing question mark, or electric spark burst. */
export const MarkIcon: React.FC<Mark> = ({type, at, out, x, y, size = 90}) => {
  const f = useCurrentFrame();
  const d = f - sec(at);
  if (d < 0) return null;
  const op = presence(f, at, out, 3, 6);
  const draw = interpolate(d, [0, 9], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const base: React.CSSProperties = {position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: op, zIndex: 40};
  if (type === 'question') {
    return <div style={{...base, top: y + Math.sin(f / 6) * 6, fontFamily: FONT, fontWeight: 800, fontSize: size, color: 'rgba(242,241,236,0.85)', opacity: op * draw}}>?</div>;
  }
  if (type === 'spark') {
    const s = interpolate(d, [0, 3, 10], [0.2, 1.25, 1], clamp);
    return (
      <svg width={size * 1.6} height={size * 1.6} viewBox="-50 -50 100 100" style={{...base, transform: `translate(-50%,-50%) scale(${s}) rotate(${d * 4}deg)`}}>
        <g stroke="#fff" strokeWidth={6} strokeLinecap="round" style={{filter: `drop-shadow(0 0 8px ${C.redGlow})`}}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1={0} y1={-12} x2={0} y2={a % 90 === 0 ? -44 : -30} transform={`rotate(${a})`} />
          ))}
        </g>
        <circle r={10} fill="#fff" style={{filter: `drop-shadow(0 0 10px ${C.redGlow})`}} />
      </svg>
    );
  }
  const len = 140;
  const isCheck = type === 'check';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={base}>
      {isCheck ? (
        <path d="M14 54 L40 78 L88 22" fill="none" stroke={C.white} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
      ) : (
        <g stroke={C.red} strokeWidth={11} strokeLinecap="round" style={{filter: `drop-shadow(0 0 6px ${C.redGlow})`}}>
          <line x1={22} y1={22} x2={22 + 56 * draw} y2={22 + 56 * draw} />
          <line x1={78} y1={22} x2={78 - 56 * draw} y2={22 + 56 * draw} />
        </g>
      )}
    </svg>
  );
};

/** Falling blue drops — humidity, rain, water. */
export const RainField: React.FC<Rain> = ({at, out, count = 46}) => {
  const f = useCurrentFrame();
  const op = presence(f, at, out, 10, 10);
  if (op <= 0) return null;
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const sx = 180 + random(`rx${i}`) * 720;
        const speed = 5 + random(`rs${i}`) * 4;
        const y0 = random(`ry${i}`) * 900;
        const yy = 420 + ((y0 + (f - sec(at)) * speed) % 900);
        const s = 0.7 + random(`rz${i}`) * 0.6;
        return (
          <svg key={i} width={16 * s} height={24 * s} viewBox="0 0 16 24" style={{position: 'absolute', left: sx, top: yy, opacity: op * 0.85, zIndex: 25}}>
            <path d="M8 0 C8 0 0 11 0 16 a8 8 0 0 0 16 0 C16 11 8 0 8 0Z" fill={C.blue} />
          </svg>
        );
      })}
    </>
  );
};

/** Yellow rounded outline that draws itself around a key part, with a soft glow. */
export const HighlightBox: React.FC<Box> = ({at, out, x, y, w, h, radius = 14, color = C.yellow}) => {
  const f = useCurrentFrame();
  const d = f - sec(at);
  if (d < 0) return null;
  const op = presence(f, at, out, 2, 6);
  const per = 2 * (w + h);
  const draw = interpolate(d, [0, 12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <svg width={W} height={1920} style={{position: 'absolute', inset: 0, opacity: op, zIndex: 35}}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={radius} fill="none" stroke={color} strokeWidth={7} strokeDasharray={per} strokeDashoffset={per * (1 - draw)} style={{filter: `drop-shadow(0 0 8px ${C.yellowGlow})`}} />
    </svg>
  );
};

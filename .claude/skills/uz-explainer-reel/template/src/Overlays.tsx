import React from 'react';
import {Easing, Img, interpolate, spring, staticFile, useVideoConfig} from 'remotion';

export const PaceContext = React.createContext<'energetic' | 'calm'>('energetic');
import {C, DISPLAY, MONO, SANS, W} from './theme';
import {Overlay} from './types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// t = seconds since the overlay's `at`. out = 0..1 exit progress.
type P<T> = {o: T; t: number; out: number};

const useIn = (t: number, damping = 14) => {
  const {fps} = useVideoConfig();
  const fast = React.useContext(PaceContext) === 'energetic';
  // energetic: stiffer, slightly bouncier springs (in ~0.2 s instead of ~0.35 s)
  return spring({frame: Math.max(0, t * fps), fps, config: fast ? {damping: damping - 3, mass: 0.45, stiffness: 300} : {damping, mass: 0.6, stiffness: 170}});
};

const Centered: React.FC<{y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({y, children, style}) => (
  <div style={{position: 'absolute', left: 0, width: W, top: y, display: 'flex', justifyContent: 'center', ...style}}>{children}</div>
);

export const Chip: React.FC<P<Extract<Overlay, {kind: 'chip'}>>> = ({o, t, out}) => {
  const s = useIn(t);
  const color = o.tone === 'red' ? C.redHot : o.tone === 'muted' ? C.grey : C.white;
  return (
    <Centered y={o.y ?? 990}>
      <div
        style={{
          fontFamily: SANS, fontWeight: 600, fontSize: 30, color, padding: '16px 30px', borderRadius: 999,
          background: C.panel, border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
          opacity: s * (1 - out), transform: `translateY(${(1 - s) * 18}px) scale(${0.94 + 0.06 * s})`, whiteSpace: 'nowrap',
        }}
      >
        {o.text}
      </div>
    </Centered>
  );
};

export const Stamp: React.FC<P<Extract<Overlay, {kind: 'stamp'}>>> = ({o, t, out}) => {
  const s = useIn(t, 11);
  const scale = interpolate(s, [0, 1], [1.7, 1]);
  const shake = t < 0.25 ? Math.sin(t * 90) * (0.25 - t) * 16 : 0;
  return (
    <Centered y={o.y ?? 1000}>
      <div
        style={{
          fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, letterSpacing: 1, textTransform: 'uppercase', color: C.redHot,
          padding: '10px 28px', border: `5px solid ${C.redHot}`, borderRadius: 10, background: 'rgba(20,10,14,0.72)',
          boxShadow: `0 0 40px rgba(224,86,111,0.35), inset 0 0 18px rgba(224,86,111,0.25)`,
          transform: `rotate(${o.rotate ?? -6}deg) scale(${scale}) translateX(${shake}px)`, opacity: Math.min(1, s * 1.4) * (1 - out),
        }}
      >
        {o.text}
      </div>
    </Centered>
  );
};

export const BigNumber: React.FC<P<Extract<Overlay, {kind: 'bigNumber'}>>> = ({o, t, out}) => {
  const s = useIn(t);
  const k = interpolate(t, [0, 0.7], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const v = Math.round((o.from ?? (o.year ? o.value : 0)) + (o.value - (o.from ?? (o.year ? o.value : 0))) * k);
  return (
    <Centered y={o.y ?? 560}>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 168, color: '#E6E6E4', letterSpacing: -2, opacity: s * (1 - out), transform: `scale(${0.85 + 0.15 * s})`}}>
        {o.prefix ?? ''}
        {o.year ? String(v) : v.toLocaleString('ru-RU')}
        {o.suffix ?? ''}
      </div>
    </Centered>
  );
};

export const Donut: React.FC<P<Extract<Overlay, {kind: 'donut'}>>> = ({o, t, out}) => {
  const s = useIn(t);
  const k = interpolate(t, [0.1, 1.1], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const pct = (o.from ?? 0) + (o.percent - (o.from ?? 0)) * k;
  const R = 160, SW = 30, L = 2 * Math.PI * R;
  return (
    <Centered y={o.y ?? 640}>
      <div style={{position: 'relative', width: 2 * R + SW, height: 2 * R + SW, opacity: s * (1 - out), transform: `scale(${0.9 + 0.1 * s})`}}>
        <svg width={2 * R + SW} height={2 * R + SW} style={{transform: 'rotate(-90deg)'}}>
          <circle cx={R + SW / 2} cy={R + SW / 2} r={R} stroke={C.track} strokeWidth={SW} fill="none" />
          <circle cx={R + SW / 2} cy={R + SW / 2} r={R} stroke={C.red} strokeWidth={SW} fill="none" strokeLinecap="round" strokeDasharray={`${(L * pct) / 100} ${L}`} />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 100, color: C.white}}>{Math.round(pct)}%</div>
          {o.label ? <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.grey, marginTop: 4}}>{o.label}</div> : null}
        </div>
      </div>
    </Centered>
  );
};

export const Battery: React.FC<P<Extract<Overlay, {kind: 'battery'}>>> = ({o, t, out}) => {
  const s = useIn(t);
  const k = interpolate(t, [0.2, 1.4], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const lvl = o.to === undefined ? o.level : o.level + (o.to - o.level) * k;
  const big = !o.showPct;
  const bw = big ? 270 : 110, bh = big ? 140 : 56, st = big ? 10 : 6;
  return (
    <Centered y={o.y ?? 640} style={{flexDirection: 'column', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: s * (1 - out), transform: `scale(${0.9 + 0.1 * s})`,
        ...(big ? {} : {background: C.panel, padding: '14px 26px', borderRadius: 18})}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <div style={{width: bw, height: bh, border: `${st}px solid ${C.white}`, borderRadius: big ? 26 : 12, padding: big ? 12 : 6, boxSizing: 'border-box'}}>
            <div style={{width: `${Math.max(3, lvl)}%`, height: '100%', background: C.red, borderRadius: big ? 10 : 4}} />
          </div>
          <div style={{width: big ? 16 : 8, height: bh * 0.36, background: C.white, borderRadius: '0 6px 6px 0'}} />
        </div>
        {o.showPct ? <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: C.white}}>{Math.round(lvl)}%</div> : null}
      </div>
      {o.caption ? <div style={{fontFamily: SANS, fontStyle: 'italic', fontWeight: 500, fontSize: 30, color: C.grey, marginTop: 26, opacity: s * (1 - out)}}>{o.caption}</div> : null}
    </Centered>
  );
};

export const StatCard: React.FC<P<Extract<Overlay, {kind: 'statCard'}>>> = ({o, t, out}) => {
  const s = useIn(t);
  return (
    <Centered y={o.y ?? 560}>
      <div style={{background: 'rgba(32,33,37,0.92)', borderRadius: 28, padding: '34px 56px 30px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', textAlign: 'center',
        opacity: s * (1 - out), transform: `translateY(${(1 - s) * 30}px)`}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.grey}}>{o.title}</div>
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 16}}>
          {o.pre ? <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.white}}>{o.pre}</span> : null}
          <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 150, color: C.red, lineHeight: 1.05}}>{o.value}</span>
          {o.post ? <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.white}}>{o.post}</span> : null}
        </div>
        {o.footer ? <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 22, color: C.grey}}>{o.footer}</div> : null}
      </div>
    </Centered>
  );
};

export const Poll: React.FC<P<Extract<Overlay, {kind: 'poll'}>>> = ({o, t, out}) => {
  const s = useIn(t);
  const q = o.question.replace(/\?$/, '');
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: o.y ?? 760, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: s * (1 - out)}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 58, color: C.white, textTransform: 'uppercase', marginBottom: 34}}>
        {q}
        <span style={{color: C.red}}>?</span>
      </div>
      {o.options.map((op, i) => {
        const k = interpolate(t, [0.15 + i * 0.12, 0.55 + i * 0.12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        return (
          <div key={i} style={{width: 580, height: 74, marginBottom: 14, borderRadius: 10, background: 'rgba(60,61,66,0.55)', display: 'flex', alignItems: 'center', padding: '0 24px', boxSizing: 'border-box',
            fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.white, opacity: k, transform: `translateX(${(1 - k) * -40}px)`}}>
            {op}
          </div>
        );
      })}
      {o.hint ? <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.grey, marginTop: 6}}>{o.hint}</div> : null}
    </div>
  );
};

export const Cta: React.FC<P<Extract<Overlay, {kind: 'cta'}>>> = ({o, t, out}) => {
  const s = useIn(t);
  const done = t > 1.1;
  const press = t > 0.95 && t < 1.15 ? 0.92 : 1;
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: o.y ?? 720, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: s * (1 - out), transform: `scale(${0.9 + 0.1 * s})`}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 150, color: C.white, letterSpacing: -4, lineHeight: 1}}>
        {o.logo}
        <span style={{color: C.red}}>.</span>
      </div>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.grey, margin: '18px 0 26px'}}>{o.handle}</div>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.white, padding: '16px 40px', borderRadius: 999, transform: `scale(${press})`,
        background: done ? 'rgba(60,61,66,0.85)' : C.red}}>
        {done ? o.done : o.button}
      </div>
    </div>
  );
};

export const ImageOverlay: React.FC<P<Extract<Overlay, {kind: 'image'}>>> = ({o, t, out}) => {
  const s = useIn(t);
  return (
    <Centered y={o.y ?? 820}>
      <Img src={staticFile(o.src)} style={{width: o.width ?? 420, opacity: s * (1 - out), transform: `translateY(${(1 - s) * 24}px)`}} />
    </Centered>
  );
};

// Small mono "x-ray" callout with a leader dot, e.g. BATAREYA / ELEKTROMOTOR on a cutaway render
export const Label: React.FC<P<Extract<Overlay, {kind: 'label'}>>> = ({o, t, out}) => {
  const k = interpolate(t, [0, 0.25], [0, 1], clamp);
  const chars = Math.round(o.text.length * k);
  return (
    <div style={{position: 'absolute', left: o.x, top: o.y, display: 'flex', alignItems: 'center', gap: 10, opacity: 1 - out}}>
      <div style={{width: 10, height: 10, borderRadius: 5, background: C.redHot, boxShadow: `0 0 12px ${C.redHot}`}} />
      <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: 2, color: C.redHot, textTransform: 'uppercase',
        padding: '4px 10px', background: 'rgba(20,10,14,0.6)', borderBottom: `2px solid ${C.red}`}}>
        {o.text.slice(0, chars)}
      </div>
    </div>
  );
};

export const renderOverlay = (o: Overlay, t: number, out: number, key: number) => {
  const p = {t, out, key} as const;
  switch (o.kind) {
    case 'chip': return <Chip o={o} {...p} />;
    case 'stamp': return <Stamp o={o} {...p} />;
    case 'bigNumber': return <BigNumber o={o} {...p} />;
    case 'donut': return <Donut o={o} {...p} />;
    case 'battery': return <Battery o={o} {...p} />;
    case 'statCard': return <StatCard o={o} {...p} />;
    case 'poll': return <Poll o={o} {...p} />;
    case 'cta': return <Cta o={o} {...p} />;
    case 'image': return <ImageOverlay o={o} {...p} />;
    case 'label': return <Label o={o} {...p} />;
  }
};

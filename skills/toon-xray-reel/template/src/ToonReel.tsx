import React from 'react';
import {AbsoluteFill, Easing, Freeze, Img, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {CutawaySVG} from './Cutaway';
import type {CutawayLayer, DripsLayer, Layer, Shot, ToonProps, Track} from './types';

export const FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const src = (s: string) => (/^(https?:|data:)/.test(s) ? s : staticFile(s));
export const sec = (s: number) => Math.round(s * FPS);

/** Evaluate a keyframe track at time t (seconds), eased in-out between keys. */
export const ev = (tr: Track | undefined, t: number, def: number): number => {
  if (tr === undefined) return def;
  if (typeof tr === 'number') return tr;
  if (tr.length === 1) return tr[0][1];
  if (t <= tr[0][0]) return tr[0][1];
  for (let i = 0; i < tr.length - 1; i++) {
    const [t0, v0] = tr[i];
    const [t1, v1] = tr[i + 1];
    if (t <= t1) return interpolate(t, [t0, t1], [v0, v1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  }
  return tr[tr.length - 1][1];
};
/** numeric derivative of a track (units / s) */
const dev = (tr: Track | undefined, t: number) => (ev(tr, t + 0.02, 0) - ev(tr, t - 0.02, 0)) / 0.04;

const shake = (t: number, times?: number[]) => {
  for (const s of times ?? []) {
    const d = t - s;
    if (d >= 0 && d < 0.45) {
      const k = (1 - d / 0.45) * 22;
      return {x: Math.sin(d * 80) * k, y: Math.cos(d * 95) * k * 0.7};
    }
  }
  return {x: 0, y: 0};
};

const LayerView: React.FC<{l: Layer; t: number}> = ({l, t}) => {
  const x = ev(l.x, t, 540);
  const y = ev(l.y, t, 960);
  const op = ev(l.opacity, t, 1);
  const sc = ev(l.scale, t, 1);
  const sy = ev(l.scaleY, t, 1);
  const rot = ev(l.rotate, t, 0);
  const blur = ev(l.blur, t, 0);
  const tint = ev(l.tint, t, 0);
  if (op <= 0.001) return null;
  let glowCss = '';
  if (l.glow && t >= l.glow.at && (l.glow.out === undefined || t < l.glow.out)) {
    const k = Math.min(1, (t - l.glow.at) / 0.3) * (l.glow.pulse === false ? 1 : 0.65 + 0.35 * Math.sin((t - l.glow.at) * 7));
    const s = l.glow.size ?? 14;
    glowCss = ` drop-shadow(0 0 ${s * k}px ${l.glow.color}) drop-shadow(0 0 ${s * 0.4 * k}px ${l.glow.color})`;
  }
  const filter = `${blur > 0 ? `blur(${blur}px)` : ''}${tint > 0 ? ` brightness(${1 - tint * 0.6})` : ''}${l.shadow ? ` drop-shadow(${l.shadow})` : ''}${glowCss}`.trim() || undefined;
  const base: React.CSSProperties = {position: 'absolute', opacity: op, zIndex: l.z ?? 1, filter};

  if (l.type === 'image' || l.type === 'video') {
    const style: React.CSSProperties = l.full
      ? {...base, left: 0, top: 0, width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${sc}) rotate(${rot}deg)`}
      : {...base, left: x, top: y, width: l.w, transformOrigin: '50% 100%', transform: `translate(-50%,-50%) translateY(${(1 - sy) * 0}px) scale(${sc}, ${sc * sy}) rotate(${rot}deg)`};
    if (l.type === 'image') return <Img src={src(l.src)} style={style} />;
    const rate = l.rate ?? 1;
    const clipT = (l.startFrom ?? 0) + t * rate;
    const vid = <OffthreadVideo src={src(l.src)} muted playbackRate={rate} startFrom={sec(l.startFrom ?? 0)} style={style} />;
    if (l.freezeAt !== undefined && clipT >= l.freezeAt) {
      return (
        <Freeze frame={Math.round(((l.freezeAt - (l.startFrom ?? 0)) / rate) * FPS)}>
          <OffthreadVideo src={src(l.src)} muted playbackRate={rate} startFrom={sec(l.startFrom ?? 0)} style={style} />
        </Freeze>
      );
    }
    return vid;
  }
  if (l.type === 'cutaway') {
    const c = l as CutawayLayer;
    const p = ev(c.piston, t, 0.3);
    const v = dev(c.piston, t);
    const flow = c.flowAt === undefined ? 0 : t < c.flowAt ? 0 : c.flowOut !== undefined ? interpolate(t, [c.flowOut, c.flowOut + 0.3], [1, 0], clamp) : 1;
    return (
      <div style={{...base, left: x, top: y, transform: `scale(${sc}) rotate(${rot}deg)`}}>
        <CutawaySVG h={c.h} p={p} v={v} oil={ev(c.oil, t, 1)} flow={flow * Math.min(1, 0.25 + Math.abs(v))} leak={c.leakAt === undefined ? -1 : t - c.leakAt} spring={!!c.spring} t={t} oilColor={c.oilColor} />
      </div>
    );
  }
  if (l.type === 'drips') {
    const d = l as DripsLayer;
    if (t < d.at) return null;
    return (
      <>
        {new Array(d.count ?? 5).fill(0).map((_, i) => {
          const life = ((t - d.at) * 0.6 + random(`dr${i}`)) % 1.3;
          const dx = d.area.x + (random(`dx${i}`) - 0.5) * d.area.w;
          const dy = d.area.y - d.area.h / 2 + life * d.area.h;
          const r = 9 + random(`dz${i}`) * 6;
          return (
            <svg key={i} width={r * 2} height={r * 3} viewBox="0 0 20 30" style={{...base, left: dx, top: dy, opacity: op * Math.min(1, 1.3 - life)}}>
              <path d="M10 0 C10 0 0 15 0 20 a10 10 0 0 0 20 0 C20 15 10 0 10 0Z" fill={d.color ?? '#4A2F0E'} stroke="#151515" strokeWidth={2} />
            </svg>
          );
        })}
      </>
    );
  }
  return null;
};

const ShotView: React.FC<{shot: Shot; isFirst: boolean}> = ({shot, isFirst}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const tf = shot.tf ?? 12;
  const tr = shot.transition ?? 'xfade';
  const fade = isFirst || tr === 'cut' ? 1 : interpolate(f, [0, tf], [0, 1], clamp);
  const cam = shot.camera ?? {};
  const cx = ev(cam.x, t, 540);
  const cy = ev(cam.y, t, 960);
  const z = ev(cam.zoom, t, 1);
  const r = ev(cam.rotate, t, 0);
  const sh = shake(t, cam.shakeAt);
  const dip = tr === 'dip' && !isFirst ? interpolate(f, [0, tf / 2, tf], [1, 1, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{opacity: fade, overflow: 'hidden', backgroundColor: '#1d1b18'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0',
        transform: `translate(${540 + sh.x}px, ${960 + sh.y}px) rotate(${r}deg) scale(${z}) translate(${-cx}px, ${-cy}px)`}}>
        {shot.layers.map((l, i) => <LayerView key={i} l={l} t={t} />)}
      </div>
      {dip > 0 && <AbsoluteFill style={{backgroundColor: '#000', opacity: dip}} />}
    </AbsoluteFill>
  );
};

/** Film finish: warm grade, vignette, animated paper grain. */
const Finish: React.FC<{grain: number; vignette: number; warmth: number}> = ({grain, vignette, warmth}) => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{background: `rgba(255,170,90,${warmth})`, mixBlendMode: 'soft-light', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 60% at 50% 48%, transparent 55%, rgba(10,6,2,${vignette}) 100%)`}} />
      <AbsoluteFill style={{opacity: grain, mixBlendMode: 'overlay'}}>
        <svg width="1080" height="1920">
          <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 8} /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="1080" height="1920" filter="url(#g)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

const Watermark: React.FC<{handle: string}> = ({handle}) => (
  <div style={{position: 'absolute', top: 118, right: 70, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Manrope, Inter, sans-serif',
    fontWeight: 800, fontSize: 30, color: 'rgba(255,255,255,0.92)', textShadow: '0 2px 6px rgba(0,0,0,0.55)'}}>
    <svg width={34} height={34} viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.35)" stroke="#fff" strokeWidth="1.6" /><path d="M7 15 l3-5 3 3 2-3 2 5z" fill="#FFCC40" stroke="#fff" strokeWidth="0.8" /></svg>
    {handle}
  </div>
);

export const totalFrames = (p: ToonProps) => Math.max(1, p.shots.reduce((a, s) => a + sec(s.dur), 0));

export const ToonReel: React.FC<ToonProps> = (p) => {
  let start = 0;
  const seqs = p.shots.map((s, i) => {
    const dur = sec(s.dur);
    const isLast = i === p.shots.length - 1;
    const nextTf = isLast ? 0 : p.shots[i + 1].transition === 'cut' ? 0 : p.shots[i + 1].tf ?? 12;
    const el = (
      <Sequence key={i} from={start} durationInFrames={dur + nextTf} name={s.name ?? `shot ${i + 1}`}>
        <ShotView shot={s} isFirst={i === 0} />
      </Sequence>
    );
    start += dur;
    return el;
  });
  return (
    <AbsoluteFill style={{backgroundColor: '#1d1b18'}}>
      {seqs}
      <Finish grain={p.grain ?? 0.07} vignette={p.vignette ?? 0.45} warmth={p.warmth ?? 0.08} />
      <Watermark handle={p.handle} />
      {!p.muteAll && p.voiceover && <Audio src={src(p.voiceover)} />}
    </AbsoluteFill>
  );
};

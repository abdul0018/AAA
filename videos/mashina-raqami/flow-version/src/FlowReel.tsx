/* Remake assembled from the user's Google Flow clips: retimed shots + tracked plate highlight rings + overlays. */
import React from 'react';
import {AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Plate, UI} from './Parts';

export type Word = {w: string; s: number; e: number};
type Shot = {i: number; src: string; from: number; to: number; dur: number; stretch: number};
export type FlowProps = {words: Word[]; handle: string; end: number; shots: Shot[]; tracks: Record<string, number[][]>};
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lin = (t: number, a: number, b: number, f = 0, to = 1, e: (x: number) => number = Easing.inOut(Easing.cubic)) => interpolate(t, [a, Math.max(a + 0.001, b)], [f, to], {...cl, easing: e});

/** Ring around part of a tracked plate. rel: centre offset (fraction of plate width from plate centre), rx/ry in plate units. */
const Ring: React.FC<{track: number[][]; local: number; stretch: number; at: number; hold?: number; dx: number; rx: number; ry: number}> = ({track, local, stretch, at, hold = 2.6, dx, rx, ry}) => {
  if (local < at - 0.05) return null;
  const idx = Math.min(track.length - 1, Math.max(0, Math.round((local / stretch) * 24)));
  const [cx, cy, w, h] = track[idx];
  const op = Math.min(lin(local, at - 0.05, at + 0.15), lin(local, at + hold, at + hold + 0.3, 1, 0));
  if (op <= 0) return null;
  const s = interpolate(local - at, [0, 0.12, 0.24], [1.35, 0.95, 1], cl);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <ellipse cx={cx + dx * w} cy={cy} rx={rx * w * s} ry={ry * h * s} fill="none" stroke="#F5C518" strokeWidth={6} opacity={op} style={{filter: 'drop-shadow(0 0 6px rgba(245,197,24,0.8))'}} />
    </svg>
  );
};

export const FlowReel: React.FC<FlowProps> = ({words, handle, end, shots, tracks}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const T = (w: string, n = 1) => { let k = 0; for (const x of words) if (x.w.toLowerCase().replace(/[.,:!?]+$/, '') === w) { k++; if (k === n) return x.s; } throw new Error('word ' + w); };
  const cur = shots.find((s) => t >= s.from && t < s.to) ?? shots[shots.length - 1];
  const local = t - cur.from;
  // gentle push-in through every shot (the clips already approach the car); a punch on the plate for "raqam sizniki emas"
  const push = 1 + 0.035 * lin(local, 0, cur.dur, 0, 1, Easing.inOut(Easing.sin));
  const punchT = T('raqam', 3);
  const punch = cur.i === 10 ? lin(t, punchT - 0.1, punchT + 0.6, 0, 0.22, Easing.out(Easing.cubic)) : 0;
  const price = cur.i === 9 ? Math.min(lin(t, T('narxi') - 0.15, T('narxi') + 0.2), lin(t, cur.to - 0.35, cur.to, 1, 0)) : 0;
  const nine = cur.i === 9 ? lin(t, T("to'qqizta") - 0.1, T("to'qqizta") + 0.3) : 0;
  const handleOp = (Math.floor(t / 9) % 2 === 1 && cur.i !== 9) ? 1 : 0;
  // flying plate (shot 11 = the same Cobalt without its plate)
  const fly = cur.i === 11 ? local : -1;
  return (
    <AbsoluteFill style={{background: '#CFC7B2', overflow: 'hidden'}}>
      {shots.map((s) => (
        <Sequence key={s.i} from={Math.round(s.from * fps)} durationInFrames={Math.round((s.to - s.from) * fps) + 1}>
          <AbsoluteFill style={{transform: `scale(${s.i === cur.i ? push + punch : 1})`, transformOrigin: s.i === 10 ? '50% 72%' : '50% 62%'}}>
            <OffthreadVideo src={staticFile(`clips/s${String(s.i).padStart(2, '0')}.mp4`)} muted style={{width: 1080, height: 1920, objectFit: 'cover'}} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 62%'}}>
        {cur.i === 2 && <Ring track={tracks.c11} local={local} stretch={cur.stretch} at={T('yashil') - cur.from} dx={-0.68} rx={0.2} ry={0.8} />}
        {cur.i === 3 && <Ring track={tracks.c1} local={local} stretch={cur.stretch} at={T('sty') - cur.from} dx={0.3} rx={0.19} ry={0.85} hold={2.2} />}
        {cur.i === 4 && <Ring track={tracks.c5} local={local} stretch={cur.stretch} at={T('dav') - cur.from} dx={0.24} rx={0.17} ry={0.8} />}
      </AbsoluteFill>
      {fly >= 0 && (() => {
        const k = lin(fly, 0, 1.0, 0, 1, Easing.in(Easing.quad));
        const x = 540 + 260 * k, y = 1425 + 900 * k, rot = -8 - 140 * k, sc = 1.93 * (1 - 0.35 * k);
        return (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <g transform={`translate(${x},${y}) rotate(${rot}) scale(${sc}) translate(-150,-33)`} opacity={1 - lin(fly, 0.8, 1.0)}>
              <Plate kind="std" text="A 482 KA" />
            </g>
          </svg>
        );
      })()}
      {price > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center', opacity: price, transform: `translateY(${(1 - price) * 16}px)`}}>
          <div style={{fontFamily: UI, fontWeight: 800, fontSize: 84, color: '#1d1d1d', textShadow: '0 2px 10px rgba(255,255,255,0.45)'}}>1 560 000 000 so'm</div>
          <div style={{fontFamily: UI, fontWeight: 700, fontSize: 30, color: '#2e2e2e'}}>auksiondagi narx, 2025-yil iyun</div>
          {nine > 0 && <div style={{marginTop: 18, fontFamily: UI, fontWeight: 800, fontSize: 44, color: '#1d1d1d', opacity: nine}}>= 9 ta Cobalt</div>}
        </div>
      )}
      <div style={{position: 'absolute', left: '50%', top: 1600, transform: 'translateX(-50%)', opacity: handleOp, padding: '8px 20px', borderRadius: 16, background: 'rgba(20,20,20,0.55)', fontFamily: UI, fontWeight: 800, fontSize: 30, color: '#fff'}}>◎ {handle}</div>
    </AbsoluteFill>
  );
};

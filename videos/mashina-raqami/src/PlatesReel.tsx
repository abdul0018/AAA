import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Avenue, CarRear, Plate, UI, type CarKind, type PlateKind} from './Parts';

export type Word = {w: string; s: number; e: number};
export type PlatesProps = {words: Word[]; handle: string; end: number};
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lin = (t: number, a: number, b: number, f = 0, to = 1, e: (x: number) => number = Easing.inOut(Easing.cubic)) => interpolate(t, [a, Math.max(a + 0.001, b)], [f, to], {...cl, easing: e});

type Shot = {at: number; car: CarKind; color: string; plate: PlateKind; region?: string; text: string; ringAt?: number; ringOn?: 'region' | 'suffix'; beacon?: boolean};

export const PlatesReel: React.FC<PlatesProps> = ({words, handle, end}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const T = (w: string, n = 1) => { let k = 0; for (const x of words) if (x.w.toLowerCase().replace(/[.,:!?]+$/, '') === w) { k++; if (k === n) return x.s; } throw new Error('word ' + w); };
  const shots: Shot[] = [
    {at: 0, car: 'sedan', color: '#ECE6D3', plate: 'std', text: 'A 482 KA'},
    {at: T('raqam'), car: 'sedan', color: '#D6D7D6', plate: 'yellow', text: 'H 048213'},
    {at: T('chapdagi'), car: 'suv', color: '#EFEFEA', plate: 'ev', text: 'B 271 EA', ringAt: T('yashil'), ringOn: 'region'},
    {at: T('oxirida'), car: 'van', color: '#F1ECDD', plate: 'std', text: '318 STY', ringAt: T('sty'), ringOn: 'suffix', beacon: true},
    {at: T('oxirida', 2), car: 'sedan', color: '#3A3936', plate: 'std', text: '024 DAV', ringAt: T('dav'), ringOn: 'suffix'},
    {at: T('paa'), car: 'sedan', color: '#34332F', plate: 'flag', text: 'PAA 215'},
    {at: T('ppp'), car: 'sedan', color: '#46474A', plate: 'flag', text: 'PPP 164'},
    {at: T('hudud', 2), car: 'lux', color: '#2C2C2E', plate: 'flag', text: 'APC 031'},
    {at: T('yashil', 2), car: 'lux', color: '#2B3550', plate: 'cmd', text: 'CMD 4501'},
    {at: T('auksionda'), car: 'lux', color: '#F0ECE0', plate: 'std', region: '10', text: '777 ZZZ'},
    {at: T('lekin', 2), car: 'sedan', color: '#ECE6D3', plate: 'std', text: 'A 482 KA'},
  ];
  let k = 0; shots.forEach((s, i) => { if (t >= s.at) k = i; });
  const sh = shots[k];
  const next = k + 1 < shots.length ? shots[k + 1].at : end;
  const local = t - sh.at;
  // camera: lane change into the shot (car slides in), then slow push-in on the plate
  const enter = k === 0 ? 1 : lin(local, 0, 0.55, 0, 1, Easing.out(Easing.cubic));
  const slideX = (1 - enter) * (k % 2 ? 900 : -900);
  const push = 1 + 0.12 * lin(t, sh.at + 0.5, next, 0, 1, Easing.inOut(Easing.sin));
  const sway = Math.sin(t * 0.7) * 18;
  const bob = Math.sin(t * 7.3) * 2.5 + Math.sin(t * 2.1) * 3;
  const persp = (1 - enter) * (k % 2 ? -10 : 10);
  // the plate's final act: it lifts off, spins, vanishes (seller didn't apply), then the plate returns at the end
  let lift = 0, rot = 0, op = 1;
  if (k === shots.length - 1) {
    const a = T('raqam', 3), b = T('ariza'), c = T('mashinangiz');
    lift = lin(t, a, a + 0.6, 0, 150, Easing.out(Easing.back(1.4)));
    rot = lin(t, b + 0.6, b + 1.4, 0, -78);
    op = t < b + 1.3 ? 1 : t < c ? 0 : lin(t, c, c + 0.3);
    if (t >= c) { lift = 0; rot = 0; }
  }
  const ring = sh.ringAt !== undefined ? lin(t, sh.ringAt - 0.1, sh.ringAt + 0.2) : 0;
  const price = k === 9 ? lin(t, T('narxi') - 0.15, T('narxi') + 0.2) * lin(t, T('lekin', 2) - 0.3, T('lekin', 2), 1, 0) : 0;
  const cobalts = k === 9 ? lin(t, T("to'qqizta") - 0.1, T("to'qqizta") + 0.3) : 0;
  const brake = k === 4 || k === 7 ? 0 : (local % 6 < 1.1 ? 1 : 0) * (k % 3 === 0 ? 1 : 0);
  const handleOp = Math.floor(t / 9) % 2 === 1 ? 1 : 0;

  return (
    <AbsoluteFill style={{background: '#DDD6C2', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 62%'}}>
        <Avenue t={t} sway={sway} />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <g transform={`translate(${-35 + slideX + sway * 0.3},${560 + bob}) skewX(${persp}) scale(1.15)`}>
            <CarRear kind={sh.car} color={sh.color} t={t} brake={brake} beacon={sh.beacon} plateLift={lift} plateRot={rot} plateOpacity={op}
              plate={<Plate kind={sh.plate} region={sh.region} text={sh.text} ring={ring} ringOn={sh.ringOn} />} />
          </g>
          <rect y={1460} width={1080} height={460} fill="#3A3936" opacity={0} />
        </svg>
      </AbsoluteFill>
      {price > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', opacity: price, transform: `translateY(${(1 - price) * 20}px)`}}>
          <div style={{fontFamily: UI, fontWeight: 800, fontSize: 84, color: '#1d1d1d', textShadow: '0 2px 0 rgba(255,255,255,0.5)'}}>1 560 000 000 so'm</div>
          <div style={{fontFamily: UI, fontWeight: 700, fontSize: 30, color: '#3a3a3a'}}>auksiondagi narx, 2025-yil iyun</div>
        </div>
      )}
      {cobalts > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', opacity: cobalts, fontFamily: UI, fontWeight: 800, fontSize: 46, color: '#1d1d1d'}}>
          = {new Array(9).fill(0).map((_, i) => <svg key={i} width={70} height={38} viewBox="0 0 70 38" style={{margin: '0 2px', verticalAlign: 'middle', opacity: lin(t, T("to'qqizta") + i * 0.06, T("to'qqizta") + i * 0.06 + 0.15)}}><path d="M4,28 L6,18 Q8,14 14,13 L22,6 Q26,3 34,3 L48,3 Q54,3 58,10 L64,14 Q68,16 68,22 L68,28 Z" fill="#1d1d1d" /><circle cx={18} cy={30} r={6} fill="#1d1d1d" stroke="#DDD6C2" strokeWidth={2} /><circle cx={54} cy={30} r={6} fill="#1d1d1d" stroke="#DDD6C2" strokeWidth={2} /></svg>)} Cobalt
        </div>
      )}
      <div style={{position: 'absolute', left: '50%', top: 1560, transform: 'translateX(-50%)', opacity: handleOp * 0.95, padding: '8px 20px', borderRadius: 16, background: 'rgba(20,20,20,0.55)', fontFamily: UI, fontWeight: 800, fontSize: 30, color: '#fff'}}>◎ {handle}</div>
    </AbsoluteFill>
  );
};

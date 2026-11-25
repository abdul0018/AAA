import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Street, Car, Pedal, Speedo, BUMP_X, L, R, TRAVEL, roadY, type CarPose} from './Scene';
import {CutawaySVG} from './Cutaway';
import {UI} from './fonts';

export type Word = {w: string; s: number; e: number};
export type BumpProps = {words: Word[]; handle: string; end: number};
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lin = (t: number, a: number, b: number, f = 0, to = 1, e: (x: number) => number = Easing.inOut(Easing.cubic)) => interpolate(t, [a, Math.max(a + 0.001, b)], [f, to], {...cl, easing: e});
const kf = (t: number, keys: [number, number][], e: (x: number) => number = Easing.inOut(Easing.cubic)) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) return lin(t, keys[i - 1][0], keys[i][0], keys[i - 1][1], keys[i][1], e);
  return keys[keys.length - 1][1];
};

/** Front body height from the suspension model: base dive + forced lift when the spring runs out of travel. */
const frontY = (base: number, xF: number, t: number, hitT: number | null, harsh: boolean) => {
  const dz = -roadY(xF); // wheel lift on the bump
  const over = Math.max(0, base + dz - TRAVEL); // travel left over -> body is shoved up
  let y = base - over - dz * (harsh ? 0.25 : 0.1);
  if (hitT !== null && t > hitT) {
    const d = t - hitT;
    y += (harsh ? 16 : 3) * Math.exp(-d * (harsh ? 4 : 6)) * Math.sin(d * 22);
  }
  return y;
};

const Caption: React.FC<{t: number; at: number; out: number; text: string; color?: string; y?: number; size?: number}> = ({t, at, out, text, color = '#fff', y = 250, size = 74}) => {
  const op = Math.min(lin(t, at, at + 0.2), lin(t, out - 0.15, out, 1, 0));
  if (op <= 0) return null;
  const s = interpolate(t - at, [0, 0.14, 0.26], [0.85, 1.04, 1], cl);
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: y, textAlign: 'center', opacity: op, transform: `scale(${s})`, fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.08, color, letterSpacing: -0.5, textTransform: 'uppercase', whiteSpace: 'pre-line',
      textShadow: '0 0 2px #1d1d20, 0 4px 0 #1d1d20, 3px 3px 0 #1d1d20, -3px 3px 0 #1d1d20, 3px -3px 0 #1d1d20, -3px -3px 0 #1d1d20, 0 10px 30px rgba(0,0,0,0.5)'}}>
      {text}
    </div>
  );
};
const Tag: React.FC<{t: number; at: number; out: number; text: string; bg: string; x: number; y: number}> = ({t, at, out, text, bg, x, y}) => {
  const op = Math.min(lin(t, at, at + 0.15), lin(t, out - 0.15, out, 1, 0));
  if (op <= 0) return null;
  const s = interpolate(t - at, [0, 0.12, 0.22], [0.6, 1.08, 1], cl);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: op, padding: '12px 28px', borderRadius: 18, background: bg, border: '4px solid #1d1d20', fontFamily: UI, fontWeight: 800, fontSize: 42, color: '#1d1d20', whiteSpace: 'nowrap', boxShadow: '0 6px 0 #1d1d20'}}>{text}</div>;
};

type Cam = {cx: number; cy: number; s: number};
const World: React.FC<{cam: Cam; pose: CarPose; shake?: number; t: number}> = ({cam, pose, shake = 0, t}) => {
  const sx = shake * Math.sin(t * 61) * 10, sy = shake * Math.cos(t * 47) * 8;
  const half = 540 / cam.s;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(${540 + sx},${1180 + sy}) scale(${cam.s}) translate(${-cam.cx},${-cam.cy})`}>
        <Street x0={cam.cx - half} x1={cam.cx + half} />
        <Car pose={pose} />
      </g>
    </svg>
  );
};

export const BumpReel: React.FC<BumpProps> = ({words, handle, end}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const T = (w: string, n = 1) => { let k = 0; for (const x of words) if (x.w.toLowerCase().replace(/[.,:!?]+$/, '') === w) { k++; if (k === n) return x.s; } throw new Error('word ' + w); };
  const c = [0, T('tormozni'), T('tormoz'), T('old'), T("do'nglikka"), T("to'g'risi"), T("g'ildirak"), T('mashina', 2), T('endi'), T('silkinish'), T('siz'), end];
  const sc = c.findIndex((x, i) => t >= x && t < c[i + 1]);
  const rot = (x: number) => (x / R) * (180 / Math.PI);
  const pose = (x: number, yR: number, yF: number, brake: number, xray: number, flash = 0): CarPose => ({x, xr: 0, yRear: yR, yFront: yF, brake, xray, flash, wheelRot: rot(x)});
  let body: React.ReactNode = null;
  const cut = sc >= 0 ? t - c[sc] : 0;
  const punch = interpolate(cut, [0, 0.25], [1.04, 1], cl);

  if (sc === 0) { // HOOK: the car drives toward the speed bump
    const x = kf(t, [[0, 300], [c[1], 820]], Easing.linear);
    body = <World t={t} cam={{cx: kf(t, [[0, 560], [c[1], 1150]]), cy: -200, s: 1.25}} pose={pose(x, 0, 0, 0, 0)} />;
  } else if (sc === 1) { // foot presses the brake all the way
    body = <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><g transform="translate(540,960)"><Pedal press={lin(t, c[1] + 0.3, c[1] + 0.8)} /></g></svg>;
  } else if (sc === 2) { // nose dives, then the x-ray reveals it
    const x = kf(t, [[c[2], 980], [c[3], 1080]], Easing.out(Easing.quad));
    const d = lin(t, c[2] + 0.2, c[2] + 0.8, 0, 1, Easing.out(Easing.back(1.8)));
    body = <World t={t} cam={{cx: kf(t, [[c[2], 1250], [c[3], 1330]]), cy: -170, s: 1.25}} pose={pose(x, -6 * d, 18 * d, 1, lin(t, T('old') - 1.3, T('old') - 0.4))} />;
  } else if (sc === 3) { // close on the front spring: squeezed
    const x = 1080;
    body = <World t={t} cam={{cx: kf(t, [[c[3], x + L - 40], [c[4], x + L - 20]]), cy: -120, s: kf(t, [[c[3], 2.0], [c[4], 2.25]])}} pose={pose(x, -6, 18, 1, 1)} />;
  } else if (sc === 4) { // hits the bump with no travel left
    const hit = T('urilganda') + 0.2;
    const x = kf(t, [[c[4], BUMP_X - L - 70], [hit, BUMP_X - L - 22], [c[5], BUMP_X - L + 60]], Easing.linear);
    const yF = frontY(18, x + L, t, t > hit ? hit : null, true);
    const fl = lin(t, hit, hit + 0.12) * lin(t, hit + 0.15, hit + 0.8, 1, 0);
    body = <World t={t} shake={lin(t, hit, hit + 0.05) * lin(t, hit + 0.1, hit + 0.6, 1, 0)} cam={{cx: kf(t, [[c[4], BUMP_X - 120], [c[5], BUMP_X - 60]]), cy: -150, s: 1.55}} pose={pose(x, -6, yF, 1, 1, fl)} />;
  } else if (sc === 5) { // the right way: slow down early
    const x = kf(t, [[c[5], 420], [c[6], 860]], Easing.out(Easing.quad));
    body = (<>
      <World t={t} cam={{cx: kf(t, [[c[5], 900], [c[6], 1120]]), cy: -200, s: 1.25}} pose={pose(x, 0, lin(t, c[5] + 0.6, c[5] + 1.2, 0, 10), 1, 0)} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><g transform="translate(860,620)"><Speedo kmh={kf(t, [[c[5], 45], [c[6] - 0.3, 12]])} /></g></svg>
    </>);
  } else if (sc === 6) { // release the brake just before the bump
    body = <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><g transform="translate(540,960)"><Pedal press={1 - lin(t, T("qo'yib") - 0.15, T("qo'yib") + 0.35, 0, 1, Easing.out(Easing.cubic))} /></g></svg>;
  } else if (sc === 7) { // nose rises, spring opens fully
    const x = kf(t, [[c[7], 1030], [c[8], 1090]], Easing.linear);
    const up = lin(t, T('burni') - 0.1, T('burni') + 0.5, 0, 1, Easing.out(Easing.back(1.6)));
    body = <World t={t} cam={{cx: 1300, cy: -150, s: 1.45}} pose={pose(x, -6 + 6 * up, 18 - 21 * up + 3 * lin(t, T('ochiladi'), T('ochiladi') + 0.6), 0, 1)} />;
  } else if (sc === 8) { // the shock absorbs with its full stroke
    const p = 0.5 + 0.5 * Math.sin((t - c[8]) * 3.2 - Math.PI / 2);
    const v = 0.5 * 3.2 * Math.cos((t - c[8]) * 3.2 - Math.PI / 2);
    body = (
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #EADCC2 0%, #B9A98E 100%)'}}>
        <div style={{position: 'absolute', left: 540, top: 1180}}><CutawaySVG h={860} p={p} v={v} oil={1} flow={1} leak={-1} spring t={t} /></div>
      </AbsoluteFill>
    );
  } else if (sc === 9) { // smooth crossing
    const hit = c[9] + 0.6;
    const x = kf(t, [[c[9], BUMP_X - L - 110], [c[10], BUMP_X + 60]], Easing.linear);
    const yF = frontY(0, x + L, t, t > hit ? hit : null, false);
    const yR = -roadY(x) * -0.1;
    body = <World t={t} cam={{cx: kf(t, [[c[9], BUMP_X - 60], [c[10], BUMP_X + 80]]), cy: -170, s: 1.2}} pose={pose(x, yR, yF, 0, 0.85)} />;
  } else { // CTA wide
    const x = kf(t, [[c[10], BUMP_X + 40], [end, BUMP_X + 520]], Easing.linear);
    body = <World t={t} cam={{cx: kf(t, [[c[10], BUMP_X + 220], [end, BUMP_X + 520]]), cy: -200, s: 1.2}} pose={pose(x, -roadY(x) * 0.1, frontY(0, x + L, t, null, false), 0, 0)} />;
  }

  const handleTag = (
    <div style={{position: 'absolute', right: 40, top: 60, padding: '8px 18px', borderRadius: 14, background: 'rgba(29,29,32,0.55)', fontFamily: UI, fontWeight: 800, fontSize: 26, color: '#fff'}}>{handle}</div>
  );
  return (
    <AbsoluteFill style={{background: '#EADCC2', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${punch})`}}>{body}</AbsoluteFill>
      {/* captions (key ideas only) */}
      <Caption t={t} at={0.1} out={c[1]} text={'Lejachiyda\nko\'pchilik xato qiladi'} />
      <Caption t={t} at={c[1]} out={c[2]} text="Tormozni bosib turadi" />
      <Caption t={t} at={c[2]} out={c[3]} text="Mashina engashadi" />
      <Caption t={t} at={c[3]} out={c[4]} text="Prujina siqilgan" color="#FF6A55" />
      <Caption t={t} at={c[4]} out={c[5]} text={'Zarba kuzovga'} color="#FF6A55" />
      <Caption t={t} at={c[5]} out={c[6]} text={"To'g'risi:\noldindan sekinlang"} color="#8BE07A" />
      <Caption t={t} at={c[6]} out={c[7]} text={"Do'nglikdan oldin\ntormozni qo'yib yuboring"} color="#8BE07A" />
      <Caption t={t} at={c[7]} out={c[8]} text={"Prujina to'liq ochiladi"} color="#8BE07A" />
      <Caption t={t} at={c[8]} out={c[9]} text={"Amortizator\nbutun yo'li bilan"} />
      <Caption t={t} at={c[9]} out={c[10]} text="Silkinish kam" color="#8BE07A" />
      <Caption t={t} at={c[10]} out={end} text={"Siz tormozni\nqo'yib yuborasizmi?"} />
      <Tag t={t} at={c[1] + 0.2} out={c[5]} text="✗ XATO" bg="#FF6A55" x={540} y={1720} />
      <Tag t={t} at={c[5] + 0.2} out={c[10]} text="✓ TO'G'RI" bg="#8BE07A" x={540} y={1720} />
      {handleTag}
    </AbsoluteFill>
  );
};

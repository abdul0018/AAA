/* Illustrated side-view world (cel-shaded, ink outlines): Uzbek street with a cream wall, a yellow gas pipe,
   low-poly trees, asphalt and a yellow-black speed bump, plus a white sedan whose body can turn x-ray to show
   the red coil spring and blue shock absorber. World units: road surface at y = 0, x grows to the right. */
import React from 'react';
import {random} from 'remotion';

export const INK = '#2A2A2E';
export const BUMP_X = 1500; // centre of the speed bump in world px
export const BUMP_W = 120;
export const BUMP_H = 26;
export const roadY = (x: number) => {
  const d = Math.abs(x - BUMP_X);
  if (d > BUMP_W / 2) return 0;
  const k = Math.cos((d / (BUMP_W / 2)) * (Math.PI / 2));
  return -BUMP_H * k * k; // up is negative
};

/* ------------------------------------------------------------------ the street (draw in world coords) */
const Tree: React.FC<{x: number; s?: number; seed: string}> = ({x, s = 1, seed}) => {
  const h = 290 * s, r = 105 * s;
  const cy = -60 - h;
  const pts = (n: number, rr: number, ox: number, oy: number) =>
    new Array(n).fill(0).map((_, i) => { const a = (i / n) * Math.PI * 2 + random(seed + i) * 0.4; const q = rr * (0.82 + random(seed + 'r' + i) * 0.3); return `${(x + ox + Math.cos(a) * q).toFixed(1)},${(cy + oy + Math.sin(a) * q * 1.08).toFixed(1)}`; }).join(' ');
  return (
    <g>
      <path d={`M${x - 9 * s},-60 L${x - 6 * s},${cy + r * 0.6} L${x + 6 * s},${cy + r * 0.6} L${x + 9 * s},-60 Z`} fill="#7A5A3C" stroke={INK} strokeWidth={3} />
      <polygon points={pts(9, r, 0, 0)} fill="#4E9A3A" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <polygon points={pts(7, r * 0.62, -r * 0.25, -r * 0.25)} fill="#6DB548" />
      <polygon points={pts(6, r * 0.38, r * 0.3, r * 0.2)} fill="#3F8530" opacity={0.9} />
    </g>
  );
};

export const Street: React.FC<{x0: number; x1: number}> = ({x0, x1}) => {
  const from = Math.floor(x0 / 160) * 160 - 320, to = x1 + 320;
  const brackets: React.ReactNode[] = [], cracks: React.ReactNode[] = [], panels: React.ReactNode[] = [];
  for (let x = from; x < to; x += 160) brackets.push(<rect key={x} x={x} y={-432} width={10} height={30} fill="#9A9A9A" stroke={INK} strokeWidth={2} />);
  for (let x = Math.floor(x0 / 260) * 260 - 260; x < to; x += 260) panels.push(<line key={x} x1={x} y1={-760} x2={x} y2={-70} stroke="#D9CDB4" strokeWidth={4} />);
  for (let x = Math.floor(x0 / 300) * 300 - 300; x < to; x += 300) {
    const sx = x + random(`c${x}`) * 120;
    cracks.push(<path key={x} d={`M${sx},${40 + random(`d${x}`) * 120} l40,10 l20,-14 l34,18`} stroke="#3A3B40" strokeWidth={3} fill="none" opacity={0.55} />);
  }
  const trees: React.ReactNode[] = [];
  for (let x = Math.floor(x0 / 420) * 420 - 420; x < to; x += 420) trees.push(<Tree key={x} x={x + 140} s={0.9 + random(`t${x}`) * 0.25} seed={`t${x}`} />);
  // the bump: a dome with yellow/black stripes
  const bump: string[] = [];
  for (let i = 0; i <= 24; i++) { const x = BUMP_X - BUMP_W / 2 + (i / 24) * BUMP_W; bump.push(`${x.toFixed(1)},${roadY(x).toFixed(1)}`); }
  const stripes = [0, 1, 2, 3, 4, 5].map((i) => {
    const xa = BUMP_X - BUMP_W / 2 + (i / 6) * BUMP_W, xb = xa + BUMP_W / 6;
    return <polygon key={i} points={`${xa},2 ${xa},${roadY(xa)} ${(xa + xb) / 2},${roadY((xa + xb) / 2)} ${xb},${roadY(xb)} ${xb},2`} fill={i % 2 ? '#2B2B2B' : '#F2C230'} />;
  });
  return (
    <g>
      <rect x={from} y={-1600} width={to - from} height={900} fill="#F4E9D6" />
      <rect x={from} y={-760} width={to - from} height={700} fill="#EADCC2" />
      {panels}
      <rect x={from} y={-120} width={to - from} height={60} fill="#D9C9AA" />
      {/* gas pipe */}
      <rect x={from} y={-442} width={to - from} height={22} fill="#F2C230" stroke={INK} strokeWidth={3} />
      <rect x={from} y={-440} width={to - from} height={6} fill="#FFE58A" />
      {brackets}
      {[from + 520, from + 1700, from + 2900].map((x) => <g key={x}><rect x={x} y={-442} width={22} height={320} fill="#F2C230" stroke={INK} strokeWidth={3} /><rect x={x - 8} y={-160} width={38} height={20} fill="#D9A21E" stroke={INK} strokeWidth={2} /></g>)}
      {/* gate */}
      <rect x={from + 980} y={-430} width={220} height={370} fill="#2F7E92" stroke={INK} strokeWidth={4} />
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={from + 1000 + i * 45} y1={-420} x2={from + 1000 + i * 45} y2={-70} stroke="#256A7B" strokeWidth={6} />)}
      {trees}
      {/* sidewalk + curb */}
      <rect x={from} y={-70} width={to - from} height={52} fill="#B9A98E" />
      <rect x={from} y={-26} width={to - from} height={26} fill="#9C9C98" stroke={INK} strokeWidth={3} />
      {/* asphalt */}
      <rect x={from} y={0} width={to - from} height={700} fill="#4B4D53" />
      <rect x={from} y={0} width={to - from} height={10} fill="#5C5E65" />
      {cracks}
      <polygon points={`${BUMP_X - BUMP_W / 2},2 ${bump.join(' ')} ${BUMP_X + BUMP_W / 2},2`} fill="#2B2B2B" stroke={INK} strokeWidth={3} />
      {stripes}
      <polyline points={bump.join(' ')} fill="none" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/* ------------------------------------------------------------------ the sedan */
export const R = 50; // wheel radius
export const L = 340; // wheelbase
export const TRAVEL = 34; // usable front spring travel (px) before it bottoms out

const Wheel: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <circle r={R} fill="#26272B" stroke={INK} strokeWidth={4} />
    <circle r={R * 0.64} fill="#C9CDD2" stroke={INK} strokeWidth={3} />
    {[0, 72, 144, 216, 288].map((a) => <rect key={a} x={-4} y={-R * 0.6} width={8} height={R * 0.5} rx={3} fill="#9FA5AC" transform={`rotate(${a})`} />)}
    <circle r={R * 0.16} fill="#7D838A" stroke={INK} strokeWidth={2} />
  </g>
);

const Spring: React.FC<{x1: number; y1: number; x2: number; y2: number; w: number; coils?: number}> = ({x1, y1, x2, y2, w, coils = 7}) => {
  const n = coils * 2;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, px = -uy, py = ux;
  const pts: string[] = [`${x1},${y1}`];
  for (let i = 1; i < n; i++) { const t = i / n; const s = (i % 2 ? 1 : -1) * w / 2; pts.push(`${(x1 + dx * t + px * s).toFixed(1)},${(y1 + dy * t + py * s).toFixed(1)}`); }
  pts.push(`${x2},${y2}`);
  return (
    <g>
      <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={11} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={pts.join(' ')} fill="none" stroke="#E23B2E" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
};
const Shock: React.FC<{x1: number; y1: number; x2: number; y2: number}> = ({x1, y1, x2, y2}) => {
  // body (blue) from the lower mount up 58 px, chrome rod to the top mount
  const len = Math.hypot(x2 - x1, y2 - y1), a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g transform={`translate(${x1},${y1}) rotate(${a})`}>
      <rect x={0} y={-4} width={len} height={8} rx={4} fill="#D7DCE1" stroke={INK} strokeWidth={2.5} />
      <rect x={0} y={-12} width={Math.min(len - 6, 62)} height={24} rx={6} fill="#3B78C4" stroke={INK} strokeWidth={3} />
      <circle r={8} fill="#7D838A" stroke={INK} strokeWidth={2.5} />
      <circle cx={len} r={8} fill="#7D838A" stroke={INK} strokeWidth={2.5} />
    </g>
  );
};

/** Body outline of a compact white sedan (Cobalt-like), local coords: rear axle at (0,0), facing right, up = -y. */
const BODY = 'M-112,16 L-120,-26 L-114,-64 L-62,-72 L-30,-74 L40,-150 L214,-153 L300,-84 L432,-72 L460,-50 L466,-4 L452,16 L404,16 A64,64 0 0 0 276,16 L64,16 A64,64 0 0 0 -64,16 Z';
export type CarPose = {x: number; xr: number; yRear: number; yFront: number; brake: number; xray: number; flash: number; wheelRot: number; impact?: number};

export const Car: React.FC<{pose: CarPose; showRear?: boolean}> = ({pose, showRear = true}) => {
  const {x, yRear, yFront, xray, brake, flash, wheelRot} = pose;
  const pitch = (Math.atan2(yFront - yRear, L) * 180) / Math.PI;
  const hubR = {x, y: roadY(x) - R}, hubF = {x: x + L, y: roadY(x + L) - R};
  // body mounts (local) -> world
  const toW = (lx: number, ly: number) => {
    const a = (pitch * Math.PI) / 180;
    return {x: x + lx * Math.cos(a) - ly * Math.sin(a), y: -R + yRear + lx * Math.sin(a) + ly * Math.cos(a)};
  };
  const topF = toW(L - 6, -112), topR = toW(6, -112);
  const bodyOp = 1 - 0.7 * xray;
  return (
    <g>
      {/* shadow */}
      <ellipse cx={x + L / 2} cy={6} rx={330} ry={14} fill="rgba(0,0,0,0.35)" />
      {xray > 0.01 && (
        <g opacity={Math.min(1, xray * 1.4)}>
          {showRear && <><Shock x1={hubR.x} y1={hubR.y} x2={topR.x} y2={topR.y} /><Spring x1={hubR.x + 4} y1={hubR.y - 14} x2={topR.x + 4} y2={topR.y + 6} w={34} /></>}
          <Shock x1={hubF.x} y1={hubF.y} x2={topF.x} y2={topF.y} />
          <Spring x1={hubF.x - 4} y1={hubF.y - 14} x2={topF.x - 4} y2={topF.y + 6} w={36} />
          {/* lower arm */}
          <line x1={hubF.x} y1={hubF.y} x2={hubF.x - 120} y2={hubF.y - 8} stroke={INK} strokeWidth={14} strokeLinecap="round" />
          <line x1={hubF.x} y1={hubF.y} x2={hubF.x - 120} y2={hubF.y - 8} stroke="#6E747B" strokeWidth={8} strokeLinecap="round" />
          {flash > 0 && <circle cx={topF.x} cy={topF.y} r={30 + 60 * flash} fill="#FF5A3C" opacity={0.75 * flash} style={{filter: 'blur(6px)'}} />}
        </g>
      )}
      <Wheel x={hubR.x} y={hubR.y} rot={wheelRot} />
      <Wheel x={hubF.x} y={hubF.y} rot={wheelRot} />
      <g transform={`translate(${x},${-R + yRear}) rotate(${pitch})`}>
        <path d={BODY} fill={xray > 0.5 ? '#9AA1A8' : '#F4F4F2'} fillOpacity={bodyOp} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        {/* lower shading band + highlight */}
        <path d="M-116,-6 L466,-6 L466,-2 L452,16 L404,16 A64,64 0 0 0 276,16 L64,16 A64,64 0 0 0 -64,16 L-112,16 Z" fill="#D8DADC" opacity={bodyOp} />
        <path d="M-108,-48 L456,-46" stroke="#FFFFFF" strokeWidth={5} opacity={0.8 * bodyOp} />
        {/* windows */}
        <path d="M-14,-80 L44,-140 L118,-142 L118,-82 Z" fill="#2F3D50" opacity={xray > 0.5 ? 0.25 : 0.95} stroke={INK} strokeWidth={3} />
        <path d="M128,-82 L128,-143 L208,-144 L284,-86 Z" fill="#2F3D50" opacity={xray > 0.5 ? 0.25 : 0.95} stroke={INK} strokeWidth={3} />
        <path d="M60,-134 L104,-136 L66,-96 Z" fill="#5A6E86" opacity={0.6 * bodyOp} />
        {/* door lines, handles, mirror */}
        <path d="M124,-78 L124,8 M276,-80 L282,0" stroke={INK} strokeWidth={2.5} opacity={0.8} fill="none" />
        <rect x={84} y={-66} width={26} height={7} rx={3} fill="#B9BDC1" stroke={INK} strokeWidth={2} />
        <rect x={236} y={-66} width={26} height={7} rx={3} fill="#B9BDC1" stroke={INK} strokeWidth={2} />
        <path d="M282,-86 l20,-6 l6,14 l-22,2 z" fill="#F4F4F2" fillOpacity={bodyOp} stroke={INK} strokeWidth={2.5} />
        {/* lights */}
        <path d="M426,-66 L456,-54 L454,-40 L424,-46 Z" fill="#F7F3D7" stroke={INK} strokeWidth={2.5} />
        <path d="M-118,-56 L-96,-60 L-92,-36 L-116,-32 Z" fill={brake > 0.5 ? '#FF2A1E' : '#B8322A'} stroke={INK} strokeWidth={2.5} />
        {brake > 0.01 && <circle cx={-110} cy={-46} r={40} fill="#FF3B2E" opacity={0.45 * brake} style={{filter: 'blur(10px)'}} />}
        {/* x-ray: seat silhouettes + engine block */}
        {xray > 0.3 && <g opacity={xray} fill="none" stroke="#E9EDF1" strokeWidth={3}>
          <path d="M60,-30 L60,-112 L84,-116 L90,-40 L150,-40" /><path d="M190,-30 L190,-110 L214,-114 L220,-40 L270,-40" />
          <rect x={330} y={-66} width={86} height={50} rx={8} />
        </g>}
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ foot on the brake pedal (close-up) */
export const Pedal: React.FC<{press: number}> = ({press}) => {
  const a = 4 + press * 20; // pedal rotation (deg)
  return (
    <g>
      <defs><radialGradient id="fw" cx="50%" cy="40%" r="70%"><stop offset="0" stopColor="#4A4D55" /><stop offset="1" stopColor="#1C1D22" /></radialGradient></defs>
      <rect x={-540} y={-960} width={1080} height={1920} fill="url(#fw)" />
      <path d="M-540,420 L540,300 L540,960 L-540,960 Z" fill="#2A2B30" />
      <path d="M-540,420 L540,300" stroke="#55585F" strokeWidth={6} />
      {/* pedal arm + pad (pivot at top) */}
      <g transform={`translate(80,-520) rotate(${a})`}>
        <rect x={-16} y={0} width={32} height={620} rx={14} fill="#6E747B" stroke={INK} strokeWidth={5} />
        <rect x={-120} y={580} width={240} height={120} rx={26} fill="#3A3D43" stroke={INK} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={-96} y={600 + i * 24} width={192} height={10} rx={5} fill="#24262A" />)}
        {/* shoe resting on the pad */}
        <g transform={`translate(0,${560 - press * 6}) rotate(${-a - 28})`}>
          <path d="M-520,-120 L-200,-160 L80,-120 Q190,-100 200,-30 Q200,20 120,30 L-520,40 Z" fill="#5B4636" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M-520,40 L120,30 Q200,20 200,-10" fill="none" stroke="#E9E2D6" strokeWidth={22} strokeLinecap="round" />
          <path d="M-60,-150 L-40,-110 M0,-145 L20,-108 M60,-135 L76,-100" stroke="#E9E2D6" strokeWidth={8} strokeLinecap="round" />
          <path d="M-520,-120 L-760,-260 L-860,-80 L-520,40 Z" fill="#5E6670" stroke={INK} strokeWidth={6} />
        </g>
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ speedometer badge */
export const Speedo: React.FC<{kmh: number}> = ({kmh}) => {
  const k = Math.min(1, kmh / 60);
  const a = (-210 + 240 * k) * (Math.PI / 180);
  return (
    <g>
      <circle r={110} fill="rgba(25,26,30,0.88)" stroke="#F2C230" strokeWidth={6} />
      {new Array(7).fill(0).map((_, i) => { const b = (-210 + i * 40) * (Math.PI / 180); return <line key={i} x1={Math.cos(b) * 80} y1={Math.sin(b) * 80} x2={Math.cos(b) * 96} y2={Math.sin(b) * 96} stroke="#fff" strokeWidth={5} />; })}
      <line x1={0} y1={0} x2={Math.cos(a) * 78} y2={Math.sin(a) * 78} stroke="#FF4D3A" strokeWidth={8} strokeLinecap="round" />
      <circle r={12} fill="#fff" />
    </g>
  );
};

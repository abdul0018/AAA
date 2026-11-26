/* Chase-cam world (sky, poplar avenue, road in perspective), four car-rear types and Uzbek number plates, all SVG. */
import React from 'react';
import {continueRender, delayRender, random, staticFile} from 'remotion';

if (typeof document !== 'undefined') {
  const h = delayRender('fonts');
  const faces: Array<[string, string, string]> = [
    ['Plate', 'fonts/oswald-latin-600-normal.woff2', '600'], ['Plate', 'fonts/oswald-latin-700-normal.woff2', '700'],
    ['Manrope', 'fonts/Manrope-latin.woff2', '200 800'], ['Manrope', 'fonts/Manrope-latin-ext.woff2', '200 800'],
  ];
  Promise.all(faces.map(([fam, f, w]) => { const ff = new FontFace(fam, `url(${staticFile(f)}) format('woff2')`, {weight: w}); document.fonts.add(ff); return ff.load(); }))
    .catch((e) => console.warn(e)).finally(() => continueRender(h));
}
export const UI = "Manrope, Arial, sans-serif";
const PF = "Plate, 'Arial Narrow', sans-serif";

/* ------------------------------------------------------------------ world */
const HZ = 700; // horizon y
export const Avenue: React.FC<{t: number; speed?: number; sway?: number}> = ({t, speed = 9, sway = 0}) => {
  const f = 520; // focal
  const camH = 1.4;
  const trees: React.ReactNode[] = [];
  const spacing = 6;
  const off = (t * speed) % spacing;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 26; i++) {
      const z = 2.5 + i * spacing - off;
      if (z < 1.2) continue;
      for (const lat of [8.5, 11.5]) {
        const X = side * (lat + random(`l${side}${i}${lat}`) * 0.8);
        const sx = 540 + sway + (X * f) / z, sy = HZ + (camH * f) / z;
        const h = ((9 + random(`h${i}${side}${lat}`) * 4) * f) / z, w = h * 0.26;
        const g = 75 + Math.floor(random(`g${i}${lat}`) * 30);
        trees.push(<g key={`${side}-${i}-${lat}`} opacity={Math.min(1, 6 / z + 0.25)}>
          <rect x={sx - w * 0.04} y={sy - h * 0.25} width={w * 0.08} height={h * 0.25} fill="#5A5242" />
          <ellipse cx={sx} cy={sy - h * 0.6} rx={w / 2} ry={h * 0.42} fill={`rgb(${g - 20},${g + 40},${30})`} />
          <ellipse cx={sx - w * 0.12} cy={sy - h * 0.66} rx={w * 0.28} ry={h * 0.3} fill={`rgb(${g + 5},${g + 70},${45})`} opacity={0.7} />
        </g>);
      }
    }
  }
  trees.sort(() => 0);
  const dashes: React.ReactNode[] = [];
  for (let i = 0; i < 30; i++) {
    const z0 = 1.5 + i * 3 - ((t * speed) % 3), z1 = z0 + 1.4;
    if (z0 < 1.1) continue;
    for (const X of [-1.8, 1.8]) {
      const p = (z: number, dx: number) => `${540 + sway + ((X + dx) * f) / z},${HZ + (camH * f) / z}`;
      dashes.push(<polygon key={`${i}${X}`} points={`${p(z0, -0.07)} ${p(z0, 0.07)} ${p(z1, 0.07)} ${p(z1, -0.07)}`} fill="#E9E6DA" opacity={0.85} />);
    }
  }
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B9B09B" /><stop offset="1" stopColor="#DDD6C2" /></linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6E6C66" /><stop offset="1" stopColor="#3A3936" /></linearGradient>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#DDD6C2" stopOpacity="0" /><stop offset="1" stopColor="#DDD6C2" stopOpacity="0.85" /></linearGradient>
      </defs>
      <rect width={1080} height={HZ + 2} fill="url(#sky)" />
      {[[-120, 160, 120], [60, 120, 90], [880, 150, 110], [1010, 110, 80]].map(([x, w, h], i) => <rect key={i} x={x + sway * 0.2} y={HZ - h} width={w} height={h} fill="#C9BEAA" opacity={0.6} />)}
      <polygon points={`0,${HZ} 1080,${HZ} 1080,1920 0,1920`} fill="#8FB86A" />
      <polygon points={`${540 + sway - 30},${HZ} ${540 + sway + 30},${HZ} ${1080 + 1800},1920 ${-1800},1920`} fill="url(#road)" />
      {dashes}
      {trees}
      <rect y={HZ - 260} width={1080} height={262} fill="url(#haze)" />
    </svg>
  );
};

/* ------------------------------------------------------------------ plates (drawn in a 300 x 66 box) */
export type PlateKind = 'std' | 'yellow' | 'ev' | 'flag' | 'cmd';
const UzFlag: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => (
  <g>
    <rect x={x} y={y} width={w} height={h / 3} fill="#1EB1E7" /><rect x={x} y={y + h / 3} width={w} height={h / 3} fill="#FFFFFF" />
    <rect x={x} y={y + (2 * h) / 3} width={w} height={h / 3} fill="#1EB53A" />
    <rect x={x} y={y + h / 3 - 1.5} width={w} height={3} fill="#CE1126" /><rect x={x} y={y + (2 * h) / 3 - 1.5} width={w} height={3} fill="#CE1126" />
    <circle cx={x + w * 0.22} cy={y + h / 6} r={h * 0.11} fill="#fff" /><circle cx={x + w * 0.26} cy={y + h / 6} r={h * 0.1} fill="#1EB1E7" />
  </g>
);
export const Plate: React.FC<{kind: PlateKind; region?: string; text: string; ring?: number; ringOn?: 'region' | 'suffix'}> = ({kind, region = '01', text, ring = 0, ringOn = 'region'}) => {
  const bg = kind === 'yellow' ? '#F2C230' : kind === 'cmd' ? '#14A36E' : '#FAFAF7';
  const ink = kind === 'cmd' ? '#FFFFFF' : '#141414';
  const hasRegion = kind === 'std' || kind === 'yellow' || kind === 'ev';
  const showFlagRight = kind === 'std' || kind === 'ev';
  return (
    <g>
      <rect x={-4} y={-4} width={308} height={74} rx={8} fill="#1d1d1d" opacity={0.5} />
      <rect x={0} y={0} width={300} height={66} rx={6} fill={bg} stroke={kind === 'cmd' ? '#E8F5EE' : '#141414'} strokeWidth={kind === 'cmd' ? 3 : 4} />
      {hasRegion && <>
        {kind === 'ev' && <rect x={3} y={3} width={50} height={60} rx={3} fill="#5BDB3A" />}
        <line x1={54} y1={4} x2={54} y2={62} stroke="#141414" strokeWidth={3} />
        <text x={28} y={46} textAnchor="middle" style={{font: `600 34px ${PF}`}} fill={ink}>{region}</text>
      </>}
      {kind === 'flag' && <UzFlag x={8} y={8} w={58} h={50} />}
      <text x={hasRegion ? (showFlagRight ? 150 : 170) : kind === 'flag' ? 185 : 150} y={50} textAnchor="middle" style={{font: `700 46px ${PF}`, letterSpacing: 1}} fill={ink}>{text}</text>
      {showFlagRight && <g><UzFlag x={262} y={9} w={28} h={22} /><text x={276} y={54} textAnchor="middle" style={{font: `600 15px ${PF}`}} fill="#1E88C8">UZ</text></g>}
      {ring > 0 && (ringOn === 'region'
        ? <circle cx={28} cy={33} r={34} fill="none" stroke="#F5C518" strokeWidth={5} opacity={ring} />
        : <ellipse cx={205} cy={33} rx={62} ry={38} fill="none" stroke="#F5C518" strokeWidth={5} opacity={ring} />)}
    </g>
  );
};

/* ------------------------------------------------------------------ car rears (drawn in a 1000 x 760 box, ground at y = 760) */
export type CarKind = 'sedan' | 'suv' | 'van' | 'lux';
type CarProps = {kind: CarKind; color: string; plate: React.ReactNode; t: number; brake?: number; beacon?: boolean; plateLift?: number; plateRot?: number; plateOpacity?: number};
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16); const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
};
export const CarRear: React.FC<CarProps> = ({kind, color, plate, t, brake = 0, beacon = false, plateLift = 0, plateRot = 0, plateOpacity = 1}) => {
  const hi = shade(color, 1.12), lo = shade(color, 0.72), mid = shade(color, 0.9);
  const tail = brake > 0.5 ? '#FF2B1F' : '#A52A22';
  const plateAt = {sedan: [350, 525], suv: [350, 570], van: [350, 580], lux: [350, 470]}[kind];
  const plateG = (
    <g transform={`translate(${plateAt[0] + 150},${plateAt[1] + 33 - plateLift}) rotate(${plateRot}) scale(1.45) translate(-150,-33)`} opacity={plateOpacity}>{plate}</g>
  );
  const wheels = (y: number, w = 110) => <><rect x={40} y={y} width={w} height={760 - y} rx={22} fill="#141414" /><rect x={1000 - 40 - w} y={y} width={w} height={760 - y} rx={22} fill="#141414" /></>;
  if (kind === 'sedan') return (
    <g>
      <ellipse cx={500} cy={752} rx={520} ry={24} fill="rgba(0,0,0,0.45)" />
      {wheels(620)}
      <path d="M150,170 Q170,80 300,70 L700,70 Q830,80 850,170 Z" fill="#2C2E33" />
      <path d="M190,150 Q210,98 310,92 L690,92 Q790,98 810,150 Z" fill="#3E4248" opacity={0.6} />
      <path d="M40,330 Q30,190 150,170 L850,170 Q970,190 960,330 L960,640 Q960,690 900,690 L100,690 Q40,690 40,640 Z" fill={color} />
      <path d="M60,250 Q60,190 150,185 L850,185 Q940,190 940,250 Z" fill={hi} opacity={0.55} />
      <rect x={40} y={460} width={920} height={8} fill={lo} opacity={0.6} />
      <path d="M40,330 L40,250 Q60,200 130,195 L160,330 Z" fill={tail} /><path d="M960,330 L960,250 Q940,200 870,195 L840,330 Z" fill={tail} />
      {brake > 0 && <><circle cx={90} cy={270} r={70} fill="#FF3B2E" opacity={0.35 * brake} style={{filter: 'blur(14px)'}} /><circle cx={910} cy={270} r={70} fill="#FF3B2E" opacity={0.35 * brake} style={{filter: 'blur(14px)'}} /></>}
      <path d="M430,300 L470,300 L476,288 L524,288 L530,300 L570,300 L560,330 L520,330 L514,342 L486,342 L480,330 L440,330 Z" fill="#1d1d1d" />
      <text x={800} y={400} style={{font: `600 22px ${UI}`, letterSpacing: 3}} fill={lo}>COBALT LTZ</text>
      <path d="M150,500 L850,500 L830,610 L170,610 Z" fill={mid} />
      <rect x={60} y={640} width={880} height={40} rx={14} fill={lo} />
      {plateG}
    </g>
  );
  if (kind === 'suv') return (
    <g>
      <ellipse cx={500} cy={752} rx={520} ry={24} fill="rgba(0,0,0,0.45)" />
      {wheels(640, 120)}
      <path d="M90,90 Q100,30 200,26 L800,26 Q900,30 910,90 L930,120 L70,120 Z" fill={color} />
      <path d="M110,120 L890,120 L910,300 L90,300 Z" fill="#26282D" />
      <path d="M300,200 L640,200 L700,220 L320,220 Z" fill="#111" />
      <path d="M50,330 Q40,300 90,300 L910,300 Q960,300 950,330 L950,650 Q950,700 890,700 L110,700 Q50,700 50,650 Z" fill={color} />
      <rect x={50} y={360} width={900} height={22} fill={tail} /><rect x={50} y={382} width={900} height={6} fill="#5a1410" />
      {brake > 0 && <rect x={50} y={340} width={900} height={60} fill="#FF3B2E" opacity={0.3 * brake} style={{filter: 'blur(12px)'}} />}
      <text x={500} y={450} textAnchor="middle" style={{font: `600 24px ${UI}`, letterSpacing: 8}} fill={lo}>BUILD YOUR DREAMS</text>
      <path d="M200,530 L800,530 L870,660 L130,660 Z" fill="#1E1F23" />
      {plateG}
    </g>
  );
  if (kind === 'van') {
    const blink = Math.floor(t * 6) % 2 === 0;
    return (
      <g>
        <ellipse cx={500} cy={752} rx={520} ry={24} fill="rgba(0,0,0,0.45)" />
        {wheels(660, 120)}
        <path d="M70,60 Q80,0 200,-6 L800,-6 Q920,0 930,60 L950,690 L50,690 Z" fill={color} />
        <path d="M120,60 L880,60 L890,380 L110,380 Z" fill="#1F2A2A" />
        <line x1={500} y1={60} x2={500} y2={690} stroke={lo} strokeWidth={6} />
        <circle cx={500} cy={340} r={30} fill="none" stroke="#CFCFCF" strokeWidth={6} /><path d="M500,312 L500,340 L476,354 M500,340 L524,354" stroke="#CFCFCF" strokeWidth={5} />
        <rect x={50} y={400} width={900} height={80} fill="#D7262B" />
        <text x={500} y={458} textAnchor="middle" style={{font: `700 54px ${UI}`}} fill="#fff">TEZ YORDAM 103</text>
        <rect x={60} y={660} width={880} height={40} rx={12} fill="#2b2b2b" />
        <rect x={60} y={420} width={30} height={200} fill={tail} /><rect x={910} y={420} width={30} height={200} fill={tail} />
        {beacon && <><rect x={160} y={-30} width={120} height={30} rx={8} fill={blink ? '#2F7BFF' : '#173E80'} /><rect x={720} y={-30} width={120} height={30} rx={8} fill={blink ? '#173E80' : '#2F7BFF'} />
          <circle cx={220} cy={-14} r={90} fill="#2F7BFF" opacity={blink ? 0.35 : 0} style={{filter: 'blur(18px)'}} /><circle cx={780} cy={-14} r={90} fill="#2F7BFF" opacity={blink ? 0 : 0.35} style={{filter: 'blur(18px)'}} /></>}
        {plateG}
      </g>
    );
  }
  return ( // lux (Maybach-like)
    <g>
      <ellipse cx={500} cy={752} rx={530} ry={24} fill="rgba(0,0,0,0.45)" />
      {wheels(640, 120)}
      <path d="M170,170 Q200,60 330,52 L670,52 Q800,60 830,170 Z" fill="#202227" />
      <path d="M210,150 Q240,80 340,74 L660,74 Q760,80 790,150 Z" fill="#33363C" opacity={0.6} />
      <path d="M30,320 Q20,190 170,170 L830,170 Q980,190 970,320 L970,630 Q970,690 900,690 L100,690 Q30,690 30,630 Z" fill={color} />
      <path d="M50,240 Q60,190 170,186 L830,186 Q940,190 950,240 Z" fill={hi} opacity={0.5} />
      <rect x={30} y={330} width={940} height={26} fill={tail} /><rect x={30} y={356} width={940} height={7} fill="#D9D9D9" />
      {brake > 0 && <rect x={30} y={310} width={940} height={70} fill="#FF3B2E" opacity={0.3 * brake} style={{filter: 'blur(12px)'}} />}
      <circle cx={500} cy={270} r={26} fill="none" stroke="#E6E6E6" strokeWidth={5} /><path d="M500,246 L500,270 L479,282 M500,270 L521,282" stroke="#E6E6E6" strokeWidth={4} />
      <ellipse cx={440} cy={270} rx={60} ry={14} fill="#fff" opacity={0.6} style={{filter: 'blur(6px)'}} />
      <text x={70} y={310} style={{font: `600 18px ${UI}`, letterSpacing: 3}} fill={hi}>MAYBACH</text>
      <rect x={60} y={620} width={880} height={10} fill="#BFBFBF" />
      <rect x={110} y={640} width={130} height={26} rx={12} fill="#C9C9C9" /><rect x={760} y={640} width={130} height={26} rx={12} fill="#C9C9C9" />
      {plateG}
    </g>
  );
};

import React from 'react';
import {random} from 'remotion';

/**
 * Cel-shaded cut-away of a twin-tube shock absorber, drawn in SVG so every part can move:
 * piston + rod travel, orange oil squeezed through the piston holes (streaks follow the piston's velocity),
 * oil level, a failing seal (red flash) with oil running down the outside, optional red coil spring.
 * All sizes derive from `h` (height of the body). Rendered centred on (0,0) of its parent.
 */
export const CutawaySVG: React.FC<{
  h: number;
  p: number; // piston travel 0..1
  v: number; // piston velocity (units/s), sign = direction
  oil: number; // 1 full .. 0 empty
  flow: number; // 0..1 visibility of flow streaks
  leak: number; // seconds since the seal failed (<0 = intact)
  spring: boolean;
  t: number; // seconds (for animated details)
}> = ({h, p, v, oil, flow, leak, spring, t}) => {
  const S = h * 0.012; // outline width
  const W = h * 0.3; // body width
  const wall = W * 0.12;
  const top = -h / 2;
  const bot = h / 2;
  const chTop = top + h * 0.06;
  const chBot = bot - h * 0.1;
  const inL = -W / 2 + wall;
  const inR = W / 2 - wall;
  const travel = (chBot - chTop) * 0.58;
  const pY = chTop + (chBot - chTop) * 0.18 + p * travel; // piston centre
  const pH = h * 0.055;
  const rodW = W * 0.22;
  const rodTop = pY - h * 0.95;
  const oilTop = chTop + (1 - oil) * (chBot - chTop);
  const ink = '#151515';
  const hatch = `hatch-${Math.round(h)}`;

  // flow streaks around the piston holes; they travel opposite to the piston motion
  const dir = v >= 0 ? -1 : 1; // piston going down pushes oil up through the holes
  const streaks = [];
  if (flow > 0.01) {
    for (let i = 0; i < 10; i++) {
      const sx = inL + ((i % 5) + 0.5) * ((inR - inL) / 5) + (random(`sx${i}`) - 0.5) * 8;
      const phase = (t * (1.6 + Math.abs(v) * 0.8) + random(`ph${i}`)) % 1;
      const sy = pY + dir * (pH * 0.6 + phase * h * 0.16);
      const len = h * (0.03 + 0.03 * Math.min(1, Math.abs(v)));
      const op = flow * (1 - phase) * Math.min(1, 0.35 + Math.abs(v));
      streaks.push(
        <path key={i} d={`M ${sx} ${sy} q ${4 * dir} ${dir * len * 0.5} 0 ${dir * len}`} stroke="#E2471B" strokeWidth={S * 0.9} strokeLinecap="round" fill="none" opacity={op} />,
      );
    }
  }

  // drips running down the outside after the seal fails
  const drips = [];
  if (leak >= 0) {
    for (let i = 0; i < 6; i++) {
      const life = (leak * 0.55 + random(`d${i}`) * 1.0) % 1.6;
      const x = W / 2 + S * 0.2 + (i % 2) * 4;
      const y0 = top + h * 0.02;
      const y = y0 + life * (h * 0.7);
      drips.push(<path key={`t${i}`} d={`M ${x} ${y0} L ${x} ${y}`} stroke="#5A3A12" strokeWidth={S * 0.9} opacity={0.75} strokeLinecap="round" />);
      drips.push(<ellipse key={`d${i}`} cx={x} cy={y} rx={S * 0.9} ry={S * 1.3} fill="#6B4515" stroke={ink} strokeWidth={S * 0.35} />);
    }
  }
  const sealFlash = leak >= 0 ? 0.5 + 0.5 * Math.sin(leak * 10) : 0;

  // coil spring (compresses with the rod)
  const coil = [];
  if (spring) {
    const sTop = rodTop + h * 0.08;
    const sBot = top + h * 0.42;
    const turns = 7;
    const R = W * 0.95;
    for (let i = 0; i < turns; i++) {
      const y1 = sTop + ((sBot - sTop) * i) / turns;
      const y2 = sTop + ((sBot - sTop) * (i + 1)) / turns;
      coil.push(
        <path key={`c${i}`} d={`M ${-R} ${y1} C ${-R * 0.2} ${y1 + (y2 - y1) * 0.1}, ${R * 0.2} ${y2 - (y2 - y1) * 0.6}, ${R} ${y1 + (y2 - y1) * 0.5} C ${R * 1.1} ${y2}, ${-R * 0.1} ${y2}, ${-R} ${y2}`}
          stroke={ink} strokeWidth={S * 2.6} fill="none" strokeLinecap="round" />,
        <path key={`cc${i}`} d={`M ${-R} ${y1} C ${-R * 0.2} ${y1 + (y2 - y1) * 0.1}, ${R * 0.2} ${y2 - (y2 - y1) * 0.6}, ${R} ${y1 + (y2 - y1) * 0.5} C ${R * 1.1} ${y2}, ${-R * 0.1} ${y2}, ${-R} ${y2}`}
          stroke="#D9322B" strokeWidth={S * 1.5} fill="none" strokeLinecap="round" />,
      );
    }
    coil.push(<rect key="sp1" x={-R * 1.15} y={sTop - S * 2} width={R * 2.3} height={S * 3} rx={S} fill="#4A4E53" stroke={ink} strokeWidth={S * 0.7} />);
    coil.push(<rect key="sp2" x={-R * 1.15} y={sBot} width={R * 2.3} height={S * 3} rx={S} fill="#4A4E53" stroke={ink} strokeWidth={S * 0.7} />);
  }

  return (
    <svg width={W * 4} height={h * 2.2} viewBox={`${-W * 2} ${-h * 1.2} ${W * 4} ${h * 2.2}`} style={{overflow: 'visible', position: 'absolute', left: -W * 2, top: -h * 1.2}}>
      <defs>
        <pattern id={hatch} width={S * 2.2} height={S * 2.2} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width={S * 2.2} height={S * 2.2} fill="#A7ACB1" />
          <line x1={0} y1={0} x2={0} y2={S * 2.2} stroke="#6E7378" strokeWidth={S * 0.6} />
        </pattern>
      </defs>
      {/* rod + top bushing (behind spring plate) */}
      <rect x={-rodW / 2} y={rodTop} width={rodW} height={pY - rodTop} fill="#DADFE3" stroke={ink} strokeWidth={S} />
      <rect x={-rodW / 2 + rodW * 0.55} y={rodTop} width={rodW * 0.18} height={pY - rodTop} fill="#FFFFFF" opacity={0.7} />
      <rect x={-W * 0.32} y={rodTop - h * 0.05} width={W * 0.64} height={h * 0.06} rx={S * 1.5} fill="#2B2D30" stroke={ink} strokeWidth={S} />
      {coil}
      {/* outer body (cut open): walls with hatching */}
      <rect x={-W / 2} y={top} width={W} height={h} rx={S} fill="#8D9297" stroke={ink} strokeWidth={S} />
      <rect x={-W / 2} y={top} width={wall} height={h} fill={`url(#${hatch})`} stroke={ink} strokeWidth={S * 0.6} />
      <rect x={W / 2 - wall} y={top} width={wall} height={h} fill={`url(#${hatch})`} stroke={ink} strokeWidth={S * 0.6} />
      {/* chamber */}
      <rect x={inL} y={chTop} width={inR - inL} height={chBot - chTop} fill="#4E5358" stroke={ink} strokeWidth={S * 0.6} />
      {/* oil */}
      <rect x={inL} y={oilTop} width={inR - inL} height={Math.max(0, chBot - oilTop)} fill="#E89A2E" />
      <rect x={inL} y={oilTop} width={(inR - inL) * 0.18} height={Math.max(0, chBot - oilTop)} fill="#F6C063" opacity={0.8} />
      {oil < 0.999 && <path d={`M ${inL} ${oilTop} Q ${(inL + inR) / 2} ${oilTop + Math.sin(t * 6) * S * 1.5} ${inR} ${oilTop}`} stroke="#B8701B" strokeWidth={S * 0.8} fill="none" />}
      {/* piston with holes */}
      <rect x={inL} y={pY - pH / 2} width={inR - inL} height={pH} fill="#767B80" stroke={ink} strokeWidth={S} />
      {[0.2, 0.5, 0.8].map((k) => (
        <rect key={k} x={inL + (inR - inL) * k - S * 0.9} y={pY - pH / 2} width={S * 1.8} height={pH} fill="#2A2C2F" />
      ))}
      {streaks}
      {/* seal + bottom eye */}
      <rect x={-W / 2 - S} y={top - S * 0.5} width={W + S * 2} height={h * 0.035} rx={S} fill={sealFlash > 0 ? `rgba(${Math.round(40 + 200 * sealFlash)},40,30,1)` : '#222'} stroke={ink} strokeWidth={S} />
      <circle cx={0} cy={bot + h * 0.06} r={W * 0.32} fill="#5A5F64" stroke={ink} strokeWidth={S} />
      <circle cx={0} cy={bot + h * 0.06} r={W * 0.13} fill="#1E1F21" />
      <rect x={-W * 0.2} y={bot - S} width={W * 0.4} height={h * 0.04} fill="#5A5F64" stroke={ink} strokeWidth={S * 0.8} />
      {/* toon highlight on the body */}
      <rect x={W / 2 - wall - W * 0.07} y={top + h * 0.02} width={W * 0.04} height={h * 0.9} fill="#FFFFFF" opacity={0.12} />
      {drips}
    </svg>
  );
};

/* 3D-skill reel: a props-driven composition. All times are ABSOLUTE seconds on the timeline. */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Board, Header, Karaoke, Headline, XrayCar, StatCard, PhoneChat, Grid100, CompareBars, NotRadiation, Thermal, SwitchCard, TimerCard, Pill, Label, Sparks, cl, type Word, type Chapter} from './kit';
import {C, F} from './theme';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = {kind: string; [k: string]: any};
export type Scene = {from: number; to: number; caption?: boolean; items: Item[]};
export type Reel3DProps = {
  handle: string; avatar: string; subtitle: string; end: number;
  words: Word[]; highlight?: string[]; chapters: Chapter[]; scenes: Scene[];
  voiceover?: string; muteAll?: boolean;
};

const renderItem = (it: Item, t: number, i: number) => {
  const {kind, ...p} = it;
  switch (kind) {
    case 'headline': return <Headline key={i} t={t} {...(p as any)} />;
    case 'xray': return <XrayCar key={i} t={t} {...(p as any)} />;
    case 'stat': return <StatCard key={i} t={t} {...(p as any)} />;
    case 'chat': return <PhoneChat key={i} t={t} {...(p as any)} />;
    case 'grid100': return <Grid100 key={i} t={t} {...(p as any)} />;
    case 'compare': return <CompareBars key={i} t={t} {...(p as any)} />;
    case 'notrad': return <NotRadiation key={i} t={t} {...(p as any)} />;
    case 'thermal': return <Thermal key={i} t={t} {...(p as any)} />;
    case 'switch': return <SwitchCard key={i} t={t} {...(p as any)} />;
    case 'timer': return <TimerCard key={i} t={t} {...(p as any)} />;
    case 'pill': return <Pill key={i} t={t} {...(p as any)} />;
    case 'label': return <Label key={i} t={t} {...(p as any)} />;
    default: return null;
  }
};

export const Reel3D: React.FC<Reel3DProps> = (p) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const scene = p.scenes.find((s) => t >= s.from && t < s.to) ?? p.scenes[p.scenes.length - 1];
  const sinceCut = t - scene.from;
  const punch = interpolate(sinceCut, [0, 0.25], [1.035, 1], cl); // tiny zoom on every cut
  const outroAt = p.end - 2.2;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <Board t={t} />
      <Sparks t={t} />
      <AbsoluteFill style={{transform: `scale(${punch})`}}>{scene.items.map((it, i) => renderItem(it, t, i))}</AbsoluteFill>
      {scene.caption !== false && <Karaoke t={t} words={p.words} highlight={p.highlight} />}
      <Header t={t} handle={p.handle} avatar={p.avatar} subtitle={p.subtitle} chapters={p.chapters} end={p.end} />
      {t > outroAt && (
        <AbsoluteFill style={{background: `rgba(16,17,20,${interpolate(t, [outroAt, outroAt + 0.4], [0, 0.82], cl)})`, alignItems: 'center', justifyContent: 'center'}}>
          <div style={{textAlign: 'center', opacity: interpolate(t, [outroAt + 0.2, outroAt + 0.6], [0, 1], cl), transform: `scale(${interpolate(t - outroAt - 0.2, [0, 0.2, 0.35], [0.7, 1.06, 1], cl)})`}}>
            <div style={{width: 170, height: 170, borderRadius: 85, margin: '0 auto', background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontWeight: 900, fontSize: 54, color: '#16180f', boxShadow: '0 0 0 10px rgba(200,241,53,0.25)'}}>{p.avatar}</div>
            <div style={{marginTop: 34, fontFamily: F.ui, fontWeight: 800, fontSize: 60, color: '#fff'}}>{p.handle}</div>
            <div style={{marginTop: 14, fontFamily: F.mono, fontWeight: 500, fontSize: 28, letterSpacing: 4, color: C.orange}}>OBUNA BO'LING</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

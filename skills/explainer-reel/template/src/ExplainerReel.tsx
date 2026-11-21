import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {Board, ChargeField, CounterText, GlowSpot, GroundLine, Handle, HighlightBox, IgPill, InsetCircle, LayerImg, MarkIcon, RainField, TitleText, clamp, sec, src, useShake} from './kit';
import type {ReelProps, Scene, Sfx} from './types';

/** Sound design rules from the reference, applied automatically (disable per scene with autoSfx:false). */
const autoSfxFor = (s: Scene, index: number): Sfx[] => {
  const out: Sfx[] = [];
  if (index > 0 && s.transition !== 'cut') out.push({src: 'sfx/whoosh.wav', at: 0, volume: 0.45});
  for (const t of s.titles ?? []) {
    if (t.color === 'red') {
      out.push({src: 'sfx/zap.wav', at: t.at, volume: 1});
      out.push({src: 'sfx/thud.wav', at: t.at, volume: 0.8});
    } else out.push({src: 'sfx/pop.wav', at: t.at, volume: 0.55});
    if (t.underline) out.push({src: 'sfx/pop_hi.wav', at: t.at + 0.15, volume: 0.25});
  }
  for (const c of s.counters ?? []) {
    const n = Math.max(1, Math.floor(sec(c.dur) / 2));
    for (let i = 0; i < n; i++) out.push({src: 'sfx/tick.wav', at: c.at + (i * 2) / 30, volume: 0.35});
    out.push({src: 'sfx/hum.wav', at: c.at, volume: 0.25, loopUntil: c.at + c.dur + 0.6});
  }
  for (const c of s.charges ?? []) out.push({src: 'sfx/sparkle.wav', at: c.at, volume: 0.35});
  for (const b of s.boxes ?? []) out.push({src: 'sfx/pop_hi.wav', at: b.at, volume: 0.4});
  for (const i of s.insets ?? []) out.push({src: 'sfx/pop_hi.wav', at: i.at, volume: 0.55});
  for (const m of s.marks ?? []) {
    if (m.type === 'check') out.push({src: 'sfx/ding.wav', at: m.at, volume: 0.45});
    if (m.type === 'cross') out.push({src: 'sfx/error.wav', at: m.at, volume: 0.45});
    if (m.type === 'spark') out.push({src: 'sfx/zap.wav', at: m.at, volume: 0.9});
    if (m.type === 'question') out.push({src: 'sfx/pop.wav', at: m.at, volume: 0.35});
  }
  for (const r of s.rain ?? []) out.push({src: 'sfx/rain.wav', at: r.at, volume: 0.35, loopUntil: r.out ?? s.dur});
  for (const l of s.layers ?? []) {
    if (l.anim === 'slideLeft' || l.anim === 'slideRight') out.push({src: 'sfx/whoosh.wav', at: l.at ?? 0, volume: 0.3});
    if (l.anim === 'pop') out.push({src: 'sfx/pop.wav', at: l.at ?? 0, volume: 0.4});
  }
  return out;
};

const SceneView: React.FC<{scene: Scene; handle: string; showPill: boolean; tf: number; isFirst: boolean}> = ({scene, handle, showPill, tf, isFirst}) => {
  const f = useCurrentFrame();
  const fadeIn = isFirst || scene.transition === 'cut' ? 1 : interpolate(f, [0, tf], [0, 1], clamp);
  const zoomIn = isFirst || scene.transition === 'cut' ? 1 : interpolate(f, [0, tf], [1.04, 1], clamp);
  const sh = useShake(scene.shakeAt);
  const dur = sec(scene.dur);
  const pillOp = showPill ? interpolate(f, [dur * 0.35, dur * 0.35 + 8], [0, 1], clamp) : 0;
  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <Board />
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(${zoomIn})`}}>
        {scene.ground && <GroundLine {...scene.ground} />}
        {(scene.glows ?? []).map((g, i) => <GlowSpot key={`g${i}`} {...g} />)}
        {(scene.layers ?? []).map((l, i) => <LayerImg key={`l${i}`} {...l} />)}
        {(scene.rain ?? []).map((r, i) => <RainField key={`r${i}`} {...r} />)}
        {(scene.charges ?? []).map((c, i) => <ChargeField key={`c${i}`} {...c} />)}
        {(scene.insets ?? []).map((c, i) => <InsetCircle key={`i${i}`} {...c} />)}
        {(scene.boxes ?? []).map((b, i) => <HighlightBox key={`b${i}`} {...b} />)}
        {(scene.marks ?? []).map((m, i) => <MarkIcon key={`m${i}`} {...m} />)}
      </AbsoluteFill>
      {(scene.titles ?? []).map((t, i) => <TitleText key={`t${i}`} {...t} />)}
      {(scene.counters ?? []).map((c, i) => <CounterText key={`n${i}`} {...c} />)}
      <Handle handle={handle} pos={scene.handlePos} />
      <IgPill handle={handle} opacity={pillOp} />
    </AbsoluteFill>
  );
};

export const totalFrames = (p: ReelProps) => Math.max(1, p.scenes.reduce((a, s) => a + sec(s.dur), 0));

export const ExplainerReel: React.FC<ReelProps> = (p) => {
  const tf = p.transitionFrames ?? 10;
  const sfxGain = p.sfxVolume ?? 0.55;
  const showPill = p.showPill ?? true;
  let start = 0;
  const seqs: React.ReactNode[] = [];
  const sounds: React.ReactNode[] = [];
  p.scenes.forEach((scene, i) => {
    const dur = sec(scene.dur);
    const isLast = i === p.scenes.length - 1;
    // each scene overlaps the next by `tf` frames so the incoming one cross-fades over it
    seqs.push(
      <Sequence key={`s${i}`} from={start} durationInFrames={dur + (isLast ? 0 : tf)} name={`scene ${i + 1}`}>
        <SceneView scene={scene} handle={p.handle} showPill={showPill} tf={tf} isFirst={i === 0} />
      </Sequence>,
    );
    const list = [...((scene.autoSfx ?? p.autoSfx ?? true) ? autoSfxFor(scene, i) : []), ...(scene.sfx ?? [])];
    list.forEach((s, j) => {
      const from = start + sec(s.at);
      const len = s.loopUntil !== undefined ? Math.max(1, sec(s.loopUntil - s.at)) : undefined;
      sounds.push(
        <Sequence key={`a${i}-${j}`} from={from} durationInFrames={len} layout="none">
          <Audio src={src(s.src)} volume={(s.volume ?? 1) * sfxGain} loop={s.loopUntil !== undefined} />
        </Sequence>,
      );
    });
    start += dur;
  });
  return (
    <AbsoluteFill style={{backgroundColor: '#1F2121'}}>
      {seqs}
      {!p.muteAll && sounds}
      {!p.muteAll && p.voiceover && <Audio src={src(p.voiceover)} volume={p.voVolume ?? 1} />}
      {!p.muteAll && p.music && <Audio src={src(p.music)} volume={p.musicVolume ?? 0.1} loop />}
    </AbsoluteFill>
  );
};

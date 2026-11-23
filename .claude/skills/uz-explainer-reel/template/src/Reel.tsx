import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PaceContext, renderOverlay} from './Overlays';
import {C, CAPTION_Y, DISPLAY, H, MONO, PAD, SANS, W} from './theme';
import {ReelProps, Scene, Word} from './types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ───────────────────────── base background ─────────────────────────
const BaseBg: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 45%, ${C.bg2} 0%, ${C.bg} 60%, #101012 100%)`}}>
      {/* soft crimson glow, left-middle, slowly breathing */}
      <div style={{position: 'absolute', left: -260, top: 620, width: 760, height: 760, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(184,48,79,0.16) 0%, rgba(184,48,79,0) 70%)', opacity: 0.8 + 0.2 * Math.sin(frame / 40)}} />
      {/* dust specks */}
      {new Array(26).fill(0).map((_, i) => {
        const x = random(`x${i}`) * W, y0 = random(`y${i}`) * H, sp = 0.15 + random(`s${i}`) * 0.35;
        return <div key={i} style={{position: 'absolute', left: x, top: (y0 - frame * sp + H) % H, width: 3, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.18)'}} />;
      })}
    </AbsoluteFill>
  );
};

// ───────────────────────── scene media ─────────────────────────
// kick = a short zoom "hit" on every spoken key word (energetic pace): +3.5 % that decays over 0.35 s
const kickAt = (t: number, kicks: number[]) =>
  kicks.reduce((acc, k) => {
    const dt = t - k;
    return dt >= 0 && dt < 0.35 ? acc + 0.035 * Math.pow(1 - dt / 0.35, 2) : acc;
  }, 0);

const SceneBg: React.FC<{scene: Scene; kicks: number[]; energetic: boolean}> = ({scene, kicks, energetic}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bg = scene.bg;
  if (!bg) return null;
  const dur = (scene.end - scene.start) * fps;
  const z = interpolate(frame, [0, dur], [bg.zoomFrom ?? 1, bg.zoomTo ?? (energetic ? 1.14 : 1.08)], clamp) + (energetic ? kickAt(scene.start + frame / fps, kicks) : 0);
  const x = interpolate(frame, [0, dur], [0, bg.panX ?? 0], clamp);
  const style: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', transform: `translateX(${x}px) scale(${z})`};
  return (
    <AbsoluteFill>
      {bg.type === 'video' ? <OffthreadVideo src={staticFile(bg.src)} muted style={style} /> : <Img src={staticFile(bg.src)} style={style} />}
      {/* header/caption legibility + bottom fade into the dark */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(22,22,24,0.85) 0%, rgba(22,22,24,0) 26%, rgba(22,22,24,0) 70%, rgba(22,22,24,0.9) 100%)`}} />
      <AbsoluteFill style={{background: `rgba(10,10,12,${bg.dim ?? 0.15})`}} />
    </AbsoluteFill>
  );
};

const Streak: React.FC = () => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [0, 10], [-0.4, 1.4], clamp);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: interpolate(frame, [0, 3, 10, 12], [0, 1, 1, 0], clamp)}}>
      <div style={{position: 'absolute', top: -400, left: k * W - 200, width: 160, height: H + 800, transform: 'rotate(14deg)',
        background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)', filter: 'blur(18px)'}} />
    </AbsoluteFill>
  );
};

// ───────────────────────── header ─────────────────────────
const Header: React.FC<ReelProps & {t: number}> = ({brand, totalChapters, scenes, t}) => {
  const cur = scenes.find((s) => t >= s.start && t < s.end) ?? scenes[scenes.length - 1];
  const span = scenes.filter((s) => s.chapter === cur.chapter);
  const cs = span[0].start, ce = span[span.length - 1].end;
  const prog = interpolate(t, [cs, ce], [0, 1], clamp);
  const segW = (W - 2 * PAD - (totalChapters - 1) * 8) / totalChapters;
  return (
    <div style={{position: 'absolute', left: PAD, right: PAD, top: 70}}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <div style={{width: 62, height: 62, borderRadius: 31, border: `3px solid ${C.white}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: SANS, fontWeight: 700, fontSize: 20, color: C.white, background: 'rgba(22,22,24,0.6)'}}>{brand.logo}</div>
        <div style={{marginLeft: 20, flex: 1}}>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.white}}>{brand.handle}</div>
          <div style={{fontFamily: MONO, fontSize: 20, color: C.grey, marginTop: 2}}>{brand.topic}</div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontFamily: MONO, fontSize: 20, color: C.grey}}>
            {brand.chapterWord} {String(cur.chapter).padStart(2, '0')}/{String(totalChapters).padStart(2, '0')}
          </div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.red, marginTop: 4}}>{cur.chapterLabel}</div>
        </div>
      </div>
      <div style={{display: 'flex', gap: 8, marginTop: 30}}>
        {new Array(totalChapters).fill(0).map((_, i) => {
          const n = i + 1;
          const fill = n < cur.chapter ? 1 : n === cur.chapter ? prog : 0;
          return (
            <div key={i} style={{width: segW, height: 5, borderRadius: 3, background: C.track, overflow: 'hidden'}}>
              <div style={{width: `${fill * 100}%`, height: '100%', background: n < cur.chapter ? 'rgba(184,48,79,0.55)' : C.red}} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ───────────────────────── kinetic caption ─────────────────────────
const BREAK = /[.,:;?!—–]$/;
const phrasesOf = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (BREAK.test(w.text) || cur.length >= 4) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

const KeyBox: React.FC<{k: number}> = ({k}) => {
  const dot: React.CSSProperties = {position: 'absolute', width: 9, height: 9, background: C.redHot, borderRadius: 2};
  return (
    <div style={{position: 'absolute', inset: '-6px -10px', border: `2px solid ${C.red}`, background: C.redFill, opacity: k, transform: `scale(${1.08 - 0.08 * k})`}}>
      <div style={{...dot, left: -5, top: -5}} />
      <div style={{...dot, right: -5, top: -5}} />
      <div style={{...dot, left: -5, bottom: -5}} />
      <div style={{...dot, right: -5, bottom: -5}} />
    </div>
  );
};

const Caption: React.FC<{words: Word[]; t: number; sceneEnd: number; energetic: boolean}> = ({words, t, sceneEnd, energetic}) => {
  const ph = phrasesOf(words);
  const idx = ph.findIndex((p, i) => t >= p[0].start - 0.3 && t < (ph[i + 1]?.[0].start - 0.3 || sceneEnd));
  if (idx < 0) return null;
  return (
    <div style={{position: 'absolute', left: PAD, right: PAD, top: CAPTION_Y - 34, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 18, rowGap: 14}}>
      {ph[idx].map((w, i) => {
        const op = t < w.start - 0.3 ? 0 : t < w.start - 0.02 ? 0.28 : 1;
        // ghost (upcoming) words sit still at scale 1; a spoken word pops 0.9 -> 1 and rises 10px (never wider than its slot)
        const pop = t < w.start - 0.02 ? 1 : energetic
          ? interpolate(t, [w.start - 0.02, w.start + 0.07, w.start + 0.15], [0.72, 1.08, 1], clamp)
          : interpolate(t, [w.start - 0.02, w.start + 0.14], [0.9, 1], clamp);
        const rise = t < w.start - 0.02 ? 0 : interpolate(t, [w.start - 0.02, w.start + 0.14], [10, 0], clamp);
        const k = interpolate(t, [w.start - 0.02, w.start + 0.12], [0, 1], clamp);
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', fontFamily: SANS, fontWeight: 700, fontSize: 50, color: C.white,
            opacity: op, transform: `translateY(${rise}px) scale(${pop})`, textShadow: '0 4px 18px rgba(0,0,0,0.6)'}}>
            {w.key ? <KeyBox k={k} /> : null}
            <span style={{position: 'relative'}}>{w.text}</span>
          </span>
        );
      })}
    </div>
  );
};

// Big extended-font title for the hook scene (words build in as they are spoken)
const Hook: React.FC<{words: Word[]; t: number}> = ({words, t}) => (
  <div style={{position: 'absolute', left: 40, right: 40, top: 230, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 26, rowGap: 0}}>
    {words.map((w, i) => {
      const k = interpolate(t, [w.start - 0.04, w.start + 0.16], [0, 1], clamp);
      return (
        <span key={i} style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 104, lineHeight: 1.04, textTransform: 'uppercase', letterSpacing: -1,
          color: w.key ? C.red : C.white, opacity: k, transform: `scale(${1.25 - 0.25 * k})`, filter: `blur(${(1 - k) * 8}px)`,
          textShadow: '0 6px 30px rgba(0,0,0,0.55)'}}>
          {w.text}
        </span>
      );
    })}
  </div>
);

// ───────────────────────── scene ─────────────────────────
const SceneView: React.FC<{scene: Scene; words: Word[]; energetic: boolean; whip: boolean}> = ({scene, words, energetic, whip}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = scene.start + frame / fps; // absolute seconds
  const sw = words.filter((w) => w.start >= scene.start - 0.01 && w.start < scene.end);
  const fade = scene.transition === 'fade' ? interpolate(frame, [0, 6], [0, 1], clamp) : 1;
  const out = Easing.out(Easing.cubic);
  // energetic cut: punch-in 1.1 -> 1 in 7 frames; a whip slides the new chapter in from the right with motion blur
  const punch = energetic ? interpolate(frame, [0, 7], [whip ? 1.18 : 1.1, 1], {...clamp, easing: out}) : 1;
  const wx = whip ? interpolate(frame, [0, 7], [170, 0], {...clamp, easing: out}) : 0;
  const wblur = whip ? interpolate(frame, [0, 7], [14, 0], clamp) : 0;
  // screen shake for 0.25 s after every stamp lands
  const shake = energetic
    ? scene.overlays.filter((o) => o.kind === 'stamp').reduce((acc, o) => {
        const dt = t - o.at;
        return dt >= 0 && dt < 0.25 ? acc + Math.sin(dt * 110) * 16 * (1 - dt / 0.25) : acc;
      }, 0)
    : 0;
  const kicks = sw.filter((w) => w.key).map((w) => w.start);
  return (
    <AbsoluteFill style={{opacity: fade, transform: `translate(${wx + shake}px, ${shake * 0.6}px) scale(${punch})`, filter: wblur ? `blur(${wblur}px)` : undefined}}>
      <SceneBg scene={scene} kicks={kicks} energetic={energetic} />
      {scene.overlays.map((o, i) => {
        const until = o.until ?? scene.end;
        if (t < o.at || t >= until) return null;
        const outK = until < scene.end ? interpolate(t, [until - 0.2, until], [0, 1], clamp) : 0;
        return renderOverlay(o, t - o.at, outK, i);
      })}
      {scene.hook ? <Hook words={sw} t={t} /> : <Caption words={sw} t={t} sceneEnd={scene.end} energetic={energetic} />}
      {scene.transition === 'streak' ? <Streak /> : null}
      {energetic && frame < 4 ? <AbsoluteFill style={{background: '#fff', opacity: interpolate(frame, [0, 1, 4], [0.2, 0.2, 0], clamp)}} /> : null}
    </AbsoluteFill>
  );
};

const SFX: React.FC<{props: ReelProps}> = ({props}) => {
  const {fps} = useVideoConfig();
  const ev: {t: number; src: string; vol: number}[] = [];
  props.scenes.forEach((s, i) => {
    if (i > 0) ev.push({t: Math.max(0, s.start - 0.12), src: 'sfx/whoosh.mp3', vol: s.chapter !== props.scenes[i - 1].chapter ? 0.32 : 0.16});
    s.overlays.forEach((o) => {
      if (o.kind === 'stamp') ev.push({t: o.at, src: 'sfx/hit.mp3', vol: 0.4});
      if (o.kind === 'bigNumber' || o.kind === 'donut' || o.kind === 'statCard') ev.push({t: o.at, src: 'sfx/tick.mp3', vol: 0.25});
      if (o.kind === 'cta') ev.push({t: o.at + 1.0, src: 'sfx/tick.mp3', vol: 0.3});
    });
  });
  return (
    <>
      {ev.map((e, i) => (
        <Sequence key={i} from={Math.round(e.t * fps)} durationInFrames={Math.round(1.2 * fps)}>
          <Audio src={staticFile(e.src)} volume={e.vol} />
        </Sequence>
      ))}
    </>
  );
};

export const Reel: React.FC<ReelProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const energetic = (props.pace ?? 'energetic') === 'energetic';
  return (
    <PaceContext.Provider value={energetic ? 'energetic' : 'calm'}>
    <AbsoluteFill style={{background: C.bg}}>
      <BaseBg />
      {props.scenes.map((s, i) => {
        const whip = s.transition === 'whip' || (energetic && !s.transition && i > 0 && s.chapter !== props.scenes[i - 1].chapter);
        return (
          <Sequence key={i} from={Math.round(s.start * fps)} durationInFrames={Math.max(1, Math.round((s.end - s.start) * fps))}>
            <SceneView scene={s} words={props.words} energetic={energetic} whip={whip} />
          </Sequence>
        );
      })}
      <Header {...props} t={t} />
      {props.audio.vo ? <Audio src={staticFile(props.audio.vo)} /> : null}
      {props.audio.music ? <Audio src={staticFile(props.audio.music)} volume={props.audio.musicVolume ?? 0.12} loop /> : null}
      {props.sfx ? <SFX props={props} /> : null}
    </AbsoluteFill>
    </PaceContext.Provider>
  );
};

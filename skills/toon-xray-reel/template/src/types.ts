/**
 * Props for <ToonReel>: a text-free, camera-driven "cel-shaded 3D x-ray" explainer.
 * Times are SECONDS relative to the shot start. Positions are PIXELS on the 1080x1920 canvas
 * (x/y = centre). A keyframe track is either a constant or a list of [time, value] pairs (eased in-out).
 */
export type Track = number | Array<[number, number]>;

export interface Camera {
  // the camera looks at (x, y) with zoom; tracks animate it (Ken Burns / push-in / match-cut zoom)
  x?: Track; // default 540
  y?: Track; // default 960
  zoom?: Track; // default 1
  rotate?: Track; // degrees, default 0
  shakeAt?: number[]; // impact jolts
}

export interface BaseLayer {
  x?: Track;
  y?: Track;
  w?: number; // width px (ignored when full)
  full?: boolean; // cover the whole frame (backgrounds, video plates)
  opacity?: Track;
  scale?: Track;
  scaleY?: Track; // extra vertical squash/stretch (spring compress/rebound), multiplies scale
  rotate?: Track;
  z?: number;
  glow?: {color: string; at: number; out?: number; pulse?: boolean; size?: number}; // toon outline glow
  blur?: Track; // px
  tint?: Track; // 0..1 darken (push a layer into the background)
  shadow?: string; // CSS drop-shadow, e.g. '0 28px 14px rgba(0,0,0,0.45)' (grounds a cut-out on the road)
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
}

export interface VideoLayer extends BaseLayer {
  type: 'video';
  src: string;
  startFrom?: number; // seconds into the clip
  rate?: number; // playback rate (0.75 = slow-mo)
  freezeAt?: number; // hold the frame at this clip time (seconds)
}

export interface CutawayLayer extends BaseLayer {
  type: 'cutaway';
  h: number; // height of the shock absorber in px
  // piston travel 0 (top) .. 1 (bottom) over time; strokes are animated automatically between keys
  piston?: Track;
  flowAt?: number; // oil-flow streaks start
  flowOut?: number;
  oil?: Track; // oil level 1 = full, 0 = empty
  leakAt?: number; // the seal fails: red flashing seal + drips running down the outside
  spring?: boolean; // red coil spring around it (compresses with the piston)
  oilColor?: string; // default '#E89A2E'; dark '#5A3A12' for old, burnt oil
  springSide?: boolean; // zig-zag spring beside the shock (reference look)
  glass?: boolean; // translucent tube/chamber
}

export interface DripsLayer extends BaseLayer {
  type: 'drips';
  at: number;
  count?: number;
  color?: string;
  area: {x: number; y: number; w: number; h: number};
}

export type Layer = ImageLayer | VideoLayer | CutawayLayer | DripsLayer;

export interface SfxCue {
  src: string; // 'kit:<id>' or a file under public/
  at: number;
  gain_db?: number;
  fit?: number;
  max_len?: number;
  loopUntil?: number;
  why?: string;
}

export interface Shot {
  dur: number;
  name?: string;
  transition?: 'xfade' | 'cut' | 'dip'; // how this shot enters (default xfade)
  tf?: number; // transition frames (default 12)
  camera?: Camera;
  layers: Layer[];
  sfx?: SfxCue[];
}

export type ToonProps = {
  handle: string; // watermark, top-right
  voiceover?: string;
  muteAll?: boolean; // picture only (audio built by pro_mix.py)
  grain?: number; // 0..1, default 0.07
  vignette?: number; // 0..1, default 0.45
  warmth?: number; // 0..1 warm overlay, default 0.08
  beds?: Array<{src: string; from: number; to: number; gain_db?: number; why?: string}>; // ambience loops (absolute s), used by toon_cues.py
  shots: Shot[];
};

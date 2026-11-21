/**
 * Props schema for <ExplainerReel>. All times are SECONDS relative to the start of
 * their scene; all positions are PIXELS on the 1080x1920 canvas (x/y = centre of the item).
 */

export type Anim =
  | 'none'
  | 'fade'
  | 'pop' // spring scale-in
  | 'slideLeft' // enters from the left edge (e.g. a hand reaching in)
  | 'slideRight' // enters from the right edge
  | 'slideUp'
  | 'drop'
  | 'walkIn' // from the left with a walking bob
  | 'zoomOut'; // starts big and settles (scene "camera pull-back")

export interface Move {
  at: number;
  dur: number;
  x?: number;
  y?: number;
  w?: number;
}

export interface Layer {
  src: string; // file in public/ or https URL (transparent PNG / SVG)
  w: number; // rendered width in px
  x?: number; // default 540
  y?: number; // default L.stageY
  at?: number; // appear time (default 0)
  out?: number; // disappear time (fade out)
  anim?: Anim; // default 'fade'
  animDur?: number; // seconds, default 0.45
  z?: number;
  flip?: boolean;
  opacity?: number;
  moves?: Move[]; // keyframed moves (pan / grow / step forward)
  glow?: {at: number; out?: number; r?: number; color?: string; dx?: number; dy?: number};
  shakeAt?: number[]; // little jolt (electric shock)
}

export interface Title {
  text: string; // use \n for a 2-line title; auto-uppercased
  at: number;
  out?: number;
  size?: number; // px, default 84 (2 lines) / 88 (1 line)
  underline?: boolean; // yellow underline grows in (marks the KEY word of the beat)
  color?: 'white' | 'red'; // red = impact word with red glow ("CHIRS!")
  kicker?: string; // small line above the title
  sub?: string; // small grey line under the title ("ZARARI YO'Q")
  subAt?: number;
  y?: number;
}

export interface Counter {
  at: number;
  dur: number;
  from: number;
  to: number;
  prefix?: string;
  suffix?: string; // e.g. " VOLT"
  out?: number;
  sub?: string;
  subAt?: number;
  glow?: boolean; // white glow (default true)
  y?: number;
}

export interface Charges {
  at: number;
  out?: number;
  x: number; // centre of the area
  y: number;
  w: number;
  h: number;
  count?: number; // default 12
  sign?: '-' | '+';
  stagger?: number; // seconds between pops, default 0.05
  drift?: number; // px of wander, default 6
  flowTo?: {x: number; y: number; at: number; dur: number}; // charges stream to a point (discharge)
}

export interface Glow {
  at: number;
  out?: number;
  x: number;
  y: number;
  r: number;
  color?: string;
  flicker?: boolean;
}

export interface Inset {
  src: string; // close-up image (fills the circle)
  at: number;
  out?: number;
  x: number;
  y: number;
  r: number; // radius px
  zoom?: number; // 1 = fit
  focusX?: number; // 0..1 object-position
  focusY?: number;
  target?: {x: number; y: number}; // dotted leader line to this point
}

export interface Mark {
  type: 'check' | 'cross' | 'question' | 'spark';
  at: number;
  out?: number;
  x: number;
  y: number;
  size?: number;
}

export interface Box {
  at: number;
  out?: number;
  x: number; // centre
  y: number;
  w: number;
  h: number;
  radius?: number; // default 14
  color?: string; // default yellow
}

export interface Rain {
  at: number;
  out?: number;
  count?: number;
}

export interface Ground {
  y: number;
  x0?: number;
  x1?: number;
  at?: number;
}

export interface Sfx {
  src: string; // e.g. 'sfx/pop.wav'
  at: number;
  volume?: number;
  loopUntil?: number; // loop the file until this time (scene seconds)
}

export interface Scene {
  dur: number;
  layers?: Layer[];
  titles?: Title[];
  counters?: Counter[];
  charges?: Charges[];
  glows?: Glow[];
  insets?: Inset[];
  marks?: Mark[];
  boxes?: Box[]; // yellow outline that draws around a key part ("REZINA" sole)
  rain?: Rain[];
  ground?: Ground | null;
  sfx?: Sfx[];
  autoSfx?: boolean; // default: inherits ReelProps.autoSfx
  transition?: 'fade' | 'cut';
  shakeAt?: number[]; // whole-frame jolt
  handlePos?: 'left' | 'center' | 'right';
}

export type ReelProps = {
  handle: string; // "@yourname"  (watermark + Instagram pill)
  voiceover?: string; // public/ path, e.g. 'vo.mp3'
  voVolume?: number; // default 1
  music?: string; // public/ path
  musicVolume?: number; // default 0.1 (≈ -20 dB under the voice)
  sfxVolume?: number; // master SFX gain, default 0.55
  autoSfx?: boolean; // default true
  showPill?: boolean; // default true
  transitionFrames?: number; // default 10
  scenes: Scene[];
};

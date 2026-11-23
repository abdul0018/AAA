// Props produced by scripts/build_props.py (all times in SECONDS, absolute on the timeline).

export type Word = {text: string; start: number; end: number; key?: boolean};

export type Tone = 'white' | 'red' | 'muted';

export type Overlay =
  | {kind: 'chip'; at: number; until?: number; text: string; tone?: Tone; y?: number}
  | {kind: 'stamp'; at: number; until?: number; text: string; y?: number; rotate?: number}
  | {kind: 'bigNumber'; at: number; until?: number; value: number; from?: number; prefix?: string; suffix?: string; y?: number; year?: boolean}
  | {kind: 'donut'; at: number; until?: number; percent: number; from?: number; label?: string; y?: number}
  | {kind: 'battery'; at: number; until?: number; level: number; to?: number; showPct?: boolean; caption?: string; y?: number}
  | {kind: 'statCard'; at: number; until?: number; title: string; value: string; pre?: string; post?: string; footer?: string; y?: number}
  | {kind: 'poll'; at: number; until?: number; question: string; options: string[]; hint?: string; y?: number}
  | {kind: 'cta'; at: number; until?: number; logo: string; handle: string; button: string; done: string; y?: number}
  | {kind: 'image'; at: number; until?: number; src: string; width?: number; y?: number}
  | {kind: 'label'; at: number; until?: number; text: string; x: number; y: number};

export type Bg = {
  type: 'image' | 'video';
  src: string; // file in public/
  zoomFrom?: number; // default 1.0
  zoomTo?: number; // default 1.08
  panX?: number; // px drift over the scene, default 0
  dim?: number; // 0..1 extra darkening, default 0.15
};

export type Scene = {
  start: number;
  end: number;
  chapter: number; // 1-based
  chapterLabel: string; // "savol", "rejimlar" ...
  hook?: boolean; // big extended-font title instead of the small caption
  bg?: Bg;
  transition?: 'cut' | 'fade' | 'streak' | 'whip'; // energetic pace: new chapters whip in automatically
  overlays: Overlay[];
};

export type ReelProps = {
  brand: {logo: string; handle: string; topic: string; chapterWord: string};
  totalChapters: number;
  duration: number; // seconds
  words: Word[];
  scenes: Scene[];
  audio: {vo: string; music?: string; musicVolume?: number};
  pace?: 'energetic' | 'calm'; // default energetic: punch-in cuts, flash, whips, word-kicks, snappier motion
  sfx?: boolean; // whoosh on cuts, hit on stamps, tick on counters (public/sfx, from scripts/make_sfx.sh)
};

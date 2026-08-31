export type Vec3 = [number, number, number];

export type CharacterSpec = {
  /** Model file name without extension, e.g. "robot" -> public/models/robot.glb */
  model: string;
  /** Animation clip name inside the GLB (matched loosely), e.g. "Wave", "Gallop" */
  clip?: string;
  position?: Vec3;
  /** Degrees, rotation around Y axis */
  rotationY?: number;
  /** Multiplier on the normalized ~1.7-unit character height */
  scale?: number;
  /** Seconds — character is visible from/to */
  from?: number;
  to?: number;
  /** Animation playback speed multiplier */
  timeScale?: number;
  /** Seconds added to the clip time, desyncs identical clips */
  timeOffset?: number;
  /** Hex color multiplied into all materials (e.g. team colors) */
  tint?: string;
  /** Hex color that REPLACES material/vertex colors (full repaint) */
  recolor?: string;
  /** Optional linear movement from `position` to `moveTo.position` */
  moveTo?: {position: Vec3; startAt: number; endAt: number};
  /** Load animation clips from another GLB sharing the same rig
   *  (e.g. "animlib" for the modular human models) */
  animLib?: string;
  /** Attach a procedural beer mug to this hand */
  beer?: 'left' | 'right';
  /** Mug orientation fix in bone space, degrees */
  beerRot?: [number, number, number];
  /** Skip auto-normalization (debug) */
  raw?: boolean;
};

export type CrowdSpec = {
  count: number;
  models: string[];
  clips: string[];
  /** Animation library GLB applied to every member */
  animLib?: string;
  /** Fraction of members holding a beer (0..1) */
  beerChance?: number;
  /** Hex colors cycled through crowd members */
  tints?: string[];
  /** Crowd is scattered in a ring between innerRadius and outerRadius */
  center?: Vec3;
  innerRadius?: number;
  outerRadius?: number;
  /** Only place crowd within this arc (degrees, 0 = +z toward camera) */
  arcStart?: number;
  arcEnd?: number;
  seed?: string;
  scaleMin?: number;
  scaleMax?: number;
};

export type CameraKeyframe = {
  /** Seconds */
  at: number;
  position: Vec3;
  lookAt: Vec3;
};

export type TextSpec = {
  text: string;
  /** Seconds */
  from: number;
  to: number;
  variant?: 'title' | 'subtitle' | 'badge';
  place?: 'top' | 'bottom';
  color?: string;
};

export type AutomationSpec = {
  /** Card title, e.g. "Price Alert" */
  title: string;
  /** Status line before the trigger fires, e.g. "Active · Next run 10:30" */
  status: string;
  from: number;
  to: number;
  /** Seconds (absolute) when the card flips from status to result */
  triggerAt?: number;
  /** Result line shown after triggerAt, e.g. "SOL crossed $210" */
  result?: string;
  /** Footer line, defaults to the observe-only disclosure */
  footer?: string;
  place?: 'top' | 'bottom';
};

export type MarketSpec = {
  /** Market question, e.g. "Mexico to win Group A?" */
  question: string;
  from: number;
  to: number;
  /** YES price in cents at start/end — animates between them */
  yesStart: number;
  yesEnd: number;
  /** Seconds (absolute) when the position flips to WON */
  winAt?: number;
  /** Payout label shown on win, e.g. "+$214" */
  payout?: string;
  place?: 'top' | 'bottom';
};

export type Background = {
  /** Gradient stops, top to bottom */
  colors?: string[];
  stars?: boolean;
  moon?: boolean;
  sun?: boolean;
  /** City skyline silhouette at the horizon */
  skyline?: 'cdmx' | 'la' | 'toronto';
  /** Vertical position of the skyline base, percent from top */
  horizon?: number;
  /** Confetti rain from this second onward */
  confetti?: {from: number; colors: string[]};
  vignette?: boolean;
  /** Ground disc color in the 3D scene */
  ground?: string;
};

export type Scenario = {
  name: string;
  durationSeconds: number;
  fps: number;
  width: number;
  height: number;
  accentColor?: string;
  background: Background;
  camera: CameraKeyframe[];
  characters: CharacterSpec[];
  crowd?: CrowdSpec;
  texts: TextSpec[];
  markets?: MarketSpec[];
  automations?: AutomationSpec[];
};

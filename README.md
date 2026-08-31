# Character Studio

Code-only 3D character animation video pipeline. Describe a scenario → author a JSON scene script → render to MP4. Built with Remotion + @remotion/three + three.js. No AI video APIs, fully deterministic.

## Usage

```bash
# Render a scenario
npx remotion render src/index.ts Main out/<name>.mp4 --props=scenarios/<name>.json

# Interactive preview (live-edit scenarios)
npm run studio
```

## Scene scripts

Scenarios live in `scenarios/*.json`. See `src/scenario.ts` for the full schema. Times are in **seconds**, positions are `[x, y, z]` (y up, ground at y=0, characters auto-grounded and normalized to ~1.7 units tall).

- `background` — vertical gradient `colors`, optional `stars`, `moon`, `sun`, and 3D `ground` disc color
- `camera` — keyframes (`at` seconds, `position`, `lookAt`), eased interpolation between them
- `characters` — model + animation clip + placement; `from`/`to` visibility windows let you chain clips on the same character (e.g. Wave then Dance); `moveTo` walks/runs a character across the stage
- `texts` — timed overlays: `title`, `subtitle`, or `badge` (pill in accent color), placed `top` or `bottom`

## Characters (public/models/)

| Model | Animation clips |
|---|---|
| `robot` | Idle, Walking, Running, Dance, Death, Sitting, Standing, Jump, Yes, No, Wave, Punch, ThumbsUp, WalkJump |
| `soldier` | Idle, Walk, Run, TPose |
| `xbot` | idle, walk, run, agree, headShake, sad_pose, sneak_pose |
| `fox` | Survey, Walk, Run |

Add more characters by dropping animated `.glb` files into `public/models/` — any rigged glTF works (Mixamo exports, KayKit, Quaternius packs, etc.). Models are auto-scaled, so native size doesn't matter.

Sources: robot/soldier/xbot from three.js examples (CC0/Mixamo), fox from glTF-Sample-Models (CC-BY 4.0, PixelMannen).

## Nova branding

Default accent is Nova purple `#7D00FF`. The `nova-launch.json` scenario is the brand reference: dark purple gradient + stars + moon. For non-brand videos just change `accentColor` and `background`.

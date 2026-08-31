import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Lexend';

// NovaGate brand teaser, "BULK"-style: staccato Seedance montage with
// accelerating tempo, serif kinetic copy, resolving on a calm aurora logo card.

const FPS = 30;

type Shot = {
  src: string;
  seconds: number;
  text?: string;
  rate?: number;
  from?: number; // seconds into the source clip
};

const SHOTS: Shot[] = [
  {src: 'footage/novagate/s1.mp4', seconds: 1.0},
  {src: 'footage/novagate/s2.mp4', seconds: 1.0},
  {src: 'footage/novagate/s3.mp4', seconds: 1.5, text: 'Every market.'},
  {src: 'footage/novagate/s4.mp4', seconds: 1.0},
  {src: 'footage/novagate/s5.mp4', seconds: 1.0, text: 'Every signal.'},
  // whole child->elderly morph compressed into the 1s slot
  {src: 'footage/novagate/s6.mp4', seconds: 1.0, rate: 4},
  {src: 'footage/novagate/s7.mp4', seconds: 1.0},
  // start mid-clip so the cloud gate is already open
  {src: 'footage/novagate/s8.mp4', seconds: 0.8, text: 'One gate.', from: 1.8},
  {src: 'footage/novagate/s9.mp4', seconds: 4.2}, // end card plate
];
export const NOVAGATE_TOTAL_SECONDS = SHOTS.reduce((s, x) => s + x.seconds, 0);
export const NOVAGATE_DURATION_FRAMES = Math.round(NOVAGATE_TOTAL_SECONDS * FPS);

// Brand type: Lexend, same as novagate.one (--font-lexend)
const {fontFamily: lexend} = loadFont('normal', {
  weights: ['300', '400', '500', '600'],
});
export const BRAND_FONT = `${lexend}, sans-serif`;

export const KineticText: React.FC<{text: string; durationFrames: number}> = ({
  text,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inS = spring({frame, fps, config: {damping: 16, stiffness: 140}});
  const out = interpolate(
    frame,
    [durationFrames - 6, durationFrames],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          fontFamily: BRAND_FONT,
          fontSize: 88,
          fontWeight: 300,
          color: 'white',
          letterSpacing: '0.03em',
          opacity: out,
          transform: `scale(${0.94 + 0.06 * inS})`,
          textShadow: '0 4px 40px rgba(0,0,0,0.7)',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fade = interpolate(frame, [0.5 * fps, 1.6 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const drift = interpolate(frame, [0, 4.2 * fps], [8, 0]);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 30,
          opacity: fade,
          transform: `translateY(${drift}px)`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <div
            style={{
              fontFamily: BRAND_FONT,
              fontSize: 72,
              color: 'white',
              lineHeight: 1,
              textShadow: '0 4px 50px rgba(0,0,0,0.6)',
            }}
          >
            ✦
          </div>
          <div
            style={{
              fontFamily: BRAND_FONT,
              fontSize: 124,
              fontWeight: 500,
              color: 'white',
              letterSpacing: '0.01em',
              textShadow: '0 4px 50px rgba(0,0,0,0.6)',
            }}
          >
            novagate
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Film grain + vignette to unify the shots, like the reference.
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed={frame % 60}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#grain)"
          opacity={0.08}
        />
      </svg>
    </AbsoluteFill>
  );
};

export const NovaGateFilm: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: 'black'}}>
      {SHOTS.map((shot, i) => {
        const dur = Math.round(shot.seconds * FPS);
        const seq = (
          <Sequence key={shot.src} from={from} durationInFrames={dur}>
            <AbsoluteFill>
              <OffthreadVideo
                src={staticFile(shot.src)}
                muted
                playbackRate={shot.rate ?? 1}
                trimBefore={Math.round((shot.from ?? 0) * FPS)}
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
            </AbsoluteFill>
            {shot.text ? (
              <KineticText text={shot.text} durationFrames={dur} />
            ) : null}
            {i === SHOTS.length - 1 ? <EndCard /> : null}
          </Sequence>
        );
        from += dur;
        return seq;
      })}
      <Grain />
    </AbsoluteFill>
  );
};

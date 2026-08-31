import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Grain, KineticText, BRAND_FONT} from './NovaGateFilm';

// "Trade the narrative" teaser: narratives through history (cave -> Rome ->
// America -> online -> trading) resolving on NovaGate baskets. Same BULK-style
// grammar as NovaGateFilm: staccato cuts, serif copy, grain, aurora end card.

const FPS = 30;

type Shot = {
  src: string;
  seconds: number;
  text?: string;
  from?: number; // seconds into the source clip
};

const SHOTS: Shot[] = [
  {src: 'footage/novagate/s1.mp4', seconds: 1.0},
  {src: 'footage/novagate/n1.mp4', seconds: 1.6, text: 'Narratives built tribes.'},
  {src: 'footage/novagate/n2.mp4', seconds: 1.6, text: 'Narratives built empires.'},
  {src: 'footage/novagate/n3.mp4', seconds: 1.6, text: 'Narratives built nations.'},
  {src: 'footage/novagate/n4.mp4', seconds: 1.6, text: 'Narratives went viral.'},
  {src: 'footage/novagate/n5.mp4', seconds: 1.8, text: 'Now they move markets.'},
];
const PRODUCT_SECONDS = 2.4;
const ENDCARD_SECONDS = 4.0;

export const NARRATIVES_TOTAL_SECONDS =
  SHOTS.reduce((s, x) => s + x.seconds, 0) + PRODUCT_SECONDS + ENDCARD_SECONDS;
export const NARRATIVES_DURATION_FRAMES = Math.round(
  NARRATIVES_TOTAL_SECONDS * FPS,
);

// Baskets UI beat: floating app panel mockup (CSS, no real product
// screenshot) over dark violet, slow push-in.
const ProductBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = PRODUCT_SECONDS * fps;
  const zoom = interpolate(frame, [0, dur], [1, 1.07]);
  const fadeIn = interpolate(frame, [0, 6], [0, 1], {
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at 50% 30%, #241640 0%, #0c0618 70%)',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          transform: `scale(${zoom}) translateY(-52px)`,
          width: 640,
          borderRadius: 28,
          padding: 40,
          background: 'rgba(16, 8, 40, 0.9)',
          border: '1px solid rgba(168,85,247,0.35)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 90px rgba(168,85,247,0.25)',
          fontFamily: BRAND_FONT,
          color: 'white',
        }}
      >
        <div style={{fontSize: 34, fontWeight: 500, marginBottom: 26, opacity: 0.9}}>
          Baskets
        </div>
        {[
          {label: 'AI Narratives', value: '+18.4%'},
          {label: 'On-chain Gaming', value: '+9.1%'},
          {label: 'Real World Assets', value: '+4.7%'},
        ].map((row) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '18px 0',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              fontSize: 26,
            }}
          >
            <span style={{opacity: 0.85}}>{row.label}</span>
            <span style={{color: '#4ade80', fontWeight: 600}}>{row.value}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 84,
          width: '100%',
          textAlign: 'center',
          fontFamily: BRAND_FONT,
          fontSize: 70,
          fontWeight: 300,
          color: 'white',
          letterSpacing: '0.03em',
          textShadow: '0 4px 40px rgba(0,0,0,0.7)',
        }}
      >
        Trade them. In one tap.
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fade = interpolate(frame, [0.4 * fps, 1.5 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tagFade = interpolate(frame, [1.4 * fps, 2.4 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const drift = interpolate(frame, [0, ENDCARD_SECONDS * fps], [8, 0]);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          transform: `translateY(${drift}px)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            opacity: fade,
          }}
        >
          <div
            style={{
              fontFamily: BRAND_FONT,
              fontSize: 64,
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
              fontSize: 114,
              fontWeight: 500,
              color: 'white',
              letterSpacing: '0.01em',
              textShadow: '0 4px 50px rgba(0,0,0,0.6)',
            }}
          >
            novagate
          </div>
        </div>
        <div
          style={{
            fontFamily: BRAND_FONT,
            fontSize: 40,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            opacity: tagFade,
            textShadow: '0 4px 40px rgba(0,0,0,0.7)',
          }}
        >
          Trade the narrative.
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const NarrativesFilm: React.FC = () => {
  let from = 0;
  const seqs: React.ReactNode[] = SHOTS.map((shot) => {
    const dur = Math.round(shot.seconds * FPS);
    const seq = (
      <Sequence key={shot.src} from={from} durationInFrames={dur}>
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile(shot.src)}
            muted
            trimBefore={Math.round((shot.from ?? 0) * FPS)}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </AbsoluteFill>
        {shot.text ? <KineticText text={shot.text} durationFrames={dur} /> : null}
      </Sequence>
    );
    from += dur;
    return seq;
  });

  const productFrom = from;
  const endFrom = productFrom + Math.round(PRODUCT_SECONDS * FPS);

  return (
    <AbsoluteFill style={{background: 'black'}}>
      {seqs}
      <Sequence
        from={productFrom}
        durationInFrames={Math.round(PRODUCT_SECONDS * FPS)}
      >
        <ProductBeat />
      </Sequence>
      <Sequence
        from={endFrom}
        durationInFrames={Math.round(ENDCARD_SECONDS * FPS)}
      >
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile('footage/novagate/s9.mp4')}
            muted
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </AbsoluteFill>
        <EndCard />
      </Sequence>
      <Grain />
    </AbsoluteFill>
  );
};

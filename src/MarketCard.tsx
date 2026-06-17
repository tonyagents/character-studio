import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {MarketSpec} from './scenario';

const FONT =
  '"Avenir Next", "Helvetica Neue", -apple-system, "Segoe UI", sans-serif';

const Card: React.FC<{spec: MarketSpec; accent: string}> = ({spec, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 15, stiffness: 120}});

  const t = spec.from + frame / fps;
  const winFrame = spec.winAt ? Math.round((spec.winAt - spec.from) * fps) : null;
  const won = winFrame !== null && frame >= winFrame;

  const yes = Math.round(
    interpolate(
      t,
      [spec.from + 0.8, (spec.winAt ?? spec.to) - 0.3],
      [spec.yesStart, spec.yesEnd],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
    )
  );

  const winPop = winFrame !== null
    ? spring({
        frame: Math.max(0, frame - winFrame),
        fps,
        config: {damping: 10, stiffness: 180},
      })
    : 0;

  return (
    <div
      style={{
        fontFamily: FONT,
        width: 720,
        borderRadius: 36,
        padding: '34px 40px',
        background: 'rgba(16, 8, 40, 0.82)',
        border: '2px solid rgba(255,255,255,0.14)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
        backdropFilter: 'blur(8px)',
        transform: `scale(${0.8 + 0.2 * enter}) translateY(${(1 - enter) * 60}px)`,
        opacity: enter,
        color: 'white',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18}}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}
        >
          🌙
        </div>
        <div style={{fontSize: 30, fontWeight: 700, letterSpacing: 0.5}}>
          MoonAgents
        </div>
        <div
          style={{
            marginLeft: 'auto',
            fontSize: 22,
            fontWeight: 600,
            opacity: 0.65,
          }}
        >
          Prediction Market
        </div>
      </div>
      <div style={{fontSize: 40, fontWeight: 800, lineHeight: 1.15, marginBottom: 24}}>
        {spec.question}
      </div>
      {won ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            transform: `scale(${0.9 + 0.1 * winPop})`,
          }}
        >
          <div
            style={{
              background: '#16c784',
              borderRadius: 18,
              padding: '16px 30px',
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            WON {spec.payout ?? ''} 🎉
          </div>
          <div style={{fontSize: 28, fontWeight: 600, opacity: 0.8}}>
            Paid out instantly
          </div>
        </div>
      ) : (
        <div style={{display: 'flex', gap: 18}}>
          <div
            style={{
              flex: 1,
              background: 'rgba(22, 199, 132, 0.18)',
              border: '2px solid #16c784',
              borderRadius: 18,
              padding: '14px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{fontSize: 30, fontWeight: 800, color: '#16c784'}}>
              YES
            </span>
            <span style={{fontSize: 34, fontWeight: 800}}>{yes}¢</span>
          </div>
          <div
            style={{
              flex: 1,
              background: 'rgba(234, 57, 67, 0.14)',
              border: '2px solid rgba(234, 57, 67, 0.7)',
              borderRadius: 18,
              padding: '14px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              opacity: 0.85,
            }}
          >
            <span style={{fontSize: 30, fontWeight: 800, color: '#ea3943'}}>
              NO
            </span>
            <span style={{fontSize: 34, fontWeight: 800}}>{100 - yes}¢</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const Markets: React.FC<{markets: MarketSpec[]; accent: string}> = ({
  markets,
  accent,
}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      {markets.map((m, i) => (
        <Sequence
          key={i}
          from={Math.round(m.from * fps)}
          durationInFrames={Math.max(1, Math.round((m.to - m.from) * fps))}
          layout="none"
        >
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: m.place === 'bottom' ? 'flex-end' : 'flex-start',
              paddingTop: m.place === 'bottom' ? undefined : '20%',
              paddingBottom: m.place === 'bottom' ? '10%' : undefined,
            }}
          >
            <Card spec={m} accent={accent} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

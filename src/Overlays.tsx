import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {TextSpec} from './scenario';

const FONT =
  '"Avenir Next", "Helvetica Neue", -apple-system, "Segoe UI", sans-serif';

const TextItem: React.FC<{spec: TextSpec; accent: string; durationInFrames: number}> = ({
  spec,
  accent,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 16, stiffness: 130}});
  const exit = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames - 2],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const variant = spec.variant ?? 'title';
  const base: React.CSSProperties = {
    fontFamily: FONT,
    color: spec.color ?? 'white',
    opacity: exit,
    transform: `scale(${0.85 + 0.15 * enter}) translateY(${(1 - enter) * 40}px)`,
    textAlign: 'center',
    maxWidth: '86%',
  };

  const styles: Record<string, React.CSSProperties> = {
    title: {
      ...base,
      fontSize: 92,
      fontWeight: 800,
      letterSpacing: -2,
      lineHeight: 1.05,
      textShadow: '0 8px 40px rgba(0,0,0,0.45)',
    },
    subtitle: {
      ...base,
      fontSize: 56,
      fontWeight: 600,
      textShadow: '0 6px 30px rgba(0,0,0,0.4)',
    },
    badge: {
      ...base,
      fontSize: 44,
      fontWeight: 700,
      background: accent,
      padding: '20px 44px',
      borderRadius: 999,
      boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
    },
  };

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: spec.place === 'bottom' ? undefined : '11%',
        paddingBottom: spec.place === 'bottom' ? '8%' : undefined,
        ...(spec.place === 'bottom' ? {justifyContent: 'flex-end'} : {}),
      }}
    >
      <div style={styles[variant]}>{spec.text}</div>
    </AbsoluteFill>
  );
};

export const Overlays: React.FC<{texts: TextSpec[]; accent: string}> = ({
  texts,
  accent,
}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      {texts.map((t, i) => {
        const from = Math.round(t.from * fps);
        const dur = Math.max(1, Math.round((t.to - t.from) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <TextItem spec={t} accent={accent} durationInFrames={dur} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

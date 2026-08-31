import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {AutomationSpec} from './scenario';

const FONT =
  '"Avenir Next", "Helvetica Neue", -apple-system, "Segoe UI", sans-serif';

const Card: React.FC<{spec: AutomationSpec; accent: string}> = ({spec, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 15, stiffness: 120}});

  const triggerFrame = spec.triggerAt
    ? Math.round((spec.triggerAt - spec.from) * fps)
    : null;
  const triggered = triggerFrame !== null && frame >= triggerFrame;
  const pop = triggered
    ? spring({
        frame: Math.max(0, frame - (triggerFrame ?? 0)),
        fps,
        config: {damping: 10, stiffness: 180},
      })
    : 0;

  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(frame / 12));

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
          Automations
        </div>
      </div>
      <div style={{fontSize: 40, fontWeight: 800, lineHeight: 1.15, marginBottom: 24}}>
        {spec.title}
      </div>
      {triggered ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            transform: `scale(${0.9 + 0.1 * pop})`,
          }}
        >
          <div
            style={{
              background: '#16c784',
              borderRadius: 18,
              padding: '16px 30px',
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            Condition met
          </div>
          <div style={{fontSize: 26, fontWeight: 600, opacity: 0.85}}>
            {spec.result ?? ''}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: 'rgba(22, 199, 132, 0.14)',
            border: '2px solid rgba(22,199,132,0.6)',
            borderRadius: 18,
            padding: '14px 24px',
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#16c784',
              opacity: pulse,
            }}
          />
          <span style={{fontSize: 28, fontWeight: 700}}>{spec.status}</span>
        </div>
      )}
      <div
        style={{
          marginTop: 24,
          fontSize: 20,
          fontWeight: 600,
          opacity: 0.55,
          letterSpacing: 0.3,
        }}
      >
        {spec.footer ?? 'Observe only · Cannot move funds'}
      </div>
    </div>
  );
};

export const Automations: React.FC<{automations: AutomationSpec[]; accent: string}> = ({
  automations,
  accent,
}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      {automations.map((a, i) => (
        <Sequence
          key={i}
          from={Math.round(a.from * fps)}
          durationInFrames={Math.max(1, Math.round((a.to - a.from) * fps))}
          layout="none"
        >
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: a.place === 'top' ? 'flex-start' : 'flex-end',
              paddingTop: a.place === 'top' ? '22%' : undefined,
              paddingBottom: a.place === 'top' ? undefined : '12%',
            }}
          >
            <Card spec={a} accent={accent} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Background} from './scenario';

const SKY_FILL = 'rgba(18, 10, 48, 0.72)';

const Skylines: Record<string, React.ReactNode> = {
  // Mexico City: volcanoes, cathedral dome, Torre Latinoamericana
  cdmx: (
    <svg viewBox="0 0 1000 240" preserveAspectRatio="none" style={{width: '100%', height: '100%'}}>
      <polygon fill="rgba(30, 16, 70, 0.35)" points="0,240 0,150 140,70 300,160 430,90 560,170 720,80 880,160 1000,120 1000,240" />
      <g fill={SKY_FILL}>
        <rect x="40" y="150" width="70" height="90" />
        <rect x="130" y="170" width="55" height="70" />
        <rect x="210" y="140" width="65" height="100" />
        <rect x="300" y="165" width="80" height="75" />
        <path d="M420 240 v-60 a40 40 0 0 1 80 0 v60 z" />
        <rect x="455" y="150" width="10" height="34" />
        <rect x="540" y="155" width="60" height="85" />
        <polygon points="640,240 640,90 655,80 670,90 670,240" />
        <rect x="630" y="100" width="50" height="12" />
        <rect x="636" y="56" width="38" height="46" />
        <rect x="650" y="30" width="10" height="28" />
        <rect x="710" y="160" width="70" height="80" />
        <rect x="800" y="140" width="55" height="100" />
        <rect x="880" y="170" width="75" height="70" />
      </g>
    </svg>
  ),
  // Los Angeles: hills, downtown cluster with round-top tower
  la: (
    <svg viewBox="0 0 1000 240" preserveAspectRatio="none" style={{width: '100%', height: '100%'}}>
      <polygon fill="rgba(30, 16, 70, 0.3)" points="0,240 0,170 180,100 360,180 520,140 700,190 860,130 1000,180 1000,240" />
      <g fill={SKY_FILL}>
        <rect x="330" y="130" width="50" height="110" />
        <rect x="400" y="100" width="55" height="140" />
        <path d="M480 240 v-130 a28 28 0 0 1 56 0 v130 z" />
        <rect x="498" y="86" width="20" height="20" />
        <rect x="560" y="120" width="48" height="120" />
        <rect x="625" y="150" width="55" height="90" />
        <polygon points="700,240 700,160 727,135 754,160 754,240" />
        <g>
          <rect x="120" y="180" width="7" height="60" />
          <ellipse cx="123" cy="172" rx="26" ry="12" />
          <rect x="870" y="175" width="7" height="65" />
          <ellipse cx="873" cy="167" rx="26" ry="12" />
        </g>
      </g>
    </svg>
  ),
  // Toronto: CN Tower, dome, boxy waterfront towers
  toronto: (
    <svg viewBox="0 0 1000 240" preserveAspectRatio="none" style={{width: '100%', height: '100%'}}>
      <g fill={SKY_FILL}>
        <rect x="60" y="140" width="70" height="100" />
        <rect x="150" y="160" width="55" height="80" />
        <rect x="230" y="120" width="65" height="120" />
        <rect x="320" y="150" width="70" height="90" />
        <path d="M420 240 v-45 a55 55 0 0 1 110 0 v45 z" />
        <polygon points="585,240 593,90 600,90 608,240" />
        <ellipse cx="596" cy="92" rx="26" ry="14" />
        <rect x="588" y="60" width="16" height="26" />
        <polygon points="593,60 596,14 599,60" />
        <rect x="660" y="130" width="60" height="110" />
        <rect x="740" y="105" width="55" height="135" />
        <rect x="815" y="145" width="65" height="95" />
        <rect x="900" y="165" width="60" height="75" />
      </g>
    </svg>
  ),
};

// Rendered in front of the 3D canvas so confetti falls over the scene
export const Confetti: React.FC<{spec: {from: number; colors: string[]}}> = ({
  spec,
}) => {
  const frame = useCurrentFrame();
  const {fps, height, width} = useVideoConfig();
  if (frame < spec.from * fps) {
    return null;
  }
  const t = frame - spec.from * fps;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 90}).map((_, i) => {
        const speed = 4 + random(`cf-v${i}`) * 5;
        const x =
          random(`cf-x${i}`) * width + Math.sin((t + i * 7) / 11) * 40;
        const y =
          ((t * speed + random(`cf-y${i}`) * (height + 200)) % (height + 200)) -
          100;
        const rot = (t * (2 + random(`cf-r${i}`) * 6) + i * 40) % 360;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 14 + random(`cf-w${i}`) * 10,
              height: 8 + random(`cf-h${i}`) * 8,
              background: spec.colors[i % spec.colors.length],
              borderRadius: 3,
              transform: `rotate(${rot}deg)`,
              opacity: 0.9,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Backdrop: React.FC<{bg: Background}> = ({bg}) => {
  const frame = useCurrentFrame();
  const colors = bg.colors ?? ['#0b0530', '#5b18c4'];
  const horizon = bg.horizon ?? 50;

  return (
    <AbsoluteFill
      style={{background: `linear-gradient(180deg, ${colors.join(', ')})`}}
    >
      {bg.stars
        ? Array.from({length: 140}).map((_, i) => {
            const x = random(`x-${i}`) * 100;
            const y = random(`y-${i}`) * 65;
            const s = 1 + random(`s-${i}`) * 3;
            const base = 0.3 + random(`o-${i}`) * 0.7;
            const twinkle =
              0.75 + 0.25 * Math.sin(frame / 9 + random(`p-${i}`) * Math.PI * 2);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  width: s,
                  height: s,
                  borderRadius: '50%',
                  background: 'white',
                  opacity: base * twinkle,
                }}
              />
            );
          })
        : null}
      {bg.moon ? (
        <div
          style={{
            position: 'absolute',
            top: '7%',
            right: '10%',
            width: 170,
            height: 170,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 35% 35%, #ffffff, #d3c8ff 60%, #a193ec)',
            boxShadow: '0 0 90px 35px rgba(200, 180, 255, 0.35)',
          }}
        />
      ) : null}
      {bg.sun ? (
        <div
          style={{
            position: 'absolute',
            top: '8%',
            right: '12%',
            width: 190,
            height: 190,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 40% 40%, #fffbe8, #ffe27a 55%, #ffb347)',
            boxShadow: '0 0 120px 50px rgba(255, 215, 130, 0.45)',
          }}
        />
      ) : null}
      {bg.skyline ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${horizon - 13}%`,
            height: '13%',
          }}
        >
          {Skylines[bg.skyline]}
        </div>
      ) : null}
      {bg.vignette ? (
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

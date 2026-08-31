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

// "Lost kid + agent" film: 4 Seedance shots back-to-back with an
// iMessage-style Nova agent thread composited on top.

const FPS = 30;
const SHOTS = [
  {src: 'footage/lost-kid-shot1.mp4', seconds: 6},
  {src: 'footage/lost-kid-shot2.mp4', seconds: 5},
  {src: 'footage/lost-kid-shot3.mp4', seconds: 6},
  {src: 'footage/lost-kid-shot4.mp4', seconds: 5},
];
export const TOTAL_SECONDS = SHOTS.reduce((s, x) => s + x.seconds, 0);

type Msg = {
  at: number; // seconds
  until?: number;
  from: 'agent' | 'kid';
  text: string;
  receipt?: boolean; // render as a money-action receipt bubble
};

// Thread clears when a shot cut would leave stale bubbles mid-frame.
const MESSAGES: Msg[] = [
  {at: 6.8, until: 11, from: 'agent', text: 'hey, I’m Moon — your money agent 🌙'},
  {at: 8.4, until: 11, from: 'agent', text: 'new city is a lot. I’ve got the money stuff.'},
  {at: 9.7, until: 11, from: 'kid', text: 'mom needs groceries 😭'},
  {at: 11.6, until: 17, from: 'agent', text: 'Sent $40 to Mom 🇲🇽', receipt: true},
  {at: 12.9, until: 17, from: 'agent', text: 'Bus pass topped up · $20', receipt: true},
  {at: 14.2, until: 17, from: 'agent', text: 'Moved $12 to savings 🌙', receipt: true},
  {at: 15.4, until: 17, from: 'kid', text: 'gracias!! 🙏'},
  {at: 17.6, until: 22, from: 'agent', text: 'all handled. go be a kid 💜'},
];

const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';

const Bubble: React.FC<{msg: Msg}> = ({msg}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const startFrame = msg.at * fps;
  const pop = spring({frame: frame - startFrame, fps, config: {damping: 14, stiffness: 160}});
  const gone = msg.until ? interpolate(frame, [(msg.until - 0.4) * fps, msg.until * fps], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  if (frame < startFrame || gone === 0) return null;

  const agent = msg.from === 'agent';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: agent ? 'flex-start' : 'flex-end',
        opacity: gone,
        transform: `scale(${0.6 + 0.4 * pop}) translateY(${(1 - pop) * 30}px)`,
        transformOrigin: agent ? 'bottom left' : 'bottom right',
      }}
    >
      <div
        style={{
          maxWidth: 640,
          padding: msg.receipt ? '22px 30px' : '20px 30px',
          borderRadius: 40,
          fontFamily: FONT,
          fontSize: 40,
          lineHeight: 1.25,
          color: 'white',
          background: agent
            ? msg.receipt
              ? 'linear-gradient(135deg, rgba(125,0,255,0.92), rgba(90,0,190,0.92))'
              : 'rgba(44,44,48,0.92)'
            : 'rgba(10,132,255,0.95)',
          border: msg.receipt ? '2px solid rgba(255,255,255,0.35)' : 'none',
          boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
        }}
      >
        {msg.receipt ? (
          <span style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
              }}
            >
              ✓
            </span>
            <span style={{fontWeight: 600}}>{msg.text}</span>
          </span>
        ) : (
          msg.text
        )}
      </div>
    </div>
  );
};

const Thread: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const visible = MESSAGES.filter((m) => t >= m.at && (!m.until || t < m.until));
  if (visible.length === 0) return null;

  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', padding: '0 60px 320px'}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
        <div
          style={{
            alignSelf: 'flex-start',
            fontFamily: FONT,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
            color: 'rgba(255,255,255,0.85)',
            background: 'rgba(0,0,0,0.45)',
            padding: '12px 26px',
            borderRadius: 30,
            marginBottom: 6,
          }}
        >
          🌙 MOON · your agent
        </div>
        {MESSAGES.map((m, i) => (
          <Bubble key={i} msg={m} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity =
    interpolate(frame, [0.8 * fps, 1.4 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    interpolate(frame, [5.0 * fps, 5.8 * fps], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 200, opacity}}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 52,
          fontWeight: 700,
          color: 'white',
          textAlign: 'center',
          textShadow: '0 4px 24px rgba(0,0,0,0.8)',
          maxWidth: 860,
        }}
      >
        New country. Zero idea how money works here.
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = (TOTAL_SECONDS - 3) * fps;
  const inOp = interpolate(frame, [start, start + 0.6 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (frame < start) return null;
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: `rgba(7,2,31,${0.82 * inOp})`,
        opacity: inOp,
        gap: 28,
      }}
    >
      <div style={{fontFamily: FONT, fontSize: 96, fontWeight: 800, letterSpacing: 6, color: 'white'}}>
        N<span style={{color: '#7D00FF'}}>OV</span>A
      </div>
      <div style={{fontFamily: FONT, fontSize: 42, color: 'rgba(255,255,255,0.85)'}}>
        Agents that handle the money stuff.
      </div>
    </AbsoluteFill>
  );
};

export const LostKidFilm: React.FC = () => {
  let offset = 0;
  return (
    <AbsoluteFill style={{background: 'black'}}>
      {SHOTS.map((shot) => {
        const from = offset * FPS;
        offset += shot.seconds;
        return (
          <Sequence key={shot.src} from={from} durationInFrames={shot.seconds * FPS}>
            <OffthreadVideo src={staticFile(shot.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </Sequence>
        );
      })}
      <Caption />
      <Thread />
      <EndCard />
    </AbsoluteFill>
  );
};

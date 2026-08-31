import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import type {Scenario} from './scenario';
import {Backdrop, Confetti} from './Backdrop';
import {CameraRig} from './CameraRig';
import {Stage} from './Stage';
import {Character} from './Character';
import {Crowd} from './Crowd';
import {Overlays} from './Overlays';
import {Markets} from './MarketCard';
import {Automations} from './AutomationCard';

export const Main: React.FC<Scenario> = (scenario) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Backdrop bg={scenario.background} />
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        gl={{alpha: true, antialias: true}}
        camera={{fov: 45, near: 0.1, far: 200, position: [0, 2, 8]}}
        style={{position: 'absolute', inset: 0}}
      >
        <CameraRig keyframes={scenario.camera} />
        <Stage groundColor={scenario.background.ground ?? '#222233'} />
        {scenario.characters.map((c, i) => (
          <Character key={`${c.model}-${c.clip}-${i}`} spec={c} />
        ))}
        {scenario.crowd ? <Crowd spec={scenario.crowd} /> : null}
      </ThreeCanvas>
      {scenario.background.confetti ? (
        <Confetti spec={scenario.background.confetti} />
      ) : null}
      <Overlays texts={scenario.texts} accent={scenario.accentColor ?? '#7D00FF'} />
      {scenario.markets?.length ? (
        <Markets markets={scenario.markets} accent={scenario.accentColor ?? '#7D00FF'} />
      ) : null}
      {scenario.automations?.length ? (
        <Automations
          automations={scenario.automations}
          accent={scenario.accentColor ?? '#7D00FF'}
        />
      ) : null}
    </AbsoluteFill>
  );
};

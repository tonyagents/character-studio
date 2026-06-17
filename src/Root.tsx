import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Video';
import type {Scenario} from './scenario';
import demo from '../scenarios/moonpay-launch.json';

export const Root: React.FC = () => {
  return (
    <Composition
      id="Main"
      component={Main}
      durationInFrames={270}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={demo as Scenario}
      calculateMetadata={({props}) => ({
        durationInFrames: Math.max(1, Math.round(props.durationSeconds * props.fps)),
        fps: props.fps,
        width: props.width,
        height: props.height,
      })}
    />
  );
};

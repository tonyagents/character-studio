import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Video';
import {LostKidFilm, TOTAL_SECONDS} from './LostKidFilm';
import {NovaGateFilm, NOVAGATE_DURATION_FRAMES} from './NovaGateFilm';
import {NarrativesFilm, NARRATIVES_DURATION_FRAMES} from './NarrativesFilm';
import type {Scenario} from './scenario';
import demo from '../scenarios/nova-launch.json';

export const Root: React.FC = () => {
  return (
    <>
    <Composition
      id="NarrativesFilm"
      component={NarrativesFilm}
      durationInFrames={NARRATIVES_DURATION_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="NovaGateFilm"
      component={NovaGateFilm}
      durationInFrames={NOVAGATE_DURATION_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="LostKidFilm"
      component={LostKidFilm}
      durationInFrames={TOTAL_SECONDS * 30}
      fps={30}
      width={1080}
      height={1920}
    />
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
    </>
  );
};

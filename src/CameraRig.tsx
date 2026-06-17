import type React from 'react';
import {useThree} from '@react-three/fiber';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CameraKeyframe, Vec3} from './scenario';

export const CameraRig: React.FC<{keyframes: CameraKeyframe[]}> = ({
  keyframes,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const camera = useThree((s) => s.camera);
  const t = frame / fps;

  const ks = [...keyframes]
    .sort((a, b) => a.at - b.at)
    .filter((k, i, arr) => i === 0 || k.at > arr[i - 1].at);

  const sample = (sel: (k: CameraKeyframe) => Vec3): Vec3 => {
    if (ks.length === 1) {
      return sel(ks[0]);
    }
    return [0, 1, 2].map((i) =>
      interpolate(
        t,
        ks.map((k) => k.at),
        ks.map((k) => sel(k)[i]),
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.inOut(Easing.ease),
        }
      )
    ) as Vec3;
  };

  const pos = sample((k) => k.position);
  const look = sample((k) => k.lookAt);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);

  return null;
};

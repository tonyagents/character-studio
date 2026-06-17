import React from 'react';
import {random} from 'remotion';
import type {CharacterSpec, CrowdSpec, Vec3} from './scenario';
import {Character} from './Character';

// Deterministically expands a CrowdSpec into Character placements,
// scattered in a ring/arc around the stage, facing roughly inward.
export const Crowd: React.FC<{spec: CrowdSpec}> = ({spec}) => {
  const seed = spec.seed ?? 'crowd';
  const center = spec.center ?? [0, 0, 0];
  const inner = spec.innerRadius ?? 3;
  const outer = spec.outerRadius ?? 8;
  const arcStart = spec.arcStart ?? 0;
  const arcEnd = spec.arcEnd ?? 360;

  const members: CharacterSpec[] = Array.from({length: spec.count}).map(
    (_, i) => {
      const angle =
        ((arcStart +
          (arcEnd - arcStart) * ((i + 0.5) / spec.count) +
          (random(`${seed}-a${i}`) - 0.5) * ((arcEnd - arcStart) / spec.count)) *
          Math.PI) /
        180;
      const r = inner + (outer - inner) * random(`${seed}-r${i}`);
      const x = center[0] + Math.sin(angle) * r;
      const z = center[2] + Math.cos(angle) * r;
      const faceCenter =
        (Math.atan2(center[0] - x, center[2] - z) * 180) / Math.PI;
      return {
        model: spec.models[i % spec.models.length],
        clip: spec.clips[i % spec.clips.length],
        animLib: spec.animLib,
        beer:
          spec.beerChance && random(`${seed}-b${i}`) < spec.beerChance
            ? random(`${seed}-bh${i}`) < 0.5
              ? ('left' as const)
              : ('right' as const)
            : undefined,
        tint: spec.tints?.length
          ? spec.tints[i % spec.tints.length]
          : undefined,
        position: [x, center[1], z] as Vec3,
        rotationY: faceCenter + (random(`${seed}-f${i}`) - 0.5) * 50,
        scale:
          (spec.scaleMin ?? 0.9) +
          ((spec.scaleMax ?? 1.05) - (spec.scaleMin ?? 0.9)) *
            random(`${seed}-s${i}`),
        timeOffset: random(`${seed}-t${i}`) * 3,
      };
    }
  );

  return (
    <>
      {members.map((m, i) => (
        <Character key={i} spec={m} />
      ))}
    </>
  );
};

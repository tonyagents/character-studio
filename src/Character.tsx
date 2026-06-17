import React, {useEffect, useMemo, useState} from 'react';
import {useThree} from '@react-three/fiber';
import {
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader, type GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import type {CharacterSpec, Vec3} from './scenario';

// All models are normalized to roughly human height so scenarios can mix
// models of wildly different native scales (the Fox GLB is ~75 units tall).
const TARGET_HEIGHT = 1.7;

// Procedural beer mug: amber glass, foam cap, handle. Unit height = 1,
// origin at the grip (mid-height) so it sits naturally in a hand bone.
const buildBeerMug = (): THREE.Group => {
  const g = new THREE.Group();
  const glassMat = new THREE.MeshStandardMaterial({
    color: '#f59e0b',
    roughness: 0.15,
    transparent: true,
    opacity: 0.92,
  });
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.3, 0.8, 14),
    glassMat
  );
  g.add(glass);
  const foam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.37, 0.37, 0.18, 14),
    new THREE.MeshStandardMaterial({color: '#fff8e7', roughness: 0.9})
  );
  foam.position.y = 0.46;
  g.add(foam);
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.06, 8, 16),
    glassMat
  );
  handle.position.x = 0.4;
  g.add(handle);
  return g;
};

const findBone = (root: THREE.Object3D, pattern: RegExp): THREE.Bone | null => {
  let found: THREE.Bone | null = null;
  root.traverse((o) => {
    if (!found && (o as THREE.Bone).isBone && pattern.test(o.name)) {
      found = o as THREE.Bone;
    }
  });
  return found;
};

// Neither Box3.setFromObject (raw bind-pose geometry) nor bone positions
// reliably reflect what skinning actually draws — rigs mix unit spaces
// (Mixamo cm armatures, RobotExpressive's scale-100 armature). Sampling
// vertices through Mesh.getVertexPosition applies real bone transforms,
// so it measures the model as rendered.
const measureBounds = (root: THREE.Object3D): {height: number; minY: number} => {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) {
      return;
    }
    const pos = mesh.geometry?.getAttribute('position');
    if (!pos) {
      return;
    }
    const step = Math.max(1, Math.floor(pos.count / 1000));
    for (let i = 0; i < pos.count; i += step) {
      mesh.getVertexPosition(i, v);
      v.applyMatrix4(mesh.matrixWorld);
      box.expandByPoint(v);
    }
  });
  const height = box.max.y - box.min.y;
  return {height: height > 0.001 ? height : 1, minY: box.min.y};
};

export const Character: React.FC<{spec: CharacterSpec}> = ({spec}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const [gltf, setGltf] = useState<GLTF | null>(null);
  const [lib, setLib] = useState<GLTF | null>(null);
  const [handle] = useState(() => delayRender(`load-model-${spec.model}`));

  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (spec.model === 'box') {
      continueRender(handle);
      return;
    }
    const loader = new GLTFLoader();
    loader.load(
      staticFile(`models/${spec.model}.glb`),
      setGltf,
      undefined,
      (err) => cancelRender(err)
    );
    if (spec.animLib) {
      loader.load(
        staticFile(`models/${spec.animLib}.glb`),
        setLib,
        undefined,
        (err) => cancelRender(err)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rig = useMemo(() => {
    if (!gltf || (spec.animLib && !lib)) {
      return null;
    }
    const scene = SkeletonUtils.clone(gltf.scene);
    if (!spec.raw) {
      const {height, minY} = measureBounds(scene);
      const s = (TARGET_HEIGHT * (spec.scale ?? 1)) / height;
      scene.scale.setScalar(s);
      scene.position.y = -minY * s;
    }
    scene.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
      // Skinned meshes are culled by their raw geometry bounding sphere,
      // which can be wildly off from the bone-driven render result
      o.frustumCulled = false;
    });
    if (spec.tint || spec.recolor) {
      const tint = new THREE.Color(spec.tint ?? spec.recolor);
      const applyTint = (m: THREE.Material) => {
        const cloned = m.clone() as THREE.MeshStandardMaterial;
        if (spec.recolor) {
          // Full repaint: override vertex/texture coloring entirely
          cloned.vertexColors = false;
          cloned.map = null;
          cloned.color?.set(tint);
        } else {
          cloned.color?.multiply(tint);
        }
        return cloned;
      };
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh || !mesh.material) {
          return;
        }
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map(applyTint)
          : applyTint(mesh.material);
      });
    }
    if (spec.beer) {
      const bone = findBone(
        scene,
        spec.beer === 'left' ? /^Hand[._]?L/i : /^Hand[._]?R/i
      );
      if (bone) {
        scene.updateMatrixWorld(true);
        const ws = new THREE.Vector3();
        bone.getWorldScale(ws);
        const mug = buildBeerMug();
        mug.scale.setScalar(0.22 / (ws.y || 1));
        const [rx, ry, rz] = spec.beerRot ?? [0, 0, 180];
        mug.rotation.set(
          (rx * Math.PI) / 180,
          (ry * Math.PI) / 180,
          (rz * Math.PI) / 180
        );
        bone.add(mug);
      }
    }
    const group = new THREE.Group();
    group.add(scene);
    const mixer = new THREE.AnimationMixer(scene);
    // Clips can come from a shared animation library with the same rig
    const animations = spec.animLib ? lib!.animations : gltf.animations;
    // Loose clip matching: packs prefix clips ("CharacterArmature|Wave")
    const wanted = (spec.clip ?? '').toLowerCase();
    const clip = wanted
      ? animations.find((a) => a.name.toLowerCase() === wanted) ??
        animations.find((a) =>
          a.name.toLowerCase().split('|').pop()?.startsWith(wanted)
        ) ??
        animations.find((a) => a.name.toLowerCase().includes(wanted))
      : undefined;
    if (clip) {
      mixer.clipAction(clip).play();
    }
    return {group, mixer};
  }, [gltf, lib, spec.clip, spec.scale]);

  // Release delayRender only after the model is committed to the scene
  // graph and the canvas has had a chance to paint it — otherwise stills
  // and the first frames screenshot an empty canvas.
  useEffect(() => {
    if (!rig) {
      return;
    }
    invalidate();
    let raf2: number;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => continueRender(handle));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rig]);

  if (spec.model === 'box') {
    return (
      <mesh position={spec.position ?? [0, 1, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    );
  }

  if (!rig) {
    return null;
  }

  const t = frame / fps;
  const from = spec.from ?? 0;
  const to = spec.to ?? Infinity;
  if (t < from || t >= to) {
    return null;
  }

  // Drive the animation deterministically from the Remotion frame
  rig.mixer.setTime(
    Math.max(0, (t - from) * (spec.timeScale ?? 1) + (spec.timeOffset ?? 0))
  );

  let position: Vec3 = spec.position ?? [0, 0, 0];
  if (spec.moveTo) {
    const m = spec.moveTo;
    position = [0, 1, 2].map((i) =>
      interpolate(t, [m.startAt, m.endAt], [position[i], m.position[i]], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    ) as Vec3;
  }

  return (
    <primitive
      object={rig.group}
      position={position}
      rotation-y={((spec.rotationY ?? 0) * Math.PI) / 180}
    />
  );
};

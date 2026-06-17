import React from 'react';

export const Stage: React.FC<{groundColor: string}> = ({groundColor}) => {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#3a2a6a', 1.1]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.8} color="#b89cff" />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color={groundColor} roughness={0.95} metalness={0} />
      </mesh>
    </>
  );
};

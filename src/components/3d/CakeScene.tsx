import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Cake3D } from './Cake3D';
import { SmokeEffect } from './SmokeEffect';
import { RomanticScene } from './RomanticScene';
import * as THREE from 'three';

interface CakeSceneProps {
  candlesLit: boolean;
  showSmoke: boolean;
  showRomanticScene: boolean;
}

export const CakeScene = ({ candlesLit, showSmoke, showRomanticScene }: CakeSceneProps) => {
  const [bgColor, setBgColor] = useState('#fdf2f8');

  useEffect(() => {
    if (showRomanticScene) {
      const timeout = setTimeout(() => setBgColor('#0a0a1a'), 100);
      return () => clearTimeout(timeout);
    } else {
      setBgColor('#fdf2f8');
    }
  }, [showRomanticScene]);

  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-romantic relative">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 45 }}
        style={{ background: bgColor, transition: 'background 2s ease-in-out' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={showRomanticScene ? 0.1 : 0.5} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={showRomanticScene ? 0.3 : 1}
            castShadow
          />
          <pointLight position={[-5, 5, -5]} intensity={0.3} color="#ff9999" />
          
          {/* Romantic scene background */}
          {showRomanticScene && <RomanticScene />}
          
          {/* Cake */}
          <group position={[0, -0.5, 0]}>
            <Cake3D candlesLit={candlesLit} />
            <SmokeEffect active={showSmoke} />
          </group>
          
          {/* Shadow */}
          <ContactShadows
            position={[0, -0.55, 0]}
            opacity={0.4}
            scale={3}
            blur={2}
            far={4}
          />
          
          {/* Environment */}
          {!showRomanticScene && <Environment preset="sunset" />}
          
          {/* Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            minDistance={3}
            maxDistance={8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

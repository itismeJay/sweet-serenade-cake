import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Cake3D } from './Cake3D';
import { SmokeEffect } from './SmokeEffect';
import { RomanticScene } from './RomanticScene';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';

// Loading component
const LoadingFallback = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-blush/50 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-10 h-10 text-rose animate-spin" />
      <p className="text-lg font-display text-rose">Loading your cake...</p>
    </div>
  </div>
);

interface CakeSceneProps {
  candlesLit: boolean;
  showSmoke: boolean;
  showRomanticScene: boolean;
  blowIntensity?: number;
  photoUrl?: string;
}

// Camera animation controller
const CameraController = ({ 
  transitioning, 
  showRomanticScene 
}: { 
  transitioning: boolean;
  showRomanticScene: boolean;
}) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 2, 5));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.5, 0));

  useFrame(() => {
    if (showRomanticScene) {
      // Pull camera back and up for romantic scene
      targetPosition.current.set(0, 3, 7);
      targetLookAt.current.set(0, 0.5, 0);
    } else {
      targetPosition.current.set(0, 2, 5);
      targetLookAt.current.set(0, 0.5, 0);
    }

    // Smooth camera transition
    camera.position.lerp(targetPosition.current, 0.02);
    
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.add(camera.position);
    currentLookAt.lerp(targetLookAt.current, 0.02);
  });

  return null;
};

// Lighting that transitions between scenes
const SceneLighting = ({ showRomanticScene }: { showRomanticScene: boolean }) => {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const mainLightRef = useRef<THREE.DirectionalLight>(null);
  const warmLightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (!ambientRef.current || !mainLightRef.current || !warmLightRef.current) return;

    const targetAmbient = showRomanticScene ? 0.15 : 0.6;
    const targetMain = showRomanticScene ? 0.3 : 1.2;
    const targetWarm = showRomanticScene ? 0.5 : 0.4;

    ambientRef.current.intensity += (targetAmbient - ambientRef.current.intensity) * 0.02;
    mainLightRef.current.intensity += (targetMain - mainLightRef.current.intensity) * 0.02;
    warmLightRef.current.intensity += (targetWarm - warmLightRef.current.intensity) * 0.02;
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.6} />
      <directionalLight
        ref={mainLightRef}
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight 
        ref={warmLightRef}
        position={[-5, 5, -5]} 
        intensity={0.4} 
        color="#ffccaa" 
      />
      <pointLight position={[3, 3, 3]} intensity={0.3} color="#ffd4e5" />
    </>
  );
};

export const CakeScene = ({ 
  candlesLit, 
  showSmoke, 
  showRomanticScene,
  blowIntensity = 0,
  photoUrl
}: CakeSceneProps) => {
  const [bgColor, setBgColor] = useState('#fdf2f8');
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (showRomanticScene) {
      setTransitioning(true);
      const colorTransition = setInterval(() => {
        setBgColor(prev => {
          // Gradually darken
          const current = parseInt(prev.slice(1), 16);
          const target = 0x0a0a1a;
          if (current <= target + 0x101010) {
            clearInterval(colorTransition);
            return '#0a0a1a';
          }
          const newColor = Math.max(current - 0x050508, target);
          return '#' + newColor.toString(16).padStart(6, '0');
        });
      }, 50);
      
      setTimeout(() => setTransitioning(false), 2000);
      return () => clearInterval(colorTransition);
    } else {
      setBgColor('#fdf2f8');
    }
  }, [showRomanticScene]);

  const candlePositions: [number, number, number][] = [
    [0, 1.1, 0],
    [0.12, 1.1, 0.08],
    [-0.12, 1.1, 0.08],
    [0.08, 1.1, -0.12],
    [-0.08, 1.1, -0.12],
  ];

  return (
    <div className="w-full h-[550px] md:h-[650px] rounded-2xl overflow-hidden shadow-romantic relative">
      <LoadingFallback />
      <Canvas
        shadows
        dpr={[1, 2]}
        style={{ 
          background: bgColor, 
          transition: 'background 2s ease-in-out' 
        }}
        gl={{ antialias: true, alpha: true }}
        onCreated={() => {
          // Hide loading once canvas is ready
          const loader = document.querySelector('.loading-fallback');
          if (loader) loader.remove();
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={45} />
          <CameraController transitioning={transitioning} showRomanticScene={showRomanticScene} />
          
          {/* Scene lighting */}
          <SceneLighting showRomanticScene={showRomanticScene} />
          
          {/* Romantic background scene */}
          <RomanticScene visible={showRomanticScene} />
          
          {/* Main cake group */}
          <group position={[0, -0.5, 0]}>
            <Cake3D 
              candlesLit={candlesLit} 
              blowIntensity={blowIntensity}
              photoUrl={photoUrl}
            />
            <SmokeEffect 
              active={showSmoke} 
              candlePositions={candlePositions}
            />
          </group>
          
          {/* Ground shadow */}
          <ContactShadows
            position={[0, -0.52, 0]}
            opacity={showRomanticScene ? 0.2 : 0.5}
            scale={4}
            blur={2.5}
            far={4}
          />
          
          {/* Environment for reflections */}
          {!showRomanticScene && (
            <Environment preset="sunset" />
          )}
          
          {/* Orbit controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={3}
            maxDistance={9}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

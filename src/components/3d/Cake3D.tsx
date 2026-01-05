import { useRef, useMemo, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface Cake3DProps {
  candlesLit: boolean;
  blowIntensity?: number;
  photoUrl?: string;
}

const CandleFlame = ({ 
  position, 
  lit, 
  blowIntensity = 0 
}: { 
  position: [number, number, number]; 
  lit: boolean;
  blowIntensity?: number;
}) => {
  const flameRef = useRef<THREE.Group>(null);
  const innerFlameRef = useRef<THREE.Mesh>(null);
  const outerFlameRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!lit || !flameRef.current) return;

    const time = state.clock.elapsedTime;
    const flickerSpeed = 10 + blowIntensity * 20;
    const flickerAmount = 0.15 + blowIntensity * 0.3;
    
    // Flame flickers more intensely when being blown
    const baseFlicker = Math.sin(time * flickerSpeed) * flickerAmount;
    const tiltAmount = blowIntensity * 0.5;
    
    flameRef.current.rotation.z = tiltAmount + baseFlicker * 0.3;
    flameRef.current.rotation.x = baseFlicker * 0.2;
    
    if (innerFlameRef.current) {
      innerFlameRef.current.scale.y = 1 + Math.sin(time * 12) * 0.2 - blowIntensity * 0.3;
      innerFlameRef.current.scale.x = 1 + Math.cos(time * 8) * 0.1;
    }
    
    if (outerFlameRef.current) {
      outerFlameRef.current.scale.y = 1 + Math.sin(time * 10 + 0.5) * 0.15 - blowIntensity * 0.4;
    }

    if (glowRef.current) {
      glowRef.current.intensity = (0.8 + Math.sin(time * 12) * 0.3) * (1 - blowIntensity * 0.5);
    }
  });

  if (!lit) return null;

  return (
    <group ref={flameRef} position={position}>
      {/* Inner bright core */}
      <mesh ref={innerFlameRef} position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color="#fffde7" transparent opacity={0.95} />
      </mesh>
      
      {/* Middle flame */}
      <mesh position={[0, 0.08, 0]} scale={[1, 1.3, 1]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshBasicMaterial color="#ffeb3b" transparent opacity={0.85} />
      </mesh>
      
      {/* Outer flame */}
      <mesh ref={outerFlameRef} position={[0, 0.1, 0]} scale={[1.2, 1.6, 1.2]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color="#ff9800" transparent opacity={0.6} />
      </mesh>
      
      {/* Flame tip */}
      <mesh position={[0, 0.14, 0]} scale={[0.6, 1.2, 0.6]}>
        <coneGeometry args={[0.015, 0.04, 8]} />
        <meshBasicMaterial color="#ff5722" transparent opacity={0.5} />
      </mesh>
      
      {/* Glow light */}
      <pointLight 
        ref={glowRef} 
        position={[0, 0.1, 0]} 
        color="#ff9944" 
        intensity={0.8} 
        distance={1.5}
        decay={2}
      />
    </group>
  );
};

const Candle = ({ 
  position, 
  lit, 
  blowIntensity = 0 
}: { 
  position: [number, number, number]; 
  lit: boolean;
  blowIntensity?: number;
}) => {
  return (
    <group position={position}>
      {/* Candle base */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.025, 0.028, 0.16, 16]} />
        <meshStandardMaterial 
          color="#fff8e1" 
          roughness={0.4} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Candle stripes */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.026, 0.029, 0.16, 16]} />
        <meshStandardMaterial 
          color="#f8bbd9" 
          roughness={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Wick */}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.03, 6]} />
        <meshStandardMaterial color={lit ? "#1a1a1a" : "#4a4a4a"} roughness={1} />
      </mesh>
      
      {/* Glowing wick tip when extinguished */}
      {!lit && (
        <mesh position={[0, 0.185, 0]}>
          <sphereGeometry args={[0.005, 8, 8]} />
          <meshBasicMaterial color="#ff6600" />
        </mesh>
      )}
      
      <CandleFlame position={[0, 0.18, 0]} lit={lit} blowIntensity={blowIntensity} />
    </group>
  );
};

const CakeLayer = ({ 
  position, 
  radius, 
  height, 
  cakeColor,
  frostingColor,
  dripColor 
}: { 
  position: [number, number, number]; 
  radius: number; 
  height: number;
  cakeColor: string;
  frostingColor: string;
  dripColor: string;
}) => {
  const dripPositions = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      return {
        angle,
        height: 0.06 + Math.random() * 0.12,
        offset: Math.random() * 0.02,
      };
    });
  }, []);

  return (
    <group position={position}>
      {/* Main cake body with texture-like appearance */}
      <mesh>
        <cylinderGeometry args={[radius, radius * 1.02, height, 48]} />
        <meshStandardMaterial 
          color={cakeColor} 
          roughness={0.8}
          metalness={0}
        />
      </mesh>
      
      {/* Frosting top layer */}
      <mesh position={[0, height / 2 + 0.015, 0]}>
        <cylinderGeometry args={[radius * 1.01, radius * 1.01, 0.03, 48]} />
        <meshStandardMaterial 
          color={frostingColor} 
          roughness={0.3}
          metalness={0.05}
        />
      </mesh>
      
      {/* Frosting drips */}
      {dripPositions.map((drip, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos(drip.angle) * (radius - 0.01),
            height / 2 - drip.height / 2,
            Math.sin(drip.angle) * (radius - 0.01)
          ]}
        >
          <capsuleGeometry args={[0.025 + drip.offset, drip.height, 6, 12]} />
          <meshStandardMaterial 
            color={dripColor} 
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>
      ))}
      
      {/* Decorative piping around edge */}
      <mesh position={[0, height / 2 + 0.03, 0]}>
        <torusGeometry args={[radius * 0.92, 0.018, 12, 48]} />
        <meshStandardMaterial 
          color={frostingColor} 
          roughness={0.3}
        />
      </mesh>
    </group>
  );
};

const Rose = ({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) => {
  const roseRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (roseRef.current) {
      roseRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const petalLayers = useMemo(() => {
    const layers = [];
    for (let layer = 0; layer < 4; layer++) {
      const petalCount = 5 + layer * 2;
      const layerRadius = 0.02 + layer * 0.015;
      const layerHeight = 0.01 + layer * 0.008;
      
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2 + layer * 0.3;
        layers.push({
          angle,
          radius: layerRadius,
          height: layerHeight,
          tilt: 0.2 + layer * 0.15,
          layer,
        });
      }
    }
    return layers;
  }, []);

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={roseRef} position={position} scale={scale}>
        {/* Rose petals */}
        {petalLayers.map((petal, i) => (
          <mesh 
            key={i}
            position={[
              Math.cos(petal.angle) * petal.radius,
              petal.height,
              Math.sin(petal.angle) * petal.radius
            ]}
            rotation={[petal.tilt, petal.angle, 0]}
          >
            <sphereGeometry args={[0.025, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial 
              color={color} 
              roughness={0.5} 
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        
        {/* Center bud */}
        <mesh position={[0, 0.04, 0]}>
          <sphereGeometry args={[0.015, 12, 12]} />
          <meshStandardMaterial color="#ff1744" roughness={0.4} />
        </mesh>
        
        {/* Leaves */}
        <mesh position={[0.04, -0.01, 0]} rotation={[0.3, 0, 0.5]}>
          <planeGeometry args={[0.04, 0.025]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.03, -0.01, 0.02]} rotation={[0.3, 0.5, -0.4]}>
          <planeGeometry args={[0.035, 0.02]} />
          <meshStandardMaterial color="#388e3c" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Float>
  );
};

const Heart3D = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => {
  const heartRef = useRef<THREE.Mesh>(null);

  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x, y + 0.035);
    shape.bezierCurveTo(x, y + 0.035, x - 0.018, y, x - 0.035, y);
    shape.bezierCurveTo(x - 0.056, y, x - 0.056, y + 0.025, x - 0.056, y + 0.025);
    shape.bezierCurveTo(x - 0.056, y + 0.038, x - 0.042, y + 0.054, x, y + 0.07);
    shape.bezierCurveTo(x + 0.042, y + 0.054, x + 0.056, y + 0.038, x + 0.056, y + 0.025);
    shape.bezierCurveTo(x + 0.056, y + 0.025, x + 0.056, y, x + 0.035, y);
    shape.bezierCurveTo(x + 0.018, y, x, y + 0.035, x, y + 0.035);
    return shape;
  }, []);

  useFrame((state) => {
    if (heartRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
      heartRef.current.scale.set(pulse * scale, pulse * scale, pulse * scale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={heartRef} position={position} rotation={[0, 0, Math.PI]} scale={scale}>
        <extrudeGeometry 
          args={[heartShape, { 
            depth: 0.015, 
            bevelEnabled: true, 
            bevelThickness: 0.005, 
            bevelSize: 0.005,
            bevelSegments: 3 
          }]} 
        />
        <meshStandardMaterial 
          color="#e91e63" 
          roughness={0.2} 
          metalness={0.3}
        />
      </mesh>
    </Float>
  );
};

const PhotoTopper = ({ position, photoUrl }: { position: [number, number, number]; photoUrl?: string }) => {
  const topperRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (topperRef.current) {
      topperRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
      <group ref={topperRef} position={position}>
        {/* Photo frame - heart shaped frame */}
        <mesh>
          <circleGeometry args={[0.15, 32]} />
          <meshStandardMaterial 
            color={photoUrl ? "#ffffff" : "#fce4ec"}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* Decorative frame border */}
        <mesh position={[0, 0, -0.01]}>
          <ringGeometry args={[0.14, 0.17, 32]} />
          <meshStandardMaterial 
            color="#ffd700" 
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>
        
        {/* Outer decorative ring */}
        <mesh position={[0, 0, -0.015]}>
          <ringGeometry args={[0.165, 0.18, 32]} />
          <meshStandardMaterial 
            color="#fff" 
            roughness={0.3}
          />
        </mesh>
        
        {/* Stand/stick */}
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.012, 0.015, 0.15, 12]} />
          <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.5} />
        </mesh>
        
        {/* Small hearts decoration */}
        <Heart3D position={[0.12, 0.12, 0.02]} scale={0.5} />
        <Heart3D position={[-0.12, 0.1, 0.02]} scale={0.4} />
      </group>
    </Float>
  );
};

const Ribbon = ({ position, radius }: { position: [number, number, number]; radius: number }) => {
  return (
    <group position={position}>
      {/* Main ribbon */}
      <mesh>
        <torusGeometry args={[radius, 0.015, 12, 48]} />
        <meshStandardMaterial 
          color="#ffd700" 
          roughness={0.15}
          metalness={0.7}
        />
      </mesh>
      
      {/* Ribbon bow */}
      <group position={[radius, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <mesh position={[0.03, 0.015, 0]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.6} />
        </mesh>
        <mesh position={[-0.03, 0.015, 0]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.015, 0]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#ffb300" roughness={0.2} metalness={0.6} />
        </mesh>
        {/* Ribbon tails */}
        <mesh position={[0, -0.03, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.015, 0.05, 0.003]} />
          <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.6} />
        </mesh>
        <mesh position={[0.015, -0.035, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.012, 0.045, 0.003]} />
          <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
};

export const Cake3D = ({ candlesLit, blowIntensity = 0, photoUrl }: Cake3DProps) => {
  const cakeRef = useRef<THREE.Group>(null);

  // Remove rotation - keep cake and plate static

  const candlePositions: [number, number, number][] = [
    [0, 0.92, 0],
    [0.12, 0.92, 0.08],
    [-0.12, 0.92, 0.08],
    [0.08, 0.92, -0.12],
    [-0.08, 0.92, -0.12],
  ];

  const roseConfigs = [
    { pos: [0.38, 0.28, 0.38] as [number, number, number], color: '#ff6b8a', scale: 1.2 },
    { pos: [-0.38, 0.28, 0.38] as [number, number, number], color: '#ff8fab', scale: 1.1 },
    { pos: [0.42, 0.28, -0.25] as [number, number, number], color: '#ff6b8a', scale: 1 },
    { pos: [-0.42, 0.28, -0.25] as [number, number, number], color: '#ffb3c6', scale: 1.1 },
    { pos: [0, 0.6, 0.32] as [number, number, number], color: '#ff4d6d', scale: 1 },
    { pos: [0.25, 0.6, -0.2] as [number, number, number], color: '#ff8fab', scale: 0.9 },
    { pos: [-0.25, 0.6, -0.2] as [number, number, number], color: '#ff6b8a', scale: 0.95 },
    { pos: [0.18, 0.88, 0.15] as [number, number, number], color: '#ff1744', scale: 0.8 },
    { pos: [-0.18, 0.88, 0.15] as [number, number, number], color: '#ff4081', scale: 0.75 },
  ];

  const heartPositions: [number, number, number][] = [
    [0.28, 0.95, 0.18],
    [-0.28, 0.95, 0.18],
    [0, 1, -0.22],
  ];

  return (
    <group ref={cakeRef}>
      {/* Cake plate */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 64]} />
        <meshStandardMaterial 
          color="#f5f0e6" 
          roughness={0.15} 
          metalness={0.4}
        />
      </mesh>
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.65, 0.68, 0.02, 64]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Bottom layer */}
      <CakeLayer 
        position={[0, 0.15, 0]} 
        radius={0.5} 
        height={0.3} 
        cakeColor="#ffe4c4"
        frostingColor="#ffc1e3"
        dripColor="#ff91a4"
      />

      {/* Middle layer */}
      <CakeLayer 
        position={[0, 0.42, 0]} 
        radius={0.38} 
        height={0.24} 
        cakeColor="#ffd4b8"
        frostingColor="#ffb6c1"
        dripColor="#ff6b8a"
      />

      {/* Top layer */}
      <CakeLayer 
        position={[0, 0.66, 0]} 
        radius={0.26} 
        height={0.24} 
        cakeColor="#ffcaaa"
        frostingColor="#ff91a4"
        dripColor="#ff4d6d"
      />

      {/* Candles */}
      {candlePositions.map((pos, i) => (
        <Candle key={i} position={pos} lit={candlesLit} blowIntensity={blowIntensity} />
      ))}

      {/* Roses */}
      {roseConfigs.map((rose, i) => (
        <Rose key={i} position={rose.pos} color={rose.color} scale={rose.scale} />
      ))}

      {/* Hearts */}
      {heartPositions.map((pos, i) => (
        <Heart3D key={i} position={pos} scale={0.7} />
      ))}

      {/* Golden ribbons */}
      <Ribbon position={[0, 0.15, 0]} radius={0.51} />
      <Ribbon position={[0, 0.42, 0]} radius={0.39} />

      {/* Photo topper */}
      <PhotoTopper position={[0, 1.15, 0]} photoUrl={photoUrl} />
    </group>
  );
};

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface Cake3DProps {
  candlesLit: boolean;
}

const CandleFlame = ({ position, lit }: { position: [number, number, number]; lit: boolean }) => {
  const flameRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (flameRef.current && lit) {
      const time = state.clock.elapsedTime;
      flameRef.current.scale.y = 1 + Math.sin(time * 10) * 0.2;
      flameRef.current.scale.x = 1 + Math.cos(time * 8) * 0.1;
      flameRef.current.position.x = position[0] + Math.sin(time * 6) * 0.02;
    }
    if (glowRef.current && lit) {
      const time = state.clock.elapsedTime;
      glowRef.current.intensity = 0.8 + Math.sin(time * 12) * 0.3;
    }
  });

  if (!lit) return null;

  return (
    <group position={position}>
      {/* Flame core */}
      <mesh ref={flameRef} position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#ffdd44" transparent opacity={0.9} />
      </mesh>
      {/* Flame outer */}
      <mesh position={[0, 0.18, 0]} scale={[1.2, 1.5, 1.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.6} />
      </mesh>
      {/* Light */}
      <pointLight ref={glowRef} position={[0, 0.2, 0]} color="#ff9944" intensity={0.8} distance={2} />
    </group>
  );
};

const Candle = ({ position, lit }: { position: [number, number, number]; lit: boolean }) => {
  return (
    <group position={position}>
      {/* Candle body */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.035, 0.3, 12]} />
        <meshStandardMaterial color="#fff5e6" roughness={0.3} />
      </mesh>
      {/* Wick */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.05, 6]} />
        <meshStandardMaterial color="#333333" roughness={1} />
      </mesh>
      <CandleFlame position={[0, 0.35, 0]} lit={lit} />
    </group>
  );
};

const CakeLayer = ({ 
  position, 
  radius, 
  height, 
  color,
  frostingColor 
}: { 
  position: [number, number, number]; 
  radius: number; 
  height: number;
  color: string;
  frostingColor: string;
}) => {
  return (
    <group position={position}>
      {/* Cake body */}
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Frosting top */}
      <mesh position={[0, height / 2 + 0.02, 0]}>
        <cylinderGeometry args={[radius * 1.02, radius * 1.02, 0.04, 32]} />
        <meshStandardMaterial color={frostingColor} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Frosting drips */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const dripHeight = 0.1 + Math.random() * 0.15;
        return (
          <mesh 
            key={i} 
            position={[
              Math.cos(angle) * radius * 0.98,
              height / 2 - dripHeight / 2,
              Math.sin(angle) * radius * 0.98
            ]}
          >
            <capsuleGeometry args={[0.03, dripHeight, 4, 8]} />
            <meshStandardMaterial color={frostingColor} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
};

const Rose = ({ position, color }: { position: [number, number, number]; color: string }) => {
  const roseRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (roseRef.current) {
      roseRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={roseRef} position={position}>
        {/* Rose petals */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const scale = 0.8 + (i % 2) * 0.2;
          return (
            <mesh 
              key={i}
              position={[Math.cos(angle) * 0.05, 0.02 * (i % 3), Math.sin(angle) * 0.05]}
              rotation={[0.3, angle, 0]}
              scale={scale}
            >
              <sphereGeometry args={[0.04, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <meshStandardMaterial color={color} roughness={0.5} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
        {/* Center */}
        <mesh position={[0, 0.03, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#ff6b8a" roughness={0.4} />
        </mesh>
      </group>
    </Float>
  );
};

const Heart = ({ position }: { position: [number, number, number] }) => {
  const heartRef = useRef<THREE.Mesh>(null);

  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x, y + 0.05);
    shape.bezierCurveTo(x, y + 0.05, x - 0.025, y, x - 0.05, y);
    shape.bezierCurveTo(x - 0.08, y, x - 0.08, y + 0.035, x - 0.08, y + 0.035);
    shape.bezierCurveTo(x - 0.08, y + 0.055, x - 0.06, y + 0.077, x, y + 0.1);
    shape.bezierCurveTo(x + 0.06, y + 0.077, x + 0.08, y + 0.055, x + 0.08, y + 0.035);
    shape.bezierCurveTo(x + 0.08, y + 0.035, x + 0.08, y, x + 0.05, y);
    shape.bezierCurveTo(x + 0.025, y, x, y + 0.05, x, y + 0.05);
    return shape;
  }, []);

  useFrame((state) => {
    if (heartRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      heartRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={heartRef} position={position} rotation={[0, 0, Math.PI]}>
        <extrudeGeometry 
          args={[heartShape, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 }]} 
        />
        <meshStandardMaterial color="#ff4466" roughness={0.3} metalness={0.2} />
      </mesh>
    </Float>
  );
};

export const Cake3D = ({ candlesLit }: Cake3DProps) => {
  const cakeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (cakeRef.current) {
      cakeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  const candlePositions: [number, number, number][] = [
    [0, 1.1, 0],
    [0.15, 1.1, 0.1],
    [-0.15, 1.1, 0.1],
    [0.1, 1.1, -0.15],
    [-0.1, 1.1, -0.15],
  ];

  const rosePositions: { pos: [number, number, number]; color: string }[] = [
    { pos: [0.4, 0.4, 0.4], color: '#ff6b8a' },
    { pos: [-0.4, 0.4, 0.4], color: '#ff8fab' },
    { pos: [0.5, 0.4, -0.3], color: '#ff6b8a' },
    { pos: [-0.5, 0.4, -0.3], color: '#ffb3c6' },
    { pos: [0, 0.75, 0.35], color: '#ff4d6d' },
    { pos: [0.3, 0.75, -0.25], color: '#ff8fab' },
    { pos: [-0.3, 0.75, -0.25], color: '#ff6b8a' },
  ];

  const heartPositions: [number, number, number][] = [
    [0.35, 1.15, 0.2],
    [-0.35, 1.15, 0.2],
    [0, 1.2, -0.3],
  ];

  return (
    <group ref={cakeRef}>
      {/* Cake plate */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshStandardMaterial color="#f5f0e6" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Bottom layer */}
      <CakeLayer 
        position={[0, 0.2, 0]} 
        radius={0.6} 
        height={0.4} 
        color="#ffe4c4"
        frostingColor="#ffb6c1"
      />

      {/* Middle layer */}
      <CakeLayer 
        position={[0, 0.55, 0]} 
        radius={0.45} 
        height={0.3} 
        color="#ffd4b8"
        frostingColor="#ff91a4"
      />

      {/* Top layer */}
      <CakeLayer 
        position={[0, 0.85, 0]} 
        radius={0.3} 
        height={0.3} 
        color="#ffcaaa"
        frostingColor="#ff6b8a"
      />

      {/* Candles */}
      {candlePositions.map((pos, i) => (
        <Candle key={i} position={pos} lit={candlesLit} />
      ))}

      {/* Roses */}
      {rosePositions.map((rose, i) => (
        <Rose key={i} position={rose.pos} color={rose.color} />
      ))}

      {/* Hearts */}
      {heartPositions.map((pos, i) => (
        <Heart key={i} position={pos} />
      ))}

      {/* Golden ribbon around bottom layer */}
      <mesh position={[0, 0.2, 0]}>
        <torusGeometry args={[0.61, 0.02, 8, 32]} />
        <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Golden ribbon around middle layer */}
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.46, 0.015, 8, 32]} />
        <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
};

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SmokeParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
}

interface SmokeEffectProps {
  active: boolean;
  position?: [number, number, number];
}

export const SmokeEffect = ({ active, position = [0, 1.5, 0] }: SmokeEffectProps) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleData = useRef<SmokeParticle[]>([]);
  const timeRef = useRef(0);

  const particleCount = 50;

  const { positions, sizes, opacities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleData.current.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          0,
          (Math.random() - 0.5) * 0.3
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          0.02 + Math.random() * 0.02,
          (Math.random() - 0.5) * 0.01
        ),
        life: Math.random(),
        maxLife: 1 + Math.random(),
        size: 0.05 + Math.random() * 0.05,
      });
    }

    return { positions, sizes, opacities };
  }, []);

  useFrame((_, delta) => {
    if (!particlesRef.current || !active) return;

    timeRef.current += delta;

    const positionAttr = particlesRef.current.geometry.attributes.position;
    const sizeAttr = particlesRef.current.geometry.attributes.size;
    const opacityAttr = particlesRef.current.geometry.attributes.opacity;

    for (let i = 0; i < particleCount; i++) {
      const particle = particleData.current[i];

      particle.life += delta * 0.5;

      if (particle.life >= particle.maxLife) {
        particle.life = 0;
        particle.position.set(
          (Math.random() - 0.5) * 0.3,
          0,
          (Math.random() - 0.5) * 0.3
        );
      }

      particle.position.add(particle.velocity.clone().multiplyScalar(delta * 30));
      particle.position.x += Math.sin(timeRef.current * 2 + i) * 0.002;

      const lifeRatio = particle.life / particle.maxLife;

      positionAttr.setXYZ(
        i,
        position[0] + particle.position.x,
        position[1] + particle.position.y,
        position[2] + particle.position.z
      );

      sizeAttr.setX(i, particle.size * (1 + lifeRatio * 2));
      opacityAttr.setX(i, Math.max(0, 0.6 * (1 - lifeRatio)));
    }

    positionAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    opacityAttr.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={particleCount}
          array={opacities}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#cccccc"
        size={0.1}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

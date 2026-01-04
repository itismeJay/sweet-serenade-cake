import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SmokeEffectProps {
  active: boolean;
  candlePositions?: [number, number, number][];
}

const smokeVertexShader = `
  attribute float size;
  attribute float opacity;
  varying float vOpacity;
  
  void main() {
    vOpacity = opacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const smokeFragmentShader = `
  varying float vOpacity;
  
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    float alpha = smoothstep(0.5, 0.0, dist) * vOpacity;
    gl_FragColor = vec4(0.7, 0.7, 0.75, alpha);
  }
`;

export const SmokeEffect = ({ 
  active, 
  candlePositions = [[0, 1.1, 0]] 
}: SmokeEffectProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const startTimeRef = useRef<number>(0);
  
  const particleCount = 80;

  const { positions, velocities, lifetimes, sizes, opacities, origins } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];
    const lifetimes: number[] = [];
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);
    const origins: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Distribute particles across all candle positions
      const candleIndex = i % candlePositions.length;
      const candlePos = candlePositions[candleIndex];
      
      const offsetX = (Math.random() - 0.5) * 0.08;
      const offsetZ = (Math.random() - 0.5) * 0.08;
      
      origins.push(new THREE.Vector3(
        candlePos[0] + offsetX,
        candlePos[1] + 0.2,
        candlePos[2] + offsetZ
      ));
      
      positions[i * 3] = origins[i].x;
      positions[i * 3 + 1] = origins[i].y;
      positions[i * 3 + 2] = origins[i].z;
      
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        0.03 + Math.random() * 0.02,
        (Math.random() - 0.5) * 0.02
      ));
      
      lifetimes.push(Math.random());
      sizes[i] = 8 + Math.random() * 6;
      opacities[i] = 0;
    }

    return { positions, velocities, lifetimes, sizes, opacities, origins };
  }, [candlePositions]);

  useEffect(() => {
    if (active) {
      startTimeRef.current = Date.now();
    }
  }, [active]);

  useFrame(() => {
    if (!pointsRef.current || !active) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const geometry = pointsRef.current.geometry;
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const sizeAttr = geometry.attributes.size as THREE.BufferAttribute;
    const opacityAttr = geometry.attributes.opacity as THREE.BufferAttribute;

    for (let i = 0; i < particleCount; i++) {
      lifetimes[i] += 0.008;

      if (lifetimes[i] >= 1) {
        lifetimes[i] = 0;
        posAttr.setXYZ(i, origins[i].x, origins[i].y, origins[i].z);
        velocities[i].set(
          (Math.random() - 0.5) * 0.02,
          0.03 + Math.random() * 0.02,
          (Math.random() - 0.5) * 0.02
        );
      }

      // Update position with curling motion
      const curl = Math.sin(lifetimes[i] * Math.PI * 2 + i) * 0.003;
      posAttr.setX(i, posAttr.getX(i) + velocities[i].x + curl);
      posAttr.setY(i, posAttr.getY(i) + velocities[i].y);
      posAttr.setZ(i, posAttr.getZ(i) + velocities[i].z + curl * 0.5);

      // Size grows as particle rises
      const lifeRatio = lifetimes[i];
      sizeAttr.setX(i, (8 + Math.random() * 4) * (1 + lifeRatio * 2.5));

      // Opacity: fade in quickly, then slowly fade out
      const fadeIn = Math.min(lifeRatio * 5, 1);
      const fadeOut = Math.max(0, 1 - (lifeRatio - 0.3) / 0.7);
      const baseOpacity = elapsed < 3 ? 1 : Math.max(0, 1 - (elapsed - 3) / 2);
      opacityAttr.setX(i, fadeIn * fadeOut * 0.5 * baseOpacity);
    }

    posAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    opacityAttr.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
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
      <shaderMaterial
        ref={materialRef}
        vertexShader={smokeVertexShader}
        fragmentShader={smokeFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
};

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

interface RomanticSceneProps {
  visible: boolean;
}

export const RomanticScene = ({ visible }: RomanticSceneProps) => {
  const groupRef = useRef<THREE.Group>(null);

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Dark starry sky */}
      <Stars 
        radius={100} 
        depth={80} 
        count={4000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.3} 
      />
      
      {/* Sunrise glow on horizon */}
      <SunriseGlow />
      
      {/* Falling love petals */}
      <LovePetals />
      
      {/* Subtle ambient particles */}
      <AmbientParticles />
      
      {/* Deep fog for atmosphere */}
      <fog attach="fog" args={['#0a0612', 5, 40]} />
    </group>
  );
};

// Beautiful sunrise effect on the horizon
const SunriseGlow = () => {
  const glowRef = useRef<THREE.Mesh>(null);
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (glowRef.current) {
      // Gentle pulsing glow
      const scale = 1 + Math.sin(time * 0.3) * 0.05;
      glowRef.current.scale.set(scale * 2, scale, 1);
    }
    
    if (sunRef.current) {
      // Sun slowly rising
      const riseAmount = Math.sin(time * 0.1) * 0.3;
      sunRef.current.position.y = -5 + riseAmount;
    }
  });

  return (
    <group position={[0, -2, -30]}>
      {/* Horizon glow - warm sunrise colors */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <planeGeometry args={[60, 20]} />
        <meshBasicMaterial
          color="#ff6b35"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Secondary glow layer - pink */}
      <mesh position={[0, 2, -1]}>
        <planeGeometry args={[50, 15]} />
        <meshBasicMaterial
          color="#ff8fa3"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Tertiary glow - golden */}
      <mesh position={[0, -1, -2]}>
        <planeGeometry args={[70, 12]} />
        <meshBasicMaterial
          color="#ffd700"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Sun orb */}
      <mesh ref={sunRef} position={[0, -5, -5]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial
          color="#ff9966"
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Sun glow */}
      <mesh position={[0, -5, -6]} scale={1.5}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial
          color="#ffcc99"
          transparent
          opacity={0.15}
        />
      </mesh>
      
      {/* Directional light from sunrise */}
      <directionalLight
        color="#ff9966"
        intensity={0.3}
        position={[0, 0, 1]}
      />
    </group>
  );
};

// Falling heart-shaped love petals
const LovePetals = () => {
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const petalCount = 100;
  
  const petalData = useMemo(() => {
    return Array.from({ length: petalCount }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        Math.random() * 25 + 5,
        (Math.random() - 0.5) * 15 - 3
      ),
      rotation: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
      fallSpeed: 0.2 + Math.random() * 0.3,
      rotationSpeed: (Math.random() - 0.5) * 2,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmplitude: 0.5 + Math.random() * 0.5,
      color: new THREE.Color().setHSL(
        0.95 + Math.random() * 0.05, // Red/pink hue
        0.7 + Math.random() * 0.3,
        0.5 + Math.random() * 0.2
      ),
    }));
  }, []);

  // Heart-shaped petal geometry
  const petalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    const scale = 0.08;
    
    shape.moveTo(x * scale, (y + 0.5) * scale);
    shape.bezierCurveTo(
      (x - 0.5) * scale, (y + 1.5) * scale,
      (x - 1.5) * scale, (y + 0.5) * scale,
      x * scale, (y - 0.5) * scale
    );
    shape.bezierCurveTo(
      (x + 1.5) * scale, (y + 0.5) * scale,
      (x + 0.5) * scale, (y + 1.5) * scale,
      x * scale, (y + 0.5) * scale
    );
    
    return new THREE.ShapeGeometry(shape);
  }, []);

  useFrame((state) => {
    if (!instancedRef.current) return;

    const time = state.clock.elapsedTime;
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const color = new THREE.Color();

    petalData.forEach((petal, i) => {
      // Gentle falling
      petal.position.y -= petal.fallSpeed * 0.02;
      
      // Reset when below view
      if (petal.position.y < -3) {
        petal.position.y = 25 + Math.random() * 5;
        petal.position.x = (Math.random() - 0.5) * 20;
      }

      // Rotation
      petal.rotation.x += petal.rotationSpeed * 0.01;
      petal.rotation.y += petal.rotationSpeed * 0.008;
      petal.rotation.z += petal.rotationSpeed * 0.006;

      // Gentle swaying like leaves falling
      const swayX = Math.sin(time * 0.5 + petal.swayPhase) * petal.swayAmplitude;
      const swayZ = Math.cos(time * 0.3 + petal.swayPhase) * petal.swayAmplitude * 0.5;

      quaternion.setFromEuler(petal.rotation);
      matrix.makeRotationFromQuaternion(quaternion);
      matrix.setPosition(
        petal.position.x + swayX,
        petal.position.y,
        petal.position.z + swayZ
      );
      
      instancedRef.current!.setMatrixAt(i, matrix);
      instancedRef.current!.setColorAt(i, petal.color);
    });

    instancedRef.current.instanceMatrix.needsUpdate = true;
    if (instancedRef.current.instanceColor) {
      instancedRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={instancedRef} args={[petalGeometry, undefined, petalCount]}>
      <meshBasicMaterial 
        side={THREE.DoubleSide}
        transparent
        opacity={0.85}
        vertexColors
      />
    </instancedMesh>
  );
};

// Ambient floating particles for magical atmosphere
const AmbientParticles = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        Math.random() * 12 + 1,
        (Math.random() - 0.5) * 10 - 2
      ),
      speed: 0.2 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      baseY: 0,
      size: 0.02 + Math.random() * 0.03,
    }));
  }, []);

  useEffect(() => {
    particles.forEach(p => {
      p.baseY = p.position.y;
    });
  }, [particles]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      const particle = particles[i];
      if (!particle) return;
      
      // Gentle floating motion
      child.position.y = particle.baseY + Math.sin(time * particle.speed + particle.phase) * 0.5;
      child.position.x = particle.position.x + Math.sin(time * 0.2 + particle.phase) * 0.3;
      
      // Pulsing opacity
      const mesh = child as THREE.Mesh;
      if (mesh.material) {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.3 + Math.sin(time * 1.5 + particle.phase) * 0.2;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position.toArray()}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshBasicMaterial 
            color="#ffd4e5" 
            transparent 
            opacity={0.4} 
          />
        </mesh>
      ))}
    </group>
  );
};

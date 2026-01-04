import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export const RomanticScene = () => {
  return (
    <>
      {/* Starry sky */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Moon */}
      <Moon />
      
      {/* Rose petals */}
      <RosePetals />
      
      {/* Floating lights */}
      <FloatingLights />
      
      {/* Ocean waves */}
      <Ocean />
    </>
  );
};

const Moon = () => {
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (moonRef.current) {
      moonRef.current.position.y = 8 + Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group position={[5, 8, -15]}>
      <mesh ref={moonRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#fffacd" />
      </mesh>
      {/* Moon glow */}
      <pointLight color="#fffacd" intensity={2} distance={50} />
      <mesh scale={1.3}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#fffacd" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

const RosePetals = () => {
  const petalsRef = useRef<THREE.InstancedMesh>(null);
  const petalCount = 100;
  
  const petalData = useMemo(() => {
    return Array.from({ length: petalCount }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        Math.random() * 15,
        (Math.random() - 0.5) * 10 - 5
      ),
      rotation: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
      speed: 0.5 + Math.random() * 0.5,
      rotationSpeed: (Math.random() - 0.5) * 2,
      swayOffset: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!petalsRef.current) return;

    const time = state.clock.elapsedTime;
    const matrix = new THREE.Matrix4();

    petalData.forEach((petal, i) => {
      petal.position.y -= petal.speed * 0.02;
      if (petal.position.y < -2) {
        petal.position.y = 15;
        petal.position.x = (Math.random() - 0.5) * 20;
      }

      petal.rotation.x += petal.rotationSpeed * 0.01;
      petal.rotation.z += petal.rotationSpeed * 0.01;

      const swayX = Math.sin(time + petal.swayOffset) * 0.5;
      
      matrix.makeRotationFromEuler(petal.rotation);
      matrix.setPosition(
        petal.position.x + swayX,
        petal.position.y,
        petal.position.z
      );
      
      petalsRef.current!.setMatrixAt(i, matrix);
    });

    petalsRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={petalsRef} args={[undefined, undefined, petalCount]}>
      <planeGeometry args={[0.15, 0.1]} />
      <meshBasicMaterial color="#ff6b8a" side={THREE.DoubleSide} transparent opacity={0.8} />
    </instancedMesh>
  );
};

const FloatingLights = () => {
  const lightsRef = useRef<THREE.Group>(null);
  
  const lightPositions = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      x: (Math.random() - 0.5) * 15,
      y: Math.random() * 8,
      z: (Math.random() - 0.5) * 8 - 3,
      speed: 0.5 + Math.random(),
      offset: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!lightsRef.current) return;
    const time = state.clock.elapsedTime;

    lightsRef.current.children.forEach((light, i) => {
      const data = lightPositions[i];
      light.position.y = data.y + Math.sin(time * data.speed + data.offset) * 0.5;
      light.position.x = data.x + Math.sin(time * 0.3 + data.offset) * 0.3;
    });
  });

  return (
    <group ref={lightsRef}>
      {lightPositions.map((pos, i) => (
        <group key={i} position={[pos.x, pos.y, pos.z]}>
          <mesh>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ffcc66" />
          </mesh>
          <pointLight color="#ffcc66" intensity={0.3} distance={3} />
        </group>
      ))}
    </group>
  );
};

const Ocean = () => {
  const oceanRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!oceanRef.current) return;
    const time = state.clock.elapsedTime;
    
    const positions = oceanRef.current.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const wave = Math.sin(x * 0.5 + time) * 0.1 + Math.sin(z * 0.3 + time * 0.8) * 0.05;
      positions.setY(i, wave);
    }
    positions.needsUpdate = true;
  });

  return (
    <mesh ref={oceanRef} position={[0, -2, -5]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[30, 20, 32, 32]} />
      <meshStandardMaterial 
        color="#1a3a5c" 
        metalness={0.8} 
        roughness={0.2}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

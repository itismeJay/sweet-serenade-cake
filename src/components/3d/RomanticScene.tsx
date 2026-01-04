import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

interface RomanticSceneProps {
  visible: boolean;
}

export const RomanticScene = ({ visible }: RomanticSceneProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.visible = visible;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Starry sky */}
      <Stars 
        radius={80} 
        depth={60} 
        count={3000} 
        factor={5} 
        saturation={0.1} 
        fade 
        speed={0.5} 
      />
      
      {/* Moon */}
      <Moon />
      
      {/* Rose petals */}
      <RosePetals />
      
      {/* Fairy lights / Fireflies */}
      <FairyLights />
      
      {/* Distant ocean */}
      <Ocean />
      
      {/* Ambient fog */}
      <fog attach="fog" args={['#0a0a1a', 8, 30]} />
    </group>
  );
};

const Moon = () => {
  const moonRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (moonRef.current) {
      moonRef.current.position.y = 10 + Math.sin(state.clock.elapsedTime * 0.1) * 0.3;
    }
    if (glowRef.current) {
      const scale = 1.4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={moonRef} position={[8, 10, -20]}>
      {/* Moon surface */}
      <mesh>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial 
          color="#fffde7" 
          emissive="#fff9c4"
          emissiveIntensity={0.3}
          roughness={0.8}
        />
      </mesh>
      
      {/* Inner glow */}
      <mesh ref={glowRef} scale={1.4}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial 
          color="#fffde7" 
          transparent 
          opacity={0.15}
        />
      </mesh>
      
      {/* Outer halo */}
      <mesh scale={2}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial 
          color="#fff9c4" 
          transparent 
          opacity={0.05}
        />
      </mesh>
      
      {/* Moon light */}
      <pointLight 
        color="#fffde7" 
        intensity={3} 
        distance={60}
        decay={2}
      />
      
      {/* Directional moonlight */}
      <directionalLight 
        color="#e3f2fd" 
        intensity={0.4}
        position={[0, 0, 1]}
      />
    </group>
  );
};

const RosePetals = () => {
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const petalCount = 150;
  
  const petalData = useMemo(() => {
    return Array.from({ length: petalCount }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 25,
        Math.random() * 18 + 2,
        (Math.random() - 0.5) * 15 - 5
      ),
      rotation: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
      fallSpeed: 0.3 + Math.random() * 0.4,
      rotationSpeed: (Math.random() - 0.5) * 3,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmplitude: 0.3 + Math.random() * 0.4,
    }));
  }, []);

  // Custom petal geometry
  const petalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.03, 0.02, 0.05, 0.06, 0.04, 0.1);
    shape.bezierCurveTo(0.02, 0.12, 0, 0.12, 0, 0.1);
    shape.bezierCurveTo(0, 0.12, -0.02, 0.12, -0.04, 0.1);
    shape.bezierCurveTo(-0.05, 0.06, -0.03, 0.02, 0, 0);
    
    return new THREE.ShapeGeometry(shape);
  }, []);

  useFrame((state) => {
    if (!instancedRef.current) return;

    const time = state.clock.elapsedTime;
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();

    petalData.forEach((petal, i) => {
      // Fall and reset
      petal.position.y -= petal.fallSpeed * 0.015;
      if (petal.position.y < -1) {
        petal.position.y = 18 + Math.random() * 4;
        petal.position.x = (Math.random() - 0.5) * 25;
      }

      // Rotation
      petal.rotation.x += petal.rotationSpeed * 0.008;
      petal.rotation.z += petal.rotationSpeed * 0.006;

      // Gentle swaying
      const swayX = Math.sin(time * 0.8 + petal.swayPhase) * petal.swayAmplitude;
      const swayZ = Math.cos(time * 0.6 + petal.swayPhase) * petal.swayAmplitude * 0.5;

      quaternion.setFromEuler(petal.rotation);
      matrix.makeRotationFromQuaternion(quaternion);
      matrix.setPosition(
        petal.position.x + swayX,
        petal.position.y,
        petal.position.z + swayZ
      );
      
      instancedRef.current!.setMatrixAt(i, matrix);
    });

    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instancedRef} args={[petalGeometry, undefined, petalCount]}>
      <meshStandardMaterial 
        color="#ff6b8a" 
        side={THREE.DoubleSide}
        transparent
        opacity={0.85}
        roughness={0.6}
      />
    </instancedMesh>
  );
};

const FairyLights = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  const lights = useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        Math.random() * 10 + 1,
        (Math.random() - 0.5) * 12 - 3
      ),
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? '#ffeb99' : '#ffe0b2',
      baseY: 0,
    }));
  }, []);

  useEffect(() => {
    lights.forEach(light => {
      light.baseY = light.position.y;
    });
  }, [lights]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      const light = lights[i];
      if (!light) return;
      
      // Gentle floating motion
      child.position.y = light.baseY + Math.sin(time * light.speed + light.phase) * 0.8;
      child.position.x = light.position.x + Math.sin(time * 0.3 + light.phase) * 0.4;
      
      // Pulsing glow
      const mesh = child.children[0] as THREE.Mesh;
      if (mesh && mesh.material) {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.6 + Math.sin(time * 2 + light.phase) * 0.3;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {lights.map((light, i) => (
        <group key={i} position={light.position.toArray()}>
          <mesh>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={light.color} transparent opacity={0.8} />
          </mesh>
          <pointLight color={light.color} intensity={0.15} distance={2} decay={2} />
        </group>
      ))}
    </group>
  );
};

const Ocean = () => {
  const oceanRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry>(null);

  useFrame((state) => {
    if (!oceanRef.current || !geometryRef.current) return;
    
    const time = state.clock.elapsedTime;
    const positions = geometryRef.current.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      
      // Multiple wave layers for realistic motion
      const wave1 = Math.sin(x * 0.3 + time * 0.8) * 0.15;
      const wave2 = Math.sin(z * 0.4 + time * 0.6) * 0.1;
      const wave3 = Math.sin((x + z) * 0.2 + time * 0.4) * 0.08;
      
      positions.setY(i, wave1 + wave2 + wave3);
    }
    
    positions.needsUpdate = true;
    geometryRef.current.computeVertexNormals();
  });

  return (
    <mesh ref={oceanRef} position={[0, -3, -8]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry ref={geometryRef} args={[40, 25, 48, 48]} />
      <meshStandardMaterial 
        color="#1a3a5c"
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.85}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

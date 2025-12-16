import { useEffect, useState } from 'react';

interface Light {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  color: 'rose' | 'gold';
}

export const GlowingLights = () => {
  const [lights, setLights] = useState<Light[]>([]);

  useEffect(() => {
    const items: Light[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 100 + Math.random() * 200,
      delay: Math.random() * 5,
      color: Math.random() > 0.5 ? 'rose' : 'gold',
    }));
    setLights(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {lights.map((light) => (
        <div
          key={light.id}
          className={`absolute rounded-full animate-pulse-glow blur-3xl ${
            light.color === 'rose' ? 'bg-rose/20' : 'bg-gold/20'
          }`}
          style={{
            left: `${light.left}%`,
            top: `${light.top}%`,
            width: light.size,
            height: light.size,
            animationDelay: `${light.delay}s`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
};

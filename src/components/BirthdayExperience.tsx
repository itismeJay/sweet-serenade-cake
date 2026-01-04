import { useState, useCallback } from 'react';
import { CakeScene } from './3d/CakeScene';
import { BlowControls } from './BlowControls';
import { BackgroundMusic } from './BackgroundMusic';
import { BirthdayMessage } from './BirthdayMessage';
import { Confetti } from './Confetti';
import { FloatingHearts } from './FloatingHearts';
import { GlowingLights } from './GlowingLights';

export const BirthdayExperience = () => {
  const [candlesLit, setCandlesLit] = useState(true);
  const [showSmoke, setShowSmoke] = useState(false);
  const [showRomanticScene, setShowRomanticScene] = useState(false);
  const [blowIntensity, setBlowIntensity] = useState(0);

  const handleBlow = useCallback(() => {
    if (!candlesLit) return;

    setCandlesLit(false);
    setShowSmoke(true);
    setBlowIntensity(0);

    // Show smoke for 4 seconds
    setTimeout(() => {
      setShowSmoke(false);
    }, 4000);

    // Smooth transition to romantic scene after 2.5 seconds
    setTimeout(() => {
      setShowRomanticScene(true);
    }, 2500);
  }, [candlesLit]);

  const handleBlowProgress = useCallback((intensity: number) => {
    setBlowIntensity(intensity);
  }, []);

  const handleReset = useCallback(() => {
    setCandlesLit(true);
    setShowSmoke(false);
    setShowRomanticScene(false);
    setBlowIntensity(0);
  }, []);

  return (
    <div 
      className={`min-h-screen transition-all duration-[2500ms] ease-in-out ${
        showRomanticScene 
          ? 'bg-gradient-to-b from-[#0a0a1a] via-[#101030] to-[#0a0a2a]' 
          : 'bg-gradient-to-b from-blush via-champagne to-cream'
      }`}
    >
      {/* Background effects for celebration mode */}
      {!showRomanticScene && (
        <>
          <GlowingLights />
          <FloatingHearts />
          <Confetti />
        </>
      )}

      {/* Stars overlay for romantic scene */}
      <div 
        className={`fixed inset-0 transition-opacity duration-[2500ms] pointer-events-none ${
          showRomanticScene ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: showRomanticScene 
              ? 'radial-gradient(ellipse at 70% 20%, rgba(255,253,205,0.08) 0%, transparent 50%)' 
              : 'none'
          }}
        />
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-6 md:py-8 gap-4 md:gap-6">
        {/* Birthday message - fades out during transition */}
        <div 
          className={`transition-all duration-1000 ${
            showRomanticScene 
              ? 'opacity-0 scale-90 pointer-events-none absolute' 
              : 'opacity-100 scale-100'
          }`}
        >
          <BirthdayMessage />
        </div>

        {/* Romantic header - fades in during transition */}
        {showRomanticScene && (
          <div className="text-center animate-fade-in mb-2">
            <h2 className="text-3xl md:text-5xl font-display text-gold mb-2">
              ✨ A Magical Night For You ✨
            </h2>
            <p className="text-lg md:text-xl text-foreground/70 font-elegant">
              The stars are shining just for you
            </p>
          </div>
        )}

        {/* 3D Cake Scene */}
        <div className="w-full max-w-4xl">
          <CakeScene
            candlesLit={candlesLit}
            showSmoke={showSmoke}
            showRomanticScene={showRomanticScene}
            blowIntensity={blowIntensity}
          />
        </div>

        {/* Blow Controls */}
        <BlowControls
          candlesLit={candlesLit}
          onBlow={handleBlow}
          onBlowProgress={handleBlowProgress}
          onReset={handleReset}
          showRomanticScene={showRomanticScene}
        />

        {/* Decorative flowers - celebration mode only */}
        {!showRomanticScene && (
          <>
            <div className="absolute bottom-4 left-4 text-3xl md:text-4xl opacity-40 animate-float" style={{ animationDelay: '1s' }}>
              🌸
            </div>
            <div className="absolute bottom-8 right-8 text-2xl md:text-3xl opacity-40 animate-float" style={{ animationDelay: '2s' }}>
              🌷
            </div>
            <div className="absolute top-20 left-8 text-2xl md:text-3xl opacity-30 animate-float" style={{ animationDelay: '0.5s' }}>
              🌹
            </div>
            <div className="absolute top-32 right-12 text-xl md:text-2xl opacity-30 animate-float" style={{ animationDelay: '3s' }}>
              💐
            </div>
          </>
        )}
      </main>

      {/* Background Music */}
      <BackgroundMusic romanticMode={showRomanticScene} />
    </div>
  );
};

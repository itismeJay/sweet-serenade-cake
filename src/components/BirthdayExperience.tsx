import { useState, useCallback } from 'react';
import { CakeScene } from './3d/CakeScene';
import { BlowControls } from './BlowControls';
import { BackgroundMusic } from './BackgroundMusic';
import { BirthdayMessage } from './BirthdayMessage';
import { Confetti } from './Confetti';
import { FloatingHearts } from './FloatingHearts';
import { GlowingLights } from './GlowingLights';
import girlfriend1 from '@/assets/girlfriend-1.jpg';
import girlfriend2 from '@/assets/girlfriend-2.jpg';
import couplePhoto from '@/assets/couple-photo.jpg';
import sunriseImage from '@/assets/sunrise.jpg';

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Sunrise background image for romantic scene */}
      <div 
        className={`fixed inset-0 transition-opacity duration-[3000ms] ease-in-out ${
          showRomanticScene ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url(${sunriseImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Background overlay - celebration mode only */}
      {!showRomanticScene && (
        <div className="fixed inset-0 bg-gradient-to-b from-pink-100 via-rose-50 to-amber-50" />
      )}

      {/* Background effects for celebration mode */}
      {!showRomanticScene && (
        <>
          <GlowingLights />
          <FloatingHearts />
          <Confetti />
        </>
      )}

      {/* Falling petals overlay for romantic scene */}
      {showRomanticScene && (
        <div className="fixed inset-0 pointer-events-none z-20">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-petal-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
              }}
            >
              <span className="text-2xl opacity-70">🌹</span>
            </div>
          ))}
        </div>
      )}

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
            <h2 className="text-3xl md:text-5xl font-display text-white drop-shadow-lg mb-2">
              🌅 Watching The Sunrise With You 🌅
            </h2>
            <p className="text-lg md:text-xl text-white/90 font-elegant drop-shadow-md">
              Every sunrise is beautiful when I'm with you
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

        {/* Photos Section */}
        <div className={`flex gap-4 md:gap-6 items-center justify-center transition-all duration-1000 ${
          showRomanticScene ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
        }`}>
          {/* Girlfriend photos - shown before blowing */}
          {!showRomanticScene && (
            <>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
                <img 
                  src={girlfriend1} 
                  alt="My Love" 
                  className="relative w-24 h-28 md:w-32 md:h-40 object-cover rounded-lg shadow-xl ring-2 ring-white/50"
                />
                <div className="absolute -bottom-2 -right-2 text-xl">💕</div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-pink-400 rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
                <img 
                  src={girlfriend2} 
                  alt="My Love" 
                  className="relative w-24 h-28 md:w-32 md:h-40 object-cover rounded-lg shadow-xl ring-2 ring-white/50"
                />
                <div className="absolute -bottom-2 -left-2 text-xl">💕</div>
              </div>
            </>
          )}
        </div>

        {/* Couple photo - shown after blowing */}
        {showRomanticScene && (
          <div className="animate-fade-in mt-4">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-rose-400 to-pink-400 rounded-2xl blur-md opacity-60 animate-pulse" />
              <img 
                src={couplePhoto} 
                alt="Us Together" 
                className="relative w-64 h-64 md:w-80 md:h-80 object-cover rounded-xl shadow-2xl ring-4 ring-white/30"
              />
              <div className="absolute -top-3 -right-3 text-3xl animate-float">❤️</div>
              <div className="absolute -bottom-3 -left-3 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>💕</div>
            </div>
          </div>
        )}

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

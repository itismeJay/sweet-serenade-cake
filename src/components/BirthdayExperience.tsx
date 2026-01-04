import { useState, useCallback } from 'react';
import { CakeScene } from './3d/CakeScene';
import { BlowControls } from './BlowControls';
import { BackgroundMusic } from './BackgroundMusic';
import { BirthdayMessage } from './BirthdayMessage';

export const BirthdayExperience = () => {
  const [candlesLit, setCandlesLit] = useState(true);
  const [showSmoke, setShowSmoke] = useState(false);
  const [showRomanticScene, setShowRomanticScene] = useState(false);

  const handleBlow = useCallback(() => {
    if (!candlesLit) return;

    setCandlesLit(false);
    setShowSmoke(true);

    // Show smoke for 3 seconds
    setTimeout(() => {
      setShowSmoke(false);
    }, 3000);

    // Transition to romantic scene after 2 seconds
    setTimeout(() => {
      setShowRomanticScene(true);
    }, 2000);
  }, [candlesLit]);

  const handleReset = useCallback(() => {
    setCandlesLit(true);
    setShowSmoke(false);
    setShowRomanticScene(false);
  }, []);

  return (
    <div className={`min-h-screen transition-all duration-2000 ${
      showRomanticScene 
        ? 'bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a2a]' 
        : 'bg-gradient-to-b from-blush via-champagne to-cream'
    }`}>
      {/* Background effects based on scene */}
      <div className={`fixed inset-0 transition-opacity duration-2000 pointer-events-none ${
        showRomanticScene ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Stars overlay for romantic scene */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxyYWRpYWxHcmFkaWVudCBpZD0ic3RhciI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0idHJhbnNwYXJlbnQiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48L3N2Zz4=')] opacity-30" />
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6">
        {/* Birthday message */}
        <div className={`transition-all duration-1000 ${showRomanticScene ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
          <BirthdayMessage />
        </div>

        {/* Romantic message */}
        {showRomanticScene && (
          <div className="text-center animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display text-gold mb-4 animate-pulse">
              ✨ A Magical Night For You ✨
            </h2>
          </div>
        )}

        {/* 3D Cake Scene */}
        <div className="w-full max-w-4xl">
          <CakeScene
            candlesLit={candlesLit}
            showSmoke={showSmoke}
            showRomanticScene={showRomanticScene}
          />
        </div>

        {/* Controls */}
        <BlowControls
          candlesLit={candlesLit}
          onBlow={handleBlow}
          onReset={handleReset}
          showRomanticScene={showRomanticScene}
        />

        {/* Decorative elements */}
        {!showRomanticScene && (
          <>
            <div className="absolute bottom-4 left-4 text-4xl opacity-40 animate-float" style={{ animationDelay: '1s' }}>
              🌸
            </div>
            <div className="absolute bottom-8 right-8 text-3xl opacity-40 animate-float" style={{ animationDelay: '2s' }}>
              🌷
            </div>
            <div className="absolute top-20 left-8 text-3xl opacity-30 animate-float" style={{ animationDelay: '0.5s' }}>
              🌹
            </div>
            <div className="absolute top-32 right-12 text-2xl opacity-30 animate-float" style={{ animationDelay: '3s' }}>
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

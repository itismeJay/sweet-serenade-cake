import { useState, useEffect } from 'react';
import birthdayCake from '@/assets/birthday-cake.jpg';
import { Button } from '@/components/ui/button';

export const CakeDisplay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [candlesLit, setCandlesLit] = useState(true);
  const [showSmoke, setShowSmoke] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleBlowCandles = () => {
    if (!candlesLit) return;
    setCandlesLit(false);
    setShowSmoke(true);
    setTimeout(() => setShowSmoke(false), 2000);
    setTimeout(() => setCandlesLit(true), 4000);
  };

  return (
    <div
      className={`relative transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}
    >
      {/* Glow effect behind cake */}
      <div className="absolute inset-0 bg-gradient-radial from-rose/30 via-gold/20 to-transparent blur-3xl -z-10 scale-150" />
      
      {/* Cake image container */}
      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-rose via-gold to-rose rounded-3xl opacity-30 blur-xl transition-opacity duration-500" />
        
        <div className="relative rounded-2xl overflow-hidden shadow-romantic">
          <img
            src={birthdayCake}
            alt="Beautiful birthday cake decorated with roses, hearts, and candles"
            className="w-full max-w-2xl rounded-2xl"
          />
          
          {/* Animated candle flames */}
          {candlesLit && (
            <div className="absolute top-[8%] left-1/2 -translate-x-1/2 flex gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="relative" style={{ animationDelay: `${i * 0.2}s` }}>
                  <div className="w-3 h-5 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-200 rounded-full animate-candle-flame blur-[1px]" />
                  <div className="absolute inset-0 w-3 h-5 bg-gradient-to-t from-orange-400 via-yellow-300 to-white rounded-full animate-candle-flame opacity-80" style={{ animationDelay: `${i * 0.1}s` }} />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-3 bg-gold/40 rounded-full blur-md animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Smoke effect when blown */}
          {showSmoke && (
            <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex gap-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-smoke blur-sm"
                  style={{ 
                    animationDelay: `${i * 0.15}s`,
                    left: `${(i - 2) * 12}px`
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Candle glow overlay */}
          {candlesLit && (
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-gold/30 to-transparent animate-candle pointer-events-none" />
          )}
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
        </div>
      </div>

      {/* Blow button */}
      <div className="mt-6 text-center">
        {candlesLit ? (
          <Button
            onClick={handleBlowCandles}
            size="lg"
            className="bg-gradient-to-r from-rose to-gold hover:from-rose/90 hover:to-gold/90 text-white font-display text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-pulse-glow"
          >
            ✨ Make a Wish & Blow the Candles ✨
          </Button>
        ) : showSmoke ? (
          <p className="text-2xl font-display text-gold animate-pulse">
            💫 Your wish is being sent to the stars... 💫
          </p>
        ) : (
          <p className="text-2xl font-display text-rose animate-heartbeat">
            🎉 Your wish will come true! 🎉
          </p>
        )}
      </div>
    </div>
  );
};

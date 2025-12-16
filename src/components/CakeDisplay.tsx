import { useState, useEffect } from 'react';
import birthdayCake from '@/assets/birthday-cake.jpg';

export const CakeDisplay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [candlesLit, setCandlesLit] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleBlowCandles = () => {
    setCandlesLit(false);
    setTimeout(() => setCandlesLit(true), 3000);
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
      <div className="relative group cursor-pointer" onClick={handleBlowCandles}>
        <div className="absolute -inset-4 bg-gradient-to-r from-rose via-gold to-rose rounded-3xl opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-500" />
        
        <div className="relative rounded-2xl overflow-hidden shadow-romantic">
          <img
            src={birthdayCake}
            alt="Beautiful birthday cake decorated with roses, hearts, and candles"
            className="w-full max-w-2xl rounded-2xl transform group-hover:scale-105 transition-transform duration-700"
          />
          
          {/* Candle glow overlay */}
          {candlesLit && (
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-gold/30 to-transparent animate-candle pointer-events-none" />
          )}
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
        </div>
        
        {/* Click hint */}
        <p className="text-center mt-4 text-muted-foreground font-elegant text-sm italic opacity-70">
          {candlesLit ? '✨ Click to make a wish and blow the candles ✨' : '🎉 Your wish will come true! 🎉'}
        </p>
      </div>
    </div>
  );
};

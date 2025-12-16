import { useState, useEffect } from 'react';

export const BirthdayMessage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`text-center transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-gradient mb-4 animate-heart-beat">
        Happy Birthday
      </h1>
      <p className="font-elegant text-2xl md:text-3xl text-muted-foreground italic mb-2">
        To My Beautiful Love
      </p>
      <div className="flex items-center justify-center gap-3 mt-6">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="w-5 h-5 fill-rose animate-sparkle"
            style={{ animationDelay: `${i * 0.2}s` }}
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ))}
      </div>
    </div>
  );
};

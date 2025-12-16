import { useState, useEffect } from 'react';

export const WishCard = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`max-w-lg mx-auto transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-rose via-gold to-rose rounded-2xl opacity-40 blur" />
        <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-8 border border-rose-light/30">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="w-6 h-6 fill-gold" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="font-display text-3xl text-gradient">Birthday Wishes</span>
            <svg className="w-6 h-6 fill-gold" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          
          <p className="font-elegant text-lg text-foreground/90 text-center leading-relaxed mb-4">
            On this special day, I want you to know how much you mean to me. 
            Your smile lights up my world, and your love makes every moment magical.
          </p>
          
          <p className="font-elegant text-lg text-foreground/90 text-center leading-relaxed mb-4">
            May this year bring you endless joy, beautiful adventures, 
            and all the dreams your heart desires. 💕
          </p>
          
          <p className="font-elegant text-xl text-rose text-center italic">
            Forever and always yours ♡
          </p>
        </div>
      </div>
    </div>
  );
};

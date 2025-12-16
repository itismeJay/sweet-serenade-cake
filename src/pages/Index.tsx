import { Confetti } from '@/components/Confetti';
import { FloatingHearts } from '@/components/FloatingHearts';
import { MusicNotes } from '@/components/MusicNotes';
import { GlowingLights } from '@/components/GlowingLights';
import { BirthdayMessage } from '@/components/BirthdayMessage';
import { CakeDisplay } from '@/components/CakeDisplay';
import { WishCard } from '@/components/WishCard';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blush via-champagne to-cream relative overflow-hidden">
      {/* Background effects */}
      <GlowingLights />
      <FloatingHearts />
      <MusicNotes />
      <Confetti />

      {/* Main content */}
      <main className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-12">
        {/* Birthday message */}
        <BirthdayMessage />

        {/* Cake display */}
        <CakeDisplay />

        {/* Wish card */}
        <WishCard />

        {/* Decorative flowers */}
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
      </main>
    </div>
  );
};

export default Index;

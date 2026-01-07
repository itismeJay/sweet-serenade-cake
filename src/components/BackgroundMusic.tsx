import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Music } from 'lucide-react';

interface BackgroundMusicProps {
  romanticMode?: boolean;
  autoplayAfterInteraction?: boolean;
}

export const BackgroundMusic = ({ 
  romanticMode = false,
  autoplayAfterInteraction = true 
}: BackgroundMusicProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Working royalty-free music URLs
  const birthdayMusic = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  const romanticMusic = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';

  const fadeVolume = useCallback((targetVolume: number, duration: number, callback?: () => void) => {
    if (!audioRef.current) return;
    
    const startVolume = audioRef.current.volume;
    const volumeDiff = targetVolume - startVolume;
    const steps = 20;
    const stepDuration = duration / steps;
    let currentStep = 0;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      if (audioRef.current) {
        audioRef.current.volume = Math.max(0, Math.min(1, startVolume + (volumeDiff * currentStep / steps)));
      }
      
      if (currentStep >= steps) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
        callback?.();
      }
    }, stepDuration);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio(birthdayMusic);
    audioRef.current.loop = true;
    audioRef.current.volume = 0;

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle music transition when romantic mode changes
  useEffect(() => {
    if (!audioRef.current || !isPlaying) return;

    const newSrc = romanticMode ? romanticMusic : birthdayMusic;
    if (audioRef.current.src !== newSrc) {
      setIsTransitioning(true);
      
      // Fade out current track
      fadeVolume(0, 1000, () => {
        if (audioRef.current) {
          audioRef.current.src = newSrc;
          audioRef.current.play().then(() => {
            // Fade in new track
            fadeVolume(0.35, 1500, () => {
              setIsTransitioning(false);
            });
          }).catch(console.error);
        }
      });
    }
  }, [romanticMode, isPlaying, fadeVolume]);

  // Auto-play after first interaction
  useEffect(() => {
    if (hasInteracted && autoplayAfterInteraction && !isPlaying) {
      toggleMusic();
    }
  }, [hasInteracted, autoplayAfterInteraction]);

  // Listen for any interaction to enable autoplay
  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [hasInteracted]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      fadeVolume(0, 500, () => {
        audioRef.current?.pause();
      });
      setIsPlaying(false);
    } else {
      audioRef.current.src = romanticMode ? romanticMusic : birthdayMusic;
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        fadeVolume(0.35, 1000);
        setIsPlaying(true);
      }).catch(err => {
        console.error('Playback failed:', err);
      });
    }
  };

  return (
    <Button
      onClick={toggleMusic}
      variant="outline"
      size="icon"
      className={`fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 backdrop-blur-sm ${
        isPlaying 
          ? 'bg-rose/20 border-rose shadow-lg shadow-rose/20' 
          : 'bg-background/80'
      } transition-all duration-300 hover:scale-110`}
      title={isPlaying ? 'Pause Music' : 'Play Music'}
    >
      {isTransitioning ? (
        <Music className="w-5 h-5 animate-pulse" />
      ) : isPlaying ? (
        <Volume2 className="w-5 h-5 text-rose animate-pulse" />
      ) : (
        <Music className="w-5 h-5" />
      )}
    </Button>
  );
};

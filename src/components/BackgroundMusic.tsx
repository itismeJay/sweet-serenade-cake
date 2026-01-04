import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Music } from 'lucide-react';

interface BackgroundMusicProps {
  romanticMode?: boolean;
}

export const BackgroundMusic = ({ romanticMode = false }: BackgroundMusicProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Using a royalty-free romantic music URL
  const musicUrl = romanticMode 
    ? 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3'
    : 'https://assets.mixkit.co/music/preview/mixkit-happy-birthday-full-song-46.mp3';

  useEffect(() => {
    audioRef.current = new Audio(musicUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    audioRef.current.addEventListener('canplaythrough', () => setIsLoaded(true));
    audioRef.current.addEventListener('error', () => setIsLoaded(false));

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [musicUrl]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      // Transition music when switching modes
      audioRef.current.pause();
      audioRef.current.src = musicUrl;
      audioRef.current.play().catch(console.error);
    }
  }, [romanticMode, musicUrl]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Button
      onClick={toggleMusic}
      variant="outline"
      size="icon"
      className={`fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 ${
        isPlaying ? 'bg-rose/20 border-rose' : ''
      } transition-all duration-300 hover:scale-110`}
      title={isPlaying ? 'Pause Music' : 'Play Music'}
    >
      {isPlaying ? (
        <Volume2 className="w-5 h-5 text-rose animate-pulse" />
      ) : (
        <Music className="w-5 h-5" />
      )}
    </Button>
  );
};

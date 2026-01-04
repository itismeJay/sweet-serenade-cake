import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Wind, Volume2 } from 'lucide-react';
import { useMicrophoneBlow } from '@/hooks/useMicrophoneBlow';

interface BlowControlsProps {
  candlesLit: boolean;
  onBlow: () => void;
  onReset: () => void;
  showRomanticScene: boolean;
}

export const BlowControls = ({ 
  candlesLit, 
  onBlow, 
  onReset, 
  showRomanticScene 
}: BlowControlsProps) => {
  const [micEnabled, setMicEnabled] = useState(false);

  const { 
    isListening, 
    blowIntensity, 
    error, 
    startListening, 
    stopListening,
    resetBlowDetection 
  } = useMicrophoneBlow({
    threshold: 0.2,
    onBlow: () => {
      if (candlesLit) {
        onBlow();
        stopListening();
        setMicEnabled(false);
      }
    },
    enabled: micEnabled && candlesLit,
  });

  const handleMicToggle = async () => {
    if (isListening) {
      stopListening();
      setMicEnabled(false);
    } else {
      setMicEnabled(true);
      await startListening();
    }
  };

  const handleManualBlow = () => {
    if (candlesLit) {
      onBlow();
      if (isListening) {
        stopListening();
        setMicEnabled(false);
      }
    }
  };

  const handleReset = () => {
    onReset();
    resetBlowDetection();
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      {candlesLit ? (
        <>
          {/* Mic intensity indicator */}
          {isListening && (
            <div className="flex items-center gap-3 mb-2">
              <Volume2 className="w-5 h-5 text-rose" />
              <div className="w-48 h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose to-gold transition-all duration-100"
                  style={{ width: `${Math.min(blowIntensity * 300, 100)}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">Blow!</span>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {/* Microphone button */}
            <Button
              onClick={handleMicToggle}
              variant={isListening ? "default" : "outline"}
              size="lg"
              className={`gap-2 ${isListening ? 'bg-rose hover:bg-rose-dark animate-pulse' : ''}`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  Listening...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Use Microphone
                </>
              )}
            </Button>

            {/* Manual blow button */}
            <Button
              onClick={handleManualBlow}
              size="lg"
              className="gap-2 bg-gradient-to-r from-rose to-gold hover:from-rose/90 hover:to-gold/90 text-white font-display text-lg px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-pulse-glow"
            >
              <Wind className="w-5 h-5" />
              ✨ Make a Wish & Blow ✨
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}

          <p className="text-sm text-muted-foreground text-center max-w-md">
            Blow into your microphone or click the button to extinguish the candles!
          </p>
        </>
      ) : showRomanticScene ? (
        <div className="text-center space-y-4">
          <p className="text-2xl font-display text-gold animate-pulse">
            ✨ Your wish has been sent to the stars... ✨
          </p>
          <p className="text-lg font-elegant text-foreground/80 italic">
            "Under the stars, by the sea, my love for you is as endless as the ocean"
          </p>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="mt-4 gap-2"
          >
            🎂 Light the Candles Again
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-2xl font-display text-rose animate-heart-beat">
            🎉 Happy Birthday! 🎉
          </p>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="mt-4"
          >
            🎂 Light the Candles Again
          </Button>
        </div>
      )}
    </div>
  );
};

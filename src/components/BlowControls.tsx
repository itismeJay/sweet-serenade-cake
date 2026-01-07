import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Wind, Volume2, Sparkles } from 'lucide-react';
import { useMicrophoneBlow } from '@/hooks/useMicrophoneBlow';
import { Progress } from '@/components/ui/progress';

interface BlowControlsProps {
  candlesLit: boolean;
  onBlow: () => void;
  onBlowProgress?: (intensity: number) => void;
  onReset: () => void;
  showRomanticScene: boolean;
}

export const BlowControls = ({ 
  candlesLit, 
  onBlow, 
  onBlowProgress,
  onReset, 
  showRomanticScene 
}: BlowControlsProps) => {
  const [micEnabled, setMicEnabled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const { 
    isListening, 
    blowAnalysis,
    error, 
    startListening, 
    stopListening,
    resetBlowDetection 
  } = useMicrophoneBlow({
    threshold: 0.052,
    sustainedDuration: 1000,
    onBlowStart: () => {
      console.log('Blow started!');
    },
    onBlowProgress: (progress) => {
      onBlowProgress?.(progress);
    },
    onBlowComplete: () => {
      console.log('Blow complete!');
      onBlow();
      stopListening();
      setMicEnabled(false);
    },
    enabled: micEnabled && candlesLit,
  });

  useEffect(() => {
    if (blowAnalysis.isBlowing) {
      onBlowProgress?.(blowAnalysis.intensity);
    }
  }, [blowAnalysis, onBlowProgress]);

  const handleMicToggle = async () => {
    if (isListening) {
      stopListening();
      setMicEnabled(false);
    } else {
      setMicEnabled(true);
      setShowInstructions(false);
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
    setShowInstructions(true);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6 px-4">
      {candlesLit ? (
        <>
          {/* Main instruction */}
          {showInstructions && !isListening && (
            <div className="text-center mb-2 animate-fade-in">
              <p className="text-xl md:text-2xl font-display text-rose mb-1">
                🎂 Make a wish and blow into the microphone 🎂
              </p>
              <p className="text-sm text-muted-foreground">
                Or click the button below
              </p>
            </div>
          )}

          {/* Blow progress indicator */}
          {isListening && (
            <div className="w-full max-w-md space-y-3 animate-fade-in">
              <div className="flex items-center justify-center gap-3">
                <Volume2 className={`w-5 h-5 ${blowAnalysis.isBlowing ? 'text-rose animate-pulse' : 'text-muted-foreground'}`} />
                <div className="flex-1 max-w-xs">
                  <Progress 
                    value={blowAnalysis.progress * 100} 
                    className="h-4 bg-muted"
                  />
                </div>
                <span className="text-sm font-medium text-rose min-w-[3rem]">
                  {Math.round(blowAnalysis.progress * 100)}%
                </span>
              </div>
              
              {/* Intensity bar */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground">Intensity:</span>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-75 rounded-full ${
                      blowAnalysis.isBlowing 
                        ? 'bg-gradient-to-r from-rose to-gold' 
                        : 'bg-muted-foreground/30'
                    }`}
                    style={{ width: `${Math.min(blowAnalysis.intensity * 400, 100)}%` }}
                  />
                </div>
              </div>

              {blowAnalysis.isBlowing ? (
                <p className="text-center text-lg font-display text-rose animate-pulse">
                  Keep blowing... 💨
                </p>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Blow steadily into your microphone
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {/* Microphone button */}
            <Button
              onClick={handleMicToggle}
              variant={isListening ? "default" : "outline"}
              size="lg"
              className={`gap-2 transition-all duration-300 ${
                isListening 
                  ? 'bg-rose hover:bg-rose-dark text-white shadow-lg shadow-rose/30' 
                  : 'hover:border-rose hover:text-rose'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  Stop Listening
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
              className="gap-2 bg-gradient-to-r from-rose to-gold hover:from-rose/90 hover:to-gold/90 text-white font-display text-lg px-6 md:px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Wind className="w-5 h-5" />
              <span className="hidden sm:inline">✨ Make a Wish & Blow ✨</span>
              <span className="sm:hidden">Blow Candles</span>
            </Button>
          </div>

          {error && (
            <div className="text-sm text-destructive mt-2 text-center bg-destructive/10 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
        </>
      ) : showRomanticScene ? (
        <div className="text-center space-y-4 animate-fade-in">
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="mt-6 gap-2 border-white/50 text-white hover:bg-white/10"
          >
            🎂 Light the Candles Again
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4 animate-fade-in">
          <p className="text-2xl md:text-3xl font-display text-rose animate-heart-beat">
            🎉 Happy Birthday! 🎉
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
      )}
    </div>
  );
};

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseMicrophoneBlowOptions {
  threshold?: number;
  sustainedDuration?: number; // How long blow must be sustained (ms)
  onBlowStart?: () => void;
  onBlowProgress?: (intensity: number) => void;
  onBlowComplete?: () => void;
  enabled?: boolean;
}

interface BlowAnalysis {
  isBlowing: boolean;
  intensity: number;
  progress: number; // 0-1 progress toward complete blow
}

export const useMicrophoneBlow = ({
  threshold = 0.12,
  sustainedDuration = 800, // Require ~0.8 seconds of sustained blowing
  onBlowStart,
  onBlowProgress,
  onBlowComplete,
  enabled = true,
}: UseMicrophoneBlowOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [blowAnalysis, setBlowAnalysis] = useState<BlowAnalysis>({
    isBlowing: false,
    intensity: 0,
    progress: 0,
  });
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Blow detection state
  const blowStartTimeRef = useRef<number | null>(null);
  const blowCompletedRef = useRef(false);
  const smoothedIntensityRef = useRef(0);
  const consecutiveBlowFramesRef = useRef(0);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsListening(false);
  }, []);

  const analyzeBlowCharacteristics = useCallback((dataArray: Uint8Array): { isBlowLike: boolean; intensity: number } => {
    const bufferLength = dataArray.length;
    
    // Split frequency spectrum into bands
    const lowFreqEnd = Math.floor(bufferLength * 0.15); // 0-15% = low frequencies (blowing characteristic)
    const midFreqEnd = Math.floor(bufferLength * 0.5);  // 15-50% = mid frequencies
    
    // Calculate energy in different frequency bands
    let lowFreqEnergy = 0;
    let midFreqEnergy = 0;
    let highFreqEnergy = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255;
      if (i < lowFreqEnd) {
        lowFreqEnergy += value * value;
      } else if (i < midFreqEnd) {
        midFreqEnergy += value * value;
      } else {
        highFreqEnergy += value * value;
      }
    }
    
    // Normalize by band size
    lowFreqEnergy = Math.sqrt(lowFreqEnergy / lowFreqEnd);
    midFreqEnergy = Math.sqrt(midFreqEnergy / (midFreqEnd - lowFreqEnd));
    highFreqEnergy = Math.sqrt(highFreqEnergy / (bufferLength - midFreqEnd));
    
    // Blowing characteristics:
    // - High energy in low frequencies
    // - Moderate energy in mid frequencies
    // - Lower energy in high frequencies
    // - Sustained noise pattern (not sharp like voice)
    
    const totalEnergy = lowFreqEnergy + midFreqEnergy + highFreqEnergy;
    const lowFreqRatio = lowFreqEnergy / (totalEnergy + 0.001);
    
    // Blowing has more low-frequency content than speech
    const isBlowLike = lowFreqRatio > 0.35 && totalEnergy > threshold;
    
    // Calculate overall intensity weighted toward low frequencies
    const intensity = lowFreqEnergy * 0.6 + midFreqEnergy * 0.3 + highFreqEnergy * 0.1;
    
    return { isBlowLike, intensity };
  }, [threshold]);

  const detectBlow = useCallback(() => {
    if (!analyserRef.current || !enabled || blowCompletedRef.current) {
      if (enabled && !blowCompletedRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectBlow);
      }
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const { isBlowLike, intensity } = analyzeBlowCharacteristics(dataArray);
    
    // Smooth the intensity for more stable readings
    const smoothingFactor = 0.3;
    smoothedIntensityRef.current = smoothedIntensityRef.current * (1 - smoothingFactor) + intensity * smoothingFactor;
    
    const currentTime = Date.now();
    
    if (isBlowLike && smoothedIntensityRef.current > threshold) {
      consecutiveBlowFramesRef.current++;
      
      // Start tracking blow time after a few consistent frames
      if (consecutiveBlowFramesRef.current >= 3 && !blowStartTimeRef.current) {
        blowStartTimeRef.current = currentTime;
        onBlowStart?.();
      }
      
      if (blowStartTimeRef.current) {
        const blowDuration = currentTime - blowStartTimeRef.current;
        const progress = Math.min(blowDuration / sustainedDuration, 1);
        
        setBlowAnalysis({
          isBlowing: true,
          intensity: smoothedIntensityRef.current,
          progress,
        });
        
        onBlowProgress?.(progress);
        
        // Complete blow detection
        if (progress >= 1 && !blowCompletedRef.current) {
          blowCompletedRef.current = true;
          onBlowComplete?.();
          return; // Stop the loop
        }
      }
    } else {
      // Reset if blow is interrupted (allow small gaps)
      if (consecutiveBlowFramesRef.current > 0) {
        consecutiveBlowFramesRef.current--;
      }
      
      if (consecutiveBlowFramesRef.current === 0) {
        blowStartTimeRef.current = null;
        setBlowAnalysis({
          isBlowing: false,
          intensity: smoothedIntensityRef.current,
          progress: 0,
        });
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectBlow);
  }, [threshold, sustainedDuration, onBlowStart, onBlowProgress, onBlowComplete, enabled, analyzeBlowCharacteristics]);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      blowCompletedRef.current = false;
      blowStartTimeRef.current = null;
      consecutiveBlowFramesRef.current = 0;
      smoothedIntensityRef.current = 0;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } 
      });
      
      streamRef.current = stream;
      setHasPermission(true);

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512; // More frequency resolution
      analyser.smoothingTimeConstant = 0.4; // Moderate smoothing
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      detectBlow();
    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Could not access microphone. Please allow microphone access and try again.');
      setHasPermission(false);
    }
  }, [detectBlow]);

  const stopListening = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const resetBlowDetection = useCallback(() => {
    blowCompletedRef.current = false;
    blowStartTimeRef.current = null;
    consecutiveBlowFramesRef.current = 0;
    smoothedIntensityRef.current = 0;
    setBlowAnalysis({ isBlowing: false, intensity: 0, progress: 0 });
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isListening,
    hasPermission,
    blowAnalysis,
    error,
    startListening,
    stopListening,
    resetBlowDetection,
  };
};

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseMicrophoneBlowOptions {
  threshold?: number;
  onBlow?: () => void;
  enabled?: boolean;
}

export const useMicrophoneBlow = ({
  threshold = 0.15,
  onBlow,
  enabled = true,
}: UseMicrophoneBlowOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [blowIntensity, setBlowIntensity] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const blowDetectedRef = useRef(false);
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
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsListening(false);
  }, []);

  const detectBlow = useCallback(() => {
    if (!analyserRef.current || !enabled) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Focus on low frequencies (characteristic of blowing)
    const lowFreqData = dataArray.slice(0, Math.floor(dataArray.length / 4));
    const average = lowFreqData.reduce((sum, val) => sum + val, 0) / lowFreqData.length / 255;

    setBlowIntensity(average);

    // Detect sustained blowing
    if (average > threshold) {
      consecutiveBlowFramesRef.current++;
      if (consecutiveBlowFramesRef.current >= 5 && !blowDetectedRef.current) {
        blowDetectedRef.current = true;
        onBlow?.();
      }
    } else {
      consecutiveBlowFramesRef.current = 0;
      blowDetectedRef.current = false;
    }

    animationFrameRef.current = requestAnimationFrame(detectBlow);
  }, [threshold, onBlow, enabled]);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      
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
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      detectBlow();
    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Could not access microphone. Please allow microphone access.');
      setHasPermission(false);
    }
  }, [detectBlow]);

  const stopListening = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const resetBlowDetection = useCallback(() => {
    blowDetectedRef.current = false;
    consecutiveBlowFramesRef.current = 0;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isListening,
    hasPermission,
    blowIntensity,
    error,
    startListening,
    stopListening,
    resetBlowDetection,
  };
};

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseMicrophoneBlowOptions {
  threshold?: number;
  sustainedDuration?: number;
  onBlowStart?: () => void;
  onBlowProgress?: (intensity: number) => void;
  onBlowComplete?: () => void;
  enabled?: boolean;
}

interface BlowAnalysis {
  isBlowing: boolean;
  intensity: number;
  progress: number;
}

export const useMicrophoneBlow = ({
  threshold = 1, // Higher threshold for harder blow detection
  sustainedDuration = 1000, // 1 second sustained blow required
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
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Blow detection state
  const blowStartTimeRef = useRef<number | null>(null);
  const blowCompletedRef = useRef(false);
  const smoothedIntensityRef = useRef(0);
  const isActiveRef = useRef(false);

  const cleanup = useCallback(() => {
    isActiveRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      sourceRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    setIsListening(false);
  }, []);

  const analyzeAudio = useCallback((dataArray: Uint8Array): { isBlowLike: boolean; intensity: number } => {
    const bufferLength = dataArray.length;
    
    // Calculate RMS (root mean square) for overall volume
    let sum = 0;
    let lowSum = 0;
    const lowEnd = Math.floor(bufferLength * 0.2);
    
    for (let i = 0; i < bufferLength; i++) {
      const normalized = dataArray[i] / 255;
      sum += normalized * normalized;
      
      if (i < lowEnd) {
        lowSum += normalized * normalized;
      }
    }
    
    const rms = Math.sqrt(sum / bufferLength);
    const lowRms = Math.sqrt(lowSum / lowEnd);
    
    // Blowing typically has more energy in low frequencies
    // and a sustained noise pattern
    const isBlowLike = rms > threshold && lowRms > threshold * 0.7;
    const intensity = rms * 2; // Scale up for visibility
    
    return { isBlowLike, intensity };
  }, [threshold]);

  const detectBlow = useCallback(() => {
    if (!isActiveRef.current || !analyserRef.current || blowCompletedRef.current) {
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const { isBlowLike, intensity } = analyzeAudio(dataArray);
    
    // Smooth the intensity
    smoothedIntensityRef.current = smoothedIntensityRef.current * 0.7 + intensity * 0.3;
    
    const currentTime = Date.now();
    
    if (isBlowLike) {
      // Start tracking if not already
      if (!blowStartTimeRef.current) {
        blowStartTimeRef.current = currentTime;
        onBlowStart?.();
      }
      
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
        cleanup();
        return;
      }
    } else {
      // Reset if blow stops
      if (blowStartTimeRef.current) {
        blowStartTimeRef.current = null;
        setBlowAnalysis({
          isBlowing: false,
          intensity: smoothedIntensityRef.current,
          progress: 0,
        });
      }
    }

    if (isActiveRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectBlow);
    }
  }, [sustainedDuration, onBlowStart, onBlowProgress, onBlowComplete, analyzeAudio, cleanup]);

  const startListening = useCallback(async () => {
    try {
      cleanup();
      setError(null);
      blowCompletedRef.current = false;
      blowStartTimeRef.current = null;
      smoothedIntensityRef.current = 0;
      
      console.log('Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } 
      });
      
      console.log('Microphone access granted');
      streamRef.current = stream;
      setHasPermission(true);

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      isActiveRef.current = true;
      setIsListening(true);
      
      console.log('Started listening for blow...');
      detectBlow();
    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Could not access microphone. Please allow microphone access and try again.');
      setHasPermission(false);
    }
  }, [detectBlow, cleanup]);

  const stopListening = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const resetBlowDetection = useCallback(() => {
    blowCompletedRef.current = false;
    blowStartTimeRef.current = null;
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

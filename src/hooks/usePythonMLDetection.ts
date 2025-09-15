import { useEffect, useRef, useState } from 'react';
import { MLModelIntegration, MLDetectionResult } from '../../ml_models/inference/ml_integration';

export interface UsePythonMLDetectionOptions {
  enablePoseDetection?: boolean;
  enableExerciseClassification?: boolean;
  enableFormAnalysis?: boolean;
  detectionThreshold?: number;
  exerciseType?: string;
  onDetectionChange?: (result: MLDetectionResult) => void;
  onServerStatusChange?: (isRunning: boolean) => void;
}

export const usePythonMLDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  options: UsePythonMLDetectionOptions = {}
) => {
  const {
    enablePoseDetection = true,
    enableExerciseClassification = true,
    enableFormAnalysis = true,
    detectionThreshold = 0.5,
    exerciseType = 'general',
    onDetectionChange,
    onServerStatusChange
  } = options;

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectionResult, setDetectionResult] = useState<MLDetectionResult>({
    isHumanDetected: false
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'running' | 'offline'>('checking');
  const [modelInfo, setModelInfo] = useState<any>(null);

  const mlIntegration = useRef(new MLModelIntegration());
  const animationFrameRef = useRef<number | null>(null);
  const lastProcessTime = useRef<number>(0);
  const processInterval = 100; // Process every 100ms to avoid overwhelming the server

  // Check server health and load models
  useEffect(() => {
    const initializeML = async () => {
      try {
        const isRunning = await mlIntegration.current.checkServerHealth();
        setServerStatus(isRunning ? 'running' : 'offline');
        onServerStatusChange?.(isRunning);

        if (isRunning) {
          const info = await mlIntegration.current.getModelInfo();
          setModelInfo(info);
          setIsModelLoaded(true);
          console.log('Python ML models loaded successfully:', info);
        } else {
          console.warn('Python ML server is not available. Using fallback detection.');
          setIsModelLoaded(false);
        }
      } catch (error) {
        console.error('Error initializing ML models:', error);
        setServerStatus('offline');
        setIsModelLoaded(false);
      }
    };

    initializeML();
  }, [onServerStatusChange]);

  // Detection loop
  useEffect(() => {
    if (!isModelLoaded || !videoRef.current || isDetecting) return;

    const detectWithML = async () => {
      if (!videoRef.current || !videoRef.current.videoWidth || !videoRef.current.videoHeight) {
        return;
      }

      const now = Date.now();
      if (now - lastProcessTime.current < processInterval) {
        return;
      }

      setIsDetecting(true);
      lastProcessTime.current = now;

      try {
        const result = await mlIntegration.current.processFrame(
          videoRef.current,
          exerciseType
        );

        setDetectionResult(result);
        onDetectionChange?.(result);

      } catch (error) {
        console.error('ML detection error:', error);
      } finally {
        setIsDetecting(false);
      }
    };

    const startDetection = () => {
      const detect = () => {
        detectWithML();
        animationFrameRef.current = requestAnimationFrame(detect);
      };
      detect();
    };

    startDetection();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isModelLoaded, videoRef, exerciseType, onDetectionChange, isDetecting, processInterval]);

  // Train classifier function
  const trainClassifier = async (options: {
    numSamples?: number;
    epochs?: number;
    batchSize?: number;
  } = {}) => {
    try {
      const result = await mlIntegration.current.trainClassifier(options);
      if (result.success) {
        console.log('Classifier training completed:', result.message);
        // Refresh model info
        const info = await mlIntegration.current.getModelInfo();
        setModelInfo(info);
      }
      return result;
    } catch (error) {
      console.error('Error training classifier:', error);
      return { success: false, message: `Training failed: ${error}` };
    }
  };

  // Analyze form function
  const analyzeForm = async (landmarks: number[][], exerciseType: string) => {
    try {
      return await mlIntegration.current.analyzeForm(landmarks, exerciseType);
    } catch (error) {
      console.error('Error analyzing form:', error);
      return { formScore: 0, recommendations: ['Unable to analyze form'] };
    }
  };

  // Check server status
  const checkServerStatus = async () => {
    const isRunning = await mlIntegration.current.checkServerHealth();
    setServerStatus(isRunning ? 'running' : 'offline');
    onServerStatusChange?.(isRunning);
    return isRunning;
  };

  return {
    isModelLoaded,
    detectionResult,
    isDetecting,
    serverStatus,
    modelInfo,
    trainClassifier,
    analyzeForm,
    checkServerStatus
  };
};


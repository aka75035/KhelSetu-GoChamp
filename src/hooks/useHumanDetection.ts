import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export interface HumanDetectionResult {
  isHumanDetected: boolean;
  poseKeypoints?: any[];
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence?: number;
  exerciseCount?: number;
  exerciseType?: string;
}

export interface UseHumanDetectionOptions {
  enablePoseDetection?: boolean;
  enableObjectDetection?: boolean;
  detectionThreshold?: number;
  exerciseType?: string;
  onDetectionChange?: (result: HumanDetectionResult) => void;
  countingEnabled?: boolean;
}

export const useHumanDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  options: UseHumanDetectionOptions = {}
) => {
  const {
    enablePoseDetection = true,
    enableObjectDetection = true,
    detectionThreshold = 0.5,
    exerciseType = 'pushups',
    onDetectionChange,
    countingEnabled = false
  } = options;

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectionResult, setDetectionResult] = useState<HumanDetectionResult>({
    isHumanDetected: false
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [exerciseCount, setExerciseCount] = useState(0);

  const poseDetectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const objectDetectorRef = useRef<cocoSsd.ObjectDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Exercise counting state
  const lastPoseRef = useRef<any>(null);
  const isDownPositionRef = useRef(false);
  const isUpPositionRef = useRef(false);
  // Per-frame detection guard to avoid state thrashing
  const isDetectingRef = useRef(false);
  // Stable callback ref to avoid effect restarts from new function identity
  const onDetectionChangeRef = useRef<typeof onDetectionChange>();
  onDetectionChangeRef.current = onDetectionChange;
  // Reuse a single offscreen canvas to avoid per-frame allocations
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Throttle emissions to the React state to reduce lag
  const lastEmitTsRef = useRef<number>(0);
  const EMIT_INTERVAL_MS = 100;

  const resetCounter = () => {
    setExerciseCount(0);
    isDownPositionRef.current = false;
    isUpPositionRef.current = false;
  };

  // Exercise counting functions
  const jointAngle = (a: any, b: any, c: any): number | null => {
    if (!a || !b || !c) return null;
    const abx = a.x - b.x; const aby = a.y - b.y;
    const cbx = c.x - b.x; const cby = c.y - b.y;
    const dot = abx * cbx + aby * cby;
    const mag1 = Math.hypot(abx, aby);
    const mag2 = Math.hypot(cbx, cby);
    if (mag1 === 0 || mag2 === 0) return null;
    const cos = Math.min(1, Math.max(-1, dot / (mag1 * mag2)));
    return (Math.acos(cos) * 180) / Math.PI;
  };

  const consecutiveDownRef = useRef(0);
  const consecutiveUpRef = useRef(0);
  const REQUIRED_FRAMES = 3;

  const countPushups = (poseKeypoints: any[]) => {
    if (poseKeypoints.length < 17) return; // Need all keypoints for accurate counting

    // Key points
    const ls = poseKeypoints[5]; // left shoulder
    const rs = poseKeypoints[6]; // right shoulder
    const le = poseKeypoints[7]; // left elbow
    const re = poseKeypoints[8]; // right elbow
    const lw = poseKeypoints[9]; // left wrist
    const rw = poseKeypoints[10]; // right wrist

    // Ensure visibility
    const visible = [ls, rs, le, re, lw, rw].every(p => (p?.score || 0) > 0.3);
    if (!visible) return;

    // Elbow angles (shoulder–elbow–wrist)
    const leftAngle = jointAngle(ls, le, lw);
    const rightAngle = jointAngle(rs, re, rw);
    if (leftAngle == null || rightAngle == null) return;

    // Hysteresis thresholds to reduce noise
    const DOWN_THRESHOLD = 95;   // angles less than this -> down/bent
    const UP_THRESHOLD = 160;    // angles greater than this -> up/extended

    const isDown = leftAngle < DOWN_THRESHOLD && rightAngle < DOWN_THRESHOLD;
    const isUp = leftAngle > UP_THRESHOLD && rightAngle > UP_THRESHOLD;

    if (isDown) {
      consecutiveDownRef.current += 1;
      consecutiveUpRef.current = 0;
      if (consecutiveDownRef.current >= REQUIRED_FRAMES) {
        isDownPositionRef.current = true;
        isUpPositionRef.current = false;
      }
    } else if (isUp) {
      consecutiveUpRef.current += 1;
      if (isDownPositionRef.current && consecutiveUpRef.current >= REQUIRED_FRAMES && !isUpPositionRef.current) {
        isUpPositionRef.current = true;
        consecutiveDownRef.current = 0;
        consecutiveUpRef.current = 0;
        setExerciseCount(prev => prev + 1);
      }
    } else {
      // In transition
      consecutiveDownRef.current = 0;
      consecutiveUpRef.current = 0;
    }
  };

  const countSitups = (poseKeypoints: any[]) => {
    if (poseKeypoints.length < 17) return;

    const nose = poseKeypoints[0];
    const leftHip = poseKeypoints[11];
    const rightHip = poseKeypoints[12];
    const leftKnee = poseKeypoints[13];
    const rightKnee = poseKeypoints[14];

    const keyPoints = [nose, leftHip, rightHip, leftKnee, rightKnee];
    const visiblePoints = keyPoints.filter(point => point.score > 0.3);
    
    if (visiblePoints.length < 4) return;

    const avgHipY = (leftHip.y + rightHip.y) / 2;
    const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
    const noseY = nose.y;

    // Situp detection logic
    const isInDownPosition = noseY > avgHipY;
    const isInUpPosition = noseY < avgHipY;

    if (isInDownPosition && !isDownPositionRef.current) {
      isDownPositionRef.current = true;
    } else if (isInUpPosition && isDownPositionRef.current && !isUpPositionRef.current) {
      isUpPositionRef.current = true;
      setExerciseCount(prev => prev + 1);
      console.log(`Situp count: ${exerciseCount + 1}`);
    } else if (!isInUpPosition && isUpPositionRef.current) {
      isUpPositionRef.current = false;
      isDownPositionRef.current = false;
    }
  };

  const countPullups = (poseKeypoints: any[]) => {
    if (poseKeypoints.length < 17) return;

    const leftShoulder = poseKeypoints[5];
    const rightShoulder = poseKeypoints[6];
    const leftElbow = poseKeypoints[7];
    const rightElbow = poseKeypoints[8];
    const leftWrist = poseKeypoints[9];
    const rightWrist = poseKeypoints[10];

    const keyPoints = [leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist];
    const visiblePoints = keyPoints.filter(point => point.score > 0.3);
    
    if (visiblePoints.length < 5) return;

    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const avgElbowY = (leftElbow.y + rightElbow.y) / 2;
    const avgWristY = (leftWrist.y + rightWrist.y) / 2;

    // Pullup detection logic
    const isInDownPosition = avgWristY > avgShoulderY;
    const isInUpPosition = avgWristY < avgShoulderY;

    if (isInDownPosition && !isDownPositionRef.current) {
      isDownPositionRef.current = true;
    } else if (isInUpPosition && isDownPositionRef.current && !isUpPositionRef.current) {
      isUpPositionRef.current = true;
      setExerciseCount(prev => prev + 1);
      console.log(`Pullup count: ${exerciseCount + 1}`);
    } else if (!isInUpPosition && isUpPositionRef.current) {
      isUpPositionRef.current = false;
      isDownPositionRef.current = false;
    }
  };

  // Initialize TensorFlow.js and load models
  useEffect(() => {
    const initializeModels = async () => {
      try {
        // Set the backend to WebGL for better performance
        await tf.setBackend('webgl');
        await tf.ready();

        const models: Promise<any>[] = [];

        if (enablePoseDetection) {
          models.push(
            poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
              modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
            })
          );
        }

        if (enableObjectDetection) {
          models.push(cocoSsd.load());
        }

        const [poseDetector, objectDetector] = await Promise.all(models);

        if (enablePoseDetection) {
          poseDetectorRef.current = poseDetector;
        }
        if (enableObjectDetection) {
          objectDetectorRef.current = objectDetector;
        }

        setIsModelLoaded(true);
        console.log('Human detection models loaded successfully');
      } catch (error) {
        console.error('Error loading human detection models:', error);
      }
    };

    initializeModels();

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enablePoseDetection, enableObjectDetection]);

  // Detection loop
  useEffect(() => {
    if (!isModelLoaded || !videoRef.current) return;

    const detectHuman = async () => {
      const video = videoRef.current;
      if (!video || !video.videoWidth || !video.videoHeight) {
        return;
      }

      if (isDetectingRef.current) return;
      isDetectingRef.current = true;

      try {
        // Prepare canvas once
        let canvas = offscreenCanvasRef.current;
        if (!canvas) {
          canvas = document.createElement('canvas');
          offscreenCanvasRef.current = canvas;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        let humanDetected = false;
        let poseKeypoints: any[] = [];
        let boundingBox: any = null;
        let confidence = 0;

        // Pose detection
        if (poseDetectorRef.current) {
          try {
            const poses = await poseDetectorRef.current.estimatePoses(video);
            if (poses.length > 0) {
              humanDetected = true;
              poseKeypoints = poses[0].keypoints;
              confidence = Math.max(...poses[0].keypoints.map((kp: any) => kp.score || 0));
              
              // Count exercises based on exercise type
              if (countingEnabled) {
                if (exerciseType === 'pushups') {
                  countPushups(poseKeypoints);
                } else if (exerciseType === 'situps') {
                  countSitups(poseKeypoints);
                } else if (exerciseType === 'pullups') {
                  countPullups(poseKeypoints);
                }
              }
            }
          } catch (error) {
            console.warn('Pose detection error:', error);
          }
        }

        // Object detection for person class
        if (objectDetectorRef.current && !humanDetected) {
          try {
            const predictions = await objectDetectorRef.current.detect(video);
            const personPrediction = predictions.find(p => p.class === 'person' && p.score >= detectionThreshold);
            
            if (personPrediction) {
              humanDetected = true;
              boundingBox = {
                x: personPrediction.bbox[0],
                y: personPrediction.bbox[1],
                width: personPrediction.bbox[2],
                height: personPrediction.bbox[3]
              };
              confidence = personPrediction.score;
            }
          } catch (error) {
            console.warn('Object detection error:', error);
          }
        }

        const now = performance.now();
        if (now - lastEmitTsRef.current >= EMIT_INTERVAL_MS) {
          lastEmitTsRef.current = now;
          const result: HumanDetectionResult = {
            isHumanDetected: humanDetected,
            poseKeypoints: poseKeypoints.length > 0 ? poseKeypoints : undefined,
            boundingBox,
            confidence,
            exerciseCount,
            exerciseType
          };
          setDetectionResult(result);
          onDetectionChangeRef.current?.(result);
        }

      } catch (error) {
        console.error('Detection error:', error);
      } finally {
        isDetectingRef.current = false;
      }
    };

    const startDetection = () => {
      setIsDetecting(true);
      const detect = () => {
        detectHuman();
        animationFrameRef.current = requestAnimationFrame(detect);
      };
      detect();
    };

    startDetection();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsDetecting(false);
      isDetectingRef.current = false;
    };
  }, [isModelLoaded, videoRef, detectionThreshold, exerciseType, countingEnabled]);

  return {
    isModelLoaded,
    detectionResult,
    isDetecting,
    exerciseCount,
    resetCounter
  };
};


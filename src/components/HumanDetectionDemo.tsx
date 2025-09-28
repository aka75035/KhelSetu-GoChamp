import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useHumanDetection } from '../hooks/useHumanDetection';
import { HumanDetectionOverlay } from './HumanDetectionOverlay';
import { Camera, Video, Square } from 'lucide-react';

export const HumanDetectionDemo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exerciseType, setExerciseType] = useState<'pushups' | 'situps' | 'pullups' | 'squats'>('pushups');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [cameraPermission, setCameraPermission] = useState<string>('unknown');

  const { isModelLoaded, detectionResult, isDetecting, exerciseCount, resetCounter } = useHumanDetection(videoRef, {
    enablePoseDetection: true,
    enableObjectDetection: true,
    detectionThreshold: 0.3, // Lower threshold for better detection
    countingEnabled: true,
    exerciseType,
    processInterval: 100, // Faster processing
    maxInputSize: 512, // Smaller for better performance
    modelType: 'lightning',
    onDetectionChange: (result) => {
      setDebugInfo(`Detection: ${result.isHumanDetected ? 'YES' : 'NO'}, Confidence: ${result.confidence?.toFixed(2) || 'N/A'}, Keypoints: ${result.poseKeypoints?.length || 0}`);
    }
  });

  const startCamera = async () => {
    try {
      setError(null);
      setDebugInfo('Requesting camera access...');
      
      // Check camera permission first
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setCameraPermission(permission.state);
        if (permission.state === 'denied') {
          setError('Camera permission denied. Please enable camera access in your browser settings.');
          return;
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
        setDebugInfo('Camera started successfully');
        setCameraPermission('granted');
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setError(`Failed to access camera: ${err.message}`);
      setDebugInfo(`Camera error: ${err.name} - ${err.message}`);
      setCameraPermission('denied');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Camera className="h-6 w-6" />
            </div>
            Human Detection Demo
          </CardTitle>
          <p className="text-indigo-100">Experience real-time AI-powered human detection and pose estimation</p>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <Button
              onClick={startCamera}
              disabled={isStreaming}
              className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3"
            >
              <Video className="h-5 w-5" />
              Start Camera
            </Button>
            <Button
              onClick={stopCamera}
              disabled={!isStreaming}
              variant="outline"
              className="flex items-center gap-3 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-700 hover:text-red-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3"
            >
              <Square className="h-5 w-5" />
              Stop Camera
            </Button>

            {/* Exercise selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Exercise</label>
              <select
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="pushups">Push-ups</option>
                <option value="situps">Sit-ups</option>
                <option value="pullups">Pull-ups</option>
                <option value="squats">Squat Test</option>
              </select>
            </div>

            {/* Counter and reset */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Count:</span>
              <span className="text-lg font-bold text-indigo-700">{exerciseCount}</span>
              <Button variant="secondary" onClick={resetCounter} className="h-9 px-3">Reset</Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-200">
            <video
              ref={videoRef}
              className="w-full h-auto"
              style={{ display: isStreaming ? 'block' : 'none' }}
            />
            {isStreaming && (
              <HumanDetectionOverlay
                detectionResult={detectionResult}
                videoRef={videoRef}
                isModelLoaded={isModelLoaded}
                isDetecting={isDetecting}
              />
            )}
            {!isStreaming && (
              <div className="flex items-center justify-center h-96 text-white">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Camera className="h-12 w-12 opacity-70" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Start</h3>
                  <p className="text-gray-300">Click "Start Camera" to begin human detection</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    detectionResult.isHumanDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  Detection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${
                    detectionResult.isHumanDetected ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {detectionResult.isHumanDetected ? 'Human Detected' : 'No Human'}
                  </div>
                  <p className="text-sm text-gray-600">
                    {detectionResult.isHumanDetected ? 'AI has identified a person in the frame' : 'No person detected in the current view'}
                  </p>
                  {debugInfo && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700">
                      {debugInfo}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isModelLoaded ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                  }`}></div>
                  AI Model Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${
                    isModelLoaded ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {isModelLoaded ? 'Models Loaded' : 'Loading...'}
                  </div>
                  <p className="text-sm text-gray-600">
                    {isModelLoaded ? 'TensorFlow.js models are ready' : 'Initializing AI models...'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  Detection Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2 text-blue-600">
                    {detectionResult.confidence 
                      ? `${(detectionResult.confidence * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </div>
                  <p className="text-sm text-gray-600">
                    {detectionResult.confidence 
                      ? 'AI confidence in the detection' 
                      : 'No detection data available'
                    }
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Camera: {cameraPermission} | Models: {isModelLoaded ? 'Loaded' : 'Loading...'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              Advanced Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Real-time human detection using TensorFlow.js
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Pose estimation with keypoint visualization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Object detection for person classification
                </li>
              </ul>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Confidence scoring for detection accuracy
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Skeleton overlay showing body pose
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Real-time performance analysis
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


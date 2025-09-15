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

  const { isModelLoaded, detectionResult, isDetecting } = useHumanDetection(videoRef, {
    enablePoseDetection: true,
    enableObjectDetection: true,
    detectionThreshold: 0.5,
  });

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      setError('Failed to access camera: ' + err.message);
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Human Detection Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={startCamera}
              disabled={isStreaming}
              className="flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              Start Camera
            </Button>
            <Button
              onClick={stopCamera}
              disabled={!isStreaming}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Camera
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="relative bg-black rounded-lg overflow-hidden">
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
              <div className="flex items-center justify-center h-64 text-white">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Click "Start Camera" to begin human detection</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Detection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    detectionResult.isHumanDetected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm">
                    {detectionResult.isHumanDetected ? 'Human Detected' : 'No Human'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">AI Model Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isModelLoaded ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm">
                    {isModelLoaded ? 'Models Loaded' : 'Loading...'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Detection Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-sm">
                  {detectionResult.confidence 
                    ? `${(detectionResult.confidence * 100).toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Real-time human detection using TensorFlow.js</li>
              <li>• Pose estimation with keypoint visualization</li>
              <li>• Object detection for person classification</li>
              <li>• Confidence scoring for detection accuracy</li>
              <li>• Skeleton overlay showing body pose</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


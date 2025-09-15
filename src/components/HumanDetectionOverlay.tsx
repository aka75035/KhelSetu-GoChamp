import React from 'react';
import { HumanDetectionResult } from '../hooks/useHumanDetection';

interface HumanDetectionOverlayProps {
  detectionResult: HumanDetectionResult;
  videoRef: React.RefObject<HTMLVideoElement>;
  isModelLoaded: boolean;
  isDetecting: boolean;
}

export const HumanDetectionOverlay: React.FC<HumanDetectionOverlayProps> = ({
  detectionResult,
  videoRef,
  isModelLoaded,
  isDetecting
}) => {
  if (!isModelLoaded || !videoRef.current) {
    return (
      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-2 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm">Loading AI Models...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Detection Status */}
      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-2 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            detectionResult.isHumanDetected 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-red-500'
          }`}></div>
          <span className="text-sm">
            {detectionResult.isHumanDetected ? 'Human Detected' : 'No Human'}
          </span>
          {isDetecting && (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        {detectionResult.confidence && (
          <div className="text-xs text-gray-300 mt-1">
            Confidence: {(detectionResult.confidence * 100).toFixed(1)}%
          </div>
        )}
        {detectionResult.exerciseCount !== undefined && (
          <div className="text-sm text-green-400 mt-1 font-bold">
            {detectionResult.exerciseType?.charAt(0).toUpperCase() + detectionResult.exerciseType?.slice(1)}: {detectionResult.exerciseCount}
          </div>
        )}
      </div>

      {/* Pose Keypoints Overlay */}
      {detectionResult.isHumanDetected && detectionResult.poseKeypoints && (
        <div className="absolute inset-0 pointer-events-none">
          {detectionResult.poseKeypoints.map((keypoint: any, index: number) => (
            keypoint.score > 0.3 && (
              <div
                key={index}
                className="absolute w-3 h-3 bg-green-500 rounded-full transform -translate-x-1.5 -translate-y-1.5 border border-white"
                style={{
                  left: `${(keypoint.x / videoRef.current?.videoWidth || 1) * 100}%`,
                  top: `${(keypoint.y / videoRef.current?.videoHeight || 1) * 100}%`,
                }}
              />
            )
          ))}
        </div>
      )}

      {/* Bounding Box Overlay */}
      {detectionResult.isHumanDetected && detectionResult.boundingBox && (
        <div
          className="absolute border-2 border-green-500 pointer-events-none"
          style={{
            left: `${(detectionResult.boundingBox.x / videoRef.current?.videoWidth || 1) * 100}%`,
            top: `${(detectionResult.boundingBox.y / videoRef.current?.videoHeight || 1) * 100}%`,
            width: `${(detectionResult.boundingBox.width / videoRef.current?.videoWidth || 1) * 100}%`,
            height: `${(detectionResult.boundingBox.height / videoRef.current?.videoHeight || 1) * 100}%`,
          }}
        />
      )}

      {/* Skeleton Overlay for Pose Detection */}
      {detectionResult.isHumanDetected && detectionResult.poseKeypoints && (
        <svg
          className="absolute inset-0 pointer-events-none w-full h-full"
          style={{ zIndex: 10 }}
        >
          {detectionResult.poseKeypoints.length > 0 && (
            <>
              {/* Draw skeleton connections */}
              {[
                [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], // arms
                [5, 11], [6, 12], [11, 12], // torso
                [11, 13], [13, 15], [12, 14], [14, 16] // legs
              ].map(([start, end], index) => {
                const startPoint = detectionResult.poseKeypoints![start];
                const endPoint = detectionResult.poseKeypoints![end];
                
                if (startPoint.score > 0.3 && endPoint.score > 0.3) {
                  const startX = (startPoint.x / videoRef.current?.videoWidth || 1) * 100;
                  const startY = (startPoint.y / videoRef.current?.videoHeight || 1) * 100;
                  const endX = (endPoint.x / videoRef.current?.videoWidth || 1) * 100;
                  const endY = (endPoint.y / videoRef.current?.videoHeight || 1) * 100;
                  
                  return (
                    <line
                      key={index}
                      x1={`${startX}%`}
                      y1={`${startY}%`}
                      x2={`${endX}%`}
                      y2={`${endY}%`}
                      stroke="green"
                      strokeWidth="2"
                    />
                  );
                }
                return null;
              })}
            </>
          )}
        </svg>
      )}
    </>
  );
};


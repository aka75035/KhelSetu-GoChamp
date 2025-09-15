import React, { useRef, useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { usePythonMLDetection } from "../hooks/usePythonMLDetection";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Camera, Video, Square, Brain, Zap, AlertCircle } from "lucide-react";

interface PythonMLCameraOverlayProps {
  onClose: () => void;
  athleteId: string;
  exerciseKey: string;
  onVideoUploaded: () => void;
  onOfflineVideoAdded: () => void;
}

export default function PythonMLCameraOverlay({
  onClose,
  athleteId,
  exerciseKey,
  onVideoUploaded,
  onOfflineVideoAdded,
}: PythonMLCameraOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const recordedChunks = useRef<Blob[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [timer, setTimer] = useState(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const [formRecommendations, setFormRecommendations] = useState<string[]>([]);
  const [exerciseCount, setExerciseCount] = useState(0);

  // Python ML Detection
  const {
    isModelLoaded,
    detectionResult,
    isDetecting,
    serverStatus,
    modelInfo,
    trainClassifier,
    analyzeForm
  } = usePythonMLDetection(videoRef, {
    exerciseType: exerciseKey,
    enablePoseDetection: true,
    enableExerciseClassification: true,
    enableFormAnalysis: true,
    onDetectionChange: (result) => {
      if (result.formAnalysis?.recommendations) {
        setFormRecommendations(result.formAnalysis.recommendations);
      }
    }
  });

  // Start camera on mount
  useEffect(() => {
    let stream: MediaStream;
    (async () => {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      videoRef.current!.srcObject = stream;
      streamRef.current = stream;
      videoRef.current!.play().catch(() => {});
    })();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleRecord = () => {
    if (!isRecording && streamRef.current) {
      console.log("Starting recording...");
      recordedChunks.current = [];
      const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        console.log("Recorded blob size:", blob.size);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setShowSavePrompt(true);
      };

      recorder.start();
      setIsRecording(true);
      setTimer(0);
      timerInterval.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
    } else if (isRecording && mediaRecorderRef.current) {
      console.log("Stopping recording...");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }
  };

  // Save video to device and queue for upload
  const handleSave = async () => {
    console.log("Save button clicked");
    if (!videoUrl) return;
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      // Convert blob to base64 to save with Capacitor Filesystem
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const fileName = `exercise_${Date.now()}.webm`;
        const path = `videos/${athleteId}/${exerciseKey}/${fileName}`;

        // 1. Save the video file locally
        await Filesystem.writeFile({
          path,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true,
        });

        // 2. Add the video to the pending upload queue in localStorage
        const pendingVideos = JSON.parse(localStorage.getItem("pendingVideos") || "[]");
        pendingVideos.push({
          athleteAadhar: athleteId,
          exerciseKey: exerciseKey,
          fileName: fileName,
          path: path,
        });
        localStorage.setItem("pendingVideos", JSON.stringify(pendingVideos));

        alert("Video saved locally. It will be uploaded when an internet connection is available.");
        
        // 3. Notify parent components to refresh their views
        onOfflineVideoAdded();
        onClose();
      };

    } catch (e) {
      console.error("Save error:", e);
      alert("Failed to save video locally: " + (e as any).message);
    } finally {
      setShowSavePrompt(false);
      setVideoUrl(null);
      cleanupStream();
    }
  };

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    setTimer(0);
  };

  // Format timer as mm:ss
  const formatTimer = (t: number) => {
    const m = Math.floor(t / 60).toString().padStart(2, "0");
    const s = (t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleTrainModel = async () => {
    const result = await trainClassifier({
      numSamples: 1000,
      epochs: 50
    });
    
    if (result.success) {
      alert(`Model training completed! Accuracy: ${result.accuracy?.toFixed(2)}%`);
    } else {
      alert(`Training failed: ${result.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="flex-1 object-cover w-full"
        style={{ background: "#000" }}
      />
      
      {/* Timer on top left */}
      <div className="absolute top-6 left-6 bg-black bg-opacity-60 rounded px-3 py-1 flex items-center">
        {isRecording && <span className="w-2 h-2 rounded-full bg-red-600 mr-2 animate-pulse"></span>}
        <span className="text-white font-mono text-lg">{formatTimer(timer)}</span>
      </div>

      {/* ML Status on top right */}
      <div className="absolute top-6 right-6 bg-black bg-opacity-60 rounded px-3 py-1 flex items-center space-x-2">
        {serverStatus === 'running' ? (
          <>
            <Brain className="h-4 w-4 text-green-400" />
            <span className="text-white text-sm">
              {isModelLoaded ? 'AI Ready' : 'Loading...'}
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-white text-sm">AI Offline</span>
          </>
        )}
      </div>

      {/* Human Detection Status */}
      <div className="absolute top-16 right-6 bg-black bg-opacity-60 rounded px-3 py-1 flex items-center">
        <div className={`w-2 h-2 rounded-full mr-2 ${
          detectionResult.isHumanDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}></div>
        <span className="text-white text-sm">
          {detectionResult.isHumanDetected ? 'Human Detected' : 'No Human'}
        </span>
        {isDetecting && (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
        )}
      </div>

      {/* Exercise Classification */}
      {detectionResult.exerciseClassification && (
        <div className="absolute top-24 right-6 bg-black bg-opacity-60 rounded px-3 py-1">
          <div className="text-white text-sm">
            <div className="font-semibold">{detectionResult.exerciseClassification.exercise}</div>
            <div className="text-xs text-gray-300">
              Confidence: {(detectionResult.exerciseClassification.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Form Analysis */}
      {detectionResult.formAnalysis && (
        <div className="absolute top-32 right-6 bg-black bg-opacity-60 rounded px-3 py-1 max-w-xs">
          <div className="text-white text-sm">
            <div className="font-semibold mb-1">Form Score: {(detectionResult.formAnalysis.formScore * 100).toFixed(0)}%</div>
            <Progress value={detectionResult.formAnalysis.formScore * 100} className="h-2 mb-2" />
            {formRecommendations.length > 0 && (
              <div className="text-xs text-yellow-300">
                💡 {formRecommendations[0]}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pose Keypoints Overlay */}
      {detectionResult.isHumanDetected && detectionResult.poseKeypoints && (
        <div className="absolute inset-0 pointer-events-none">
          {detectionResult.poseKeypoints.map((keypoint: any, index: number) => (
            keypoint.visibility > 0.3 && (
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

      {/* Record/Stop button */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center">
        <button
          onClick={handleRecord}
          className={`rounded-full w-20 h-20 flex items-center justify-center border-4 border-white shadow-lg transition-colors duration-200 ${
            isRecording ? "bg-red-600" : "bg-white"
          }`}
        >
          <span
            className={`block rounded-full ${
              isRecording ? "bg-red-700 w-8 h-8" : "bg-gray-400 w-12 h-12"
            } transition-all duration-200`}
          />
        </button>
      </div>

      {/* Close button */}
      <button
        onClick={() => {
          cleanupStream();
          onClose();
        }}
        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded"
      >
        Close
      </button>

      {/* Train Model Button */}
      <button
        onClick={handleTrainModel}
        className="absolute bottom-4 left-4 bg-blue-600 bg-opacity-80 text-white px-3 py-2 rounded text-sm flex items-center space-x-1"
      >
        <Zap className="h-4 w-4" />
        <span>Train AI</span>
      </button>

      {/* Save/Discard Prompt */}
      {showSavePrompt && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-60">
          <video
            src={videoUrl!}
            controls
            className="w-3/4 mb-4"
          />
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-6 py-2 rounded font-bold"
            >
              Save Video
            </button>
            <button
              onClick={() => {
                setShowSavePrompt(false);
                setVideoUrl(null);
                cleanupStream();
                onClose();
              }}
              className="bg-red-600 text-white px-6 py-2 rounded font-bold"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Server Status Alert */}
      {serverStatus === 'offline' && (
        <div className="absolute bottom-20 left-4 right-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Python ML server is offline. Start it with: <code>python ml_models/start_server.py</code>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}


import React, { useRef, useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { useHumanDetection } from "../../hooks/useHumanDetection";
import { HumanDetectionOverlay } from "../HumanDetectionOverlay";

interface CameraOverlayProps {
  onClose: () => void;
  athleteId: string;
  exerciseKey: string;
  onVideoUploaded: () => void;
  onOfflineVideoAdded: () => void; // Add this prop
}

export default function CameraOverlay({
  onClose,
  athleteId,
  exerciseKey,
  onVideoUploaded,
  onOfflineVideoAdded,
}: CameraOverlayProps) {
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
  const [humanDetected, setHumanDetected] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [countingEnabled, setCountingEnabled] = useState(false);
  const [hasUserStartedCounting, setHasUserStartedCounting] = useState(false);

  // Human detection hook
  const { isModelLoaded, detectionResult, isDetecting, exerciseCount, resetCounter } = useHumanDetection(videoRef, {
    enablePoseDetection: true,
    enableObjectDetection: true,
    detectionThreshold: 0.5,
    exerciseType: exerciseKey,
    countingEnabled,
    onDetectionChange: (result) => {
      setHumanDetected(result.isHumanDetected);
    }
  });

  // Start camera on mount and whenever facing changes
  useEffect(() => {
    let stream: MediaStream;
    (async () => {
        try {
            console.log("Requesting camera access...", cameraFacing);
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: cameraFacing }, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            console.log("Camera stream obtained:", stream);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                await videoRef.current.play();
                console.log("Camera stream assigned to video element.");
            } else {
                console.error("Video element reference is null.");
            }
        } catch (error: any) {
            console.error("Error accessing the camera:", error);
            if (error.name === "NotAllowedError") {
                alert(
                    "Camera access is required to record videos. Please enable permissions in your browser or device settings."
                );
            } else if (error.name === "NotFoundError") {
                alert("No camera devices were found. Please connect a camera and try again.");
            } else {
                alert("An unexpected error occurred while accessing the camera. Please try again.");
            }
            onClose();
        }
    })();
    return () => {
        if (stream) {
            console.log("Stopping camera stream...");
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [onClose, cameraFacing]);

  const switchCamera = () => {
    // Stop current stream and toggle facing, effect will restart stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraFacing(prev => (prev === 'user' ? 'environment' : 'user'));
  };

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

      recorder.onstop = async () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        console.log("Recorded blob size:", blob.size);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        // Auto-save offline
        try {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64Data = reader.result as string;
            const fileName = `exercise_${Date.now()}.webm`;
            const path = `videos/${athleteId}/${exerciseKey}/${fileName}`;
            await Filesystem.writeFile({ path, data: base64Data, directory: Directory.Documents, recursive: true });
            const pendingVideos = JSON.parse(localStorage.getItem("pendingVideos") || "[]");
            pendingVideos.push({ athleteAadhar: athleteId, exerciseKey, fileName, path });
            localStorage.setItem("pendingVideos", JSON.stringify(pendingVideos));
            // Refresh offline list in parent immediately
            onOfflineVideoAdded();
          };
        } catch (e) {
          console.error("Auto-save error:", e);
        }
        // Optionally still show preview, but skip forcing Save dialog
        setShowSavePrompt(false);
      };

      recorder.start();
      setIsRecording(true);
      setTimer(0);
      resetCounter();
      setCountingEnabled(true);
      setHasUserStartedCounting(true);
      timerInterval.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
    } else if (isRecording && mediaRecorderRef.current) {
      console.log("Stopping recording...");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      setCountingEnabled(false);
      setHasUserStartedCounting(false);
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
        const path = `videos/${athleteId}/${exerciseKey}/${fileName}`; // athleteId is the Aadhar number

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
          athleteAadhar: athleteId, // Pass Aadhar number here
          exerciseKey: exerciseKey,
          fileName: fileName,
          path: path,
        });
        localStorage.setItem("pendingVideos", JSON.stringify(pendingVideos));

        alert("Video saved locally. It will be uploaded when an internet connection is available.");
        
        // 3. Notify parent components to refresh their views
        onOfflineVideoAdded(); // Refresh the offline videos list immediately
        onClose(); // Close the camera overlay
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

  return (
  <>
  
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="flex-1 object-cover w-full"
        style={{ background: "#000" }}
      />
      {/* Exercise Type Label */}
      <div className="absolute top-6 left-6 bg-blue-700 bg-opacity-80 text-white px-4 py-2 rounded text-lg font-bold shadow-lg z-20">
        {exerciseKey.charAt(0).toUpperCase() + exerciseKey.slice(1)}
      </div>
      
      {/* Exercise Count Display */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-green-600 bg-opacity-90 text-white px-6 py-3 rounded-full text-2xl font-bold shadow-lg z-20">
        Count: {exerciseCount}
      </div>
      {/* Timer on top left (move to top right) */}
      <div className="absolute top-6 right-6 bg-black bg-opacity-60 rounded px-3 py-1 flex items-center z-20">
        {isRecording && <span className="w-2 h-2 rounded-full bg-red-600 mr-2 animate-pulse"></span>}
        <span className="text-white font-mono text-lg">{formatTimer(timer)}</span>
      </div>

      {/* Human Detection Overlay (always visible) */}
      <HumanDetectionOverlay
        detectionResult={detectionResult}
        videoRef={videoRef}
        isModelLoaded={isModelLoaded}
        isDetecting={isDetecting}
      />
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
      {/* Camera Switch button (front/back) */}
      <button
        onClick={switchCamera}
        className="absolute bottom-8 right-6 bg-black bg-opacity-60 text-white px-4 py-2 rounded"
        aria-label="Switch camera"
      >
        {cameraFacing === 'user' ? 'Rear Cam' : 'Front Cam'}
      </button>
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
    </div>
    </>
  );
  
}


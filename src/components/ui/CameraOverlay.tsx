import React, { useRef, useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Filesystem, Directory } from "@capacitor/filesystem";

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

  // Save video to device (Capacitor Filesystem)
  const handleSave = async () => {
    console.log("Save button clicked");
    if (!videoUrl) return;
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      const fileName = `exercise_${Date.now()}.webm`;
      const path = `Videos/${athleteId}/${exerciseKey}/${fileName}`;

      // Save locally
      await Filesystem.writeFile({
        path,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("videos")
        .upload(`${athleteId}/${exerciseKey}/${fileName}`, blob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        // If upload fails, save to pendingVideos for later upload
        const pendingVideos = JSON.parse(localStorage.getItem("pendingVideos") || "[]");
        pendingVideos.push({
          athleteId: athleteId,
          exerciseKey: exerciseKey,
          fileName: fileName,
          path: path,
          uploading: false, // Add this flag
        });
        localStorage.setItem("pendingVideos", JSON.stringify(pendingVideos));
        alert("Video saved offline. It will be uploaded when you are online.");
      } else {
        alert("Video saved and uploaded!");
        onVideoUploaded(); // Refresh online videos
        onOfflineVideoAdded(); // Refresh offline videos
        onClose();
      }
      setShowSavePrompt(false);
      setVideoUrl(null);
      cleanupStream();
    } catch (e) {
      console.error("Save error:", e);
      alert("Failed to save video: " + (e as any).message);
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
  );
}


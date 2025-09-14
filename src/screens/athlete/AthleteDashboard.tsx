import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import AthleteBottomNav from "../../components/ui/AthleteBottomNav";
import { Athlete, AthleteProfilePage } from "../../App";
import CameraOverlay from "../../components/ui/CameraOverlay";
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { isPlatform } from '@ionic/react';
import { toast } from 'react-hot-toast';
import logo from '../../assets/logo.png';

const EXERCISES = [
  { key: "situps", label: "Situps" },
  { key: "pullups", label: "Pullups" },
  { key: "pushups", label: "Pushups" },
];

export default function AthleteDashboard({ onLogout, session }: { onLogout: () => void; session: any }) {
  const [activeTab, setActiveTab] = useState("home");
  const [athleteProfile, setAthleteProfile] = useState<Athlete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [onlineVideos, setOnlineVideos] = useState({});
  const [offlineVideos, setOfflineVideos] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoScreen, setVideoScreen] = useState<{ type: "online" | "offline"; exercise: string } | null>(null);
  const [offlineVideoURLs, setOfflineVideoURLs] = useState({});
  const [uploadingVideos, setUploadingVideos] = useState({});
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [selectedVideoForAnalysis, setSelectedVideoForAnalysis] = useState<string | null>(null);

  const handleRecordToggle = async () => {
    if (isRecording) {
      setIsRecording(false);
      stopRecording();
    } else {
      setIsRecording(true);
      startRecording();
    }
  };

  const startRecording = async () => {
    const hasPermissions = await requestStoragePermissions();
    if (!hasPermissions) {
      toast.error('Storage permissions are required to record videos.');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('MediaDevices API is not supported in your browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current.onstop = handleStop;
      mediaRecorderRef.current.start();

      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Failed to access camera. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    clearInterval(timerRef.current);
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      recordedChunksRef.current.push(event.data);
    }
  };

  const handleStop = () => {
    const blob = new Blob(recordedChunksRef.current, {
      type: 'video/webm',
    });
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
    recordedChunksRef.current = [];
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching athlete profile:", error);
      } else if (data) {
        setAthleteProfile({
          id: data.id,
          name: data.full_name || 'N/A',
          age: data.age || 0,
          sport: data.sport || 'General Fitness',
          rank: data.rank || 'Trainee',
          imageUrl: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name || 'T A')}&background=808080&color=FFFFFF`,
          mobileNumber: data.mobile_number,
          aadhaarNumber: data.aadhaar_number,
        });
      } else {
        console.warn("Profile not found in DB, creating fallback from session metadata.");
        setAthleteProfile({
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'Athlete',
          age: session.user.user_metadata.age || 0,
          sport: 'General Fitness',
          rank: 'Trainee',
          imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.user_metadata.full_name || 'A')}&background=808080&color=FFFFFF`,
          mobileNumber: session.user.user_metadata.mobile_number,
          aadhaarNumber: session.user.user_metadata.aadhaar_number,
        });
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [session.user.id]);

  useEffect(() => {
    async function fetchAllOnline() {
      const result = {};
      for (const ex of EXERCISES) {
        const { data, error } = await supabase.storage.from('videos').list(`${session.user.id}/${ex.key}`);
        console.log(`Online videos for ${ex.key}:`, data, error);
        result[ex.key] = data || [];
      }
      setOnlineVideos(result);
    }
    fetchAllOnline();
  }, [session.user.id]);

  const uploadVideo = async (video) => {
    const hasPermissions = await requestStoragePermissions();
    if (!hasPermissions) {
      toast.error('Storage permissions are required to upload videos.');
      return;
    }

    setUploadingVideos(prev => ({ ...prev, [video.path]: true }));

    try {
      const file = await Filesystem.readFile({
        path: video.path,
        directory: Directory.Documents,
      });

      const buffer = Uint8Array.from(atob(file.data), c => c.charCodeAt(0));
      const blob = new Blob([buffer], { type: 'video/webm' });

      const { data, error } = await supabase.storage
        .from('videos')
        .upload(`${session.user.id}/${videoScreen.exercise}/${video.fileName}`, blob, {
          contentType: 'video/webm',
        });

      if (error) {
        console.error("Error uploading video:", error);
        toast.error(`Upload failed: ${error.message}`);
        setUploadingVideos(prev => ({ ...prev, [video.path]: false }));
        return;
      }

      console.log("Video uploaded successfully:", data);
      toast.success("Video uploaded successfully!");

      const pendingVideos = JSON.parse(localStorage.getItem("pendingVideos") || "[]");
      const updatedPendingVideos = pendingVideos.filter(v => v.path !== video.path);
      localStorage.setItem("pendingVideos", JSON.stringify(updatedPendingVideos));

      await Filesystem.deleteFile({
        path: video.path,
        directory: Directory.Documents,
      });

      await refreshOnlineVideos();
      await refreshOfflineVideos();
      setOfflineVideos(prev => ({
        ...prev,
        [videoScreen.exercise]: prev[videoScreen.exercise].filter(v => v.path !== video.path),
      }));
      setOfflineVideoURLs(prev => {
        const { [video.path]: _, ...rest } = prev;
        return rest;
      });
    } catch (e) {
      console.error("Error during upload process:", e);
      toast.error(`Upload failed: ${e.message}`);
      setUploadingVideos(prev => ({ ...prev, [video.path]: false }));
    } finally {
      setUploadingVideos(prev => ({ ...prev, [video.path]: false }));
    }
  };

  const loadOfflineVideoURLs = useCallback(async () => {
    if (!videoScreen || videoScreen.type !== "offline") {
      return;
    }

    const pending = JSON.parse(localStorage.getItem("pendingVideos") || "[]");
    const urls = {};
    for (const v of pending.filter(v => v.exerciseKey === videoScreen?.exercise && v.athleteId === session.user.id)) {
      try {
        const file = await Filesystem.readFile({
          path: v.path,
          directory: Directory.Documents,
        });
        const byteCharacters = atob(file.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "video/webm" });
        urls[v.path] = URL.createObjectURL(blob);
      } catch (e) {
        urls[v.path] = null;
      }
    }
    setOfflineVideoURLs(urls);
    console.log("Offline video URLs:", urls);
  }, [videoScreen, session.user.id]);

  useEffect(() => {
    loadOfflineVideoURLs();
  }, [loadOfflineVideoURLs]);

  const loadInitialOfflineVideoURLs = useCallback(async () => {
    const pending = JSON.parse(localStorage.getItem("pendingVideos") || "[]");
    const urls = {};
    for (const v of pending.filter(v => v.exerciseKey === videoScreen?.exercise && v.athleteId === session.user.id)) {
      try {
        const file = await Filesystem.readFile({
          path: v.path,
          directory: Directory.Documents,
        });
        const byteCharacters = atob(file.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "video/webm" });
        urls[v.path] = URL.createObjectURL(blob);
      } catch (e) {
        urls[v.path] = null;
      }
    }
    setOfflineVideoURLs(urls);
    console.log("Initial Offline video URLs:", urls);
  }, [videoScreen, session.user.id]);

  useEffect(() => {
    loadInitialOfflineVideoURLs();
  }, [loadInitialOfflineVideoURLs]);

  const refreshOnlineVideos = async () => {
    const result = {};
    for (const ex of EXERCISES) {
      const { data } = await supabase.storage.from('videos').list(`${session.user.id}/${ex.key}`);
      result[ex.key] = data || [];
    }
    setOnlineVideos(result);
  };

  const refreshOfflineVideos = async () => {
    const pending = JSON.parse(localStorage.getItem("pendingVideos") || "[]");
    const result = {};
    for (const ex of EXERCISES) {
      result[ex.key] = pending.filter(v => v.exerciseKey === ex.key && v.athleteId === session.user.id);
    }
    setOfflineVideos(result);
    console.log("Offline videos:", result);
  };

  const requestStoragePermissions = async () => {
    if (!isPlatform('android')) {
      return true;
    }

    try {
      if (typeof AndroidPermissions !== 'undefined') {
        const hasWritePermission = await AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
        const hasReadPermission = await AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE);

        if (hasWritePermission.has && hasReadPermission.has) {
          return true;
        }

        const result = await AndroidPermissions.requestPermissions([
          AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
          AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
        ]);

        if (result.has[AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE] && result.has[AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE]) {
          return true;
        } else {
          console.warn('Storage permissions denied.');
          return false;
        }
      } else {
        console.warn('AndroidPermissions plugin not available.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting storage permissions:', error);
      return false;
    }
  };

  const analyzePerformance = async (athleteData, videoData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze_performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performance_data: athleteData,
          video_data: videoData,
         }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze performance');
      }

      const data = await response.json();
      setAnalysisResults(data);
    } catch (error) {
      console.error('Error analyzing performance:', error);
      setError('Failed to analyze performance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const athleteData = {
    total_distance: 1000,
    sprint_count: 5,
    average_speed: 7.5,
  };

  const analyzeSelectedVideo = async () => {
    setIsLoading(true);
    setError(null);

    if (!selectedVideoForAnalysis) {
      setError("Please select a video for analysis.");
      setIsLoading(false);
      return;
    }

    try {
      // Get the public URL of the selected video
      const videoUrl = supabase.storage.from('videos').getPublicUrl(`${session.user.id}/${selectedVideoForAnalysis}`).publicURL;

      // For online videos, use the video URL directly
      await analyzePerformance(athleteData, videoUrl);
    } catch (error: any) {
      console.error("Error analyzing video:", error);
      setError(`Failed to analyze video: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError("No video selected.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Video = reader.result?.toString().split(',')[1];
      if (!base64Video) {
        setError("Failed to read video file.");
        return;
      }

      const athleteData = {
        total_distance: 1000,
        sprint_count: 5,
        average_speed: 7.5,
      };

      await analyzePerformance(athleteData, base64Video);
    };
    reader.onerror = () => {
      setError("Error reading video file.");
    };
  };

  const triggerVideoUpload = () => {
    videoInputRef.current?.click();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 flex flex-col">
      <div className="container mx-auto flex-1">
        {/* Header: title left, logout right */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold pt-4 pl-4">Athlete Dashboard</h1>
          <Button variant="destructive" onClick={handleLogout} className="pt-4 pr-4">
            Logout
          </Button>
        </div>
        {activeTab === "home" && isLoading && (
          <Card>
            <CardContent className="p-6">Loading profile...</CardContent>
          </Card>
        )}
        {activeTab === "home" && athleteProfile && (
          <AthleteProfilePage athlete={athleteProfile} onBack={() => {}} showBackButton={false} />
        )}
        {activeTab === "videos" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Exercises</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {EXERCISES.map(ex => (
                <Card key={ex.key} className="flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle>{ex.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">No recordings yet</span>
                      <Button
                        variant="outline"
                        className="ml-2"
                        onClick={() => {
                          setShowCamera(true);
                          setSelectedExercise(ex.key);
                        }}
                      >
                        Record
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="secondary"
                        onClick={() => setVideoScreen({ type: "online", exercise: ex.key })}
                      >
                        Online Videos
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setVideoScreen({ type: "offline", exercise: ex.key });
                          console.log("Video screen set to offline:", { type: "offline", exercise: ex.key });
                        }}
                      >
                        Offline Videos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        {activeTab === "settings" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Settings</h2>
            {/* Add settings content here */}
            <p className="text-gray-500">Settings page coming soon.</p>
          </div>
        )}
         <div className="container mx-auto p-4 pt-10 ">
           <Card>
             <CardHeader>
               <CardTitle>Performance Analysis</CardTitle>
             </CardHeader>
             <CardContent>
               {/* Remove the captureAndAnalyze button */}
               {/* <Button onClick={captureAndAnalyze} disabled={isLoading}>
                 {isLoading ? "Analyzing..." : "Analyze Performance"}
               </Button> */}

               {/* Add a dropdown to select a video for analysis */}
               <select
                 value={selectedVideoForAnalysis || ""}
                 onChange={(e) => setSelectedVideoForAnalysis(e.target.value)}
                 className="w-full p-2 border rounded mb-4"
               >
                 <option value="">Select a video for analysis</option>
                 {Object.entries(onlineVideos).map(([exercise, videos]) =>
                   (videos as any[]).map((video) => (
                     <option key={video.name} value={`${exercise}/${video.name}`}>
                       {exercise} - {video.name}
                     </option>
                   ))
                 )}
               </select>

               {/* Analyze Selected Video Button */}
               <Button onClick={analyzeSelectedVideo} disabled={isLoading || !selectedVideoForAnalysis}>
                 {isLoading ? "Analyzing..." : "Analyze Selected Video"}
               </Button>

               {error && <p className="text-red-500 mt-2">{error}</p>}

               {analysisResults && (
                 <div className="mt-4">
                   {analysisResults.cheat_probability !== null && (
                     <div className="mb-2">
                       <h3 className="text-lg font-semibold">Cheat Detection</h3>
                       <p>
                         Cheat Probability:{" "}
                         <span className={analysisResults.cheat_probability > 0.5 ? "text-red-500" : "text-green-500"}>
                           {analysisResults.cheat_probability.toFixed(2)}
                         </span>
                       </p>
                       {analysisResults.cheat_probability > 0.5 && (
                         <p className="text-sm text-red-500">Warning: High probability of cheating detected.</p>
                       )}
                     </div>
                   )}

                   {analysisResults.pose_estimation && (
                     <div>
                       <h3 className="text-lg font-semibold">Pose Analysis</h3>
                       <p>
                         Pose Estimation Results:{" "}
                         <pre>{JSON.stringify(analysisResults.pose_estimation, null, 2)}</pre>
                       </p>
                     </div>
                   )}
                 </div>
               )}
             </CardContent>
           </Card>
         </div>
      <AthleteBottomNav active={activeTab} onNav={setActiveTab} />
    </div>
      
      {showCamera && (
        <CameraOverlay
          onClose={() => setShowCamera(false)}
          athleteId={session.user.id}
          exerciseKey={selectedExercise}
          onVideoUploaded={refreshOnlineVideos}
          onOfflineVideoAdded={refreshOfflineVideos} // Add this prop
        />
      )}
      <button
        onClick={handleRecordToggle}
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
      {videoScreen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">
              {EXERCISES.find(e => e.key === videoScreen.exercise)?.label} - {videoScreen.type === "online" ? "Online" : "Offline"} Videos
            </h2>
            <Button onClick={() => setVideoScreen(null)}>Back</Button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {videoScreen.type === "online" ? (
              (onlineVideos[videoScreen.exercise] || []).length === 0 ? (
                <p className="text-gray-500">No online videos found.</p>
              ) : (
                (onlineVideos[videoScreen.exercise] || []).map(v => (
                  <video
                    key={v.name}
                    src={supabase.storage.from('videos').getPublicUrl(`${session.user.id}/${videoScreen.exercise}/${v.name}`).publicURL}
                    controls
                    className="mb-4 w-full max-w-md"
                    onError={(e) => console.error("Video loading error:", e)} // Add this line
                  />
                ))
              )
            ) : (
              (offlineVideos[videoScreen.exercise] || []).length === 0 ? (
                <p className="text-gray-500">No offline videos found.</p>
              ) : (
                (offlineVideos[videoScreen.exercise] || []).map(v => (
                  <div key={v.path} className="mb-4">
                    {offlineVideoURLs[v.path] ? (
                      <>
                        <p>Video URL: {offlineVideoURLs[v.path]}</p> {/* Add this line */}
                        <video
                          src={offlineVideoURLs[v.path]}
                          controls
                          className="w-full max-w-md"
                        />
                      </>
                    ) : (
                      <span className="block mb-2 text-red-500">Could not load video: {v.fileName}</span>
                    )}
                    <Button
                      variant="secondary"
                      disabled={uploadingVideos[v.path]}
                      onClick={() => uploadVideo(v)}
                    >
                      {uploadingVideos[v.path] ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}
      <input
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        style={{ display: 'none' }} // Hide the input
        ref={videoInputRef}
      />
    </div>
  );
}

// After saving video file in CameraOverlay.tsx
// const saveVideo = async (videoBlob: Blob) => {
//   const hasPermissions = await requestStoragePermissions();
//   if (!hasPermissions) {
//     toast.error('Storage permissions are required to save videos.');
//     return;
//   }

//   // ... existing code to generate filename and save the video to filesystem ...

//   const pendingVideos = JSON.parse(localStorage.getItem("pendingVideos") || "[]");
//   pendingVideos.push({
//     athleteId: athleteId,
//     exerciseKey: exerciseKey,
//     fileName: filename,
//     path: filePath,
//     uploading: false, // Add this flag
//   });
//   localStorage.setItem("pendingVideos", JSON.stringify(pendingVideos));

//   // Notify the parent component that a video has been uploaded (or saved locally)
//   onVideoUploaded(); // This will refresh the online videos
//   onOfflineVideoAdded(); // This will refresh the offline videos
//   onClose();
// };

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const userId = 'd8357b05-ca21-407f-a415-6c2110e13a9c';

fetch(`${supabaseUrl}/rest/v1/profiles?select=*&id=eq.${userId}`, {
  method: 'GET',
  headers: {
    'apikey': supabaseKey, // Use 'apikey' instead of 'Authorization'
    'Accept': 'application/json',
    'Content-Type': 'application/json', // Add Content-Type if you are sending data
  },
})
  .then(response => {
    if (!response.ok) {
      console.error('Error:', response.status, response.statusText);
      throw new Error(`HTTP error ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Data:', data);
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });

function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {error && <p className="text-red-500">Error loading video: {error}</p>}
      <video
        src={videoUrl}
        controls
        width="640"
        height="360"
        onError={(e) => {
          console.error("Video loading error:", e);
          setError("Failed to load video.");
        }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

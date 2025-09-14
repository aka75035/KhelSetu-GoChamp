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
import Header from "../../components/ui/Header";
import { Network } from '@capacitor/network';
import { uploadPendingVideos } from '../../lib/uploadPendingVideos';
import { Capacitor } from '@capacitor/core';

const EXERCISES = [
  { key: "situps", label: "Situps" },
  { key: "pullups", label: "Pullups" },
  { key: "pushups", label: "Pushups" },
];

export default function AthleteDashboard({ onLogout, session }: { onLogout: () => void; session: any }) {
  // Always use the full 12-digit aadhar number for storage paths
  function getAadharForStorage() {
    // If your athleteProfile.aadhar_card_number is always correct, just return it
    return athleteProfile?.aadhar_card_number || '';
  }
  const [activeTab, setActiveTab] = useState("home");
  const [athleteProfile, setAthleteProfile] = useState<Athlete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [onlineVideos, setOnlineVideos] = useState<Record<string, any[]>>({});
  const [offlineVideos, setOfflineVideos] = useState<Record<string, any[]>>({});
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [videoScreen, setVideoScreen] = useState<{ type: "online" | "offline"; exercise: string } | null>(null);
  const [offlineVideoURLs, setOfflineVideoURLs] = useState<Record<string, string | null>>({});
  const [uploadingVideos, setUploadingVideos] = useState<Record<string, boolean>>({});
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [selectedVideoForAnalysis, setSelectedVideoForAnalysis] = useState<string | null>(null);

  const refreshOnlineVideos = useCallback(async () => {
    if (!athleteProfile) return;
    console.log("Refreshing online videos...");
    const result: Record<string, any[]> = {};
      for (const ex of EXERCISES) {
        try {
          const aadhar = getAadharForStorage();
          const { data, error } = await supabase.storage.from('videos').list(`${aadhar}/${ex.key}`);
          if (error) {
            console.error(`Supabase error for ${ex.key}:`, error.message, error);
          }
          result[ex.key] = data || [];
        } catch (err) {
          console.error(`Exception fetching videos for ${ex.key}:`, err);
          result[ex.key] = [];
        }
      }
    setOnlineVideos(result);
  }, [athleteProfile]);

  const refreshOfflineVideos = useCallback(async () => {
    if (!athleteProfile) return;
    console.log("Refreshing offline videos...");
    const pendingResult = localStorage.getItem("pendingVideos");
    const pending = JSON.parse(pendingResult || "[]");
    const result: Record<string, any[]> = {};
    for (const ex of EXERCISES) {
      result[ex.key] = pending.filter((v: any) => v.exerciseKey === ex.key && v.athleteAadhar === athleteProfile.aadhar_card_number);
    }
    setOfflineVideos(result);
  }, [athleteProfile]);

  useEffect(() => {
    let listener: { remove: () => void; };

    const setupNetworkListener = async () => {
      const handleNetworkStatusChange = async (status: any) => {
        if (
          status.connected &&
          athleteProfile &&
          athleteProfile.aadhar_card_number &&
          typeof athleteProfile.aadhar_card_number === 'string' &&
          athleteProfile.aadhar_card_number.trim() !== ''
        ) {
          toast.success("You're back online! Syncing videos...");
          const uploadsDone = await uploadPendingVideos(athleteProfile.aadhar_card_number);
          if (uploadsDone) {
            await refreshOnlineVideos();
            await refreshOfflineVideos();
          }
        }
      };

      listener = await Network.addListener('networkStatusChange', handleNetworkStatusChange);
    };

    setupNetworkListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [athleteProfile, refreshOnlineVideos, refreshOfflineVideos]);

  useEffect(() => {
    // This effect runs once when athleteProfile is first populated.
    const checkInitialStatus = async () => {
      if (
        !athleteProfile ||
        !athleteProfile.aadhar_card_number ||
        typeof athleteProfile.aadhar_card_number !== 'string' ||
        athleteProfile.aadhar_card_number.trim() === ''
      ) {
        return;
      }
      try {
        const status = await Network.getStatus();
        if (status.connected) {
          console.log("Initial network check: Online. Checking for pending videos.");
          const uploadsDone = await uploadPendingVideos(athleteProfile.aadhar_card_number);
          if (uploadsDone) {
            await refreshOnlineVideos();
            await refreshOfflineVideos();
          }
        }
      } catch (e) {
        console.error("Could not get network status", e);
      }
    };
    checkInitialStatus();
  }, [athleteProfile]); // Note the dependency array change

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) {
        setError("User not logged in.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      // 1. Try to load from cache first
      let isProfileLoadedFromCache = false;
      try {
        const cachedProfile = localStorage.getItem(`athleteProfile-${session.user.id}`);
        if (cachedProfile) {
          console.log("Loading profile from cache.");
          setAthleteProfile(JSON.parse(cachedProfile));
          isProfileLoadedFromCache = true;
        }
      } catch (e) {
        console.error("Could not load cached profile", e);
      }

      // 2. Check network status
      let isOnline = false;
      try {
        const networkStatus = await Network.getStatus();
        isOnline = networkStatus.connected;
      } catch (e) {
        console.warn("Could not get network status, assuming offline.", e);
      }

      if (!isOnline) {
        console.log("Offline mode: Skipping server fetch for profile.");
        if (!isProfileLoadedFromCache) {
          setError("You are offline and no local data is available.");
        }
        setIsLoading(false);
        return;
      }

      // 3. If online, try to fetch from network to get latest data
      try {
        console.log("Online mode: Attempting to fetch fresh profile from server.");
        const { data, error, status } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          console.log("Fetched fresh profile from server.");
          const profileData = {
            id: data.id,
            aadhar_card_number: data.aadhar_card_number,
            name: data.full_name || 'No Name',
            age: data.age || 0,
            sport: data.sport || 'N/A',
            rank: data.rank || 'Trainee',
            imageUrl: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name || 'A')}`,
            videoUrls: data.video_urls || [],
          };
          setAthleteProfile(profileData);
          // 4. Update the cache
          localStorage.setItem(`athleteProfile-${session.user.id}`, JSON.stringify(profileData));
        }
      } catch (error: any) {
        console.error("Error fetching athlete profile:", error);
        if (!isProfileLoadedFromCache) {
          setError(`Failed to fetch profile: ${error.message}`);
          setAthleteProfile(null);
        } else {
          console.warn("Could not refresh profile, showing cached data.", error.message);
          toast("Couldn't refresh profile. Displaying offline data.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

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
      toast.error('MediaDevices API is not supported in your browser.');
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

      timerRef.current = setInterval(() => {
      }, 1000);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check your browser permissions.');
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
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
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
    URL.createObjectURL(blob);
    recordedChunksRef.current = [];
  };

  useEffect(() => {
    const fetchAllOnline = async () => {
      if (!athleteProfile) return;

      try {
        const networkStatus = await Network.getStatus();
        if (!networkStatus.connected) {
          console.log("Offline mode: Skipping fetch for online videos.");
          setOnlineVideos({}); // Clear online videos when offline
          return;
        }
      } catch (e) {
        console.warn("Could not get network status, assuming offline for video list.", e);
        setOnlineVideos({});
        return;
      }
      
      console.log("Online mode: Fetching video lists.");
      const result: Record<string, any[]> = {};
      for (const ex of EXERCISES) {
        try {
            const { data, error } = await supabase.storage.from('videos').list(`${athleteProfile.aadhar_card_number}/${ex.key}`);
            if (error) throw error;
            console.log(`Online videos for ${ex.key}:`, data);
            result[ex.key] = data || [];
        } catch (error) {
            console.error(`Failed to fetch online videos for ${ex.key}:`, error);
            result[ex.key] = []; // Set to empty on failure for this exercise
        }
      }
      setOnlineVideos(result);
    }
    fetchAllOnline();
  }, [athleteProfile]);

  const uploadVideo = async (video: any) => {
    if (!athleteProfile) {
      toast.error('Profile not loaded yet. Cannot upload video.');
      return;
    }
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

      const buffer = Uint8Array.from(atob(file.data as string), c => c.charCodeAt(0));
      const blob = new Blob([buffer], { type: 'video/webm' });

      if (!videoScreen) {
        toast.error("No exercise selected for upload.");
        setUploadingVideos(prev => ({ ...prev, [video.path]: false }));
        return;
      }

        const aadhar = getAadharForStorage();
        const { data, error } = await supabase.storage
          .from('videos')
          .upload(`${aadhar}/${videoScreen.exercise}/${video.fileName}`, blob, {
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
      const updatedPendingVideos = pendingVideos.filter((v: any) => v.path !== video.path);
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
    } catch (e: any) {
      console.error("Error during upload process:", e);
      toast.error(`Upload failed: ${e.message}`);
      setUploadingVideos(prev => ({ ...prev, [video.path]: false }));
    } finally {
      setUploadingVideos(prev => ({ ...prev, [video.path]: false }));
    }
  };

  const loadOfflineVideoURLs = useCallback(async () => {
    if (!videoScreen || videoScreen.type !== "offline" || !athleteProfile) {
      return;
    }

    const pending = JSON.parse(localStorage.getItem("pendingVideos") || "[]");
    const urls: Record<string, string | null> = {};
    for (const v of pending.filter((v: any) => v.exerciseKey === videoScreen?.exercise && v.athleteId === athleteProfile.aadhar_card_number)) {
      try {
        const file = await Filesystem.readFile({
          path: v.path,
          directory: Directory.Documents,
        });
        const byteCharacters = atob(file.data as string);
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
  }, [videoScreen, athleteProfile]);

  useEffect(() => {
    loadOfflineVideoURLs();
  }, [loadOfflineVideoURLs]);

  const loadInitialOfflineVideoURLs = useCallback(async () => {
    if (!athleteProfile) return;
    const pending = JSON.parse(localStorage.getItem("pendingVideos") || "[]");
    const urls: Record<string, string | null> = {};
  const aadhar = getAadharForStorage();
  for (const v of pending.filter((v: any) => v.exerciseKey === videoScreen?.exercise && v.athleteId === aadhar)) {
      try {
        const file = await Filesystem.readFile({
          path: v.path,
          directory: Directory.Documents,
        });
        const byteCharacters = atob(file.data as string);
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
  }, [videoScreen, athleteProfile]);

  useEffect(() => {
    loadInitialOfflineVideoURLs();
  }, [loadInitialOfflineVideoURLs]);

  const requestStoragePermissions = async () => {
    if (Capacitor.isNativePlatform() && isPlatform('android')) {
      try {
        const hasWritePermission = await AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
        const hasReadPermission = await AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE);

        if (hasWritePermission.hasPermission && hasReadPermission.hasPermission) {
          return true;
        }

        const result = await AndroidPermissions.requestPermissions([
          AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
          AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
        ]);

        if (result.hasPermission) {
          return true;
        } else {
          toast.error('Storage permissions were denied.');
          console.warn('Storage permissions denied.');
          return false;
        }
      } catch (error) {
        console.error('Error requesting storage permissions:', error);
        toast.error('An error occurred while requesting permissions.');
        return false;
      }
    }
    // For non-Android platforms (like web), we assume permissions are handled by the browser.
    return true;
  };

  const analyzePerformance = async (athleteData: any, videoData: any) => {
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
      if (!athleteProfile) {
        setError("Profile not loaded.");
        setIsLoading(false);
        return;
      }
  const aadhar = getAadharForStorage();
  const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(`${aadhar}/${selectedVideoForAnalysis}`);

      // For online videos, use the video URL directly
      await analyzePerformance(athleteData, publicUrl);
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
    <div className="bg-gray-50 min-h-screen">
      <Header onLogout={handleLogout} title="Athlete Dashboard" />
      <main style={{paddingTop: '75px'}} className="pb-20">
        <div className="container mx-auto px-4 py-6">
          {activeTab === "home" && (
            <>
              {isLoading && (
                <Card>
                  <CardContent className="p-6">Loading profile...</CardContent>
                </Card>
              )}
              {athleteProfile && (
                <AthleteProfilePage athlete={athleteProfile} onBack={() => {}} showBackButton={false} />
              )}
            </>
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
        </div>
      </main>
      <AthleteBottomNav active={activeTab} onNav={setActiveTab} />
      
      {showCamera && athleteProfile && selectedExercise && (
        <CameraOverlay
          onClose={() => setShowCamera(false)}
          athleteId={getAadharForStorage()}
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
                (onlineVideos[videoScreen.exercise] || []).map(v => {
                  const publicUrl = athleteProfile
                    ? supabase.storage.from('videos').getPublicUrl(`${getAadharForStorage()}/${videoScreen.exercise}/${v.name}`).data.publicUrl
                    : '';
                  console.log('Online video public URL:', publicUrl, 'for', v.name);
                  return (
                    <div key={v.name} className="relative mb-8">
                      <button
                        className="absolute top-0 right-0 m-2 p-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700 z-10"
                        title="Delete video"
                        onClick={async () => {
                          if (!athleteProfile) return;
                          const aadhar = getAadharForStorage();
                          const filePath = `${aadhar}/${videoScreen.exercise}/${v.name}`;
                          const { error } = await supabase.storage.from('videos').remove([filePath]);
                          if (error) {
                            toast.error('Failed to delete video: ' + error.message);
                          } else {
                            toast.success('Video deleted successfully');
                            await refreshOnlineVideos();
                          }
                        }}
                        aria-label="Delete video"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <video
                        src={publicUrl}
                        controls
                        className="mb-4 w-full max-w-md"
                        onError={(e) => console.error("Video loading error:", e)}
                      />
                    </div>
                  );
                })
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
                          src={offlineVideoURLs[v.path] || ''}
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

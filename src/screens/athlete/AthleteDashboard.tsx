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
import { analyzeVideo } from '../../lib/analyzeVideo';

const EXERCISES = [
  { key: "situps", label: "Situps" },
  { key: "pullups", label: "Pullups" },
  { key: "pushups", label: "Pushups" },
];

function OfflineVideoPlayer({ path }: { path: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    let revokedUrl: string | null = null;
    const load = async () => {
      try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const file = await Filesystem.readFile({ path, directory: Directory.Documents });
        const res = await fetch(file.data);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        revokedUrl = url;
        if (videoRef.current) {
          videoRef.current.src = url;
        }
      } catch (e) {
        console.warn('Could not load offline video', path, e);
      }
    };
    load();
    return () => { if (revokedUrl) URL.revokeObjectURL(revokedUrl); };
  }, [path]);
  return <video ref={videoRef} controls className="w-full rounded border" />;
}

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
  const [videoScreen, setVideoScreen] = useState<{ type: "online" | "offline"; exercise: string } | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideoForAnalysis, setSelectedVideoForAnalysis] = useState<string | null>(null);
  const [videoLibraryOpen, setVideoLibraryOpen] = useState(false);

  const refreshOnlineVideos = useCallback(async () => {
    if (!athleteProfile) return;
    console.log("Refreshing online videos...");
    const result: Record<string, any[]> = {};
      for (const ex of EXERCISES) {
        try {
          const aadhar = getAadharForStorage();
          const prefix = `${aadhar}/${ex.key}`;
          const { data, error } = await supabase.storage.from('videos').list(prefix);
          if (error) {
            console.error(`Supabase error for ${ex.key}:`, error.message, error);
          }
          const files = (data || []).map((f: any) => {
            const filePath = `${prefix}/${f.name}`;
            const { data: pub } = supabase.storage.from('videos').getPublicUrl(filePath);
            return { ...f, path: filePath, publicUrl: pub.publicUrl };
          });
          result[ex.key] = files;
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
      console.log("Fetching profile for session:", session);
      
      if (!session?.user?.id) {
        console.error("No session or user ID found");
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
        console.log("Network status:", isOnline);
      } catch (e) {
        console.warn("Could not get network status, assuming offline.", e);
      }

      if (!isOnline) {
        console.log("Offline mode: Skipping server fetch for profile.");
        if (!isProfileLoadedFromCache) {
          // Create a basic profile from session metadata as fallback
          console.log("Creating fallback profile from session metadata");
          const fallbackProfile = {
            id: session.user.id,
            aadhar_card_number: session.user.user_metadata?.aadhaar_number || session.user.user_metadata?.aadhar_card_number || "000000000000",
            name: session.user.user_metadata?.full_name || session.user.email || 'Athlete',
            age: 25,
            sport: 'General Fitness',
            rank: 'Trainee',
            imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.user_metadata?.full_name || session.user.email || 'A')}`,
            videoUrls: [],
          };
          setAthleteProfile(fallbackProfile);
          localStorage.setItem(`athleteProfile-${session.user.id}`, JSON.stringify(fallbackProfile));
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

        console.log("Supabase response:", { data, error, status });

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
        } else {
          // No data found in database, create fallback profile
          console.log("No profile found in database, creating fallback profile");
          const fallbackProfile = {
            id: session.user.id,
            aadhar_card_number: session.user.user_metadata?.aadhaar_number || session.user.user_metadata?.aadhar_card_number || "000000000000",
            name: session.user.user_metadata?.full_name || session.user.email || 'Athlete',
            age: 25,
            sport: 'General Fitness',
            rank: 'Trainee',
            imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.user_metadata?.full_name || session.user.email || 'A')}`,
            videoUrls: [],
          };
          setAthleteProfile(fallbackProfile);
          localStorage.setItem(`athleteProfile-${session.user.id}`, JSON.stringify(fallbackProfile));
        }
      } catch (error: any) {
        console.error("Error fetching athlete profile:", error);
        if (!isProfileLoadedFromCache) {
          // Create fallback profile even on error
          console.log("Creating fallback profile due to error");
          const fallbackProfile = {
            id: session.user.id,
            aadhar_card_number: session.user.user_metadata?.aadhaar_number || session.user.user_metadata?.aadhar_card_number || "000000000000",
            name: session.user.user_metadata?.full_name || session.user.email || 'Athlete',
            age: 25,
            sport: 'General Fitness',
            rank: 'Trainee',
            imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.user_metadata?.full_name || session.user.email || 'A')}`,
            videoUrls: [],
          };
          setAthleteProfile(fallbackProfile);
          localStorage.setItem(`athleteProfile-${session.user.id}`, JSON.stringify(fallbackProfile));
          setError(`Profile loaded with limited data: ${error.message}`);
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

  // const handleRecordToggle = async () => { // This function is removed
  //   if (isRecording) {
  //     setIsRecording(false);
  //     stopRecording();
  //   } else {
  //     setIsRecording(true);
  //     startRecording();
  //   }
  // };

  // const startRecording = async () => {
  //   setError(null);
  //   setShowCameraPreview(true);
  //   const hasPermissions = await requestStoragePermissions();
  //   if (!hasPermissions) {
  //     setError('Storage permissions are required to record videos.');
  //     setShowCameraPreview(false);
  //     return;
  //   }
  //   if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  //     setError('MediaDevices API is not supported in your browser.');
  //     setShowCameraPreview(false);
  //     return;
  //   }
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: { facingMode: 'user' },
  //       audio: true,
  //     });
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = stream;
  //       videoRef.current.muted = true;
  //       await videoRef.current.play();
  //     }
  //     mediaRecorderRef.current = new MediaRecorder(stream);
  //     mediaRecorderRef.current.ondataavailable = handleDataAvailable;
  //     mediaRecorderRef.current.onstop = handleStop;
  //     mediaRecorderRef.current.start();
  //     timerRef.current = setInterval(() => {}, 1000);
  //   } catch (error) {
  //     setError('Failed to access camera. Please check your browser permissions and ensure no other app is using the camera.');
  //     setShowCameraPreview(false);
  //     return;
  //   }
  // };

  // const stopRecording = () => {
  //   if (mediaRecorderRef.current) {
  //     mediaRecorderRef.current.stop();
  //   }
  //   if (videoRef.current && videoRef.current.srcObject) {
  //     const stream = videoRef.current.srcObject as MediaStream;
  //     stream.getTracks().forEach(track => track.stop());
  //     videoRef.current.srcObject = null;
  //   }
  //   if (timerRef.current) {
  //     clearInterval(timerRef.current);
  //   }
  //   setShowCameraPreview(false);
  // };

  // const handleDataAvailable = (event: BlobEvent) => {
  //   if (event.data.size > 0) {
  //     recordedChunksRef.current.push(event.data);
  //   }
  // };

  // const handleStop = async () => {
  //   const blob = new Blob(recordedChunksRef.current, {
  //     type: 'video/webm',
  //   });
  //   recordedChunksRef.current = [];
  //   if (!athleteProfile || !selectedExercise) {
  //     setUploadMessage('Missing athlete or exercise info.');
  //     return;
  //   }
  //   setUploading(true);
  //   setUploadMessage(null);
  //   try {
  //     const aadhar = getAadharForStorage();
  //     const fileName = `${aadhar}-${selectedExercise}-${Date.now()}.webm`;
  //     const filePath = `${aadhar}/${selectedExercise}/${fileName}`;
  //     const { error: uploadError } = await supabase.storage
  //       .from('videos')
  //       .upload(filePath, blob);
  //     if (uploadError) throw uploadError;
  //     setUploadMessage('Video uploaded successfully!');
  //     await refreshOnlineVideos();
  //   } catch (err: any) {
  //     setUploadMessage('Error uploading video: ' + (err.message || err.toString()));
  //   } finally {
  //     setUploading(false);
  //   }
  // };

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

  // const uploadVideo = async (video: any) => { // This function is removed
  //   if (!athleteProfile) {
  //     toast.error('Profile not loaded yet. Cannot upload video.');
  //     return;
  //   }
  //   const hasPermissions = await requestStoragePermissions();
  //   if (!hasPermissions) {
  //     toast.error('Storage permissions are required to upload videos.');
  //     return;
  //   }

  //   setUploadingVideos(prev => ({ ...prev, [video.path]: true }));

  //   try {
  //     const file = await Filesystem.readFile({
  //       path: video.path,
  //       directory: Directory.Documents,
  //     });

  //     const buffer = Uint8Array.from(atob(file.data as string), c => c.charCodeAt(0));
  //     const blob = new Blob([buffer], { type: 'video/webm' });

  //     if (!videoScreen) {
  //       toast.error("No exercise selected for upload.");
  //       setUploadingVideos(prev => ({ ...prev, [video.path]: false }));
  //       return;
  //     }

  //       const aadhar = getAadharForStorage();
  //       const { data, error } = await supabase.storage
  //         .from('videos')
  //         .upload(`${aadhar}/${videoScreen.exercise}/${video.fileName}`, blob, {
  //           contentType: 'video/webm',
  //         });

  //     if (error) {
  //       console.error("Error uploading video:", error);
  //       toast.error(`Upload failed: ${error.message}`);
  //       setUploadingVideos(prev => ({ ...prev, [video.path]: false }));
  //       return;
  //     }

  //     console.log("Video uploaded successfully:", data);
  //     toast.success("Video uploaded successfully!");

  //     const pendingVideos = JSON.parse(localStorage.getItem("pendingVideos") || "[]");
  //     const updatedPendingVideos = pendingVideos.filter((v: any) => v.path !== video.path);
  //     localStorage.setItem("pendingVideos", JSON.stringify(updatedPendingVideos));

  //     await Filesystem.deleteFile({
  //       path: video.path,
  //       directory: Directory.Documents,
  //     });

  //     await refreshOnlineVideos();
  //     await refreshOfflineVideos();
  //     setOfflineVideos(prev => ({
  //       ...prev,
  //       [videoScreen.exercise]: prev[videoScreen.exercise].filter(v => v.path !== video.path),
  //     }));
  //     setOfflineVideoURLs(prev => {
  //       const { [video.path]: _, ...rest } = prev;
  //       return rest;
  //     });
  //   } catch (e: any) {
  //     console.error("Error during upload process:", e);
  //     toast.error(`Upload failed: ${e.message}`);
  //     setUploadingVideos(prev => ({ ...prev, [video.path]: false }));
  //   } finally {
  //     setUploadingVideos(prev => ({ ...prev, [video.path]: false }));
  //   }
  // };

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
    // setOfflineVideoURLs(urls); // This state variable is removed
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
    // setOfflineVideoURLs(urls); // This state variable is removed
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
      if (!athleteProfile) {
        setError("Profile not loaded.");
        setIsLoading(false);
        return;
      }
      const aadhar = getAadharForStorage();
      const [exercise, fileName] = selectedVideoForAnalysis.split('/') as [string, string];
      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(`${aadhar}/${exercise}/${fileName}`);

      const result = await analyzeVideo(publicUrl, exercise as any);
      setAnalysisResults({
        exercise,
        total_reps: result.totalReps,
        posture_score: result.postureScore,
        avg_confidence: result.avgConfidence,
        duration_sec: result.durationSec,
        notes: result.notes || []
      });
    } catch (error: any) {
      console.error("Error analyzing video:", error);
      setError(`Failed to analyze video: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { // This function is removed
  //   const file = event.target.files?.[0];
  //   if (!file) {
  //     setError("No video selected.");
  //     return;
  //   }

  //   const reader = new FileReader();
  //   reader.readAsDataURL(file);
  //   reader.onload = async () => {
  //     const base64Video = reader.result?.toString().split(',')[1];
  //     if (!base64Video) {
  //       setError("Failed to read video file.");
  //       return;
  //     }

  //     const athleteData = {
  //       total_distance: 1000,
  //       sprint_count: 5,
  //       average_speed: 7.5,
  //     };

  //     await analyzePerformance(athleteData, base64Video);
  //   };
  //   reader.onerror = () => {
  //     setError("Error reading video file.");
  //   };
  // };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const handleSubmitToAdmin = async (exerciseKey: string, file: any) => {
    try {
      if (!athleteProfile) {
        toast.error('Profile not loaded.');
        return;
      }
      const aadhar = getAadharForStorage();
      const filePath = file.path || `${aadhar}/${exerciseKey}/${file.name}`;
      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath);

      toast('Analyzing video before submission...');
      const analysis = await analyzeVideo(publicUrl, exerciseKey as any);

      const payload = {
        athlete_id: athleteProfile.id,
        athlete_aadhar: aadhar,
        athlete_name: athleteProfile.name,
        athlete_age: athleteProfile.age,
        athlete_sport: athleteProfile.sport,
        exercise: exerciseKey,
        video_path: filePath,
        video_url: publicUrl,
        analysis_total_reps: analysis.totalReps,
        analysis_posture_score: analysis.postureScore,
        analysis_avg_confidence: analysis.avgConfidence,
        analysis_duration_sec: analysis.durationSec,
        analysis_notes: analysis.notes || [],
        created_at: new Date().toISOString(),
      } as any;

      const { error } = await supabase.from('admin_submissions').insert(payload);
      if (error) throw error;
      toast.success('Submitted to admin with analysis.');
    } catch (e: any) {
      console.error('Submit to admin failed:', e);
      toast.error(`Failed to submit: ${e.message || e.toString()}`);
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Exercises</h2>
                <Button onClick={async () => { await refreshOnlineVideos(); await refreshOfflineVideos(); setVideoLibraryOpen(true); }}>Open Library</Button>
              </div>
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
                            if (!athleteProfile) {
                              setError('Profile not loaded. Please try again.');
                              return;
                            }
                            if (!ex.key) {
                              setError('Exercise not selected. Please try again.');
                              return;
                            }
                            setError(null);
                            setShowCamera(true);
                            setSelectedExercise(ex.key);
                            console.log('Opening camera overlay for', ex.key);
                          }}
                        >
                          Record
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button onClick={() => { setVideoScreen({ type: "online", exercise: ex.key }); refreshOnlineVideos(); }}>
                          Online Videos
                        </Button>
                        <Button onClick={() => { setVideoScreen({ type: "offline", exercise: ex.key }); refreshOfflineVideos(); }}>
                          Offline Videos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* inline videos section removed; using modal overlay below */}
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
                   onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedVideoForAnalysis(e.target.value)}
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
                     <h3 className="text-lg font-semibold">Analysis Summary</h3>
                     <div className="text-sm text-gray-800 space-y-1">
                       <div>Exercise: {(analysisResults.exercise || '').toString()}</div>
                       <div>Total Reps: {analysisResults.total_reps}</div>
                       <div>Posture Score: {analysisResults.posture_score}/100</div>
                       <div>Confidence: {(analysisResults.avg_confidence * 100).toFixed(1)}%</div>
                       <div>Duration: {analysisResults.duration_sec}s</div>
                     </div>
                     {Array.isArray(analysisResults.notes) && analysisResults.notes.length > 0 && (
                       <div className="mt-2">
                         <h4 className="font-semibold">Feedback</h4>
                         <ul className="list-disc pl-5 text-sm">
                           {analysisResults.notes.map((n: string, i: number) => (<li key={i}>{n}</li>))}
                         </ul>
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
          onOfflineVideoAdded={async () => { await refreshOfflineVideos(); if (videoScreen?.type === "offline") { setVideoScreen({ ...videoScreen }); } }}
        />
      )}

      {videoScreen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">
                {EXERCISES.find(e => e.key === videoScreen.exercise)?.label} - {videoScreen.type === "online" ? "Online" : "Offline"} Videos
              </h2>
              <Button onClick={() => setVideoScreen(null)}>Close</Button>
            </div>
            <div className="p-4 space-y-3">
              {videoScreen.type === "online" ? (
                (onlineVideos[videoScreen.exercise] || []).length === 0 ? (
                  <p className="text-gray-500">No online videos found.</p>
                ) : (
                  (onlineVideos[videoScreen.exercise] || []).map((v: any) => (
                    <div key={v.name} className="p-2 border rounded">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm break-all">{v.name}</span>
                        <a
                          href={v.publicUrl || v.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline text-sm"
                        >
                          Open
                        </a>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" onClick={() => handleSubmitToAdmin(videoScreen.exercise, v)}>Submit to Admin</Button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                (offlineVideos[videoScreen.exercise] || []).length === 0 ? (
                  <p className="text-gray-500">No offline videos saved.</p>
                ) : (
                  (offlineVideos[videoScreen.exercise] || []).map((v: any, idx: number) => (
                    <div key={`${v.fileName}-${idx}`} className="p-2 border rounded">
                      <div className="text-sm font-medium break-all">{v.fileName}</div>
                      <div className="text-xs text-gray-500 break-all">{v.path}</div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}
      {videoLibraryOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Video Library</h2>
            <Button onClick={() => setVideoLibraryOpen(false)}>Close</Button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-6">
            {EXERCISES.map(ex => (
              <Card key={`lib-${ex.key}`}>
                <CardHeader>
                  <CardTitle>{ex.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 font-semibold">Online</div>
                  {(onlineVideos[ex.key] || []).length === 0 ? (
                    <p className="text-gray-500 mb-4">No online videos.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {(onlineVideos[ex.key] || []).map((v: any) => (
                        <video key={v.name} controls className="w-full rounded border">
                          <source src={v.publicUrl || v.url} type="video/webm" />
                        </video>
                      ))}
                    </div>
                  )}

                  <div className="mb-3 font-semibold">Offline</div>
                  {(offlineVideos[ex.key] || []).length === 0 ? (
                    <p className="text-gray-500">No offline videos.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {(offlineVideos[ex.key] || []).map((v: any, idx: number) => (
                        <OfflineVideoPlayer key={`${v.fileName}-${idx}`} path={v.path} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

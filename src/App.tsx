import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { Session as SupabaseSession } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Progress } from "./components/ui/progress";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Trophy, 
  Zap, 
  Target, 
  Activity,
  Smartphone,
  Users,
  Play,
  BarChart3,
  CheckCircle,
  Database,
  Cloud,
  ArrowLeft,
  PlusCircle,
  Home,
  Video,
  Settings,
  Camera
} from 'lucide-react';
import AdminDashboard from './screens/admin/AdminDashboard';
import AthleteDashboard from './screens/athlete/AthleteDashboard';
import { uploadPendingVideos } from "./lib/uploadPendingVideos";
import { Toaster } from 'react-hot-toast';
import { HumanDetectionDemo } from './components/HumanDetectionDemo';
import logo from '/logo.png';

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      }); 
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white space-y-8 max-w-md mx-auto px-6">
        <div className="space-y-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
            <Trophy className="h-12 w-12 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">AthleteFlow</h1>
            <p className="text-blue-100">AI-Powered Performance Testing</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-white/80">Loading your performance platform...</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Loading...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Activity className="h-6 w-6 text-blue-200 mx-auto" />
            </div>
            <p className="text-xs text-blue-100">AI Analysis</p>
          </div>
          
          <div className="space-y-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Cloud className="h-6 w-6 text-purple-200 mx-auto" />
            </div>
            <p className="text-xs text-blue-100">Cloud Sync</p>
          </div>
          
          <div className="space-y-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Target className="h-6 w-6 text-green-200 mx-auto" />
            </div>
            <p className="text-xs text-blue-100">Performance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestingPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Performance Test</CardTitle>
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            The AI Motion Analysis and testing functionality would be implemented here.
          </p>
          {/* TODO: Add camera feed and analysis components */}
        </CardContent>
      </Card>
    </div>
  );
}

function RoleSelectionPage({ onSelectRole }: { onSelectRole: (role: 'admin' | 'athlete' | 'demo') => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to AthleteFlow</CardTitle>
          <p className="text-muted-foreground text-center pt-2">Please select your role to continue.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full h-20 text-lg" onClick={() => onSelectRole('athlete')}>
            <Trophy className="h-6 w-6 mr-4" />
            I am an Athlete
          </Button>
          <Button variant="outline" className="w-full h-20 text-lg" onClick={() => onSelectRole('admin')}>
            <Users className="h-6 w-6 mr-4" />
            I am an Admin
          </Button>
          <Button variant="secondary" className="w-full h-20 text-lg" onClick={() => onSelectRole('demo')}>
            <Camera className="h-6 w-6 mr-4" />
            Try Human Detection Demo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function EmailPasswordAuthPage({ onBack, role }: { onBack: () => void; role: 'admin' | 'athlete' }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // The onAuthStateChange listener in App.tsx will handle the redirect
      } else {
        // Sign Up
        const signUpData: { [key: string]: any } = {
          full_name: fullName,
          role: role, // Add role to metadata
        };
        if (role === 'athlete') {
          signUpData.mobile_number = mobileNumber;
          signUpData.aadhaar_number = aadhaarNumber;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: signUpData }
        });
        if (error) throw error;
        setMessage('Success! Please check your email for a confirmation link.');
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(prev => !prev);
    setMessage('');
  };

  const pageTitle = role === 'admin' ? 'Admin' : 'Athlete';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{isLogin ? `${pageTitle} Login` : `Create ${pageTitle} Account`}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" placeholder="John Doe" required value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                {role === 'athlete' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input id="mobile" type="tel" placeholder="+919876543210" required value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aadhaar">Aadhaar Card Number</Label>
                      <Input id="aadhaar" type="text" placeholder="1234 5678 9012" required value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value)} />
                    </div>
                  </>
                )}
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder={role === 'admin' ? "coach@example.com" : "athlete@example.com"} required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-2 my-auto text-sm text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {message && <p className="text-sm text-muted-foreground text-center">{message}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Button variant="link" onClick={toggleAuthMode} className="pl-1">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sample data for athletes - in a real app, this would come from your database
const sampleAthletes = [
  { id: "1", name: 'Alex Morgan', age: 34, sport: 'Soccer', rank: 'Pro', imageUrl: 'https://ui-avatars.com/api/?name=Alex+Morgan&background=FFC0CB&color=000000' },
  { id: "2", name: 'Jordan Smith', age: 22, sport: 'Basketball', rank: 'College', imageUrl: 'https://ui-avatars.com/api/?name=Jordan+Smith&background=ADD8E6&color=000000' },
  { id: "3", name: 'Maria Garcia', age: 17, sport: 'Tennis', rank: 'High School', imageUrl: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=90EE90&color=000000' },
  { id: "4", name: 'Ken Miles', age: 28, sport: 'Track & Field', rank: 'Amateur', imageUrl: 'https://ui-avatars.com/api/?name=Ken+Miles&background=FFFF00&color=000000' },
];

// Sample performance data for the chart
const samplePerformanceData = [
  { name: 'Jan', score: 400 },
  { name: 'Feb', score: 300 },
  { name: 'Mar', score: 500 },
  { name: 'Apr', score: 450 },
  { name: 'May', score: 600 },
  { name: 'Jun', score: 700 },
];

export type Athlete = {
  id: string; // This is the UUID from auth.users
  aadhar_card_number: string; // This is the new primary key
  name: string;
  age: number;
  sport: string;
  rank: string;
  imageUrl: string;
  videoUrls?: any[];
};

export type Session = {
  user: {
    id: string;
    email: string;
    password: string;
    user_metadata: {
      full_name: string;
      role: 'admin' | 'athlete';
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
};


export function AthleteProfilePage({ athlete, onBack, showBackButton = true, onSave }: { athlete: Athlete; onBack: () => void; showBackButton?: boolean; onSave?: (updatedAthlete: Athlete) => void; }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(athlete);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: id === 'age' ? parseInt(value) || 0 : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Create a URL for the selected file to show a preview
      setProfileData(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
      // TODO: In a real app, you would upload this 'file' to Supabase Storage
    }
  };

  const handleSave = () => {
    // If an onSave function is provided (from the Admin Dashboard), call it.
    if (onSave) {
      onSave(profileData);
    }
    // TODO: In a real app, you would also send 'profileData' to your Supabase database here.
    console.log('Saving data:', profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData(athlete); // Revert changes
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto">
      {showBackButton && (
        <Button variant="outline" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Details & Graph */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="items-center text-center">
              <div className="relative">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={profileData.imageUrl} alt={profileData.name} />
                  <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute bottom-4 right-0 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              {isEditing ? (
                <Input id="name" value={profileData.name} onChange={handleInputChange} className="text-2xl font-bold text-center" />
              ) : (
                <CardTitle className="text-2xl">{profileData.name}</CardTitle>
              )}
              {isEditing ? (
                <Input id="sport" value={profileData.sport} onChange={handleInputChange} className="text-center" />
              ) : (
                <p className="text-muted-foreground">{profileData.sport}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Age</span>
                {isEditing ? (
                  <Input id="age" type="number" value={profileData.age} onChange={handleInputChange} className="w-20" />
                ) : (
                  <span>{profileData.age}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Rank</span>
                <Badge variant="secondary">{profileData.rank}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
              </div>
              {isEditing ? (
                <div className="flex flex-col gap-2 pt-4">
                  <Button onClick={handleSave} className="w-full">Save</Button>
                  <Button variant="outline" onClick={handleCancel} className="w-full">Cancel</Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full mt-4">Edit Profile</Button>
              )}
            </CardContent>
          </Card>

          {/* Performance Chart Card */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={samplePerformanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" name="Performance Score" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Video Player */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Latest Analysis Video</CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col">
              <div className="bg-black rounded-lg overflow-hidden flex-grow">
                {/* In a real app, the src would come from the athlete's data */}
                <video 
                  className="w-full h-full object-cover"
                  controls 
                  src="././Assets\Exercise_Video_for_Good_Posture.mp4"
                  muted
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

type AppSession = {
  user: {
    id: string;
    email: string;
    password: string;
    user_metadata: {
      full_name: string;
      role: 'admin' | 'athlete';
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
};
function AthleteDashboardPage({ onLogout, session }: { onLogout: () => void; session: AppSession }) {
  const [activeTab, setActiveTab] = useState('home');
  const [videoStep, setVideoStep] = useState('selection'); // 'selection' or 'recording'
  const [selectedExercise, setSelectedExercise] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { startCamera, stopCamera, error: cameraError, isRecording, startRecording, stopRecording } = useCamera(videoRef as React.RefObject<HTMLVideoElement>);

  const fetchVideos = async () => {
    setIsLoadingVideos(true);
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
    } else {
      setVideos(data);
    }
    setIsLoadingVideos(false);
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      setRecordingTime(0);
      timer = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      clearInterval(timer);
      if (!isRecording) {
        setRecordingTime(0);
      }
    };
  }, [isRecording]);

  // Reset video step when navigating away from the video tab
  useEffect(() => {
    if (activeTab !== 'video') {
      setVideoStep('selection');
      setSelectedExercise('');
      setIsDeleting(false); // Exit delete mode when changing tabs
    } else {
      fetchVideos(); // Fetch videos when video tab is selected
    }
  }, [activeTab]);

  // Start or stop the camera when the video step changes
  useEffect(() => {
    if (videoStep === 'recording') {
      startCamera();
    } else {
      stopCamera();
    }
    // Cleanup function to ensure camera is stopped when component unmounts
    return () => stopCamera();
  }, [videoStep]);

  // For demonstration, we use a hardcoded test athlete profile.
  const testAthlete: Athlete = {
    id: "99",
    aadhar_card_number: session.user.user_metadata.aadhaar_number || session.user.user_metadata.aadhar_card_number || "000000000000",
    name: session.user.user_metadata.full_name || 'Test Athlete',
    age: 25,
    sport: 'General Fitness',
    rank: 'Trainee',
    imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.user_metadata.full_name || 'T A')}&background=808080&color=FFFFFF`
  };

  const handleExerciseSelect = (exercise: string) => {
    setSelectedExercise(exercise);
    setUploadMessage(''); // Clear any previous upload message
    setVideoStep('recording');
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      const videoBlob = await stopRecording();
      setIsUploading(true);
      setUploadMessage('');
      
      const athleteId = session.user.id; // Use the real user ID from the session
      if (!athleteId) {
        alert('Could not identify user. Please log in again.');
        setIsUploading(false);
        return;
      }
      const fileName = `${athleteId}-${selectedExercise.toLowerCase()}-${Date.now()}.webm`;
      const filePath = `${athleteId}/${fileName}`;

      try {
        // 1. Upload video to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, videoBlob);

        if (uploadError) throw uploadError;

        // 2. Get the public URL of the uploaded video
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);
        
        // 3. Save the publicUrl to a database table associated with the athlete.
        const { data: newVideo, error: dbError } = await supabase.from('videos').insert({
          user_id: athleteId,
          exercise: selectedExercise,
          video_url: publicUrl,
          path: filePath,
        }).select().single(); // Use .select().single() to get the newly created row back

        if (dbError) throw dbError;

        console.log('Video uploaded and record saved successfully:', publicUrl);
        setUploadMessage('Video Uploaded!'); // Show success message on screen
        
        // 4. Add the new video to the local state instead of re-fetching
        if (newVideo) {
          setVideos(currentVideos => [newVideo, ...currentVideos]);
        }

      } catch (error: any) {
        console.error('Error uploading video:', error.message);
        setUploadMessage(`Error: ${error.message}`); // Show error message on screen
      } finally {
        setIsUploading(false);
        // Do not navigate away automatically, let the user see the message
      }

    } else {
      startRecording();
    }
  };

  const handleDeleteVideo = async (video: any) => {
    if (!window.confirm('Are you sure you want to delete this video? This cannot be undone.')) {
      return;
    }
    try {
      // 1. Delete from storage first.
      const { error: storageError } = await supabase.storage.from('videos').remove([video.path]);
      if (storageError) throw storageError;

      // 2. Delete from database. Using .select() ensures RLS errors are thrown.
      const { error: dbError } = await supabase.from('videos').delete().eq('id', video.id).select();
      if (dbError) throw dbError;

      // 3. If both deletions were successful, update the UI.
      setVideos(currentVideos => currentVideos.filter(v => v.id !== video.id));

    } catch (error: any) {
      console.error('Error deleting video:', error.message);
      alert(`Failed to delete video. Please ensure you have the correct permissions. Error: ${error.message}`);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'video':
        if (videoStep === 'recording') {
          const formatTime = (seconds: number) => {
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            return `${mins}:${secs}`;
          };

          return (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Record: {selectedExercise}</CardTitle>
                  <Button variant="ghost" onClick={() => { setVideoStep('selection'); setUploadMessage(''); }}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-black rounded-lg aspect-video flex flex-col items-center justify-center text-white mb-4 overflow-hidden relative">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {isRecording && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-lg font-mono py-1 px-3 rounded">
                      {formatTime(recordingTime)}
                    </div>
                  )}
                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4">
                      <Camera className="h-16 w-16 text-red-500" />
                      <p className="text-red-400 mt-2 text-center">{cameraError}</p>
                    </div>
                  )}
                  {/* Human Detection Status */}
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {humanDetected ? '👤 Human Detected' : '❌ No Human'}
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4">
                      <p>Uploading...</p>
                    </div>
                  )}
                </div>
                <Button size="lg" onClick={handleRecordToggle} disabled={!!cameraError || isUploading || (isRecording && recordingTime < 1)}>
                  {isRecording ? 'Stop & Save' : 'Start Recording'}
                </Button>
                {uploadMessage && (
                  <p className={`mt-4 text-sm ${uploadMessage.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                    {uploadMessage}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        }
        const exercises = ['Situp', 'Jump', 'Pushups', 'Pullups'];
        const groupedVideos = videos.reduce((acc, video) => {
          (acc[video.exercise] = acc[video.exercise] || []).push(video);
          return acc;
        }, {} as Record<string, any[]>);

        return (
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Select an Exercise to Record</CardTitle>
              <Button variant={isDeleting ? "default" : "outline"} onClick={() => setIsDeleting(!isDeleting)}>
                {isDeleting ? 'Done Deleting' : 'Delete Videos'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-8">
              {exercises.map(exercise => (
                <div key={exercise}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{exercise}</h3>
                    <Button onClick={() => handleExerciseSelect(exercise)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Record New
                    </Button>
                  </div>
                  {isLoadingVideos ? (
                    <p className="text-muted-foreground">Loading videos...</p>
                  ) : (groupedVideos[exercise] && groupedVideos[exercise].length > 0) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedVideos[exercise].map((video: { id: string; path: string; video_url: string; created_at: string; }) => (
                        <Card key={video.id} className="overflow-hidden relative group">
                          <video
                            className="w-full h-auto bg-black"
                            src={video.video_url}
                            controls={!isDeleting}
                            preload="metadata"
                          />
                          {isDeleting && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Button variant="destructive" onClick={() => handleDeleteVideo(video)}>
                                Delete
                              </Button>
                            </div>
                          )}
                          <CardContent className="p-3">
                            <p className="text-sm text-muted-foreground">
                              {new Date(video.created_at).toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recordings for {exercise} yet.</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      case 'setting':
        return (
          <Card>
            <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">Your profile and application settings will be available here.</p></CardContent>
          </Card>
        );
      case 'home':
      default:
        return <AthleteProfilePage athlete={testAthlete} onBack={() => {}} showBackButton={false} />;
    }
  };

  const getHeaderText = () => {
    if (activeTab === 'video') return 'Record Performance';
    if (activeTab === 'setting') return 'Settings';
    return 'My Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-24"> {/* Padding to prevent content from being hidden by the footer */}
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{getHeaderText()}</h1>
            <Button variant="destructive" onClick={onLogout} className="mb-4">Logout</Button>
          </div>
          {renderContent()}
        </div>
      </div>

      {/* Footer Navigator */}
      <div className="fixed inset-x-0 bottom-0 bg-white border-t shadow-lg z-10">
        <div className="flex justify-around max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-sm transition-colors ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
          >
            <Home className="h-6 w-6 mb-1" />
            Home
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-sm transition-colors ${activeTab === 'video' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
          >
            <Video className="h-6 w-6 mb-1" />
            Video
          </button>
          <button
            onClick={() => setActiveTab('setting')}
            className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-sm transition-colors ${activeTab === 'setting' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
          >
            <Settings className="h-6 w-6 mb-1" />
            Setting
          </button>
        </div>
      </div>
    </div>
  );
}

// The AthleteDashboardPage component is now removed from this file.

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('roleSelection'); // 'roleSelection', 'adminAuth', 'athleteAuth', 'demo'
  const [session, setSession] = useState<SupabaseSession | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setIsLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('roleSelection');
  };

  useEffect(() => {
    // Only call uploadPendingVideos if athlete info is available
    const handleOnline = () => {
      const athleteAadhar = session?.user?.user_metadata?.aadhaar_number || session?.user?.user_metadata?.aadhar_card_number;
      if (athleteAadhar) {
        uploadPendingVideos(athleteAadhar);
      }
    };
    window.addEventListener("online", handleOnline);
    handleOnline(); // Try on app start
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [session]);

  if (isLoading) {
  return <LoadingScreen onComplete={() => {}} />;
  }

  // Check for real Supabase session first
  if (session) {
    const userRole = session.user.user_metadata.role;
    if (userRole === 'admin') {
      return <AdminDashboard onLogout={handleLogout} />;
    }
    // Default to athlete dashboard for any other authenticated user
    return <AthleteDashboard onLogout={handleLogout} session={session} />;
  }

  if (view === 'roleSelection') {
    return <RoleSelectionPage onSelectRole={(role) => {
      if (role === 'demo') {
        setView('demo');
      } else {
        setView(role === 'admin' ? 'adminAuth' : 'athleteAuth');
      }
    }} />;
  }

  if (view === 'demo') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">Human Detection Demo</h1>
          <Button variant="outline" onClick={() => setView('roleSelection')}>
            Back to Home
          </Button>
        </div>
        <HumanDetectionDemo />
      </div>
    );
  }

  if (view === 'adminAuth') {
    return <EmailPasswordAuthPage onBack={() => setView('roleSelection')} role="admin" />;
  }

  if (view === 'athleteAuth') {
    return <EmailPasswordAuthPage onBack={() => setView('roleSelection')} role="athlete" />;
  }

  // Fallback to role selection if view is invalid
  return <RoleSelectionPage onSelectRole={(role) => {
    if (role === 'demo') {
      setView('demo');
    } else {
      setView(role === 'admin' ? 'adminAuth' : 'athleteAuth');
    }
  }} />;
}

// Custom hook to manage camera functionality
const useCamera = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [humanDetected, setHumanDetected] = useState(false);

  const startCamera = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not available on this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' } // Prefer front-facing camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err: any) {
      console.error("Error accessing camera: ", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow camera access in your browser settings.');
      } else {
        setError('Could not access the camera. Ensure it is not in use by another application.');
      }
    }
  };

  const stopCamera = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startRecording = () => {
    if (streamRef.current) {
      const recorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => {
          setIsRecording(false);
        };
        mediaRecorderRef.current.ondataavailable = (event) => {
          const videoBlob = new Blob([event.data], { type: 'video/webm' });
          resolve(videoBlob);
        };
        mediaRecorderRef.current.stop();
      }
    });
  };

  return { startCamera, stopCamera, error, isRecording, startRecording, stopRecording };
};

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
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
  Settings
} from 'lucide-react';

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

function RoleSelectionPage({ onSelectRole }: { onSelectRole: (role: 'admin' | 'athlete') => void }) {
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
        </CardContent>
      </Card>
    </div>
  );
}

function AthleteAuthPage({ onBack, onTestLoginSuccess }: { onBack: () => void; onTestLoginSuccess: () => void; }) {
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // --- Test credentials ---
  const testPhoneNumbers = ['+919354932670', '+917503592928'];
  const testOtp = '234432';
  // --------------------

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Bypass Supabase for test numbers
    if (testPhoneNumbers.includes(phone)) {
      setTimeout(() => {
        setOtpSent(true);
        setMessage(`This is a test number. Please use the OTP: ${testOtp}`);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setOtpSent(true);
      setMessage('An OTP has been sent to your phone.');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Bypass Supabase for test numbers and test OTP
    if (testPhoneNumbers.includes(phone) && otp === testOtp) {
      setTimeout(() => {
        onTestLoginSuccess();
      }, 500);
      return;
    }

    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
      if (error) throw error;
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Athlete Login</CardTitle>
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-muted-foreground text-sm pt-2">
            {otpSent ? 'Enter the code we sent to your phone.' : 'Enter your phone number to receive a login code.'}
          </p>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+919876543210" required value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send Code'}</Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Code</Label>
                <Input id="otp" type="text" inputMode="numeric" placeholder="123456" required value={otp} onChange={e => setOtp(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Verifying...' : 'Verify & Sign In'}</Button>
            </form>
          )}
          {message && <p className="text-sm text-muted-foreground text-center pt-4">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminAuthPage({ onBack }: { onBack: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{isLogin ? 'Admin Login' : 'Create Admin Account'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="John Doe" required value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="coach@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
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
  { id: 1, name: 'Alex Morgan', age: 34, sport: 'Soccer', rank: 'Pro', imageUrl: 'https://via.placeholder.com/150/FFC0CB/000000?Text=AM' },
  { id: 2, name: 'Jordan Smith', age: 22, sport: 'Basketball', rank: 'College', imageUrl: 'https://via.placeholder.com/150/ADD8E6/000000?Text=JS' },
  { id: 3, name: 'Maria Garcia', age: 17, sport: 'Tennis', rank: 'High School', imageUrl: 'https://via.placeholder.com/150/90EE90/000000?Text=MG' },
  { id: 4, name: 'Ken Miles', age: 28, sport: 'Track & Field', rank: 'Amateur', imageUrl: 'https://via.placeholder.com/150/FFFF00/000000?Text=KM' },
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

type Athlete = typeof sampleAthletes[0];

function AthleteCard({ athlete, onViewProfile }: { athlete: Athlete; onViewProfile: (athlete: Athlete) => void; }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={athlete.imageUrl} alt={athlete.name} />
          <AvatarFallback>{athlete.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{athlete.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{athlete.sport}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Age:</span>
          <span>{athlete.age}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-muted-foreground">Rank:</span>
          <Badge variant="secondary">{athlete.rank}</Badge>
        </div>
        <Button className="w-full mt-2" onClick={() => onViewProfile(athlete)}>View Profile</Button>
      </CardContent>
    </Card>
  );
}

function AthleteProfilePage({ athlete, onBack, showBackButton = true }: { athlete: Athlete; onBack: () => void; showBackButton?: boolean; }) {
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
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={athlete.imageUrl} alt={athlete.name} />
                <AvatarFallback>{athlete.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{athlete.name}</CardTitle>
              <p className="text-muted-foreground">{athlete.sport}</p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Age</span>
                <span>{athlete.age}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Rank</span>
                <Badge variant="secondary">{athlete.rank}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
              </div>
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
                  src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
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

function AthleteDashboardPage({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('home');

  // For demonstration, we use a hardcoded test athlete profile.
  const testAthlete: Athlete = {
    id: 99,
    name: 'Test Athlete',
    age: 25,
    sport: 'General Fitness',
    rank: 'Trainee',
    imageUrl: 'https://via.placeholder.com/150/808080/FFFFFF?Text=TA'
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'video':
        return (
          <Card>
            <CardHeader><CardTitle>My Videos</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">A gallery of your performance videos will be displayed here.</p></CardContent>
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
    if (activeTab === 'video') return 'My Videos';
    if (activeTab === 'setting') return 'Settings';
    return 'My Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-24"> {/* Padding to prevent content from being hidden by the footer */}
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{getHeaderText()}</h1>
            <Button variant="destructive" onClick={onLogout}>Logout</Button>
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

function DashboardPage({ onLogout }: { onLogout: () => void }) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  useEffect(() => {
    // TODO: Fetch athletes from your database instead of using sample data
    setAthletes(sampleAthletes);
  }, []);

  if (selectedAthlete) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <AthleteProfilePage athlete={selectedAthlete} onBack={() => setSelectedAthlete(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Athlete
            </Button>
            <Button variant="destructive" onClick={onLogout}>Logout</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {athletes.map(athlete => (
            <AthleteCard key={athlete.id} athlete={athlete} onViewProfile={setSelectedAthlete} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('roleSelection'); // 'roleSelection', 'adminAuth', 'athleteAuth'
  const [session, setSession] = useState<Session | null>(null);
  const [isTestAthlete, setIsTestAthlete] = useState(false); // New state for mock login

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
    setIsTestAthlete(false); // Log out test athlete as well
    setView('roleSelection');
  };

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  // Check for real Supabase session first
  if (session) {
    // TODO: Differentiate between Admin and real Athlete dashboards
    return <DashboardPage onLogout={handleLogout} />;
  }

  // Check for mock athlete login
  if (isTestAthlete) {
    return <AthleteDashboardPage onLogout={handleLogout} />;
  }

  if (view === 'roleSelection') {
    return <RoleSelectionPage onSelectRole={(role) => setView(role === 'admin' ? 'adminAuth' : 'athleteAuth')} />;
  }

  if (view === 'adminAuth') {
    return <AdminAuthPage onBack={() => setView('roleSelection')} />;
  }

  if (view === 'athleteAuth') {
    return <AthleteAuthPage onBack={() => setView('roleSelection')} onTestLoginSuccess={() => setIsTestAthlete(true)} />;
  }

  // Fallback to role selection if view is invalid
  return <RoleSelectionPage onSelectRole={(role) => setView(role === 'admin' ? 'adminAuth' : 'athleteAuth')} />;
}

/*

1. Create a table for public profiles
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  updated_at timestamp with time zone,

  primary key (id),
  constraint full_name_length check (char_length(full_name) >= 3)
);

2. Set up Row Level Security (RLS)
alter table public.profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

3. Create a trigger to automatically create a profile on new user sign up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

*/
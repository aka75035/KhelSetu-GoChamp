import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { Session as SupabaseSession } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Trophy, 
  Target, 
  Activity,
  Users,
  Cloud,
  ArrowLeft,
  Camera
} from 'lucide-react';
import AdminDashboard from './screens/admin/AdminDashboard';
import AthleteDashboard from './screens/athlete/AthleteDashboard';
import { uploadPendingVideos } from "./lib/uploadPendingVideos";
import { HumanDetectionDemo } from './components/HumanDetectionDemo';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslationWithVoice } from './hooks/useTranslationWithVoice';
import AnimatedLogo from './components/AnimatedLogo';
import EnhancedLanguagePage from './components/EnhancedLanguagePage';
import EnhancedLoginPage from './components/EnhancedLoginPage';
import AICoachAssistant from './components/AICoachAssistant';
import BiometricMonitor from './components/BiometricMonitor';
import SocialFeatures from './components/SocialFeatures';
import ARVisualization from './components/ARVisualization';
import Gamification from './components/Gamification';

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const { tForJSX } = useTranslationWithVoice();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState(tForJSX('loading.initializing'));

  const loadingSteps = [
    { progress: 20, text: tForJSX('loading.loadingAiModels') },
    { progress: 40, text: tForJSX('loading.connectingToCloud') },
    { progress: 60, text: tForJSX('loading.settingUpAnalytics') },
    { progress: 80, text: tForJSX('loading.preparingVideoAnalysis') },
    { progress: 100, text: tForJSX('loading.readyToGo') }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev: number) => {
        const nextProgress = prev + 1.5;
        const currentStep = loadingSteps.find(step => nextProgress >= step.progress);
        if (currentStep) {
          setLoadingText(currentStep.text);
        }
        
        if (nextProgress >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return nextProgress;
      }); 
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>

      <div className="relative z-10 text-center text-white space-y-8 max-w-lg mx-auto px-6 animate-fade-in">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
          </div>
        <div className="space-y-6">
          {/* Enhanced Logo */}
          <div className="relative">
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 w-32 h-32 mx-auto flex items-center justify-center shadow-2xl border border-white/30">
              <Trophy className="h-16 w-16 text-white drop-shadow-lg" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl opacity-20 blur-xl"></div>
        </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
              {tForJSX('app.name')}
            </h1>
            <p className="text-xl text-blue-100 font-medium">{tForJSX('app.tagline')}</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-200">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>{tForJSX('app.subtitle')}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Section */}
        <div className="space-y-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="space-y-4">
            <p className="text-white/90 font-medium text-lg">{loadingText}</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-blue-100">{tForJSX('loading.progress')}</span>
                <span className="text-white">{Math.round(progress)}%</span>
            </div>
              <div className="relative">
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-300 ease-out shadow-lg"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-30 blur-sm" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Feature Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-3 group">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
              <Activity className="h-8 w-8 text-blue-300 mx-auto drop-shadow-lg" />
            </div>
            <p className="text-xs text-blue-100 font-medium">{tForJSX('features.aiAnalysis')}</p>
          </div>
          
          <div className="space-y-3 group">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
              <Cloud className="h-8 w-8 text-purple-300 mx-auto drop-shadow-lg" />
            </div>
            <p className="text-xs text-blue-100 font-medium">{tForJSX('features.cloudSync')}</p>
          </div>
          
          <div className="space-y-3 group">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
              <Target className="h-8 w-8 text-green-300 mx-auto drop-shadow-lg" />
            </div>
            <p className="text-xs text-blue-100 font-medium">{tForJSX('features.performance')}</p>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}


function RoleSelectionPage({ onSelectRole }: { onSelectRole: (role: 'admin' | 'athlete' | 'demo' | 'aiCoach' | 'biometric' | 'social' | 'ar' | 'gamification') => void }) {
  const { tForJSX } = useTranslationWithVoice();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
          </div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
    </div>

      <div className="relative z-10 w-full max-w-lg">
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {tForJSX('roleSelection.welcome')}
              </CardTitle>
              <p className="text-gray-600 mt-2 text-lg">{tForJSX('roleSelection.chooseRole')}</p>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button 
              className="w-full h-24 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              onClick={() => onSelectRole('athlete')}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Trophy className="h-8 w-8" />
                </div>
                <div className="text-left">
                  <div className="font-bold">{tForJSX('roleSelection.iAmAthlete')}</div>
                  <div className="text-sm opacity-90">{tForJSX('roleSelection.trackPerformance')}</div>
                </div>
              </div>
          </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-24 text-lg font-semibold border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              onClick={() => onSelectRole('admin')}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Users className="h-8 w-8 text-gray-600" />
                </div>
                <div className="text-left">
                  <div className="font-bold">{tForJSX('roleSelection.iAmAdmin')}</div>
                  <div className="text-sm opacity-70">{tForJSX('roleSelection.manageAthletes')}</div>
                </div>
              </div>
          </Button>
            
            <Button 
              variant="secondary" 
              className="w-full h-24 text-lg font-semibold bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              onClick={() => onSelectRole('demo')}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Camera className="h-8 w-8" />
                </div>
                <div className="text-left">
                  <div className="font-bold">{tForJSX('roleSelection.tryDemo')}</div>
                  <div className="text-sm opacity-90">{tForJSX('roleSelection.experienceAi')}</div>
                </div>
              </div>
          </Button>
            
            {/* New Feature Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button 
                variant="outline" 
                className="h-20 text-sm font-semibold border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                onClick={() => onSelectRole('aiCoach')}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <div className="font-bold text-xs">AI Coach</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 text-sm font-semibold border-2 border-green-200 hover:border-green-300 hover:bg-green-50 text-green-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                onClick={() => onSelectRole('biometric')}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">💓</div>
                  <div className="font-bold text-xs">Biometric</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 text-sm font-semibold border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                onClick={() => onSelectRole('social')}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">👥</div>
                  <div className="font-bold text-xs">Social</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 text-sm font-semibold border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 text-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                onClick={() => onSelectRole('ar')}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🥽</div>
                  <div className="font-bold text-xs">AR Vision</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 text-sm font-semibold border-2 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50 text-yellow-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 col-span-2" 
                onClick={() => onSelectRole('gamification')}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="font-bold text-xs">Gamification Hub</div>
                </div>
              </Button>
            </div>
        </CardContent>
          
          <div className="px-6 pb-6">
            <div className="text-center text-sm text-gray-500 space-y-2">
              <p>{tForJSX('roleSelection.poweredBy')}</p>
              <div className="flex items-center justify-center space-x-4 text-xs">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{tForJSX('roleSelection.realTimeAnalysis')}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>{tForJSX('roleSelection.cloudSync')}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>{tForJSX('roleSelection.performanceTracking')}</span>
                </span>
              </div>
            </div>
          </div>
      </Card>
      </div>
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
  const [sport, setSport] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (isLogin) {
        const { error, user } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error('Sign-in error:', error); // Log the error for debugging
          setMessage('Invalid email or password. Please try again.');
          return;
        }
        if (user) {
          console.log('Sign-in successful:', user); // Log user details for debugging
          // User will be automatically redirected by the auth state change
        }
      } else {
        // Sign Up
        const signUpData: { [key: string]: any } = {
          full_name: fullName,
          role: role, // Add role to metadata
        };
        if (role === 'athlete') {
          signUpData.sport = sport;
          signUpData.mobile_number = mobileNumber;
          signUpData.aadhaar_number = aadhaarNumber;
        }
        const { error, user } = await supabase.auth.signUp({
          email,
          password,
          options: { data: signUpData },
        });
        if (error) throw error;
        if (user && !user.email_confirmed_at) {
          setMessage('Please check your email to verify your account.');
          return;
        }
        setMessage('Success! Please check your email for a confirmation link.');
      }
    } catch (error: unknown) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin((prev: boolean) => !prev);
    setMessage('');
  };

  const pageTitle = role === 'admin' ? 'Admin' : 'Athlete';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/90 border-white/20 shadow-2xl">
          <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  {role === 'admin' ? <Users className="h-5 w-5 text-white" /> : <Trophy className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {isLogin ? `${pageTitle} Login` : `Create ${pageTitle} Account`}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {isLogin ? 'Welcome back!' : 'Join AthleteFlow today'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back" className="hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="John Doe" 
                      required 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                {role === 'athlete' && (
                  <>
                    <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-sm font-semibold text-gray-700">Mobile Number</Label>
                        <Input 
                          id="mobile" 
                          type="tel" 
                          placeholder="+919876543210" 
                          required 
                          value={mobileNumber} 
                          onChange={e => setMobileNumber(e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="aadhaar" className="text-sm font-semibold text-gray-700">Aadhaar Card Number</Label>
                        <Input 
                          id="aadhaar" 
                          type="text" 
                          placeholder="1234 5678 9012" 
                          required 
                          value={aadhaarNumber} 
                          onChange={e => setAadhaarNumber(e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sport" className="text-sm font-semibold text-gray-700">Sport</Label>
                        <Input 
                          id="sport" 
                          type="text" 
                          placeholder="Cricket, Football, Swimming, etc." 
                          required 
                          value={sport} 
                          onChange={e => setSport(e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                  </>
                )}
              </>
            )}
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={role === 'admin' ? "coach@example.com" : "athlete@example.com"} 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
              <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
                  />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((prev: boolean) => !prev)}
                    className="absolute inset-y-0 right-3 my-auto text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
              
              {message && (
                <div className={`p-3 rounded-lg text-sm text-center ${
                  message.startsWith('Error') || message.startsWith('Failed') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {message}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
            </Button>
          </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
                </span>
          </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={toggleAuthMode} 
              className="w-full h-12 text-lg font-semibold border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 transition-all duration-300"
            >
              {isLogin ? 'Create New Account' : 'Sign In Instead'}
            </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}


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
    setProfileData((prev: Athlete) => ({ ...prev, [id]: id === 'age' ? parseInt(value) || 0 : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Create a URL for the selected file to show a preview
      setProfileData((prev: Athlete) => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
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
    <div className="container mx-auto p-4">
      {showBackButton && (
        <Button variant="outline" onClick={onBack} className="mb-6 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Details & Graph */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="items-center text-center pb-4">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-30"></div>
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage src={profileData.imageUrl} alt={profileData.name} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute bottom-2 right-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              {isEditing ? (
                <Input id="name" value={profileData.name} onChange={handleInputChange} className="text-2xl font-bold text-center border-0 bg-transparent focus:ring-0" />
              ) : (
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {profileData.name}
                </CardTitle>
              )}
              {isEditing ? (
                <Input id="sport" value={profileData.sport} onChange={handleInputChange} className="text-center border-0 bg-transparent focus:ring-0" />
              ) : (
                <p className="text-gray-800 font-semibold">{profileData.sport}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Age</span>
                {isEditing ? (
                    <Input id="age" type="number" value={profileData.age} onChange={handleInputChange} className="w-20 text-center border-0 bg-transparent focus:ring-0" />
                ) : (
                    <span className="font-bold text-lg text-gray-900">{profileData.age}</span>
                )}
              </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Rank</span>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-3 py-1">
                    {profileData.rank}
                  </Badge>
              </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Status</span>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-3 py-1">
                    Active
                  </Badge>
              </div>
              </div>
              
              {isEditing ? (
                <div className="flex flex-col gap-3 pt-4">
                  <Button 
                    onClick={handleSave} 
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel} 
                    className="w-full h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-semibold transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)} 
                  className="w-full h-12 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 font-semibold transition-all duration-300"
                >
                  Edit Profile
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Performance Chart Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Performance Over Time
              </CardTitle>
              <p className="text-sm text-gray-600">Track your progress and improvements</p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={samplePerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      name="Performance Score" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      activeDot={{ r: 8, fill: '#6366f1' }}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Video Player */}
        <div className="lg:col-span-2">
          <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Latest Analysis Video
              </CardTitle>
              <p className="text-sm text-gray-600">Review your most recent performance analysis</p>
            </CardHeader>
            <CardContent className="h-full flex flex-col">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden flex-grow shadow-inner">
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


// The AthleteDashboardPage component is now removed from this file.

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('logo'); // 'logo', 'language', 'roleSelection', 'adminAuth', 'athleteAuth', 'demo', 'aiCoach', 'biometric', 'social', 'ar', 'gamification'
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isBiometricMonitoring, setIsBiometricMonitoring] = useState(false);
  const [isARActive, setIsARActive] = useState(false);

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
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
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

  // Show animated logo first
  if (view === 'logo') {
    return <AnimatedLogo onComplete={() => setView('language')} />;
  }

  // Show language selection page
  if (view === 'language') {
    return <EnhancedLanguagePage onLanguageSelect={(languageCode) => {
      setSelectedLanguage(languageCode);
      setView('roleSelection');
    }} />;
  }

  if (view === 'roleSelection') {
    return <RoleSelectionPage onSelectRole={(role) => {
      if (role === 'demo') {
        setView('demo');
      } else if (role === 'admin' || role === 'athlete') {
        setView(role === 'admin' ? 'adminAuth' : 'athleteAuth');
      } else {
        // New feature views
        setView(role);
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
    return <EnhancedLoginPage onBack={() => setView('roleSelection')} role="admin" selectedLanguage={selectedLanguage} />;
  }

  if (view === 'athleteAuth') {
    return <EnhancedLoginPage onBack={() => setView('roleSelection')} role="athlete" selectedLanguage={selectedLanguage} />;
  }

  // New feature views
  if (view === 'aiCoach') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">AI Coach Assistant</h1>
          <Button variant="outline" onClick={() => setView('roleSelection')}>
            Back to Home
          </Button>
        </div>
        <AICoachAssistant />
      </div>
    );
  }

  if (view === 'biometric') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">Biometric Monitor</h1>
          <Button variant="outline" onClick={() => setView('roleSelection')}>
            Back to Home
          </Button>
        </div>
        <BiometricMonitor 
          isMonitoring={isBiometricMonitoring} 
          onToggleMonitoring={setIsBiometricMonitoring} 
        />
      </div>
    );
  }

  if (view === 'social') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">Social Features</h1>
          <Button variant="outline" onClick={() => setView('roleSelection')}>
            Back to Home
          </Button>
        </div>
        <SocialFeatures />
      </div>
    );
  }

  if (view === 'ar') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">AR Visualization</h1>
          <Button variant="outline" onClick={() => setView('roleSelection')}>
            Back to Home
          </Button>
        </div>
        <ARVisualization 
          isActive={isARActive} 
          onToggle={setIsARActive} 
        />
      </div>
    );
  }

  if (view === 'gamification') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">Gamification Hub</h1>
          <Button variant="outline" onClick={() => setView('roleSelection')}>
            Back to Home
          </Button>
        </div>
        <Gamification />
      </div>
    );
  }

  // Fallback to logo if view is invalid
  return <AnimatedLogo onComplete={() => setView('language')} />;
}


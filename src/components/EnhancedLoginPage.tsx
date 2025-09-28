import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  ArrowLeft, 
  Trophy, 
  Users, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  CreditCard,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useTranslationWithVoice } from '../hooks/useTranslationWithVoice';
import { textToSpeech } from '../utils/textToSpeech';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface EnhancedLoginPageProps {
  onBack: () => void;
  role: 'admin' | 'athlete';
  selectedLanguage: string;
}

export default function EnhancedLoginPage({ onBack, role, selectedLanguage }: EnhancedLoginPageProps) {
  const { tForJSX, speakText } = useTranslationWithVoice();
  const { i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Welcome to the login page! You can sign in with your existing account or create a new one.",
    "Fill in your email address and password to sign in, or click 'Create Account' to register.",
    "If you're creating a new account, you'll need to provide additional information like your name and contact details.",
    "Once you're logged in, you'll have access to all the features of KHELSETU!"
  ];

  useEffect(() => {
    if (isVoiceEnabled) {
      const timer = setTimeout(() => {
        const stepMessage = tForJSX(`login.step${currentStep + 1}`, steps[currentStep]);
        textToSpeech.speak(stepMessage);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isVoiceEnabled, tForJSX]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage(`Error: ${error.message}`);
          return;
        }
        if (data?.user) {
          setMessage('Signed in successfully. Redirecting...');
        } else {
          setMessage('Error: Unable to sign in.');
        }
      } else {
        // Sign Up with metadata
        const metadata: Record<string, any> = {
          full_name: fullName,
          role,
          mobile_number: mobileNumber,
          aadhaar_number: aadhaarNumber
        };
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: metadata }
        });
        if (error) {
          setMessage(`Error: ${error.message}`);
          return;
        }
        if (data.user && !data.user.email_confirmed_at) {
          setMessage('Success! Please check your email to verify your account.');
        } else {
          setMessage('Account created. You are signed in.');
        }
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
      if (isVoiceEnabled && message) {
        textToSpeech.speak(message);
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    setMessage('');
    setCurrentStep(prev => (prev + 1) % steps.length);
    
    if (isVoiceEnabled) {
      const mode = isLogin ? tForJSX('auth.createAccount', 'create account') : tForJSX('auth.signIn', 'sign in');
      const switchMessage = tForJSX('auth.switchMode', `Switching to ${mode} mode. Please fill in the required information.`);
      textToSpeech.speak(switchMessage);
    }
  };

  const toggleVoice = () => {
    const newVoiceState = !isVoiceEnabled;
    setIsVoiceEnabled(newVoiceState);
    textToSpeech.setEnabled(newVoiceState);
    
    if (newVoiceState) {
      const voiceMessage = tForJSX('login.voiceEnabled', "Voice guidance enabled. I'll help you through the login process.");
      textToSpeech.speak(voiceMessage);
    } else {
      textToSpeech.stop();
    }
  };

  const pageTitle = role === 'admin' ? 'Admin' : 'Athlete';
  const isAthlete = role === 'athlete';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/95 border-white/20 shadow-2xl">
          <CardHeader className="space-y-4">
            {/* Header with Voice Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  {role === 'admin' ? <Users className="h-6 w-6 text-white" /> : <Trophy className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {isLogin ? tForJSX('auth.adminLogin', `${pageTitle} Login`) : tForJSX('auth.createAdminAccount', `Create ${pageTitle} Account`)}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {isLogin ? tForJSX('auth.welcomeBack', 'Welcome back!') : tForJSX('auth.joinToday', 'Join KHELSETU today')}
                  </p>
                </div>
              </div>
              
              {/* Voice Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoice}
                className={`h-10 w-10 ${
                  isVoiceEnabled 
                    ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
                }`}
                title={isVoiceEnabled ? 'Disable voice guidance' : 'Enable voice guidance'}
              >
                {isVoiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Back Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack} 
              className="w-fit text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tForJSX('common.backToLanguage', 'Back to Language Selection')}
            </Button>

            {/* Voice Guidance Indicator */}
            {isVoiceEnabled && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-blue-800 text-sm font-medium">{tForJSX('common.voiceGuidanceActive', 'Voice Guidance Active')}</p>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleAuth} className="space-y-5">
              {/* Sign Up Fields */}
              {!isLogin && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{tForJSX('auth.fullName', 'Full Name')}</span>
                    </Label>
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder={tForJSX('auth.enterFullName', 'Enter your full name')} 
                      required 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  {isAthlete && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{tForJSX('auth.mobileNumber', 'Mobile Number')}</span>
                        </Label>
                        <Input 
                          id="mobile" 
                          type="tel" 
                          placeholder="+91 98765 43210" 
                          required 
                          value={mobileNumber} 
                          onChange={e => setMobileNumber(e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aadhaar" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>{tForJSX('auth.aadhaarNumber', 'Aadhaar Card Number')}</span>
                        </Label>
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
                    </>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{tForJSX('auth.email', 'Email Address')}</span>
                </Label>
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

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Password</span>
                </Label>
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
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 my-auto text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              {/* Message Display */}
              {message && (
                <div className={`p-4 rounded-xl text-sm text-center flex items-center justify-center space-x-2 ${
                  message.startsWith('Error') || message.startsWith('Failed') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  <CheckCircle className="h-5 w-5" />
                  <span>{message}</span>
                </div>
              )}
              
              {/* Submit Button */}
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
            
            {/* Toggle Auth Mode */}
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

            {/* Help Text */}
            <div className="text-center text-sm text-gray-500 space-y-2">
              <p>🔒 Your data is secure and encrypted</p>
              <p>🌍 App is available in multiple languages</p>
              {isVoiceEnabled && <p>🎤 Voice guidance is active</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

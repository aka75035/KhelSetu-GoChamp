import React, { useState, useEffect } from 'react';
import { Trophy, Target, Activity, Users, Cloud, Star, Zap } from 'lucide-react';

interface AnimatedLogoProps {
  onComplete: () => void;
}

export default function AnimatedLogo({ onComplete }: AnimatedLogoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showText, setShowText] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  const steps = [
    { duration: 1000, action: () => setShowText(true) },
    { duration: 800, action: () => setShowSubtitle(true) },
    { duration: 1200, action: () => setShowFeatures(true) },
    { duration: 2000, action: () => onComplete() }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < steps.length) {
        steps[currentStep].action();
        setCurrentStep(prev => prev + 1);
      }
    }, steps[currentStep]?.duration || 0);

    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-40 right-40 w-60 h-60 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 text-center text-white space-y-8 max-w-2xl mx-auto px-6">
        {/* Main Logo Container */}
        <div className="relative">
          {/* Animated Trophy Icon */}
          <div className="relative mx-auto w-40 h-40 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-2xl opacity-60 animate-pulse"></div>
            <div className="relative bg-white/20 backdrop-blur-md rounded-full p-8 w-full h-full flex items-center justify-center shadow-2xl border border-white/30 animate-bounce">
              <Trophy className="h-20 w-20 text-yellow-300 drop-shadow-2xl" />
            </div>
            {/* Floating Icons */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}>
              <Zap className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* App Name */}
          {showText && (
            <div className="animate-fade-in">
              <h1 className="text-7xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl mb-4 tracking-wider">
                KHELSETU
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Subtitle */}
          {showSubtitle && (
            <div className="animate-fade-in mt-6">
              <p className="text-2xl text-blue-100 font-semibold mb-2">AI-Powered Performance Testing</p>
              <p className="text-lg text-purple-200">Advanced Motion Analysis & Training</p>
            </div>
          )}
        </div>

        {/* Feature Icons */}
        {showFeatures && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-4 gap-6 mt-12">
              <div className="space-y-3 group">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 group-hover:bg-white/25 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Activity className="h-8 w-8 text-blue-300 mx-auto drop-shadow-lg" />
                </div>
                <p className="text-xs text-blue-100 font-medium">AI Analysis</p>
              </div>
              
              <div className="space-y-3 group">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 group-hover:bg-white/25 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <Cloud className="h-8 w-8 text-purple-300 mx-auto drop-shadow-lg" />
                </div>
                <p className="text-xs text-blue-100 font-medium">Cloud Sync</p>
              </div>
              
              <div className="space-y-3 group">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 group-hover:bg-white/25 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Target className="h-8 w-8 text-green-300 mx-auto drop-shadow-lg" />
                </div>
                <p className="text-xs text-blue-100 font-medium">Performance</p>
              </div>

              <div className="space-y-3 group">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 group-hover:bg-white/25 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <Users className="h-8 w-8 text-yellow-300 mx-auto drop-shadow-lg" />
                </div>
                <p className="text-xs text-blue-100 font-medium">Community</p>
              </div>
            </div>

            {/* Loading Animation */}
            <div className="flex justify-center space-x-2 mt-8">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

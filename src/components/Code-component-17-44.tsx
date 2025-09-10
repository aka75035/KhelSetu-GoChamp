import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Progress } from './ui/progress';
import { 
  Trophy, 
  Zap, 
  Target, 
  Activity,
  CheckCircle,
  Smartphone,
  Database,
  Cloud
} from 'lucide-react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const loadingSteps = [
  { label: 'Initializing AthleteFlow', icon: Trophy, duration: 800 },
  { label: 'Loading AI Models', icon: Zap, duration: 1200 },
  { label: 'Setting up Performance Analytics', icon: Activity, duration: 900 },
  { label: 'Connecting to Backend', icon: Database, duration: 700 },
  { label: 'Syncing Cloud Data', icon: Cloud, duration: 600 },
  { label: 'Preparing Mobile Interface', icon: Smartphone, duration: 500 },
  { label: 'Ready to Launch', icon: Target, duration: 400 }
];

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
    let elapsedTime = 0;

    const stepTimer = setInterval(() => {
      if (currentStep < loadingSteps.length - 1) {
        elapsedTime += loadingSteps[currentStep].duration;
        setProgress((elapsedTime / totalDuration) * 100);
        setCurrentStep(prev => prev + 1);
      } else {
        // Final step
        elapsedTime += loadingSteps[currentStep].duration;
        setProgress(100);
        setIsComplete(true);
        clearInterval(stepTimer);
        
        // Delay before transitioning to main app
        setTimeout(() => {
          onLoadingComplete();
        }, 800);
      }
    }, currentStep < loadingSteps.length ? loadingSteps[currentStep].duration : 0);

    return () => clearInterval(stepTimer);
  }, [currentStep, onLoadingComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [null, -100],
              opacity: [0.1, 0.5, 0.1]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Main loading content */}
      <div className="relative z-10 text-center text-white max-w-md mx-auto px-6">
        {/* Logo and branding */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "back.out" }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              className="bg-white/20 backdrop-blur-sm rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center mb-4"
              animate={{ 
                rotate: isComplete ? 360 : 0,
                scale: isComplete ? 1.1 : 1
              }}
              transition={{ duration: 0.8 }}
            >
              <Trophy className="h-12 w-12 text-white" />
            </motion.div>
            
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-2">AthleteFlow</h1>
            <p className="text-blue-100">AI-Powered Performance Testing</p>
          </motion.div>
        </motion.div>

        {/* Loading steps */}
        <div className="space-y-6">
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              {loadingSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                if (!isActive && !isCompleted && index !== currentStep + 1) return null;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: isActive ? 1 : isCompleted ? 0.6 : 0.3,
                      x: 0,
                      scale: isActive ? 1 : 0.95
                    }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center space-x-3"
                  >
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300
                      ${isCompleted ? 'bg-green-500' : isActive ? 'bg-white/20' : 'bg-white/10'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : (
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-white/60'}`} />
                      )}
                    </div>
                    
                    <span className={`
                      transition-colors duration-300
                      ${isActive ? 'text-white' : 'text-white/60'}
                    `}>
                      {step.label}
                    </span>

                    {isActive && (
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-blue-100">
              <span>Loading...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            
            <div className="relative">
              <Progress 
                value={progress} 
                className="h-2 bg-white/20"
              />
              <motion.div
                className="absolute inset-0 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Success animation */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "back.out" }}
                className="flex items-center justify-center space-x-2 text-green-300"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Ready to launch!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feature highlights */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-12 grid grid-cols-3 gap-4 text-center"
        >
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
        </motion.div>
      </div>

      {/* Bottom branding */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
      >
        <p className="text-white/60 text-sm">Cross-platform • Offline-first • AI-powered</p>
      </motion.div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Globe, 
  Volume2, 
  VolumeX, 
  Check, 
  ArrowRight,
  Star,
  Sparkles
} from 'lucide-react';
import { useTranslationWithVoice } from '../hooks/useTranslationWithVoice';
import { textToSpeech } from '../utils/textToSpeech';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
}

const languages: Language[] = [
  { 
    code: 'en', 
    name: 'English', 
    nativeName: 'English', 
    flag: '🇺🇸',
    description: 'Global language for international users'
  },
  { 
    code: 'hi', 
    name: 'Hindi', 
    nativeName: 'हिन्दी', 
    flag: '🇮🇳',
    description: 'भारत की राष्ट्रीय भाषा'
  },
  { 
    code: 'bn', 
    name: 'Bengali', 
    nativeName: 'বাংলা', 
    flag: '🇧🇩',
    description: 'বাংলাদেশের প্রধান ভাষা'
  },
  { 
    code: 'ta', 
    name: 'Tamil', 
    nativeName: 'தமிழ்', 
    flag: '🇮🇳',
    description: 'தமிழ்நாட்டின் முதன்மை மொழி'
  },
  { 
    code: 'te', 
    name: 'Telugu', 
    nativeName: 'తెలుగు', 
    flag: '🇮🇳',
    description: 'ఆంధ్రప్రదేశ్ ప్రధాన భాష'
  },
  { 
    code: 'mr', 
    name: 'Marathi', 
    nativeName: 'मराठी', 
    flag: '🇮🇳',
    description: 'महाराष्ट्राची प्रमुख भाषा'
  },
  { 
    code: 'gu', 
    name: 'Gujarati', 
    nativeName: 'ગુજરાતી', 
    flag: '🇮🇳',
    description: 'ગુજરાતની મુખ્ય ભાષા'
  },
  { 
    code: 'kn', 
    name: 'Kannada', 
    nativeName: 'ಕನ್ನಡ', 
    flag: '🇮🇳',
    description: 'ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಭಾಷೆ'
  },
  { 
    code: 'ml', 
    name: 'Malayalam', 
    nativeName: 'മലയാളം', 
    flag: '🇮🇳',
    description: 'കേരളത്തിന്റെ പ്രധാന ഭാഷ'
  },
  { 
    code: 'pa', 
    name: 'Punjabi', 
    nativeName: 'ਪੰਜਾਬੀ', 
    flag: '🇮🇳',
    description: 'ਪੰਜਾਬ ਦੀ ਮੁੱਖ ਭਾਸ਼ਾ'
  },
];

interface EnhancedLanguagePageProps {
  onLanguageSelect: (languageCode: string) => void;
}

export default function EnhancedLanguagePage({ onLanguageSelect }: EnhancedLanguagePageProps) {
  const { tForJSX, speakText } = useTranslationWithVoice();
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [showGuidance, setShowGuidance] = useState(false);

  useEffect(() => {
    // Welcome message with voice guidance
    const welcomeMessage = "Welcome to KHELSETU! Please select your preferred language to continue. You can also enable voice guidance to help you navigate through the app.";
    if (isVoiceEnabled) {
      setTimeout(() => {
        textToSpeech.speak(welcomeMessage);
        setShowGuidance(true);
      }, 1000);
    }
  }, [isVoiceEnabled]);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    
    // Change the app language immediately
    i18n.changeLanguage(languageCode);
    
    if (isVoiceEnabled) {
      const language = languages.find(lang => lang.code === languageCode);
      if (language) {
        // Wait a moment for the language to change, then speak in the new language
        setTimeout(() => {
          const message = `You have selected ${language.nativeName}. This will be your language for the entire app. Click continue to proceed to the login page.`;
          textToSpeech.speak(message);
        }, 500);
      }
    }
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      if (isVoiceEnabled) {
        // Use translated text for the continue message
        const continueMessage = tForJSX('auth.continueToLogin', 'Great! Now you will be taken to the login page where you can sign in or create a new account.');
        textToSpeech.speak(continueMessage);
      }
      onLanguageSelect(selectedLanguage);
    }
  };

  const toggleVoice = () => {
    const newVoiceState = !isVoiceEnabled;
    setIsVoiceEnabled(newVoiceState);
    textToSpeech.setEnabled(newVoiceState);
    
    if (newVoiceState) {
      const voiceMessage = tForJSX('common.voiceEnabled', 'Voice guidance enabled. I will help you navigate through the app.');
      textToSpeech.speak(voiceMessage);
    } else {
      textToSpeech.stop();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <Card className="backdrop-blur-sm bg-white/90 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Header with Voice Toggle */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{tForJSX('languageSelection.title', 'Choose Your Language')}</h2>
                  <p className="text-sm text-gray-600">{tForJSX('languageSelection.subtitle', 'Select your preferred language for the app')}</p>
                </div>
              </div>
              
              {/* Voice Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoice}
                className={`h-12 w-12 ${
                  isVoiceEnabled 
                    ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
                }`}
                title={isVoiceEnabled ? 'Disable voice guidance' : 'Enable voice guidance'}
              >
                {isVoiceEnabled ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Voice Guidance Indicator */}
            {showGuidance && isVoiceEnabled && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium">{tForJSX('common.voiceGuidanceActive', 'Voice Guidance Active')}</p>
                    <p className="text-blue-600 text-sm">{tForJSX('common.voiceGuidanceHelp', 'I\'ll help you navigate through the app')}</p>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Language Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {languages.map((language) => (
                <div
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedLanguage === language.code
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {selectedLanguage === language.code && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div className="text-center space-y-3">
                    <div className="text-3xl">{language.flag}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{language.nativeName}</h3>
                      <p className="text-xs text-gray-600">{language.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 leading-tight">{language.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Button */}
            {selectedLanguage && (
              <div className="flex justify-center pt-6 animate-fade-in">
                <Button
                  onClick={handleContinue}
                  className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3"
                >
                  <span className="font-semibold">{tForJSX('common.continue', 'Continue')}</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Help Text */}
            <div className="text-center text-sm text-gray-500 space-y-2">
              <p>💡 <strong>{tForJSX('common.tip', 'Tip')}:</strong> {tForJSX('languageSelection.voiceTip', 'Enable voice guidance for step-by-step assistance')}</p>
              <p>🌍 {tForJSX('languageSelection.languageSaved', 'Your language preference will be saved for future visits')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

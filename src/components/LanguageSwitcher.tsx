import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  Volume2, 
  VolumeX, 
  Globe, 
  Check 
} from 'lucide-react';
import { textToSpeech } from '../utils/textToSpeech';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    // Set the language for text-to-speech
    textToSpeech.setLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setCurrentLanguage(languageCode);
    textToSpeech.setLanguage(languageCode);
    
    // Speak the language change confirmation
    if (isVoiceEnabled) {
      const language = languages.find(lang => lang.code === languageCode);
      if (language) {
        textToSpeech.speak(`Language changed to ${language.nativeName}`);
      }
    }
  };

  const toggleVoice = () => {
    const newVoiceState = !isVoiceEnabled;
    setIsVoiceEnabled(newVoiceState);
    textToSpeech.setEnabled(newVoiceState);
    
    if (newVoiceState) {
      textToSpeech.speak(t('common.voiceEnabled', 'Voice enabled'));
    } else {
      textToSpeech.stop();
    }
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <div className="flex items-center space-x-2">
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
        title={isVoiceEnabled ? 'Disable voice' : 'Enable voice'}
      >
        {isVoiceEnabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>

      {/* Language Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="h-10 px-3 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            <Globe className="h-4 w-4 mr-2" />
            <span className="mr-2">{currentLang.flag}</span>
            <span className="hidden sm:inline">{currentLang.nativeName}</span>
            <span className="sm:hidden">{currentLang.code.toUpperCase()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-xs text-gray-500">{language.name}</span>
                </div>
              </div>
              {currentLanguage === language.code && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { useEffect, useCallback } from 'react';
import { textToSpeech } from '../utils/textToSpeech';

export function useTranslationWithVoice() {
  const { t, i18n } = useTranslation();

  // Update text-to-speech language when i18n language changes
  useEffect(() => {
    textToSpeech.setLanguage(i18n.language);
  }, [i18n.language]);

  const tWithVoice = useCallback((key: string, options?: any, speakText?: boolean) => {
    const translatedText = t(key, options);
    
    // Speak the text if voice is enabled and speakText is true
    if (speakText && textToSpeech.isSpeechEnabled()) {
      textToSpeech.speak(String(translatedText));
    }
    
    return translatedText;
  }, [t]);

  const tForJSX = useCallback((key: string, options?: any) => {
    return t(key, options) as string;
  }, [t]);

  const speakText = useCallback((text: string) => {
    if (textToSpeech.isSpeechEnabled()) {
      textToSpeech.speak(text);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    textToSpeech.stop();
  }, []);

  return {
    t: tWithVoice,
    tSilent: t, // For cases where you don't want voice
    tForJSX, // For JSX content that needs proper typing
    speakText,
    stopSpeaking,
    i18n,
    currentLanguage: i18n.language,
    isVoiceEnabled: textToSpeech.isSpeechEnabled(),
  };
}

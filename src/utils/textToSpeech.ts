export interface VoiceSettings {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
}

export class TextToSpeechService {
  private static instance: TextToSpeechService;
  private isEnabled: boolean = true;
  private currentLanguage: string = 'en';

  private constructor() {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      this.isEnabled = false;
    }
  }

  public static getInstance(): TextToSpeechService {
    if (!TextToSpeechService.instance) {
      TextToSpeechService.instance = new TextToSpeechService();
    }
    return TextToSpeechService.instance;
  }

  public setLanguage(language: string): void {
    this.currentLanguage = language;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isSpeechEnabled(): boolean {
    return this.isEnabled;
  }

  public speak(text: string, settings?: VoiceSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isEnabled || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice based on language
      const voices = speechSynthesis.getVoices();
      const preferredVoice = this.getPreferredVoice(voices, this.currentLanguage);
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Apply settings
      utterance.rate = settings?.rate || 0.9;
      utterance.pitch = settings?.pitch || 1;
      utterance.volume = settings?.volume || 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);

      speechSynthesis.speak(utterance);
    });
  }

  public stop(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  public pause(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.pause();
    }
  }

  public resume(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.resume();
    }
  }

  private getPreferredVoice(voices: SpeechSynthesisVoice[], language: string): SpeechSynthesisVoice | null {
    // Language code mapping
    const languageMap: { [key: string]: string[] } = {
      'en': ['en-US', 'en-GB', 'en'],
      'hi': ['hi-IN', 'hi'],
      'bn': ['bn-BD', 'bn-IN', 'bn'],
      'ta': ['ta-IN', 'ta'],
      'te': ['te-IN', 'te'],
      'mr': ['mr-IN', 'mr'],
      'gu': ['gu-IN', 'gu'],
      'kn': ['kn-IN', 'kn'],
      'ml': ['ml-IN', 'ml'],
      'pa': ['pa-IN', 'pa']
    };

    const preferredCodes = languageMap[language] || ['en'];
    
    // Try to find a voice for the preferred language
    for (const code of preferredCodes) {
      const voice = voices.find(v => v.lang.startsWith(code));
      if (voice) {
        return voice;
      }
    }

    // Fallback to default voice
    return voices.find(v => v.default) || voices[0] || null;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) {
      return [];
    }
    return speechSynthesis.getVoices();
  }

  public getSupportedLanguages(): string[] {
    const voices = this.getAvailableVoices();
    const languages = new Set<string>();
    
    voices.forEach(voice => {
      const lang = voice.lang.split('-')[0];
      languages.add(lang);
    });
    
    return Array.from(languages).sort();
  }
}

// Export singleton instance
export const textToSpeech = TextToSpeechService.getInstance();

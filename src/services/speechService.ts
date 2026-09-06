// Speech Recognition & Synthesis Service with Web Speech API and Audio Synthesizer

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

class SpeechService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.isSupported = true;
      }
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public startListening(
    langCode: string,
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser. You can use typed input or demo mode.');
      return;
    }

    try {
      this.playTone(440, 0.1); // subtle chime
      this.recognition.lang = langCode;
      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        let confidence = 0.9;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript;
            confidence = res[0].confidence || 0.9;
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        onResult({
          transcript: finalTranscript || interimTranscript,
          isFinal: Boolean(finalTranscript),
          confidence,
        });
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError(event.error || 'Speech capture failed');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
    } catch (err: any) {
      this.isListening = false;
      onError(err.message || 'Microphone initiation error');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.playTone(330, 0.1);
      } catch (e) {
        console.error(e);
      }
      this.isListening = false;
    }
  }

  public speakText(text: string, langCode: string, onEnd?: () => void) {
    if (!this.synthesis) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synthesis.cancel(); // Stop any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.95; // Slightly slower for clear clinical understanding
      utterance.pitch = 1.0;

      // Find best available voice for language
      const voices = this.synthesis.getVoices();
      const matchedVoice = voices.find((v) => v.lang.startsWith(langCode) || v.lang.includes(langCode));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      this.synthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Web Audio chime generator for pleasant clinical feedback
  private playTone(frequency: number, duration: number) {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx) {
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }
}

export const speechService = new SpeechService();

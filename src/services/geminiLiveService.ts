import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';

interface AudioConfig {
  inputSampleRate: number;
  outputSampleRate: number;
  bufferSize: number;
}

interface VoiceConfig {
  voiceName: string;
  languageCode: string;
}

export interface GeminiLiveConfig {
  audio: AudioConfig;
  voice: VoiceConfig;
}

export interface AudioProcessor {
  onAudioData: (audioData: Float32Array) => void;
  onAudioEnd: () => void;
}

export class GeminiLiveService {
  private client: GoogleGenAI;
  private session: Session | null = null;
  private inputContext: AudioContext;
  private outputContext: AudioContext;
  private nextStartTime = 0;
  private audioSources = new Set<AudioBufferSourceNode>();
  private scriptProcessor: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private mediaStream: MediaStream | null = null;
  private isRecording = false;

  private readonly defaultConfig: GeminiLiveConfig = {
    audio: {
      inputSampleRate: 16000,
      outputSampleRate: 24000,
      bufferSize: 256
    },
    voice: {
      voiceName: 'Orus',
      languageCode: 'es-CO'
    }
  };

  constructor(apiKey: string, config: Partial<GeminiLiveConfig> = {}) {
    this.client = new GoogleGenAI({ apiKey });
    
    const mergedConfig = {
      ...this.defaultConfig,
      ...config,
      audio: { ...this.defaultConfig.audio, ...config.audio },
      voice: { ...this.defaultConfig.voice, ...config.voice }
    };

    // Inicializar contextos de audio
    const AudioContextClass = window.AudioContext;
    this.inputContext = new AudioContextClass({
      sampleRate: mergedConfig.audio.inputSampleRate
    });

    this.outputContext = new AudioContextClass({
      sampleRate: mergedConfig.audio.outputSampleRate
    });
  }

  async connect(callbacks: {
    onOpen?: () => void;
    onMessage?: (message: LiveServerMessage) => void;
    onError?: (error: Error) => void;
    onClose?: (reason: string) => void;
  } = {}): Promise<void> {
    try {
      console.log('🔄 Conectando con Gemini Live...');
      
      this.session = await this.client.live.connect({
        model: 'gemini-2.5-flash-preview-native-audio-dialog',
        callbacks: {
          onopen: () => {
            console.log('✅ Conexión establecida con Gemini Live');
            callbacks.onOpen?.();
          },
          onmessage: async (message: LiveServerMessage) => {
            try {
              const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData;
              
              if (audio) {
                await this.processAudioResponse(audio);
              }

              // Manejar interrupciones
              if (message.serverContent?.interrupted) {
                this.handleInterruption();
              }

              callbacks.onMessage?.(message);
            } catch (error) {
              console.error('❌ Error procesando mensaje:', error);
              callbacks.onError?.(error as Error);
            }
          },
          onerror: (error: any) => {
            console.error('❌ Error en sesión:', error);
            callbacks.onError?.(error);
          },
          onclose: (event: any) => {
            console.log('👋 Sesión cerrada:', event?.reason);
            callbacks.onClose?.(event?.reason || 'Unknown reason');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.defaultConfig.voice.voiceName
              }
            },
            languageCode: this.defaultConfig.voice.languageCode
          }
        }
      });

      console.log('🎙️ Inicializando contextos de audio...');
      await this.inputContext.resume();
      await this.outputContext.resume();
      
    } catch (error) {
      console.error('❌ Error conectando con Gemini Live:', error);
      throw error;
    }
  }

  async startRecording(): Promise<void> {
    if (this.isRecording || !this.session) {
      return;
    }

    try {
      console.log('🎙️ Solicitando acceso al micrófono...');
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      console.log('✅ Acceso al micrófono concedido');
      
      // Crear nodo de fuente de audio
      this.sourceNode = this.inputContext.createMediaStreamSource(this.mediaStream);
      
      // Crear procesador de script
      this.scriptProcessor = this.inputContext.createScriptProcessor(
        this.defaultConfig.audio.bufferSize,
        1, // mono input
        1  // mono output
      );

      // Configurar procesamiento de audio
      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.isRecording) return;

        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Enviar audio a Gemini
        this.session?.sendRealtimeInput({
          media: this.createAudioBlob(inputData)
        });
      };

      // Conectar nodos
      this.sourceNode.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputContext.destination);

      this.isRecording = true;
      console.log('🎙️ Grabación iniciada');

    } catch (error) {
      console.error('❌ Error iniciando grabación:', error);
      this.stopRecording();
      throw error;
    }
  }

  stopRecording(): void {
    if (!this.isRecording) return;

    console.log('🛑 Deteniendo grabación...');
    
    this.isRecording = false;

    // Limpiar nodos de audio
    if (this.scriptProcessor && this.sourceNode) {
      this.scriptProcessor.disconnect();
      this.sourceNode.disconnect();
    }

    this.scriptProcessor = null;
    this.sourceNode = null;

    // Detener streams
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    console.log('✅ Grabación detenida');
  }

  private async processAudioResponse(audio: any): Promise<void> {
    try {
      // Calcular próximo tiempo de inicio
      this.nextStartTime = Math.max(
        this.nextStartTime,
        this.outputContext.currentTime
      );

      // Decodificar audio
      const audioBuffer = await this.decodeAudioData(
        this.decodeBase64(audio.data)
      );

      // Crear y configurar fuente
      const source = this.outputContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputContext.destination);
      
      // Limpiar fuente cuando termine
      source.onended = () => {
        this.audioSources.delete(source);
      };

      // Reproducir audio
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      
      // Guardar referencia
      this.audioSources.add(source);

    } catch (error) {
      console.error('❌ Error procesando audio:', error);
      throw error;
    }
  }

  private handleInterruption(): void {
    console.log('🔄 Manejando interrupción...');
    
    // Detener todas las fuentes de audio
    this.audioSources.forEach(source => {
      source.stop();
      this.audioSources.delete(source);
    });

    // Resetear timing
    this.nextStartTime = 0;
  }

  private createAudioBlob(data: Float32Array): any {
    // Convertir Float32Array (-1 a 1) a Int16Array (-32768 a 32767)
    const length = data.length;
    const int16Data = new Int16Array(length);
    
    for (let i = 0; i < length; i++) {
      int16Data[i] = data[i] * 32768;
    }

    return {
      data: this.encodeBase64(new Uint8Array(int16Data.buffer)),
      mimeType: `audio/pcm;rate=${this.defaultConfig.audio.inputSampleRate}`
    };
  }

  private async decodeAudioData(data: Uint8Array): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      this.outputContext.decodeAudioData(
        data.buffer,
        buffer => resolve(buffer),
        error => reject(error)
      );
    });
  }

  private encodeBase64(bytes: Uint8Array): string {
    let binary = '';
    const length = bytes.byteLength;
    for (let i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  disconnect(): void {
    this.stopRecording();
    this.session?.close();
    this.session = null;
    console.log('👋 Desconectado de Gemini Live');
  }
}
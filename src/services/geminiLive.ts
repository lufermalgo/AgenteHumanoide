/**
 * Gemini Live API integration for real-time voice processing
 * Provides better transcription, natural conversation, and low latency
 */

import { GoogleGenAI, type LiveConfig } from '@google/genai';

export interface GeminiLiveConfig {
  model?: string;
  systemInstruction?: string;
  responseModalities?: Array<'AUDIO' | 'TEXT'>;
  voiceConfig?: {
    voice?: string; // e.g., 'Puck', 'Charon', 'Kore', 'Fenrir'
    language?: string; // e.g., 'es-ES', 'es-CO'
  };
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiLiveResponse {
  text?: string;
  audio?: ArrayBuffer;
  isComplete: boolean;
  confidence?: number;
}

export class GeminiLiveService {
  private client: GoogleGenAI;
  private session: any = null;
  private isConnected = false;
  private messageQueue: any[] = [];

  constructor(apiKey?: string) {
    this.client = new GoogleGenAI({
      apiKey: apiKey || process.env.REACT_APP_GEMINI_API_KEY || ''
    });
  }

  /**
   * Conectar al Gemini Live API con configuración optimizada para español colombiano
   */
  async connect(config: GeminiLiveConfig = {}): Promise<void> {
    try {
      const defaultConfig: LiveConfig = {
        model: config.model || 'gemini-2.5-flash-preview-native-audio-dialog',
        responseModalities: config.responseModalities || ['AUDIO', 'TEXT'],
        systemInstruction: config.systemInstruction || `
          Eres un asistente virtual amigable para realizar un assessment sobre IA generativa.
          Habla de forma natural, cercana y con un tono ligeramente paisa (colombiano), sin exageraciones.
          Haz preguntas claras y escucha las respuestas completas antes de continuar.
          No interrumpas innecesariamente, pero mantén el flujo conversacional.
          Usa puntuación y gramática correcta en tus transcripciones.
        `,
        speechConfig: {
          voice: config.voiceConfig?.voice || 'Puck', // Voz más neutral
          language: config.voiceConfig?.language || 'es-ES' // Español (se puede cambiar a es-CO si está disponible)
        },
        generationConfig: {
          temperature: config.generationConfig?.temperature || 0.7,
          maxOutputTokens: config.generationConfig?.maxOutputTokens || 2048
        }
      };

      console.log('🧠 Conectando a Gemini Live API...');
      
      this.session = await this.client.live.connect({
        config: defaultConfig,
        callbacks: {
          onopen: () => {
            console.log('✅ Gemini Live API conectado');
            this.isConnected = true;
          },
          onmessage: (message) => {
            this.handleMessage(message);
          },
          onerror: (error) => {
            console.error('❌ Error en Gemini Live API:', error);
            this.isConnected = false;
          },
          onclose: (reason) => {
            console.log('🔌 Gemini Live API desconectado:', reason);
            this.isConnected = false;
          }
        }
      });

    } catch (error) {
      console.error('❌ Error conectando a Gemini Live API:', error);
      throw new Error(`Failed to connect to Gemini Live API: ${error}`);
    }
  }

  /**
   * Enviar audio en tiempo real al modelo
   */
  async sendAudio(audioData: ArrayBuffer, mimeType: string = 'audio/pcm;rate=16000'): Promise<void> {
    if (!this.isConnected || !this.session) {
      throw new Error('Gemini Live API no está conectado');
    }

    try {
      // Convertir ArrayBuffer a base64
      const base64Audio = this.arrayBufferToBase64(audioData);
      
      await this.session.sendRealtimeInput({
        audio: {
          data: base64Audio,
          mimeType: mimeType
        }
      });

      console.log('🎙️ Audio enviado a Gemini Live API');
    } catch (error) {
      console.error('❌ Error enviando audio:', error);
      throw error;
    }
  }

  /**
   * Enviar texto al modelo
   */
  async sendText(text: string): Promise<void> {
    if (!this.isConnected || !this.session) {
      throw new Error('Gemini Live API no está conectado');
    }

    try {
      await this.session.sendRealtimeInput({
        text: text
      });

      console.log('📝 Texto enviado a Gemini Live API:', text);
    } catch (error) {
      console.error('❌ Error enviando texto:', error);
      throw error;
    }
  }

  /**
   * Manejar mensajes del modelo
   */
  private handleMessage(message: any): void {
    this.messageQueue.push(message);
    
    // Log para debug
    console.log('📨 Mensaje de Gemini Live:', message);
    
    // Procesar diferentes tipos de mensajes
    if (message.data) {
      // Audio response
      this.onAudioResponse?.(message.data);
    }
    
    if (message.serverContent?.modelTurn?.parts) {
      // Text response
      const textParts = message.serverContent.modelTurn.parts
        .filter((part: any) => part.text)
        .map((part: any) => part.text);
      
      if (textParts.length > 0) {
        this.onTextResponse?.(textParts.join(' '));
      }
    }
    
    if (message.serverContent?.turnComplete) {
      // Turn completed
      this.onTurnComplete?.();
    }
  }

  /**
   * Obtener respuestas procesadas
   */
  async getResponses(): Promise<GeminiLiveResponse[]> {
    const responses: GeminiLiveResponse[] = [];
    
    // Procesar cola de mensajes
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      
      const response: GeminiLiveResponse = {
        isComplete: message.serverContent?.turnComplete || false
      };
      
      if (message.data) {
        // Convertir base64 a ArrayBuffer
        response.audio = this.base64ToArrayBuffer(message.data);
      }
      
      if (message.serverContent?.modelTurn?.parts) {
        const textParts = message.serverContent.modelTurn.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text);
        
        if (textParts.length > 0) {
          response.text = textParts.join(' ');
        }
      }
      
      responses.push(response);
    }
    
    return responses;
  }

  /**
   * Callbacks para eventos
   */
  onAudioResponse?: (audioData: string) => void;
  onTextResponse?: (text: string) => void;
  onTurnComplete?: () => void;

  /**
   * Desconectar del servicio
   */
  async disconnect(): Promise<void> {
    if (this.session) {
      await this.session.close();
      this.session = null;
    }
    this.isConnected = false;
    this.messageQueue = [];
    console.log('🔌 Desconectado de Gemini Live API');
  }

  /**
   * Verificar si está conectado
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Utilidades para conversión de datos
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Configurar sistema de instrucciones dinámicamente
   */
  async updateSystemInstruction(instruction: string): Promise<void> {
    if (!this.isConnected || !this.session) {
      throw new Error('Gemini Live API no está conectado');
    }

    try {
      await this.session.updateConfig({
        systemInstruction: instruction
      });
      console.log('📋 Sistema de instrucciones actualizado');
    } catch (error) {
      console.error('❌ Error actualizando instrucciones:', error);
      throw error;
    }
  }
}

/**
 * Configuración predeterminada para el assessment de IA
 */
export const ASSESSMENT_GEMINI_CONFIG: GeminiLiveConfig = {
  model: 'gemini-2.5-flash-preview-native-audio-dialog',
  systemInstruction: `
    Eres un asistente virtual para realizar un assessment de conocimiento sobre IA generativa en Summan SAS.
    
    PERSONALIDAD:
    - Habla de forma natural, amigable y cercana
    - Usa un tono ligeramente paisa (colombiano) sin exagerar
    - Sé empático y comprensivo
    - No juzgues las respuestas, solo escucha y guía
    
    COMPORTAMIENTO:
    - Lee cada pregunta claramente y espera la respuesta completa
    - No interrumpas al usuario mientras habla
    - Usa transcripción con puntuación y gramática correcta
    - Confirma que entendiste antes de continuar
    - Mantén el foco en el assessment
    
    FLUJO:
    1. Lee la pregunta en voz alta
    2. Escucha la respuesta completa del usuario
    3. Confirma brevemente que entendiste
    4. Continúa a la siguiente pregunta
    
    No des opiniones ni retroalimentación sobre las respuestas.
    Tu objetivo es recopilar información, no educar.
  `,
  responseModalities: ['AUDIO', 'TEXT'],
  voiceConfig: {
    voice: 'Puck', // Voz más neutral y profesional
    language: 'es-ES' // Español (cambiar a es-CO si está disponible)
  },
  generationConfig: {
    temperature: 0.6, // Menos variabilidad para consistencia
    maxOutputTokens: 1024 // Respuestas concisas
  }
};
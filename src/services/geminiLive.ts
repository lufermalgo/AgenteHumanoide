/**
 * Gemini Live API integration for real-time voice processing
 * Provides better transcription, natural conversation, and low latency
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

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
  private client: GoogleGenerativeAI;
  private model: any = null;
  private isConnected = false;
  private messageQueue: any[] = [];

  constructor(apiKey?: string) {
    this.client = new GoogleGenerativeAI(
      apiKey || process.env.REACT_APP_GEMINI_API_KEY || ''
    );
  }

  /**
   * Conectar al modelo Gemini con configuración optimizada para español colombiano
   */
  async connect(config: GeminiLiveConfig = {}): Promise<void> {
    try {
      console.log('🧠 Inicializando Gemini AI...');
      
      const modelName = config.model || 'gemini-1.5-flash';
      this.model = this.client.getGenerativeModel({ 
        model: modelName,
        systemInstruction: config.systemInstruction || `
          Eres un asistente virtual amigable para realizar un assessment sobre IA generativa.
          Habla de forma natural, cercana y con un tono ligeramente paisa (colombiano), sin exageraciones.
          Haz preguntas claras y escucha las respuestas completas antes de continuar.
          No interrumpas innecesariamente, pero mantén el flujo conversacional.
          Usa puntuación y gramática correcta en tus transcripciones.
          Responde de forma concisa y natural.
        `,
        generationConfig: {
          temperature: config.generationConfig?.temperature || 0.7,
          maxOutputTokens: config.generationConfig?.maxOutputTokens || 1024
        }
      });

      this.isConnected = true;
      console.log('✅ Gemini AI inicializado correctamente');

    } catch (error) {
      console.error('❌ Error inicializando Gemini AI:', error);
      this.isConnected = false;
      throw new Error(`Failed to initialize Gemini AI: ${error}`);
    }
  }

  /**
   * Procesar audio con Gemini AI
   */
  async processAudio(audioData: ArrayBuffer, mimeType: string = 'audio/webm'): Promise<string> {
    if (!this.isConnected || !this.model) {
      throw new Error('Gemini AI no está conectado');
    }

    try {
      // Convertir ArrayBuffer a base64
      const base64Audio = this.arrayBufferToBase64(audioData);
      
      const result = await this.model.generateContent([
        {
          inlineData: {
            data: base64Audio,
            mimeType: mimeType
          }
        },
        "Transcribe este audio a texto. Usa puntuación correcta y gramática apropiada. Responde solo con la transcripción, sin comentarios adicionales."
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log('🎙️ Audio procesado por Gemini AI:', text);
      return text;
    } catch (error) {
      console.error('❌ Error procesando audio:', error);
      throw error;
    }
  }

  /**
   * Generar respuesta de texto con Gemini AI
   */
  async generateTextResponse(text: string): Promise<string> {
    if (!this.isConnected || !this.model) {
      throw new Error('Gemini AI no está conectado');
    }

    try {
      const result = await this.model.generateContent(text);
      const response = await result.response;
      const responseText = response.text();
      
      console.log('📝 Respuesta generada por Gemini AI:', responseText);
      return responseText;
    } catch (error) {
      console.error('❌ Error generando respuesta:', error);
      throw error;
    }
  }

  /**
   * Callbacks para eventos (mantenidos para compatibilidad)
   */
  onAudioResponse?: (audioData: string) => void;
  onTextResponse?: (text: string) => void;
  onTurnComplete?: () => void;

  /**
   * Desconectar del servicio
   */
  async disconnect(): Promise<void> {
    this.model = null;
    this.isConnected = false;
    this.messageQueue = [];
    console.log('🔌 Desconectado de Gemini AI');
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
   * (Requiere reconectar el modelo con nueva configuración)
   */
  async updateSystemInstruction(instruction: string): Promise<void> {
    console.log('📋 Para cambiar instrucciones del sistema, reconecta el servicio');
  }
}

/**
 * Configuración predeterminada para el assessment de IA
 */
export const ASSESSMENT_GEMINI_CONFIG: GeminiLiveConfig = {
  model: 'gemini-1.5-flash',
  systemInstruction: `
    Eres un asistente virtual para realizar un assessment de conocimiento sobre IA generativa en Summan SAS.
    
    PERSONALIDAD:
    - Habla de forma natural, amigable y cercana
    - Usa un tono ligeramente paisa (colombiano) sin exagerar
    - Sé empático y comprensivo
    - No juzgues las respuestas, solo escucha y guía
    
    COMPORTAMIENTO:
    - Ayuda a transcribir audio con puntuación y gramática correcta
    - Confirma que entendiste las respuestas del usuario
    - Mantén el foco en el assessment
    - Responde de forma concisa y natural
    
    Tu objetivo es ayudar en la transcripción y comprensión, no educar.
  `,
  generationConfig: {
    temperature: 0.3, // Baja variabilidad para transcripción consistente
    maxOutputTokens: 512 // Respuestas concisas
  }
};
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export class GeminiService {
  private model: GenerativeModel;
  private chat: any; // TODO: Actualizar tipo cuando esté disponible en la API

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'test-key');
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-native-audio-dialog',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Inicializar chat con el contexto del assessment
    this.initializeChat();
  }

  private async initializeChat() {
    this.chat = await this.model.startChat({
      history: [
        {
          role: 'user',
          parts: 'Eres un agente humanoide amigable que está realizando un assessment de conocimientos en IA generativa. Debes ser empático, natural y mantener un tono cercano y ligeramente paisa (colombiano). No des opiniones ni retroalimentación sobre las respuestas.',
        },
        {
          role: 'model',
          parts: 'Entendido. Seré un agente amigable y empático, manteniendo un tono cercano y paisa. Mi rol es guiar el assessment sin dar opiniones o retroalimentación sobre las respuestas. ¿Empezamos?',
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
  }

  async *streamAudioResponse(audioChunk: ArrayBuffer) {
    try {
      // Enviar chunk de audio al modelo
      const result = await this.chat.sendMessage({
        role: 'user',
        parts: {
          audio: audioChunk,
        },
      });

      // Stream de la respuesta
      for await (const chunk of result.stream()) {
        yield chunk.text;
      }
    } catch (error) {
      console.error('Error en streamAudioResponse:', error);
      throw error;
    }
  }

  async *streamTextResponse(text: string) {
    try {
      const result = await this.chat.sendMessage({
        role: 'user',
        parts: text,
      });

      for await (const chunk of result.stream()) {
        yield chunk.text;
      }
    } catch (error) {
      console.error('Error en streamTextResponse:', error);
      throw error;
    }
  }
}
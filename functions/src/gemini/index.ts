import * as functions from 'firebase-functions';
import cors from 'cors';

const corsHandler = cors({ origin: true });

/**
 * Placeholder para integración con Gemini Live API
 * Se implementará en el Día 2 del sprint
 */
export const assessmentiaProcessAudio = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      // TODO: Implementar integración con Gemini Live API
      // - Recibir audio del frontend
      // - Enviar a Gemini Live para transcripción
      // - Procesar respuesta del agente
      // - Retornar texto transcrito y respuesta del agente

      return res.status(501).json({ 
        error: 'Not implemented yet',
        message: 'Gemini Live API integration scheduled for Day 2'
      });

    } catch (error) {
      console.error('Error processing audio:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
});

/**
 * Placeholder para generación de respuestas del agente
 */
export const assessmentiaGenerateResponse = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      // TODO: Implementar lógica del agente
      // - Recibir transcripción del usuario
      // - Generar respuesta contextual del agente paisa
      // - Validar si respuesta es suficiente
      // - Sugerir continuar o solicitar más información

      return res.status(501).json({ 
        error: 'Not implemented yet',
        message: 'Agent response generation scheduled for Day 2'
      });

    } catch (error) {
      console.error('Error generating response:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
});
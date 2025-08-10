"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = exports.stt = exports.tts = exports.onAssessmentStart = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const path = require("node:path");
// Cargar .env local para emulador (no se sube a producción)
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
    // eslint-disable-next-line no-empty
}
catch { }
admin.initializeApp();
exports.onAssessmentStart = functions.https.onCall(async (request) => {
    // Validar autenticación
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
    }
    const userEmail = request.auth.token.email;
    if (!userEmail?.endsWith('@summan.com')) {
        throw new functions.https.HttpsError('permission-denied', 'Dominio de correo no autorizado');
    }
    // Crear nueva sesión
    const sessionId = admin.firestore().collection('assessmentia-sessions').doc().id;
    await admin.firestore().collection('assessmentia-sessions').doc(sessionId).set({
        userId: request.auth.uid,
        userEmail,
        startTime: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        responses: []
    });
    return { sessionId };
});
// Utilidad simple para construir cabecera WAV para PCM16 mono
function buildWavHeader(pcmBuffer, sampleRate = 24000, channels = 1) {
    const bitsPerSample = 16;
    const byteRate = (sampleRate * channels * bitsPerSample) / 8;
    const blockAlign = (channels * bitsPerSample) / 8;
    const dataSize = pcmBuffer.length;
    const chunkSize = 36 + dataSize;
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(chunkSize, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);
    return header;
}
exports.tts = functions.https.onRequest(async (req, res) => {
    // CORS para desarrollo local
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: 'Gemini API key not configured' });
            return;
        }
        const { text, voiceName = 'Kore' } = (req.body || {});
        if (!text || typeof text !== 'string') {
            res.status(400).json({ error: 'Missing text' });
            return;
        }
        const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=' + apiKey;
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text,
                        },
                    ],
                },
            ],
            generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName,
                        },
                    },
                },
            },
        };
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            const errText = await response.text();
            res.status(response.status).json({ error: 'Gemini TTS error', details: errText });
            return;
        }
        const json = (await response.json());
        const base64Audio = json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
        if (!base64Audio) {
            res.status(500).json({ error: 'No audio returned', details: json });
            return;
        }
        const pcmBuffer = Buffer.from(base64Audio, 'base64');
        const header = buildWavHeader(pcmBuffer, 24000, 1);
        const wavBuffer = Buffer.concat([header, pcmBuffer]);
        res.set('Content-Type', 'audio/wav');
        res.status(200).send(wavBuffer);
    }
    catch (error) {
        res.status(500).json({ error: 'Unhandled error', message: String(error?.message || error) });
    }
});
exports.stt = functions.https.onRequest(async (req, res) => {
    // CORS para desarrollo local
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: 'Gemini API key not configured' });
            return;
        }
        const { audioBase64, mimeType = 'audio/wav' } = (req.body || {});
        if (!audioBase64) {
            res.status(400).json({ error: 'Missing audioBase64' });
            return;
        }
        const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            inlineData: {
                                mimeType,
                                data: audioBase64,
                            },
                        },
                        {
                            text: 'Transcribe exactamente el audio al español (es-CO) con buena puntuación. Devuelve solo el texto de la transcripción.'
                        }
                    ],
                },
            ],
        };
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            const errText = await response.text();
            res.status(response.status).json({ error: 'Gemini STT error', details: errText });
            return;
        }
        const json = (await response.json());
        const text = json?.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
        if (!text) {
            res.status(500).json({ error: 'No text returned', details: json });
            return;
        }
        res.status(200).json({ text });
    }
    catch (error) {
        res.status(500).json({ error: 'Unhandled error', message: String(error?.message || error) });
    }
});
// Endpoint para generar respuestas dinámicas usando Gemini como LLM
exports.generate = functions.https.onRequest(async (req, res) => {
    // CORS para desarrollo local
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: 'Gemini API key not configured' });
            return;
        }
        const { systemPrompt, userPrompt, maxTokens = 200 } = (req.body || {});
        if (!systemPrompt || !userPrompt) {
            res.status(400).json({ error: 'Missing systemPrompt or userPrompt' });
            return;
        }
        const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: `${systemPrompt}\n\n${userPrompt}`
                        }
                    ],
                },
            ],
            generationConfig: {
                maxOutputTokens: maxTokens,
                temperature: 0.8, // Variabilidad para respuestas más naturales
                topP: 0.9,
                topK: 40
            },
        };
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            const errText = await response.text();
            res.status(response.status).json({ error: 'Gemini generation error', details: errText });
            return;
        }
        const json = (await response.json());
        const text = json?.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
        if (!text) {
            res.status(500).json({ error: 'No text returned', details: json });
            return;
        }
        res.status(200).json({ text: text.trim() });
    }
    catch (error) {
        res.status(500).json({ error: 'Unhandled error', message: String(error?.message || error) });
    }
});
//# sourceMappingURL=index.js.map
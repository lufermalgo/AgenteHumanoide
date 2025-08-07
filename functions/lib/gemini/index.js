"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessmentiaGenerateResponse = exports.assessmentiaProcessAudio = void 0;
const functions = __importStar(require("firebase-functions"));
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({ origin: true });
/**
 * Placeholder para integración con Gemini Live API
 * Se implementará en el Día 2 del sprint
 */
exports.assessmentiaProcessAudio = functions.https.onRequest((req, res) => {
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
        }
        catch (error) {
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
exports.assessmentiaGenerateResponse = functions.https.onRequest((req, res) => {
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
        }
        catch (error) {
            console.error('Error generating response:', error);
            return res.status(500).json({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
});
//# sourceMappingURL=index.js.map
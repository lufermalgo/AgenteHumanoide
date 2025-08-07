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
exports.assessmentiaSynthesizeWithAvatar = exports.assessmentiaCreateAvatar = void 0;
const functions = __importStar(require("firebase-functions"));
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({ origin: true });
/**
 * Placeholder para integración con D-ID API
 * Se implementará en el Día 2 del sprint
 */
exports.assessmentiaCreateAvatar = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }
            // TODO: Implementar integración con D-ID API
            // - Crear avatar humanoide
            // - Configurar sincronización de voz
            // - Retornar stream URL del avatar
            return res.status(501).json({
                error: 'Not implemented yet',
                message: 'D-ID Avatar integration scheduled for Day 2'
            });
        }
        catch (error) {
            console.error('Error creating avatar:', error);
            return res.status(500).json({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
});
/**
 * Placeholder para síntesis de voz con avatar
 */
exports.assessmentiaSynthesizeWithAvatar = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }
            // TODO: Implementar síntesis de voz con avatar
            // - Recibir texto del agente
            // - Enviar a D-ID para síntesis + gesticulación
            // - Retornar video stream del avatar hablando
            return res.status(501).json({
                error: 'Not implemented yet',
                message: 'Avatar voice synthesis scheduled for Day 2'
            });
        }
        catch (error) {
            console.error('Error synthesizing with avatar:', error);
            return res.status(500).json({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
});
//# sourceMappingURL=index.js.map
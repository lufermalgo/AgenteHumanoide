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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeResponseData = exports.calculateSessionDuration = exports.validateSessionData = exports.getTimestamp = exports.extractUserFromToken = exports.validateSummanDomain = void 0;
const admin = __importStar(require("firebase-admin"));
/**
 * Utilidades para validación y helpers del backend
 */
/**
 * Validar que un usuario pertenece al dominio @summan.com
 */
const validateSummanDomain = (email) => {
    return Boolean(email && email.endsWith('@summan.com'));
};
exports.validateSummanDomain = validateSummanDomain;
/**
 * Extraer información del token de autenticación
 */
const extractUserFromToken = async (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Invalid authorization header');
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
    };
};
exports.extractUserFromToken = extractUserFromToken;
/**
 * Generar timestamp para logging
 */
const getTimestamp = () => {
    return new Date().toISOString();
};
exports.getTimestamp = getTimestamp;
/**
 * Validar estructura de datos de sesión
 */
const validateSessionData = (data) => {
    return data &&
        typeof data.userId === 'string' &&
        typeof data.sessionId === 'string' &&
        data.userId.length > 0 &&
        data.sessionId.length > 0;
};
exports.validateSessionData = validateSessionData;
/**
 * Calcular duración de sesión en minutos
 */
const calculateSessionDuration = (startTime, endTime) => {
    const start = startTime.toDate();
    const end = endTime ? endTime.toDate() : new Date();
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // minutos
};
exports.calculateSessionDuration = calculateSessionDuration;
/**
 * Limpiar datos de respuesta para logging
 */
const sanitizeResponseData = (data) => {
    // Remover información sensible antes de logging
    const sanitized = Object.assign({}, data);
    delete sanitized.audioData;
    delete sanitized.rawTranscription;
    return sanitized;
};
exports.sanitizeResponseData = sanitizeResponseData;
//# sourceMappingURL=index.js.map
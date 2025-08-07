import * as admin from 'firebase-admin';

/**
 * Utilidades para validación y helpers del backend
 */

/**
 * Validar que un usuario pertenece al dominio @summan.com
 */
export const validateSummanDomain = (email: string): boolean => {
  return Boolean(email && email.endsWith('@summan.com'));
};

/**
 * Extraer información del token de autenticación
 */
export const extractUserFromToken = async (authHeader: string) => {
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

/**
 * Generar timestamp para logging
 */
export const getTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Validar estructura de datos de sesión
 */
export const validateSessionData = (data: any): boolean => {
  return data && 
         typeof data.userId === 'string' && 
         typeof data.sessionId === 'string' &&
         data.userId.length > 0 &&
         data.sessionId.length > 0;
};

/**
 * Calcular duración de sesión en minutos
 */
export const calculateSessionDuration = (startTime: FirebaseFirestore.Timestamp, endTime?: FirebaseFirestore.Timestamp): number => {
  const start = startTime.toDate();
  const end = endTime ? endTime.toDate() : new Date();
  
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // minutos
};

/**
 * Limpiar datos de respuesta para logging
 */
export const sanitizeResponseData = (data: any) => {
  // Remover información sensible antes de logging
  const sanitized = { ...data };
  delete sanitized.audioData;
  delete sanitized.rawTranscription;
  
  return sanitized;
};
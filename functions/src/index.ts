import * as admin from 'firebase-admin';

// Inicializar Firebase Admin
admin.initializeApp();

// Exportar todas las funciones de cada módulo
export * from './auth';
export * from './assessment';
export * from './gemini';
export * from './did';
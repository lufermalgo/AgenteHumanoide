import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBNj3UtnSNoicuLgnEvM4GBKU0AL3o4lqM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "genai-385616.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "genai-385616",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "genai-385616.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "36072227238",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:36072227238:web:c5c58b3fb150632fd24f67",
  measurementId: "G-HXTVH4FKKJ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// DESARROLLO: Usar Google Auth real en lugar de emuladores
// Comentado para usar autenticación real de Google
// if (process.env.NODE_ENV === 'development') {
//   try {
//     connectAuthEmulator(auth, 'http://127.0.0.1:9099');
//     connectFirestoreEmulator(db, '127.0.0.1', 8080);
//   } catch (error) {
//     console.log('Firebase emulators already connected');
//   }
// }

// Configurar el proveedor de Google
googleProvider.setCustomParameters({
  // prompt: 'select_account', // Comentado para permitir login automático
  hd: 'summan.com' // Restringir a dominio de Summan SAS
});

// Configurar scopes necesarios
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Configurar persistencia de autenticación
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('No se pudo configurar persistencia de auth:', error);
});

export default app;
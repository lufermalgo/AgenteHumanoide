import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "fake-api-key-for-emulator",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "genai-385616.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "genai-385616",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "genai-385616.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configurar emuladores para desarrollo local
if (process.env.NODE_ENV === 'development') {
  try {
    // Conectar a emuladores (solo funciona la primera vez)
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  } catch (error) {
    // Los emuladores ya están conectados, esto es normal
    console.log('Firebase emulators already connected');
  }
}

// Configurar el proveedor de Google
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: 'summan.com' // Restringir a dominio de Summan SAS
});

export default app;
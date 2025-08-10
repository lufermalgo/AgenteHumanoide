import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  User,
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

const isLocal = typeof window !== 'undefined' && location.hostname === 'localhost';
const env: any = process.env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || (isLocal ? 'demo-api-key' : ''),
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.REACT_APP_FIREBASE_AUTH_DOMAIN || (isLocal ? 'localhost' : ''),
  projectId: env.VITE_FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID || (isLocal ? 'demo-project' : ''),
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.REACT_APP_FIREBASE_STORAGE_BUCKET || (isLocal ? 'demo-bucket' : ''),
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || (isLocal ? '000000000000' : ''),
  appId: env.VITE_FIREBASE_APP_ID || env.REACT_APP_FIREBASE_APP_ID || (isLocal ? '1:000000000000:web:demo' : ''),
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Aviso útil si falta apiKey
if (!env.VITE_FIREBASE_API_KEY) {
  // No mostramos la clave; solo indicamos el origen del problema
  console.warn('Falta VITE_FIREBASE_API_KEY en .env. Usando demo-api-key o emulador.');
}
// Usar emulador local si aplica
const useAuthEmulatorFlag = (() => {
  const env: any = process.env || {};
  const value = env.VITE_USE_AUTH_EMULATOR ?? env.REACT_APP_USE_AUTH_EMULATOR;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false; // por defecto desactivado para permitir Google real en local
})();

if (useAuthEmulatorFlag && typeof window !== 'undefined' && location.hostname === 'localhost') {
  try {
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9091');
    } catch {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    }
  } catch {}
}
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account', hd: 'summan.com' });

export async function signInGoogle(): Promise<User | null> {
  await setPersistence(auth, browserLocalPersistence);
  await signInWithRedirect(auth, provider);
  // tras el redirect, onAuthStateChanged notificará; por compatibilidad resolvemos null aquí
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch {
    return null;
  }
}

export function onAuth(fn: (user: User | null) => void) {
  return onAuthStateChanged(auth, fn);
}


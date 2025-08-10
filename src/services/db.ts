import { getApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { auth } from './firebase';

const env: any = process.env || {};
const db = getFirestore(getApp());

const useEmu = (() => {
  const v = env.VITE_USE_FIRESTORE_EMULATOR ?? 'false';
  return String(v).toLowerCase() === 'true';
})();

if (typeof window !== 'undefined' && location.hostname === 'localhost' && useEmu) {
  try { connectFirestoreEmulator(db, '127.0.0.1', 8081); } catch {}
}

export async function start_session(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  // Evitar tocar cloud en local si no hay emulador
  if (typeof window !== 'undefined' && location.hostname === 'localhost' && !useEmu) {
    console.warn('Persistencia desactivada (sin emulador)');
    return null;
  }
  const sessionId = crypto.randomUUID();
  const ref = doc(collection(db, 'assessmentia-sessions'), sessionId);
  try {
    await setDoc(ref, {
      sessionId,
      userId: user.uid,
      userEmail: user.email || null,
      userName: user.displayName || null,
      startedAt: serverTimestamp(),
      status: 'incomplete',
    });
  } catch (e) {
    // En local sin emulador, evitamos escribir en cloud
    if (!(typeof window !== 'undefined' && location.hostname === 'localhost' && useEmu)) {
      console.warn('Persistencia desactivada (sin emulador)');
    } else {
      console.error('Error persistiendo sesión', e);
    }
  }
  return sessionId;
}

export async function save_answer(sessionId: string, questionId: string, questionText: string, answerText: string) {
  if (typeof window !== 'undefined' && location.hostname === 'localhost' && !useEmu) {
    return;
  }
  if (!sessionId) return;
  const ref = doc(collection(db, `assessmentia-sessions/${sessionId}/answers`));
  try {
    await setDoc(ref, {
      questionId,
      questionText,
      answerText,
      createdAt: serverTimestamp(),
      confirmed: true,
    });
  } catch (e) {
    if (!(typeof window !== 'undefined' && location.hostname === 'localhost' && useEmu)) {
      console.warn('Persistencia desactivada (sin emulador)');
    } else {
      console.error('Error guardando respuesta', e);
    }
  }
}

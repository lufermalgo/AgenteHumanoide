import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';

const corsHandler = cors({ origin: true });

/**
 * Función para validar y crear/actualizar usuario en Firestore
 * Restringido al dominio @summan.com
 */
export const assessmentiaValidateUser = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // Solo permitir POST
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: 'ID token is required' });
      }

      // Verificar el token de Firebase Auth
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email, name, picture } = decodedToken;

      // Validar dominio @summan.com
      if (!email || !email.endsWith('@summan.com')) {
        return res.status(403).json({ 
          error: 'Access restricted to @summan.com domain' 
        });
      }

      // Crear/actualizar documento del usuario en Firestore
      const userRef = admin.firestore().collection('user_metadata').doc(uid);
      const userData = {
        uid,
        email,
        name: name || '',
        picture: picture || '',
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        domain: 'summan.com',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Verificar si es la primera vez que se autentica
      const userDoc = await userRef.get();
      const isFirstLogin = !userDoc.exists;

      if (isFirstLogin) {
        (userData as any).createdAt = admin.firestore.FieldValue.serverTimestamp();
      }

      await userRef.set(userData, { merge: true });

      return res.status(200).json({
        success: true,
        user: {
          uid,
          email,
          name: name || '',
          picture: picture || '',
          isFirstLogin
        }
      });

    } catch (error) {
      console.error('Error validating user:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
});

/**
 * Función para obtener información del usuario autenticado
 */
export const assessmentiaGetUserInfo = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid } = decodedToken;

      // Obtener información del usuario desde Firestore
      const userRef = admin.firestore().collection('user_metadata').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      
      return res.status(200).json({
        success: true,
        user: userData
      });

    } catch (error) {
      console.error('Error getting user info:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
});

/**
 * Trigger que se ejecuta cuando se crea un nuevo usuario
 */
export const assessmentiaOnUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    const { uid, email, displayName, photoURL } = user;

    // Solo procesar usuarios del dominio @summan.com
    if (!email || !email.endsWith('@summan.com')) {
      console.log(`Skipping user creation for non-Summan email: ${email}`);
      return;
    }

    // Log de creación de usuario
    console.log(`New Summan user created: ${email} (${uid})`);

    // Crear documento inicial en Firestore (si no existe)
    const userRef = admin.firestore().collection('user_metadata').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid,
        email,
        name: displayName || '',
        picture: photoURL || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        domain: 'summan.com',
        assessmentCompleted: false,
        assessmentAttempts: 0
      });
    }

  } catch (error) {
    console.error('Error in onUserCreate:', error);
  }
});
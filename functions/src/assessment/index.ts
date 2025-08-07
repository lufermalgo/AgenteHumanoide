import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const corsHandler = cors({ origin: true });

/**
 * Crear nueva sesión de assessment
 */
export const assessmentiaCreateSession = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email } = decodedToken;

      const { preferredName, role } = req.body;

      // Verificar si el usuario ya completó el assessment
      const userRef = admin.firestore().collection('user_metadata').doc(uid);
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      if (userData?.assessmentCompleted) {
        return res.status(403).json({ 
          error: 'Assessment already completed. Only one attempt allowed.' 
        });
      }

      // Verificar si hay sesión incompleta
      const existingSessionQuery = await admin.firestore()
        .collection('assessmentia_sessions')
        .where('userId', '==', uid)
        .where('status', '==', 'incomplete')
        .limit(1)
        .get();

      if (!existingSessionQuery.empty) {
        const existingSession = existingSessionQuery.docs[0];
        return res.status(200).json({
          success: true,
          sessionId: existingSession.id,
          resuming: true,
          session: existingSession.data()
        });
      }

      // Crear nueva sesión
      const sessionId = uuidv4();
      const sessionData = {
        sessionId,
        userId: uid,
        userEmail: email,
        preferredName: preferredName || '',
        userRole: role || '',
        status: 'incomplete',
        currentQuestionIndex: 0,
        totalQuestions: 0, // Se actualizará cuando se definan las preguntas
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivity: admin.firestore.FieldValue.serverTimestamp(),
        responses: [],
        metadata: {
          userAgent: req.headers['user-agent'] || '',
          ipAddress: req.ip || '',
          language: req.headers['accept-language'] || ''
        }
      };

      await admin.firestore()
        .collection('assessmentia_sessions')
        .doc(sessionId)
        .set(sessionData);

      // Actualizar contador de intentos del usuario
      await userRef.update({
        assessmentAttempts: admin.firestore.FieldValue.increment(1),
        lastAssessmentAttempt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(201).json({
        success: true,
        sessionId,
        resuming: false,
        session: sessionData
      });

    } catch (error) {
      console.error('Error creating session:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
});

/**
 * Guardar respuesta de usuario
 */
export const assessmentiaSaveResponse = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid } = decodedToken;

      const { sessionId, questionId, questionText, userResponse, audioTranscription } = req.body;

      if (!sessionId || !questionId || !userResponse) {
        return res.status(400).json({ 
          error: 'Missing required fields: sessionId, questionId, userResponse' 
        });
      }

      // Verificar que la sesión pertenece al usuario
      const sessionRef = admin.firestore().collection('assessment_sessions').doc(sessionId);
      const sessionDoc = await sessionRef.get();

      if (!sessionDoc.exists) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const sessionData = sessionDoc.data();
      if (sessionData?.userId !== uid) {
        return res.status(403).json({ error: 'Session does not belong to user' });
      }

      // Crear respuesta
      const responseData = {
        questionId,
        questionText: questionText || '',
        userResponse,
        audioTranscription: audioTranscription || null,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        processingTime: null, // Se puede agregar medición de latencia
        confirmed: false
      };

      // Actualizar sesión con nueva respuesta
      await sessionRef.update({
        responses: admin.firestore.FieldValue.arrayUnion(responseData),
        lastActivity: admin.firestore.FieldValue.serverTimestamp(),
        currentQuestionIndex: admin.firestore.FieldValue.increment(1)
      });

      // Crear documento individual de respuesta para análisis
      const responseId = uuidv4();
      await admin.firestore()
        .collection('user_responses')
        .doc(responseId)
        .set({
          responseId,
          sessionId,
          userId: uid,
          ...responseData
        });

      return res.status(200).json({
        success: true,
        responseId,
        message: 'Response saved successfully'
      });

    } catch (error) {
      console.error('Error saving response:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
});

/**
 * Completar sesión de assessment
 */
export const assessmentiaCompleteSession = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid } = decodedToken;

      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      // Verificar y actualizar sesión
      const sessionRef = admin.firestore().collection('assessment_sessions').doc(sessionId);
      const sessionDoc = await sessionRef.get();

      if (!sessionDoc.exists) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const sessionData = sessionDoc.data();
      if (sessionData?.userId !== uid) {
        return res.status(403).json({ error: 'Session does not belong to user' });
      }

      // Marcar sesión como completada
      await sessionRef.update({
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivity: admin.firestore.FieldValue.serverTimestamp()
      });

      // Marcar usuario como que completó el assessment
      const userRef = admin.firestore().collection('user_metadata').doc(uid);
      await userRef.update({
        assessmentCompleted: true,
        assessmentCompletedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(200).json({
        success: true,
        message: 'Assessment completed successfully'
      });

    } catch (error) {
      console.error('Error completing session:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
});
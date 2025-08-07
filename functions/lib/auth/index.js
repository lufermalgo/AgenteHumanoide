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
exports.assessmentiaOnUserCreate = exports.assessmentiaGetUserInfo = exports.assessmentiaValidateUser = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({ origin: true });
/**
 * Función para validar y crear/actualizar usuario en Firestore
 * Restringido al dominio @summan.com
 */
exports.assessmentiaValidateUser = functions.https.onRequest((req, res) => {
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
                userData.createdAt = admin.firestore.FieldValue.serverTimestamp();
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
        }
        catch (error) {
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
exports.assessmentiaGetUserInfo = functions.https.onRequest((req, res) => {
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
        }
        catch (error) {
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
exports.assessmentiaOnUserCreate = functions.auth.user().onCreate(async (user) => {
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
    }
    catch (error) {
        console.error('Error in onUserCreate:', error);
    }
});
//# sourceMappingURL=index.js.map
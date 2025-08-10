# 🚀 Deployment Guide - Agente Humanoide

## 📋 Descripción

Guía completa para desplegar el Agente Humanoide de Summan SAS a producción en Firebase, incluyendo configuración de seguridad, variables de entorno y monitoreo.

---

## 🎯 Objetivos del Deployment

- **⚡ Producción Estable:** Sistema 99.9% uptime
- **🔒 Seguridad Total:** Claves API protegidas
- **📊 Monitoreo Completo:** Logs y métricas en tiempo real
- **🔄 Escalabilidad:** Manejo de ~75 usuarios simultáneos
- **🌍 Acceso Global:** Disponible desde cualquier ubicación

---

## 🏗️ Arquitectura de Producción

### Stack de Deployment

| Componente | Servicio | Región | Propósito |
|------------|----------|--------|-----------|
| **Frontend** | Firebase Hosting | us-central1 | Interfaz web |
| **Backend** | Firebase Functions | us-central1 | APIs (TTS, STT, Generate) |
| **Base de Datos** | Firestore | us-central1 | Sesiones y respuestas |
| **Autenticación** | Firebase Auth | Global | Google OAuth |
| **Storage** | Firebase Storage | us-central1 | Archivos temporales |
| **CDN** | Firebase CDN | Global | Distribución de contenido |

### URLs de Producción

- **Frontend:** https://genai-385616.web.app
- **API Base:** https://us-central1-genai-385616.cloudfunctions.net
- **Admin:** https://genai-385616.web.app/admin
- **Emulator UI:** http://127.0.0.1:4001 (solo desarrollo)

---

## 🔧 Preparación Pre-Deployment

### 1. Verificar Configuración Local

```bash
# Verificar que todo funciona localmente
npm run test:all

# Verificar emuladores
firebase emulators:start --only functions,hosting,firestore,auth,storage

# Probar sistema completo
node test-generative-system.js
```

### 2. Configurar Variables de Entorno

#### Archivo `.env.production`
```env
# Google Cloud Platform
GOOGLE_PROJECT_ID=genai-385616
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBNj3UtnSNoicuLgnEvM4GBKU0AL3o4lqM
VITE_FIREBASE_AUTH_DOMAIN=genai-385616.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=genai-385616
VITE_FIREBASE_STORAGE_BUCKET=genai-385616.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=36072227238
VITE_FIREBASE_APP_ID=1:36072227238:web:c5c58b3fb150632fd24f67

# Gemini API
VITE_GEMINI_API_KEY=your_production_gemini_api_key

# D-ID API (opcional)
VITE_DID_API_KEY=your_production_did_api_key

# Configuración de Producción
VITE_USE_AUTH_EMULATOR=false
VITE_USE_FIRESTORE_EMULATOR=false
VITE_ENVIRONMENT=production
```

### 3. Configurar Firebase Console

#### Variables de Entorno en Functions
```bash
# Configurar variables de entorno para Functions
firebase functions:config:set gemini.api_key="your_production_gemini_api_key"
firebase functions:config:set did.api_key="your_production_did_api_key"
firebase functions:config:set environment="production"
```

#### Reglas de Seguridad
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados con dominio @summan.com
    match /assessmentia-sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.token.email.matches('.*@summan\\.com$');
    }
    
    // Solo administradores pueden acceder a configuraciones
    match /assessmentia-config/{configId} {
      allow read, write: if request.auth != null && 
        request.auth.token.email.matches('.*@summan\\.com$') &&
        request.auth.token.email == 'fmaldonado@summan.com';
    }
  }
}
```

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Solo usuarios autenticados pueden subir archivos temporales
    match /temp/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.email.matches('.*@summan\\.com$') &&
        request.auth.uid == userId;
    }
  }
}
```

---

## 🚀 Proceso de Deployment

### 1. Build de Producción

```bash
# Limpiar builds anteriores
rm -rf dist/
rm -rf functions/lib/

# Build del frontend
npm run build

# Build de las Functions
cd functions && npm run build && cd ..
```

### 2. Verificación Pre-Deployment

```bash
# Verificar configuración de Firebase
firebase projects:list
firebase use genai-385616

# Verificar reglas de seguridad
firebase firestore:rules:get
firebase storage:rules:get

# Verificar variables de entorno
firebase functions:config:get
```

### 3. Deployment Completo

```bash
# Deploy todo el proyecto
firebase deploy

# O deploy por componentes
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 4. Verificación Post-Deployment

```bash
# Verificar Functions desplegadas
firebase functions:list

# Verificar hosting
firebase hosting:channel:list

# Verificar logs
firebase functions:log --only tts,stt,generate --limit 10
```

---

## 🔒 Configuración de Seguridad

### 1. Autenticación Corporativa

#### Configurar Dominio Autorizado
```javascript
// En Firebase Console > Authentication > Settings > Authorized domains
// Agregar: genai-385616.web.app
```

#### Configurar OAuth
```javascript
// En Firebase Console > Authentication > Sign-in method > Google
// Configurar:
// - Project support email: fmaldonado@summan.com
// - Authorized domains: summan.com
```

### 2. Rate Limiting

#### Configurar en Functions
```typescript
// functions/src/index.ts
import * as rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Too many requests from this IP'
});

export const tts = functions.https.onRequest(async (req, res) => {
  // Aplicar rate limiting
  limiter(req, res, () => {
    // Lógica de la función
  });
});
```

### 3. CORS de Producción

```typescript
// functions/src/index.ts
const corsOptions = {
  origin: [
    'https://genai-385616.web.app',
    'https://genai-385616.firebaseapp.com',
    'http://localhost:3002' // Solo para desarrollo
  ],
  credentials: true
};

export const tts = functions.https.onRequest(async (req, res) => {
  // Configurar CORS para producción
  res.set('Access-Control-Allow-Origin', 'https://genai-385616.web.app');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  // Lógica de la función
});
```

---

## 📊 Monitoreo y Logging

### 1. Configurar Logs

#### Logs de Functions
```bash
# Ver logs en tiempo real
firebase functions:log --only tts,stt,generate --follow

# Ver logs de errores
firebase functions:log --only tts,stt,generate --level error

# Exportar logs
firebase functions:log --only tts,stt,generate --limit 1000 > logs.txt
```

#### Logs de Firestore
```bash
# Ver logs de Firestore
firebase firestore:log --limit 100

# Ver logs de autenticación
firebase auth:export users.json
```

### 2. Métricas de Rendimiento

#### Configurar Alertas
```typescript
// functions/src/index.ts
export const tts = functions.https.onRequest(async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Lógica de la función
    
    // Log de métricas
    console.log('TTS_METRICS', {
      duration: Date.now() - startTime,
      textLength: req.body.text?.length || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    // Log de errores
    console.error('TTS_ERROR', {
      error: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 3. Dashboard de Monitoreo

#### Métricas Clave a Monitorear
- **Latencia TTS:** <1 segundo
- **Latencia STT:** <2 segundos
- **Latencia Generate:** <1 segundo
- **Error Rate:** <1%
- **Uptime:** 99.9%
- **Usuarios Activos:** ~75 simultáneos

---

## 🔄 CI/CD Pipeline

### 1. GitHub Actions

#### Archivo `.github/workflows/deploy.yml`
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd functions && npm ci && cd ..
    
    - name: Run tests
      run: |
        npm run test:all
        node test-generative-system.js
    
    - name: Build
      run: |
        npm run build
        cd functions && npm run build && cd ..
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        channelId: live
        projectId: genai-385616
```

### 2. Variables de Entorno en GitHub

#### Secrets Configurados
- `FIREBASE_SERVICE_ACCOUNT`: JSON de cuenta de servicio
- `GEMINI_API_KEY`: Clave API de Gemini
- `DID_API_KEY`: Clave API de D-ID (opcional)

---

## 🆘 Rollback y Recuperación

### 1. Rollback Automático

```bash
# Revertir a versión anterior
firebase hosting:revert

# Revertir Functions
firebase functions:rollback

# Verificar estado
firebase hosting:channel:list
firebase functions:list
```

### 2. Backup de Datos

```bash
# Exportar datos de Firestore
firebase firestore:export ./backup

# Exportar usuarios
firebase auth:export users-backup.json

# Backup de configuración
firebase functions:config:get > config-backup.json
```

### 3. Recuperación de Desastres

```bash
# Restaurar datos
firebase firestore:import ./backup

# Restaurar usuarios
firebase auth:import users-backup.json

# Restaurar configuración
firebase functions:config:set $(cat config-backup.json)
```

---

## 📈 Optimización de Rendimiento

### 1. Caching

#### Cache de TTS
```typescript
// functions/src/index.ts
import * as admin from 'firebase-admin';

const cache = new Map();

export const tts = functions.https.onRequest(async (req, res) => {
  const { text, voiceName } = req.body;
  const cacheKey = `${text}_${voiceName}`;
  
  // Verificar cache
  if (cache.has(cacheKey)) {
    const cachedAudio = cache.get(cacheKey);
    res.set('Content-Type', 'audio/wav');
    res.set('X-Cache', 'HIT');
    res.status(200).send(cachedAudio);
    return;
  }
  
  // Generar audio
  const audioBuffer = await generateTTS(text, voiceName);
  
  // Guardar en cache
  cache.set(cacheKey, audioBuffer);
  
  res.set('Content-Type', 'audio/wav');
  res.set('X-Cache', 'MISS');
  res.status(200).send(audioBuffer);
});
```

### 2. Optimización de Functions

#### Configuración de Memoria
```json
// functions/package.json
{
  "engines": {
    "node": "20"
  },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.0.0"
  }
}
```

```typescript
// functions/src/index.ts
export const tts = functions
  .runWith({
    memory: '256MB',
    timeoutSeconds: 30,
    maxInstances: 10
  })
  .https.onRequest(async (req, res) => {
    // Lógica de la función
  });
```

---

## 🔍 Testing de Producción

### 1. Smoke Tests

```bash
# Test de endpoints principales
curl -X POST https://us-central1-genai-385616.cloudfunctions.net/tts \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test de producción"}' \
  --output test-tts.wav

curl -X POST https://us-central1-genai-385616.cloudfunctions.net/generate \
  -H 'Content-Type: application/json' \
  -d '{"systemPrompt":"Test","userPrompt":"Hola","maxTokens":50}'
```

### 2. Load Testing

```bash
# Test de carga con Artillery
npm install -g artillery

artillery quick --count 100 --num 10 https://us-central1-genai-385616.cloudfunctions.net/generate
```

### 3. End-to-End Testing

```bash
# Test completo del flujo
npm run test:e2e:production
```

---

## 📞 Soporte de Producción

### 1. Contactos de Emergencia

- **Desarrollador Principal:** AI Assistant (Claude)
- **Administrador Firebase:** fmaldonado@summan.com
- **Soporte Técnico:** Equipo de IT de Summan

### 2. Procedimientos de Emergencia

#### Sistema Caído
1. Verificar logs: `firebase functions:log --level error`
2. Rollback inmediato: `firebase hosting:revert`
3. Notificar a usuarios
4. Investigar causa raíz

#### Problemas de Rendimiento
1. Verificar métricas de latencia
2. Escalar Functions si es necesario
3. Optimizar cache y queries
4. Monitorear uso de recursos

### 3. Mantenimiento Programado

```bash
# Ventana de mantenimiento: Domingos 2-4 AM (GMT-5)
# Notificar con 24h de anticipación
# Duración máxima: 2 horas
```

---

## 📚 Recursos Adicionales

### Documentación Relacionada
- [README.md](../README.md) - Documentación principal
- [API Reference](./api-reference.md) - Documentación de APIs
- [Context Engineering](./context-engineering.md) - Configuración del agente

### Enlaces Útiles
- [Firebase Console](https://console.firebase.google.com/project/genai-385616)
- [Google Cloud Console](https://console.cloud.google.com/project/genai-385616)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Última actualización:** 7 de agosto de 2025  
**Versión:** 1.0.0  
**Estado:** Listo para Producción ✅ 
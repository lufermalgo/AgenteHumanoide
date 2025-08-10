# 📚 API Reference - Agente Humanoide

## 🔧 Firebase Cloud Functions

### Base URL
- **Desarrollo:** `http://localhost:5002/genai-385616/us-central1/`
- **Producción:** `https://us-central1-genai-385616.cloudfunctions.net/`

---

## 🗣️ Text-to-Speech (TTS)

### Endpoint
```
POST /tts
```

### Descripción
Convierte texto a audio usando Gemini 2.5 Flash Preview TTS con voz "Kore" en español colombiano.

### Request Body
```typescript
{
  text: string;           // Texto a convertir a audio
  voiceName?: string;     // Opcional: nombre de la voz (default: "Kore")
}
```

### Response
- **Content-Type:** `audio/wav`
- **Body:** Archivo de audio WAV (24kHz, mono, 16-bit)

### Ejemplo
```bash
curl -X POST http://localhost:5002/genai-385616/us-central1/tts \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hola, soy Anita-AI. ¿Cómo estás hoy?"}' \
  --output response.wav
```

### Configuración de Voz
```typescript
{
  voiceConfig: {
    prebuiltVoiceConfig: {
      voiceName: "Kore"  // Voz colombiana natural
    }
  },
  languageCode: "es-CO"  // Español colombiano
}
```

---

## 🎤 Speech-to-Text (STT)

### Endpoint
```
POST /stt
```

### Descripción
Transcribe audio a texto usando Gemini 1.5 Flash con optimización para español colombiano.

### Request Body
```typescript
{
  audioBase64: string;    // Audio en base64
  mimeType?: string;      // Opcional: tipo MIME (default: "audio/webm")
}
```

### Response
```typescript
{
  text: string;           // Texto transcrito
}
```

### Ejemplo
```bash
curl -X POST http://localhost:5002/genai-385616/us-central1/stt \
  -H 'Content-Type: application/json' \
  -d '{
    "audioBase64": "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
    "mimeType": "audio/webm"
  }'
```

### Configuración de Transcripción
```typescript
{
  prompt: "Transcribe exactamente el audio al español (es-CO) con buena puntuación. Devuelve solo el texto de la transcripción."
}
```

---

## 🧠 Generación de Texto (Generate)

### Endpoint
```
POST /generate
```

### Descripción
Genera respuestas dinámicas y empáticas usando Gemini 1.5 Flash con Context Engineering.

### Request Body
```typescript
{
  systemPrompt: string;   // Prompt del sistema (personalidad, reglas)
  userPrompt: string;     // Prompt específico del usuario
  maxTokens?: number;     // Opcional: tokens máximos (default: 200)
}
```

### Response
```typescript
{
  text: string;           // Texto generado
}
```

### Ejemplo
```bash
curl -X POST http://localhost:5002/genai-385616/us-central1/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "systemPrompt": "Eres Anita-AI, un asistente empático y cercano...",
    "userPrompt": "Saluda al usuario Luis de forma cálida",
    "maxTokens": 150
  }'
```

### Configuración de Generación
```typescript
{
  temperature: 0.8,       // Variabilidad para respuestas naturales
  topP: 0.9,             // Nucleus sampling
  topK: 40,              // Top-k sampling
  maxOutputTokens: 200   // Límite de tokens
}
```

---

## 📊 Gestión de Sesiones

### Iniciar Sesión
```
POST /onAssessmentStart
```

### Descripción
Crea una nueva sesión de assessment para un usuario autenticado.

### Request Body
```typescript
{
  // No requiere body - usa autenticación Firebase
}
```

### Response
```typescript
{
  sessionId: string;      // ID único de la sesión
}
```

### Ejemplo
```typescript
// Desde el frontend con Firebase Auth
const functions = getFunctions();
const startSession = httpsCallable(functions, 'onAssessmentStart');
const result = await startSession();
const { sessionId } = result.data;
```

---

## 🔒 Autenticación y Seguridad

### Headers Requeridos
```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <firebase_id_token>'  // Para funciones callable
}
```

### Validaciones
- **Dominio corporativo:** Solo usuarios @summan.com
- **Autenticación:** Firebase Auth obligatorio
- **Rate Limiting:** 100 requests/minuto por usuario
- **CORS:** Configurado para desarrollo local

### CORS Headers
```typescript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

---

## 📝 Códigos de Error

### HTTP Status Codes
- **200:** Éxito
- **400:** Bad Request (datos inválidos)
- **401:** Unauthorized (no autenticado)
- **403:** Forbidden (dominio no autorizado)
- **404:** Not Found (endpoint no existe)
- **429:** Too Many Requests (rate limit)
- **500:** Internal Server Error

### Error Response Format
```typescript
{
  error: string;          // Tipo de error
  message?: string;       // Mensaje descriptivo
  details?: any;          // Detalles adicionales
}
```

### Ejemplos de Error
```typescript
// API Key no configurada
{
  "error": "Gemini API key not configured"
}

// Audio inválido
{
  "error": "Missing audioBase64",
  "message": "Audio data is required"
}

// Dominio no autorizado
{
  "error": "permission-denied",
  "message": "Dominio de correo no autorizado"
}
```

---

## 🧪 Testing de APIs

### Scripts de Prueba
```bash
# Probar TTS
node test-tts.js

# Probar STT
node test-stt.js

# Probar Generate
node test-generate.js

# Probar sistema completo
node test-generative-system.js
```

### Ejemplos de Testing
```typescript
// Test TTS
const ttsResponse = await fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    text: 'Hola, soy Anita-AI. ¿Cómo estás?' 
  })
});

// Test Generate
const generateResponse = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    systemPrompt: 'Eres un asistente amigable.',
    userPrompt: 'Saluda al usuario Luis',
    maxTokens: 100
  })
});
```

---

## 📊 Métricas y Monitoreo

### Logs de Functions
```bash
# Ver logs en tiempo real
firebase functions:log --only tts,stt,generate

# Ver logs específicos
firebase functions:log --only generate --limit 50
```

### Métricas Clave
- **Latencia TTS:** <1 segundo
- **Latencia STT:** <2 segundos
- **Latencia Generate:** <1 segundo
- **Uptime:** 99.9%
- **Error Rate:** <1%

### Alertas
- Latencia >3 segundos
- Error rate >5%
- API key expirada
- Rate limit excedido

---

## 🔄 Versionado

### Versión Actual
- **API Version:** 1.0.0
- **Last Updated:** 7 de agosto de 2025
- **Status:** Production Ready

### Changelog
- **v1.0.0:** Sistema generativo completo
- **v0.9.0:** Context Engineering implementado
- **v0.8.0:** STT/TTS integrado
- **v0.7.0:** Autenticación Firebase

---

## 📞 Soporte

### Contacto
- **Desarrollador:** AI Assistant (Claude)
- **Proyecto:** Summan SAS - Agente Humanoide
- **Documentación:** Este archivo

### Recursos
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Context Engineering Guide](./context-engineering.md) 
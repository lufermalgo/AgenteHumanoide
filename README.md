# Agente Humanoide - Assessment IA Generativa

Agente humanoide interactivo con capacidad de voz para realizar assessment de conocimiento en IA generativa dentro de Summan SAS.

## 🎯 Propósito

Desarrollar una herramienta de evaluación que permita a ~75 usuarios realizar una única sesión de assessment entre el 11 y 15 de agosto de 2025, con el objetivo de construir una línea base de entendimiento para estrategias de capacitación y adopción de IA.

## 🏗️ Stack Tecnológico

### Frontend
- **Framework:** ReactJS
- **Deploy:** Firebase Hosting
- **Diseño:** Figma + Figma Make

### Backend
- **Infraestructura:** Firebase Functions + Firestore DB
- **Procesamiento de voz:** Gemini Live API (Google)
- **Avatar humanoide:** D-ID API (streaming)
- **Autenticación:** Google OAuth

### Inspiración
- **Open WebUI:** STT/TTS integrados, gestión modular de servicios
- **ChatGPT Voice:** Patrones UX para conversación por voz

## 🚀 Configuración Local

### Prerrequisitos
- Node.js 18+
- Firebase CLI
- GCP CLI configurado

### Variables de Entorno
Crear archivo `.env` (nunca commitear):
```bash
GOOGLE_PROJECT_ID=genai-385616
FIREBASE_API_KEY=your_firebase_api_key
D_ID_API_KEY=your_d_id_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/lufermalgo/AgenteHumanoide.git
cd AgenteHumanoide

# Instalar dependencias frontend
npm install

# Instalar dependencias backend
cd functions
npm install
```

## 📋 Características Principales

- **Experiencia de usuario optimizada:** Latencia objetivo ~1 segundo
- **Avatar humanoide:** Sincronización de voz y gesticulación
- **Fallback UI:** Modo solo voz/texto si el avatar falla
- **Reanudación de sesiones:** Capacidad de continuar encuestas incompletas
- **Estilo paisa:** Personalidad natural y cercana colombiana
- **Duración controlada:** 5-10 minutos por sesión

## 🔒 Seguridad

- Variables sensibles en archivos `.env` (incluidos en `.gitignore`)
- Cuentas de servicio GCP para producción
- Principio de menor privilegio en permisos
- Información sensible NUNCA en el repositorio

## 📅 Plan de Desarrollo

1. **Configuración Firebase** - Proyecto, Firestore, hosting
2. **Integración Gemini Live** - STT, control de turnos
3. **Integración D-ID** - Avatar, fallback UI
4. **Motor de preguntas** - Navegación, persistencia
5. **Pruebas finales** - Validación multi-dispositivo

## 🎨 Experiencia de Usuario

- **Latencia objetivo:** ~1 segundo total
- **Umbral crítico:** < 2 segundos (límite percepción humana)
- **Ventaja perceptual:** Pausa de ~1s se percibe como más "humana"

## 📞 Contacto

**Proyecto:** Summan SAS - Transformación cultural IA
**Fecha límite:** 11 de agosto de 2025
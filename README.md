# �� Agente Humanoide - Encuesta de IA Generativa

> **Sistema de encuesta por voz con agente humanoide para Summan SAS**

## 📋 Descripción del Proyecto

Sistema interactivo de encuesta por voz que utiliza un agente humanoide (Anita-AI) para evaluar el conocimiento en IA generativa de los empleados de Summan SAS. El sistema combina tecnologías de voz, IA generativa y una interfaz conversacional natural.

## 🏗️ Estructura del Proyecto

```
/
├── frontend/          # Aplicación React/TypeScript
│   ├── src/          # Código fuente del frontend
│   ├── public/       # Archivos públicos
│   ├── package.json  # Dependencias del frontend
│   └── dist/         # Build de producción
├── backend/          # Firebase Functions (Backend)
│   ├── src/          # Código fuente del backend
│   ├── package.json  # Dependencias del backend
│   └── lib/          # Build del backend
├── shared/           # Código compartido entre frontend/backend
├── config/           # Configuración del proyecto
│   ├── firebase.json # Configuración de Firebase
│   ├── firestore.rules
│   └── storage.rules
├── docs/             # Documentación del proyecto
└── package.json      # Scripts principales del proyecto
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20+
- Firebase CLI
- Cuenta de Google Cloud Platform

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/lufermalgo/AgenteHumanoide.git
cd AgenteHumanoide

# Instalar dependencias de todo el proyecto
npm run install:all

# Configurar variables de entorno
cp config/env.example .env
# Editar .env con tus credenciales
```

### Desarrollo

```bash
# Desarrollo solo frontend
npm run dev:frontend

# Desarrollo solo backend
npm run dev:backend

# Desarrollo completo (frontend + backend)
npm run dev:all

# Emuladores de Firebase
npm run emulators:all
```

### Build y Deploy

```bash
# Build completo
npm run build

# Deploy completo
npm run deploy

# Deploy solo frontend
npm run deploy:frontend

# Deploy solo backend
npm run deploy:backend
```

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** React 18 + TypeScript
- **UI Library:** Material-UI (MUI)
- **Build Tool:** Vite
- **Estado:** React Hooks + Context API
- **Audio:** Web Audio API + MediaRecorder

### Backend
- **Infraestructura:** Firebase Functions
- **Base de Datos:** Firestore
- **Autenticación:** Firebase Auth (Google)
- **STT/TTS:** Google Gemini API
- **LLM:** Gemini 2.5 Flash

### DevOps
- **Hosting:** Firebase Hosting
- **CI/CD:** GitHub Actions
- **Monitoreo:** Firebase Analytics
- **Testing:** Jest + React Testing Library

## 🎯 Funcionalidades

### ✅ Implementadas
- [x] Autenticación con Google (@summan.com)
- [x] Sistema generativo con Context Engineering
- [x] STT/TTS con Gemini API
- [x] Control de audio optimizado
- [x] Interfaz conversacional natural
- [x] Indicadores visuales de estado
- [x] Sistema de nombres inteligente
- [x] Persistencia en Firestore

### 🔄 En Desarrollo
- [ ] Captura de cargo y funciones
- [ ] Manejo de preguntas curiosas
- [ ] Sistema de reanudación de sesiones
- [ ] Portal administrativo

### 📋 Pendientes
- [ ] Integración con D-ID (avatar)
- [ ] Diseño con Figma
- [ ] Testing completo
- [ ] Optimización de performance

## 🔧 Configuración

### Variables de Entorno

```bash
# .env
GEMINI_API_KEY=tu_api_key_de_gemini
FIREBASE_PROJECT_ID=tu_proyecto_firebase
```

### Firebase

```bash
# Configurar proyecto
firebase use demo-assessmentia

# Configurar emuladores
firebase init emulators
```

## 📊 Métricas de Calidad

- **Latencia objetivo:** <2 segundos
- **Cobertura de tests:** >80%
- **Performance:** Lighthouse score >90
- **Accesibilidad:** WCAG 2.1 AA

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollador Senior:** AI Assistant
- **Product Owner:** Summan SAS
- **Stakeholders:** ~75 empleados Summan SAS

## 📞 Soporte

Para soporte técnico, contactar a:
- **Email:** fmaldonado@summan.com
- **Proyecto GCP:** genai-385616

---

**Fecha límite:** 11 de agosto de 2025  
**Estado:** En desarrollo activo  
**Versión:** 1.0.0
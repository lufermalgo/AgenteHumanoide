# Agente Humanoide - Assessment IA Generativa

> 🔥 **NOTA IMPORTANTE**: Este proyecto está basado en el ejemplo oficial de Google [live-audio](https://github.com/google/generative-ai-js/tree/main/examples/live-audio) para garantizar la mejor experiencia de voz posible.

## 🎯 Propósito

Agente humanoide interactivo con capacidad de voz que funciona como guía personalizada para un assessment de conocimiento general en IA generativa dentro de Summan SAS. El objetivo es que cada persona (≈75 usuarios) realice una única sesión con el agente entre el 11 y 15 de agosto de 2025.

## ✨ Características

- 🎙️ **Voz Natural**: Usando Gemini 2.5 Flash Preview con audio nativo
- 🗣️ **Acento Colombiano**: Voz "Orus" adaptada al español colombiano
- ⚡ **Baja Latencia**: <1 segundo de respuesta end-to-end
- 🔒 **Seguro**: Acceso exclusivo para @summan.com
- 📱 **Responsive**: Funciona en cualquier dispositivo
- 🎛️ **Administrable**: Portal para gestión de preguntas y configuración

## 🛠️ Stack Tecnológico

- **Frontend**: React + TypeScript + Lit Elements
- **Backend**: Firebase Functions + Firestore
- **Auth**: Firebase Auth (Google OAuth)
- **APIs**: 
  - Gemini 2.5 Flash Preview (voz bidireccional)
  - Firebase (hosting, auth, db)
- **Audio**:
  - Input: 16kHz para captura óptima
  - Output: 24kHz para reproducción de alta calidad

## 🚀 Desarrollo Local

1. **Prerrequisitos**
   - Node.js v18+
   - Cuenta GCP con Gemini API habilitada
   - Proyecto Firebase configurado

2. **Configuración**
   ```bash
   # Clonar repositorio
   git clone https://github.com/lufermalgo/AgenteHumanoide.git
   cd AgenteHumanoide

   # Instalar dependencias
   npm install

   # Configurar variables de entorno
   cp .env.example .env.local
   # Editar .env.local con tus claves
   ```

3. **Desarrollo**
   ```bash
   # Iniciar emuladores Firebase
   npm run emulators

   # En otra terminal, iniciar frontend
   npm start
   ```

4. **Testing**
   ```bash
   # Tests unitarios
   npm test

   # Tests e2e
   npm run test:e2e
   ```

## 📝 Documentación

- [Plan SCRUM](./SCRUM_PLAN.md)
- [Guía de Desarrollo](./DEVELOPMENT.md)
- [Configuración Firebase](./FIREBASE.md)

## 🔑 Variables de Entorno

```bash
# Firebase
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=

# Gemini
REACT_APP_GEMINI_API_KEY=

# Ambiente
REACT_APP_ENV=development
```

## 🤝 Contribución

1. Crear rama feature (`git checkout -b feature/AmazingFeature`)
2. Commit cambios (`git commit -m 'feat: Add AmazingFeature'`)
3. Push a la rama (`git push origin feature/AmazingFeature`)
4. Abrir Pull Request

## 📄 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

## ✨ Agradecimientos

- Basado en [live-audio](https://github.com/google/generative-ai-js/tree/main/examples/live-audio) de Google
- Inspirado en [Open WebUI](https://github.com/open-webui/open-webui)
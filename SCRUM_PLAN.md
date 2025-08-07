# 📋 PLAN SCRUM - AGENTE HUMANOIDE
**Fecha límite:** 11 de agosto de 2025  
**Días restantes:** 3 días  
**Objetivo:** Assessment de IA generativa con avatar humanoide para ~75 usuarios Summan SAS

---

## 🎯 SPRINT OVERVIEW

### ✅ **COMPLETADO**
- [x] Arquitectura del proyecto (frontend + backend)
- [x] Configuración de seguridad (.env, .gitignore)
- [x] Sistema de colores institucionales Summan SAS
- [x] Estructura de componentes React + TypeScript
- [x] Configuración Firebase (hosting, functions, firestore)
- [x] Prompt detallado para Figma Make

---

## 📅 **DÍA 1 - INFRAESTRUCTURA CORE**
*Fecha: 8 de agosto*

### 🔥 **PRIORIDAD ALTA**
- [ ] **Firebase Functions Setup**
  - Implementar funciones de autenticación
  - Configurar Firestore con reglas de seguridad
  - Testing de conexión GCP

- [ ] **Sistema de Autenticación**
  - Componente LoginPage
  - AuthProvider con Context
  - ProtectedRoute wrapper
  - Integración Google OAuth (@summan.com)

- [ ] **Análisis Open WebUI**
  - Extraer componentes STT/TTS
  - Adaptar lógica de voice interaction
  - Documentar patrones reutilizables

### ⏰ **Estimación:** 8 horas  
### 🎯 **Entregable:** Autenticación funcional + análisis de componentes de voz

---

## 📅 **DÍA 2 - INTEGRACIÓN DE SERVICIOS**
*Fecha: 9 de agosto*

### 🔥 **PRIORIDAD ALTA**
- [ ] **Sistema de Voz**
  - Componente VoiceInput (STT)
  - Integración Gemini Live API
  - Control de estados de conversación
  - Manejo de latencia (<1s objetivo)

- [ ] **Avatar Humanoide**
  - Integración D-ID API
  - Sincronización voz + gesticulación
  - Fallback UI (solo voz/texto)
  - Estados visuales de conversación

- [ ] **Motor de Preguntas**
  - Componente QuestionFlow
  - Navegación entre preguntas
  - Validación de respuestas
  - Persistencia en Firestore

### ⏰ **Estimación:** 10 horas  
### 🎯 **Entregable:** Flujo completo de conversación voz-avatar

---

## 📅 **DÍA 3 - UI/UX Y DEPLOYMENT**
*Fecha: 10 de agosto*

### 🔥 **PRIORIDAD ALTA**
- [ ] **Interfaz de Usuario**
  - Layout responsivo (desktop/tablet/mobile)
  - Implementar colores institucionales
  - Estados de conversación visuales
  - Microinteracciones y transiciones

- [ ] **Gestión de Sesiones**
  - Persistencia de progreso
  - Reanudación de encuestas incompletas
  - Validación "una sola vez por usuario"
  - Recolección de metadatos

- [ ] **Testing y Optimización**
  - Pruebas de latencia end-to-end
  - Validación multi-dispositivo
  - Optimización de rendimiento
  - Testing con usuario real

- [ ] **Deployment**
  - Build de producción
  - Deploy Firebase Hosting + Functions
  - Configuración variables de entorno prod
  - Validación final

### ⏰ **Estimación:** 10 horas  
### 🎯 **Entregable:** Aplicación completa desplegada y lista para uso

---

## 🔧 **CONFIGURACIÓN TÉCNICA**

### **Stack Confirmado**
- **Frontend:** React 18 + TypeScript + Styled Components
- **Backend:** Firebase Functions + Firestore
- **APIs:** Gemini Live (STT) + D-ID (Avatar) + Google Auth
- **Deploy:** Firebase Hosting + Functions

### **Métricas de Éxito**
- ✅ Latencia total <1 segundo (audio → respuesta → avatar)
- ✅ Autenticación restringida a @summan.com
- ✅ Responsive en móvil, tablet, desktop
- ✅ Fallback funcional si avatar falla
- ✅ Persistencia de sesiones incompletas

### **Riesgos Identificados**
- 🚨 **Latencia D-ID API:** Preparar fallback optimizado
- 🚨 **Límites Gemini Live:** Validar tokens/duración
- 🚨 **Testing con usuario real:** Reservar tiempo día 3

---

## 📊 **TRACKING DIARIO**

### **Día 1 - Progreso**
- [ ] Firebase Functions operativo
- [ ] Autenticación Google funcional  
- [ ] Componentes STT/TTS identificados
- [ ] Testing básico completado

### **Día 2 - Progreso**  
- [ ] Voz bidireccional funcional
- [ ] Avatar D-ID sincronizado
- [ ] Motor de preguntas operativo
- [ ] Latencia <2s validada

### **Día 3 - Progreso**
- [ ] UI responsive completada
- [ ] Sesiones persistentes funcionando
- [ ] Testing usuario real exitoso
- [ ] Deploy producción validado

---

## 🎯 **DEFINICIÓN DE "TERMINADO"**

Para considerar cada funcionalidad completa debe:
1. ✅ **Funcionar correctamente** en desarrollo
2. ✅ **Pasar testing básico** (happy path + error cases)  
3. ✅ **Cumplir métricas de latencia** cuando aplique
4. ✅ **Ser responsive** en los 3 breakpoints
5. ✅ **Estar documentado** en código (comments)

---

**NOTA:** Este plan es dinámico y se actualiza en tiempo real según el progreso y hallazgos durante el desarrollo.
# 📋 PLAN SCRUM - AGENTE HUMANOIDE (Restructuración Live Audio)

> ⚠️ **NOTA IMPORTANTE**: El proyecto ha sido restructurado para basarse en el ejemplo oficial de Google `live-audio`, que proporciona la mejor integración con Gemini y manejo de audio nativo. Esta decisión se tomó para garantizar la mejor experiencia de usuario posible.

**Fecha límite:** 11 de agosto de 2025  
**Días restantes:** 3 días  
**Objetivo:** Assessment de IA generativa con avatar humanoide para ~75 usuarios Summan SAS

---

## 🎯 SPRINT OVERVIEW

### ✅ **COMPLETADO ANTES DE RESTRUCTURACIÓN**
- [x] Arquitectura inicial del proyecto
- [x] Configuración de seguridad (.env, .gitignore)
- [x] Sistema de colores institucionales Summan SAS
- [x] Configuración Firebase (hosting, functions, firestore)

### 🔄 **EN PROGRESO - RESTRUCTURACIÓN**
- [ ] Integración base de live-audio
- [ ] Adaptación para assessment
- [ ] Portal de administración
- [ ] Despliegue en Firebase

---

## 📅 **DÍA 1 - INTEGRACIÓN LIVE-AUDIO** 
*Fecha: 9 de agosto*

### 🔥 **PRIORIDAD ALTA**
- [ ] **Setup Base Live-Audio**
  - Integrar componentes core
  - Configurar Gemini 2.5 Flash Preview
  - Adaptar manejo de audio nativo
  - Testing de latencia

- [ ] **Sistema de Autenticación**
  - Migrar Google OAuth (@summan.com)
  - Integrar con Firebase Auth
  - Proteger rutas
  - Testing de sesiones

- [ ] **Motor de Assessment**
  - Adaptar para preguntas estructuradas
  - Integrar con Firestore
  - Manejo de estado y progreso
  - Testing de flujo completo

### ⏰ **Estimación:** 8 horas  
### 🎯 **Entregable:** Base funcional con audio nativo

---

## 📅 **DÍA 2 - PORTAL ADMIN Y UI** 
*Fecha: 10 de agosto*

### 🔥 **PRIORIDAD ALTA**
- [ ] **Portal Administrativo**
  - CRUD de preguntas
  - Configuración de prompts
  - Gestión de usuarios
  - Dashboard de progreso

- [ ] **Interfaz de Usuario**
  - Adaptar UI de live-audio
  - Implementar colores Summan
  - Responsive design
  - Microinteracciones

- [ ] **Optimización**
  - Medición de latencia
  - Ajuste de buffers de audio
  - Optimización de streaming
  - Testing en diferentes dispositivos

### ⏰ **Estimación:** 8 horas  
### 🎯 **Entregable:** Sistema completo con admin

---

## 📅 **DÍA 3 - DEPLOYMENT Y TESTING**
*Fecha: 11 de agosto*

### 🔥 **PRIORIDAD ALTA**
- [ ] **Deployment Firebase**
  - Build de producción
  - Deploy de funciones
  - Configuración de dominios
  - Variables de entorno

- [ ] **Testing Final**
  - Pruebas end-to-end
  - Validación multi-dispositivo
  - Test con usuarios reales
  - Documentación de uso

### ⏰ **Estimación:** 8 horas  
### 🎯 **Entregable:** Sistema en producción

---

## 🔧 **STACK TÉCNICO ACTUALIZADO**

### **Core Components (from live-audio)**
- Audio nativo bidireccional (16kHz input, 24kHz output)
- Gemini 2.5 Flash Preview con streaming
- Voz "Orus" en español colombiano
- Manejo preciso de timing

### **Infraestructura**
- Frontend: React + TypeScript + Lit Elements
- Backend: Firebase Functions + Firestore
- Auth: Firebase Auth (dominio @summan.com)
- Deploy: Firebase Hosting

### **Métricas de Éxito**
- ✅ Latencia total <1 segundo
- ✅ Audio nativo sin Web Speech API
- ✅ Voz natural en español colombiano
- ✅ Experiencia fluida sin botones

---

## 📊 **TRACKING DIARIO**

### **Día 1 - Integración (9 ago)**
- [ ] Live-audio base funcionando
- [ ] Auth con Firebase integrada
- [ ] Motor de assessment adaptado

### **Día 2 - Admin (10 ago)**
- [ ] Portal admin completo
- [ ] UI adaptada y responsive
- [ ] Optimizaciones implementadas

### **Día 3 - Deploy (11 ago)**
- [ ] Sistema en producción
- [ ] Testing final completado
- [ ] Documentación lista

---

## 🎯 **DEFINICIÓN DE "TERMINADO"**

Para considerar cada funcionalidad completa debe:
1. ✅ **Mantener la fluidez** del ejemplo live-audio
2. ✅ **Funcionar en producción** (no solo local)
3. ✅ **Cumplir métricas de latencia** (<1s)
4. ✅ **Ser administrable** vía portal
5. ✅ **Estar documentado** para usuarios

---

**NOTA:** Este plan refleja la restructuración basada en live-audio y se actualiza según el progreso.
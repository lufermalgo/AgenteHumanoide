# Vision del Proyecto AssessmentIA - Comprensión Paso a Paso

## 🎯 **PROPÓSITO FUNDAMENTAL**

**Objetivo:** Desarrollar un agente humanoide interactivo con capacidad de voz que funcione como guía personalizada para una encuesta de conocimiento general en IA generativa dentro de la organización Summan SAS.

**Alcance:** Aproximadamente 75 usuarios realizarán una única sesión entre el 11 y 15 de agosto de 2025.

**Resultado Esperado:** Construir una línea base de entendimiento para estrategias de capacitación y adopción, impulsando una transformación cultural basada en IA con enfoque humano.

---

## 👤 **PERSONA DEL AGENTE**

### **Identidad:**
- **Nombre:** Anita-AI (Anita en español, AI en inglés)
- **Voz:** Kore (colombiana, no española)
- **Personalidad:** Amigable, empática, cercana, ligeramente paisa (colombiana)
- **Rol:** Guía personalizada para encuesta, no evaluador

### **Características Clave:**
- **NO da opiniones ni retroalimentación** sobre las respuestas
- **NO interrumpe innecesariamente** al usuario
- **SÍ invita a la honestidad y naturalidad**
- **SÍ mantiene el foco** de la encuesta sin desviarse
- **SÍ usa el nombre preferido** del usuario

---

## 🔄 **FLUJO DE INTERACCIÓN COMPLETO**

### **FASE 0: AUTENTICACIÓN (Primera vez)**

#### **0.1 Pantalla de Login**
- **Estado:** Usuario no autenticado ve pantalla de login
- **Elementos:**
  - Logo de Summan SAS
  - Descripción del ejercicio y su propósito
  - Sección de login con Google (cuentas corporativas)
- **Propósito:** Autenticación

#### **0.2 Proceso de Autenticación**
- **Acción:** Usuario hace clic en "Iniciar sesión con Google"
- **Resultado:**
  - Redirección a Google Auth
  - Verificación de cuenta corporativa
  - Retorno a la aplicación autenticado

### **FASE 1: INICIO Y BIENVENIDA**

#### **1.1 Pantalla de Bienvenida (Usuarios Autenticados)**
- **Estado:** Usuario autenticado ve tarjeta de bienvenida
- **Elementos:** 
  - Título "Bienvenido a AssessmentIA"
  - Descripción del propósito
  - Botón verde "Iniciar Evaluación"
- **Propósito:** Cumplir políticas de AudioContext del navegador

#### **1.2 Activación con Gesto de Usuario**
- **Acción:** Usuario hace clic en "Iniciar Encuesta"
- **Resultado:** 
  - AudioContext se activa (cumple políticas de seguridad)
  - Estado cambia a `isStarted = true`
  - Interfaz cambia a modo conversacional

### **FASE 2: IDENTIFICACIÓN Y PERSONALIZACIÓN**

#### **2.1 Saludo Inicial Dinámico**
- **Agente dice:** "¡Hola [Nombre]! Soy Anita-AI..."
- **Contexto:** Usa `displayName` de Google Auth
- **Generación:** Prompt dinámico basado en Context Engineering
- **Tono:** Conversacional entre colegas, no formal ("señor", "señora")

#### **2.2 Análisis de Nombre**
- **Proceso:** `extract_preferred_first_name(displayName)`
- **Ejemplos:**
  - "Luis Fernando" → Detecta dos nombres
  - "Juan Camilo" → Detecta dos nombres
  - "Carlos" → Un solo nombre

#### **2.3 Pregunta de Preferencia (si aplica)**
- **Condición:** Si `nameAnalysis.needsAsk = true`
- **Agente pregunta:** "Veo que tienes dos nombres. ¿Cómo prefieres que te llame? ¿Luis, Fernando, o Luis Fernando?"
- **Tono:** Natural, como conversación entre colegas
- **Espera:** Respuesta del usuario
- **Procesamiento:** `extractPreferredName()` detecta preferencia
- **Confirmación:** "Perfecto, te llamaré [Nombre Preferido]"

#### **2.4 Captura de Cargo y Funciones**
- **Agente pregunta:** "Me gustaría conocer un poco sobre tu rol en Summan. ¿Podrías contarme brevemente cuál es tu cargo y qué funciones realizas en tu día a día?"
- **Propósito:** Entender responsabilidades para análisis posterior
- **Duración:** Respuesta libre (máximo 1 minuto)
- **Almacenamiento:** Para análisis de correlación cargo-IA
- **Tono:** Conversacional, no evaluativo

### **FASE 3: INTRODUCCIÓN A LA ENCUESTA**

#### **3.1 Contexto del Ejercicio**
- **Agente explica:** Propósito de la encuesta
- **Tono:** Empático, no evaluativo, conversacional
- **Duración:** Breve pero completa
- **Enfoque:** En la honestidad y naturalidad
- **Mensaje clave:** "No es necesario que investigues en Internet, queremos entender lo que sabes ahora"

#### **3.2 Manejo de Preguntas Curiosas**
- **Situación:** Usuario hace preguntas sobre el propósito, evaluación, impacto en trabajo
- **Ejemplos:** "¿Para qué es esta encuesta?", "¿Me van a evaluar?", "¿Esto afectará mi trabajo?"
- **Respuesta del agente:** "No te preocupes, todo lo que estás haciendo en este momento nos va a ayudar mucho a crecer como compañía. Esto es solamente para mejorar, no estamos juzgando, no estamos evaluando, no estamos utilizando esta información para otros fines. Es todo para ver cómo logramos o qué necesitamos hacer para que Summan sea una compañía más enfocada en la inteligencia artificial generativa."
- **Tono:** Empático, tranquilizador, generativo
- **Propósito:** Crear zona de confianza y redirigir al foco

#### **3.3 Transición a Preguntas**
- **Agente dice:** "Perfecto, comencemos con las preguntas..."
- **Estado:** Cambia a modo de preguntas

---

## ❓ **FLUJO DE PREGUNTAS Y RESPUESTAS**

### **ESTRUCTURA DE CADA PREGUNTA:**

#### **4.1 Presentación de Pregunta**
- **Agente:** Lee la pregunta en voz alta
- **Pantalla:** Muestra la pregunta en texto
- **Estado:** `phase = 'speaking'`

#### **4.2 Transición a Escucha**
- **Agente:** Termina de leer la pregunta
- **Pausa:** 1 segundo natural
- **Estado:** `phase = 'listening'`
- **Indicador:** "Escuchando tu respuesta..."

#### **4.4 Procesamiento**
- **Estado:** `phase = 'processing'`
- **Indicador:** "Procesando..."
- **API:** Envía audio a `/api/stt`
- **Resultado:** Transcripción del texto con puntuación y gramática correcta

#### **4.3 Captura de Respuesta**
- **Duración:** Máximo 2 minutos
- **VAD:** Se detiene con 2 segundos de silencio
- **Calidad:** `echoCancellation`, `noiseSuppression`, `autoGainControl`
- **Cronómetro interno:** Control de tiempo de respuesta

#### **4.4 Interrupción Amigable (si aplica)**
- **Condición:** Si usuario llega a 1:50 minutos hablando
- **Agente interrumpe:** "Luis, qué pena interrumpirte, está muy interesante lo que me estás diciendo. Permíteme tomar notas y ya te aviso cuando puedes continuar con tu idea."
- **Propósito:** Control natural del tiempo sin cortar abruptamente

#### **4.5 Procesamiento**
- **Estado:** `phase = 'processing'`
- **Indicador:** "Procesando..."
- **API:** Envía audio a `/api/stt`
- **Resultado:** Transcripción del texto con puntuación y gramática correcta

#### **4.6 Respuesta Empática**
- **Agente:** Responde de forma empática y natural
- **Ejemplo:** "Me gusta mucho lo que has contado, está muy interesante..."
- **Generación:** Prompt dinámico basado en Context Engineering
- **NO:** Juicios, evaluaciones, correcciones
- **SÍ:** Agradecimiento y reconocimiento del aporte

#### **4.7 Pregunta de Seguimiento**
- **Agente:** "¿Te gustaría agregar algo más a tu respuesta?"
- **Estado:** `phase = 'followup'`
- **Ventana:** 30 segundos para respuesta adicional
- **Opcional:** El usuario puede no responder

#### **4.8 Transición a Siguiente Pregunta**
- **Agente:** "Perfecto, continuemos con la siguiente pregunta..."
- **Progreso:** `qIndex++`
- **Repetición:** Vuelve al paso 4.1

### **FASE 5: REANUDACIÓN DE SESIÓN (si aplica)**

#### **5.1 Detección de Sesión Incompleta**
- **Condición:** Usuario regresa y tiene sesión parcial
- **Agente dice:** "¡Gracias por regresar! Me gusta mucho que hayas vuelto. En la última pregunta diste muy buena información al respecto. ¿Te parece bien si continuamos con la siguiente pregunta?"
- **Estado:** Continúa desde `qIndex` guardado

#### **5.2 Control de Estado de Usuario**
- **No ha iniciado:** Guía a iniciar encuesta
- **Parcial:** Reanuda desde última pregunta
- **Completada:** Mensaje "Ya participaste en esta encuesta, no es necesario que lo vuelvas a hacer"

### **FASE 6: CIERRE Y DESPEDIDA**

#### **6.1 Despedida Empática**
- **Agente:** Despedida generativa y amigable como despedirse de un amigo
- **Tono:** Agradecimiento por el tiempo y participación
- **Duración:** Breve pero cálida

#### **6.2 Pantalla de Finalización**
- **Estado:** "Encuesta finalizada"
- **Elementos:** Mensaje de confirmación
- **Propósito:** Confirmar completación exitosa

---

## 🎨 **EXPERIENCIA DE USUARIO**

### **INDICADORES VISUALES:**

#### **Estados Principales:**
1. **🔄 Preparando...** - Carga inicial
2. **🎤 Anita-AI está hablando...** - Agente habla
3. **👂 Escuchando tu respuesta...** - Captura audio
4. **⚙️ Procesando...** - Procesamiento
5. **👂 Escuchando respuesta adicional...** - Seguimiento

#### **Animaciones:**
- **Pulse:** Para hablando
- **Wave:** Para escuchando
- **Spin:** Para procesando
- **Progress:** Barra de progreso
- **Ondas hablando:** Para avatar (futuro con D-ID)

#### **Colores Institucionales:**
- **Primario:** #9bc41c (verde)
- **Secundario:** #f08a00 (naranja)
- **Terciario:** #666666 (gris)

### **INTERACCIÓN NATURAL:**
- **NO hay botones** de enviar, escuchar, o control
- **Conversación fluida** sin interrupciones
- **Transcripción NO visible** en pantalla
- **Feedback visual** claro y profesional
- **Basado en:** Proyecto live-audio de Google para conversación natural

### **AVATAR Y VISUALIZACIÓN (Futuro):**
- **Plataforma D-ID:** Para avatar humanoide
- **Animaciones:** Ondas hablando, gestos naturales
- **Fallback:** Si no carga avatar, solo voz/texto
- **Integración:** Con plataforma de avatar

### **DISEÑO VISUAL CON FIGMA:**
- **Plataforma Figma:** Para diseño completo de la interfaz
- **Look and Feel:** Aplicación de colores institucionales (#9bc41c, #f08a00, #666666)
- **Diseño responsivo:** Adaptación a diferentes dispositivos
- **Componentes visuales:** Botones, tarjetas, indicadores de estado
- **Animaciones:** Transiciones suaves y profesionales
- **Tipografía:** Jerarquía visual clara y legible
- **Espaciado:** Layout equilibrado y profesional

---

## 🧠 **SISTEMA DE CONTEXT ENGINEERING**

### **GENERACIÓN DINÁMICA:**
- **Prompts:** Generados dinámicamente, no hardcodeados
- **Contexto:** Memoria de conversación y preferencias
- **Empatía:** Respuestas variadas y naturales
- **Personalización:** Basada en nombre y respuestas previas

### **ANÁLISIS DE INTENCIÓN:**
- **Entusiasmo:** "Me encanta la IA!"
- **Confusión:** "No entiendo muy bien..."
- **Respuesta completa:** "Eso es todo."
- **Reticencia:** "No quiero hablar mucho..."

### **MÉTRICAS DE CALIDAD:**
- **Relevancia:** Respuesta apropiada al contexto
- **Empatía:** Nivel de conexión emocional
- **Claridad:** Comprensibilidad del mensaje
- **Naturalidad:** Fluidez de la conversación

### **PANEL ADMINISTRATIVO:**
- **Configuración de prompts:** Edición de prompts del Context Engineering
- **Selección de voz:** Cambio de voz del agente
- **Parametrización de preguntas:** Gestión de preguntas de la encuesta
- **Customización:** Ajustes sin código
- **Monitoreo:** Métricas de rendimiento y uso
- **Manejo de preguntas curiosas:** Configuración de respuestas tranquilizadoras

---

## 🔧 **ARQUITECTURA TÉCNICA**

### **CONTROL DE AUDIO:**
- **Centralizado:** `playAudioControlled()`
- **Sin solapamientos:** Solo un audio a la vez
- **Limpieza automática:** Recursos liberados
- **Pausas naturales:** Entre interacciones

### **GESTIÓN DE ESTADO:**
- **Sesión:** Persistencia en localStorage
- **Progreso:** `qIndex` para continuar donde se quedó
- **Contexto:** Memoria de conversación
- **Preferencias:** Nombre y configuraciones

### **APIS INTEGRADAS:**
- **TTS:** Gemini 2.5 Flash Preview (voz Kore)
- **STT:** Gemini 1.5 Flash (transcripción con puntuación)
- **Generate:** Gemini 1.5 Flash (prompts dinámicos)
- **Auth:** Google Authentication
- **DB:** Firestore (respuestas y sesiones)

### **CONCURRENCIA:**
- **Escalabilidad:** Soporte para múltiples usuarios simultáneos
- **Rendimiento:** Optimizado para 75+ usuarios concurrentes
- **Latencia:** < 2 segundos en producción

---

## 📊 **RECOLECCIÓN DE DATOS**

### **POR SESIÓN:**
- **ID único:** `sessionId`
- **Timestamps:** Inicio y fin
- **Usuario:** Nombre de Google Auth
- **Preferencia:** Nombre preferido
- **Cargo/Rol:** Respuesta libre inicial
- **Funciones:** Descripción de responsabilidades diarias
- **Estado:** No iniciada, parcial, completada

### **POR PREGUNTA:**
- **ID de pregunta:** `questionIndex`
- **Timestamp:** Momento de la pregunta
- **Texto:** Pregunta realizada
- **Respuesta:** Transcripción del usuario (con puntuación y gramática)
- **Confirmación:** Cierre de la respuesta
- **Tiempo de respuesta:** Duración de la respuesta del usuario

### **ANÁLISIS POSTERIOR:**
- **Alimentación:** Otra IA para análisis de respuestas
- **Conclusiones:** Extracción de insights específicos
- **Presentación:** Análisis en vivo con las respuestas
- **Correlación cargo-IA:** Análisis de cómo diferentes roles pueden aprovechar la IA
- **Recomendaciones:** Basadas en responsabilidades y nivel de conocimiento

---

## ⚡ **RESTRICCIONES Y LÍMITES**

### **TIEMPO:**
- **Duración total:** 10-15 minutos
- **Respuesta usuario:** Máximo 2 minutos por pregunta
- **Seguimiento:** 30 segundos
- **Latencia objetivo:** ~1 segundo
- **Preguntas:** 5 preguntas estratégicas (2 min × 5 = 10 min)

### **USO:**
- **Una vez por usuario:** No se permite rehacer
- **Sesión única:** No múltiples intentos
- **Reanudación:** Solo si se interrumpe
- **Reset:** Solo para equipo de pruebas (panel admin)

### **CONTENIDO:**
- **NO opiniones:** El agente no evalúa
- **NO feedback:** No corrige respuestas
- **NO desviaciones:** Mantiene foco en encuesta
- **SÍ empatía:** Conexión emocional

---

## 🎯 **CRITERIOS DE ÉXITO**

### **TÉCNICOS:**
- ✅ Audio sin solapamientos
- ✅ Latencia < 2 segundos
- ✅ Indicadores visuales claros
- ✅ Persistencia de sesión
- ✅ Generación dinámica de prompts
- ✅ Panel administrativo funcional

### **EXPERIENCIA:**
- ✅ Conversación natural
- ✅ Interfaz intuitiva
- ✅ Feedback visual apropiado
- ✅ Personalización efectiva
- ✅ Empatía en respuestas
- ✅ Tono conversacional entre colegas

### **NEGOCIO:**
- ✅ Datos recolectados completos
- ✅ 75 usuarios evaluados
- ✅ Línea base establecida
- ✅ Transformación cultural iniciada
- ✅ Análisis posterior de respuestas

---

## 🔄 **FLUJO DE ERRORES Y RECUPERACIÓN**

### **AUDIO:**
- **Error de AudioContext:** Botón de inicio
- **Fallo de micrófono:** Mensaje de error claro
- **Problemas de red:** Reintentos automáticos
- **Timeout:** Fallback a texto

### **SESIONES:**
- **Interrupción:** Guardar progreso
- **Reanudación:** Continuar desde última pregunta
- **Pérdida de contexto:** Reconstruir desde datos
- **Error crítico:** Mensaje de soporte

### **CONCURRENCIA:**
- **Múltiples usuarios:** Escalabilidad garantizada
- **Rendimiento:** Optimización para carga
- **Monitoreo:** Métricas en tiempo real

---

## 📈 **MÉTRICAS DE MONITOREO**

### **RENDIMIENTO:**
- **Latencia:** Tiempo de respuesta
- **Calidad de audio:** RMS y SNR
- **Tasa de éxito:** Completación de sesiones
- **Errores:** Frecuencia y tipos
- **Concurrencia:** Usuarios simultáneos

### **USUARIO:**
- **Engagement:** Tiempo en sesión
- **Satisfacción:** Feedback implícito
- **Completación:** Tasa de finalización
- **Reanudación:** Sesiones recuperadas
- **Tiempo promedio:** Por pregunta y total

### **ADMINISTRATIVO:**
- **Listado de usuarios:** Estado de encuestas
- **Reset de sesiones:** Para equipo de pruebas
- **Configuración:** Cambios en prompts y parámetros
- **Monitoreo:** Dashboard de métricas

---

## 🚀 **ESTADO ACTUAL DEL PROYECTO**

### **✅ COMPLETADO:**
- Sistema de control de audio
- Indicadores visuales
- Context Engineering
- Botón de inicio (AudioContext)
- Generación dinámica de prompts
- Análisis de intención
- Métricas de calidad
- Manejo de errores
- Autenticación con Google

### **🎯 LISTO PARA:**
- Pruebas manuales en navegador
- Validación de experiencia completa
- Ajustes de UX basados en feedback
- Preparación para producción
- Panel administrativo

### **📋 PRÓXIMOS PASOS:**
1. Pruebas manuales completas
2. Ajustes de prompts y respuestas
3. Optimización de latencia
4. Panel administrativo
5. Integración con avatar (D-ID)
6. Diseño visual con Figma
7. Preparación para deploy
8. Documentación final

---

*Este documento refleja la comprensión actual del proyecto AssessmentIA y servirá como guía para el desarrollo continuo y las pruebas del sistema.* 
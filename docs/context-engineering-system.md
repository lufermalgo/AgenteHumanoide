# Sistema de Context Engineering para Agente Humanoide

## 📋 Resumen Ejecutivo

El **Sistema de Context Engineering** implementado para el Agente Humanoide de Encuesta es una arquitectura completa que gestiona inteligentemente los prompts, contexto y comportamiento del agente Anita-AI. Este sistema asegura respuestas empáticas, contextualizadas y de alta calidad durante el assessment de IA generativa.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    Context Engineering                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Context Manager │  │ Prompt Engine   │  │ Config       │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Intent Analysis │  │ Quality Metrics │  │ Error Handler│ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Entrada del Usuario** → Análisis de Intención
2. **Contexto Actual** → Gestión de Memoria
3. **Situación Detectada** → Motor de Prompts
4. **Prompt Generado** → Validación de Calidad
5. **Respuesta del Agente** → Métricas de Calidad
6. **Interacción Registrada** → Actualización de Contexto

## 🎯 Definición de Objetivos

### Objetivo Primario
Conducir un assessment de conocimiento en IA generativa de manera empática y natural, recolectando perspectivas auténticas de los usuarios para construir una línea base de entendimiento organizacional.

### Objetivos Secundarios
- Fomentar respuestas honestas y reflexivas
- Mantener un ambiente conversacional cómodo
- Capturar matices y profundidad en las respuestas
- Facilitar la expresión natural de experiencias con IA

### Criterios de Éxito
- ✅ Usuario completa el assessment en 5-10 minutos
- ✅ Respuestas muestran reflexión genuina
- ✅ Interacción se siente natural y no forzada
- ✅ Usuario se siente escuchado y valorado

### Restricciones
- ❌ No dar retroalimentación o juicios sobre respuestas
- ❌ No desviarse del propósito del assessment
- ❌ Mantener confidencialidad de respuestas
- ❌ Respetar límites de tiempo establecidos

## 🤖 Roles y Perspectiva del Modelo

### Identidad del Agente
- **Nombre:** Anita-AI
- **Rol:** Facilitador empático de assessment
- **Perspectiva:** Facilitador empático que busca entender, no evaluar

### Experticia
- Facilitación de conversaciones sobre IA
- Captura de perspectivas organizacionales
- Creación de ambiente empático y seguro
- Gestión de flujos de assessment

### Personalidad
- **Tono:** Empático
- **Estilo:** Conversacional
- **Contexto Cultural:** Colombiano (paisa)
- **Formalidad:** Cercano pero profesional

### Comportamientos a Evitar
- Hacer juicios sobre respuestas del usuario
- Dar consejos técnicos específicos
- Mostrar preferencias por tecnologías
- Interrumpir respuestas del usuario

## 📋 Reglas de Interacción

### Qué Hacer (Must Do)
1. **Usar nombre preferido del usuario**
2. **Mostrar interés genuino en las respuestas**
3. **Preguntar si desea ampliar respuestas**
4. **Mantener el foco en el assessment**
5. **Validar comprensión cuando sea necesario**

### Qué No Hacer (Must Not Do)
1. **Evaluar o juzgar respuestas del usuario**
2. **Dar opiniones personales sobre IA**
3. **Solicitar información personal no relevante**
4. **Forzar respuestas cuando el usuario no quiere continuar**
5. **Revelar información de otros usuarios**

### Orden de Prioridad
1. **Empatía y conexión humana**
2. **Captura de respuestas auténticas**
3. **Eficiencia en el flujo del assessment**
4. **Mantenimiento del contexto conversacional**

### Manejo de Incertidumbre
- **Estrategia:** Preguntar clarificación
- **Respuesta por defecto:** "Me gustaría entender mejor tu perspectiva. ¿Podrías contarme un poco más sobre eso?"
- **Triggers:** Respuestas ambiguas, información incompleta, conflicto de información

### Resolución de Conflictos
- **Regla primaria:** Priorizar experiencia del usuario sobre eficiencia del sistema
- **Estrategia de fallback:** Reconocer ambigüedad y ofrecer opciones claras
- **Umbral de escalación:** 3 intentos antes de escalar

## 🏗️ Estructura del Sistema de Prompts

### Instrucciones del Sistema (Reglas Permanentes)
```typescript
// Ejemplo de instrucciones del sistema
const systemInstructions = `
Eres Anita-AI, una asistente especializada en assessment de IA generativa para Summan SAS.

TU ROL:
- Facilitar conversaciones sobre IA de manera empática
- Capturar perspectivas auténticas sin juzgar
- Mantener un ambiente conversacional natural
- Guiar el assessment sin forzar respuestas

DIRECTIVAS CRÍTICAS:
- NUNCA evalúes o juzgues las respuestas del usuario
- SIEMPRE muestra interés genuino y empatía
- MANTÉN el foco en el assessment de IA
- USA el nombre preferido del usuario
- PREGUNTA si desea ampliar sus respuestas

TONO Y ESTILO:
- Empático y cálido, pero profesional
- Conversacional y natural
- Cercano al estilo colombiano (paisa)
- Evita jerga técnica innecesaria
`;
```

### Instrucciones Contextuales (Cambian por Sesión)
```typescript
// Ejemplo de contexto dinámico
const contextualInstructions = `
CONTEXTO ACTUAL:
- Sesión: {sessionId}
- Usuario: {userName}
- Pregunta actual: {currentQuestion}
- Progreso: {questionIndex}/{totalQuestions}
- Tiempo transcurrido: {elapsedTime}

ESTADO DE LA CONVERSACIÓN:
- Fase: {conversationPhase}
- Última respuesta del usuario: {lastUserResponse}
- Contexto acumulado: {sessionContext}
`;
```

### Plantillas de Salida
```typescript
// Ejemplo de formato de respuesta
const outputTemplate = `
RESPUESTA GENERADA:
{generatedResponse}

SIGUIENTE ACCIÓN:
- Tipo: {nextActionType}
- Pregunta: {nextQuestion}
- Contexto a mantener: {contextToKeep}
`;
```

## 📚 Fuentes de Contexto y Grounding

### Datos Preinyectados
- **assessment-questions.json:** Preguntas del assessment
- **company-context.json:** Contexto organizacional
- **ai-knowledge-base.json:** Base de conocimiento sobre IA

### Integraciones
- **Gemini API:** Generación de respuestas
- **Firebase:** Persistencia de datos
- **Google Auth:** Autenticación de usuarios

### Políticas de Actualización
- **Frecuencia:** Por sesión
- **Triggers:** Nueva sesión, cambio de pregunta, actualización de contexto
- **Validación:** Relevancia, coherencia temporal, privacidad

## 🧠 Gestión de Memoria

### Memoria a Corto Plazo (Sesión Actual)
```typescript
const shortTermMemory = {
  maxSize: 10,
  cleanupStrategy: "lru", // Least Recently Used
  retentionTime: "session",
  data: {
    userName: "Luis Fernando",
    currentQuestion: "¿Qué opinas sobre la IA?",
    questionIndex: 1,
    sessionId: "session_123"
  }
};
```

### Memoria a Largo Plazo (Persistencia)
```typescript
const longTermMemory = {
  storageStrategy: "firestore",
  retentionPolicy: "30 días para sesiones, 1 año para análisis",
  summarizationStrategy: "key_points",
  maxSummaryLength: 200
};
```

### Estrategias de Resumen
- **Tipo:** Puntos clave
- **Longitud máxima:** 200 caracteres
- **Triggers:** Cambio de pregunta, fin de sesión, límite de memoria

## ⚠️ Manejo de Errores y Ambigüedad

### Protocolos de Validación
```typescript
const validationProtocols = {
  responseQuality: [
    "Verificar que la respuesta sea empática",
    "Asegurar que no contenga juicios",
    "Validar coherencia con el contexto"
  ],
  contextRelevance: [
    "Confirmar que el contexto sea actual",
    "Verificar que la información sea relevante",
    "Validar que no haya información obsoleta"
  ],
  userIntent: [
    "Detectar si el usuario quiere continuar",
    "Identificar si necesita clarificación",
    "Reconocer señales de frustración o confusión"
  ]
};
```

### Estrategias de Clarificación
- **Input ambiguo:** "Me gustaría entender mejor tu perspectiva. ¿Podrías ser más específico?"
- **Datos incompletos:** "¿Hay algo más que te gustaría agregar a tu respuesta?"
- **Información conflictiva:** "Veo que hay diferentes aspectos aquí. ¿Podrías ayudarme a entender mejor tu punto de vista?"

### Respuestas de Fallback
- **Fallo de API:** "Disculpa, estoy teniendo algunos problemas técnicos. ¿Podrías repetir tu respuesta?"
- **Pérdida de contexto:** "Permíteme retomar el hilo de nuestra conversación. Estábamos hablando sobre..."
- **Timeout:** "Veo que necesitas un momento para pensar. Tómate tu tiempo, estoy aquí para escucharte."

## 📊 Métricas y Validación

### KPIs de Calidad de Respuesta
```typescript
const qualityMetrics = {
  responseQuality: {
    relevance: { target: 0.9, weight: 0.25 },
    empathy: { target: 0.95, weight: 0.3 },
    clarity: { target: 0.85, weight: 0.2 },
    naturalness: { target: 0.9, weight: 0.25 }
  },
  interactionFlow: {
    turnTaking: { target: 0.9, weight: 0.3 },
    contextRetention: { target: 0.85, weight: 0.25 },
    userEngagement: { target: 0.9, weight: 0.45 }
  },
  assessmentSpecific: {
    questionClarity: { target: 0.9, weight: 0.3 },
    responseCapture: { target: 0.95, weight: 0.4 },
    followUpEffectiveness: { target: 0.85, weight: 0.3 }
  }
};
```

### Umbrales de Calidad
- **Mínimo:** 0.7
- **Advertencia:** 0.8
- **Excelente:** 0.9

### Proceso de Evaluación
1. **Validación automática** en tiempo real
2. **Análisis de intención** del usuario
3. **Cálculo de métricas** de calidad
4. **Ajuste dinámico** de prompts
5. **Registro de métricas** para análisis

## 🔧 Configuración y Personalización

### Configuración de Latencia
```typescript
const latencyConfig = {
  target: 1000, // ms
  warning: 2000, // ms
  critical: 5000, // ms
  optimization: {
    preloadTemplates: true,
    cacheContext: true,
    parallelProcessing: true
  }
};
```

### Configuración de Personalización
```typescript
const personalizationConfig = {
  nameHandling: {
    detectMultipleNames: true,
    askPreference: true,
    rememberPreference: true,
    useConsistently: true
  },
  culturalContext: {
    region: "Colombia",
    dialect: "paisa",
    formality: "cercano",
    expressions: ["pues", "entonces", "bueno", "mire", "usted"]
  }
};
```

## 🧪 Testing y Validación

### Suite de Testing Implementada
```bash
# Ejecutar todos los tests
npx ts-node src/test/context-engineering-test.ts
```

### Tests Incluidos
1. **Validación de configuración**
2. **Gestión de contexto**
3. **Motor de prompts**
4. **Análisis de intención**
5. **Métricas de calidad**
6. **Validación de respuestas**
7. **Manejo de errores**

### Ejemplo de Test
```typescript
// Test de análisis de intención
const enthusiasmIntent = analyzeUserIntent('Me encanta la IA, es fantástica!');
console.log(enthusiasmIntent);
// Output: { intent: 'enthusiasm', confidence: 0.8, keywords: ['me encanta', 'fantástica'] }
```

## 📈 Monitoreo y Análisis

### Métricas en Tiempo Real
- **Calidad de respuesta:** Relevancia, empatía, claridad, naturalidad
- **Flujo de interacción:** Turn-taking, retención de contexto, engagement
- **Específicas del assessment:** Claridad de preguntas, captura de respuestas, efectividad de seguimiento

### Dashboard de Monitoreo
```typescript
const monitoringDashboard = {
  realTimeMetrics: {
    averageResponseTime: "1.2s",
    qualityScore: "0.87",
    userSatisfaction: "0.92",
    completionRate: "94%"
  },
  alerts: {
    lowQualityThreshold: 0.7,
    highLatencyThreshold: 3000,
    errorRateThreshold: 0.05
  }
};
```

## 🔒 Seguridad y Privacidad

### Manejo de Datos
- **Anonimización:** Datos personales anonimizados
- **Encriptación:** Información sensible encriptada
- **Retención:** 30 días para sesiones, 1 año para análisis
- **Eliminación:** Automática según política

### Control de Acceso
- **Autenticación requerida:** Sí
- **Validación de dominio:** @summan.com
- **Timeout de sesión:** 30 minutos
- **Máximo sesiones por usuario:** 1

## 🚀 Implementación y Uso

### Instalación
```bash
# El sistema ya está integrado en el proyecto
# No requiere instalación adicional
```

### Uso Básico
```typescript
import { PromptEngine } from './services/prompt-engine';
import { ContextManager } from './services/context-engineering';

// Crear instancia del motor de prompts
const promptEngine = new PromptEngine();

// Generar prompt para una situación específica
const prompt = await promptEngine.generatePrompt({
  situation: 'greeting',
  context: {
    userName: 'Luis Fernando',
    sessionId: 'session_123'
  }
});

console.log(prompt.systemPrompt);
console.log(prompt.userPrompt);
```

### Integración con el Sistema Existente
El sistema de Context Engineering está completamente integrado con:
- ✅ **AssessmentAudio.tsx:** Generación de respuestas dinámicas
- ✅ **AssessmentFlow.tsx:** Gestión de flujo de conversación
- ✅ **context.ts:** Servicio de contexto existente
- ✅ **Firebase Functions:** Endpoint `/api/generate`

## 📚 Documentación Adicional

### Archivos Relacionados
- `src/services/context-engineering.ts` - Sistema principal
- `src/services/prompt-engine.ts` - Motor de prompts
- `src/config/context-engineering-config.ts` - Configuración
- `src/test/context-engineering-test.ts` - Suite de testing
- `docs/context-engineering.md` - Documentación técnica

### Referencias
- [Context Engineering Best Practices](https://www.anthropic.com/index/prompting-and-context-engineering)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Conversational AI Design](https://www.interaction-design.org/literature/topics/conversational-ai)

## 🎯 Próximos Pasos

### Mejoras Planificadas
1. **Análisis de sentimientos** en tiempo real
2. **Adaptación dinámica** de personalidad
3. **Integración con RAG** para conocimiento específico
4. **A/B testing** de prompts
5. **Análisis predictivo** de engagement

### Optimizaciones
1. **Caching inteligente** de prompts
2. **Compresión de contexto** para sesiones largas
3. **Paralelización** de análisis de intención
4. **Optimización de latencia** end-to-end

---

**Versión:** 1.0.0  
**Última actualización:** Agosto 2025  
**Mantenido por:** Equipo de Desarrollo Summan SAS 
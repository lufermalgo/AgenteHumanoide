/**
 * Sistema de Context Engineering para Agente Humanoide de Encuesta
 * Implementa principios de Context Engineering para gestión inteligente de prompts y contexto
 */

// ============================================================================
// TIPOS Y INTERFACES PRINCIPALES
// ============================================================================

export interface ContextObjective {
  primary: string;
  secondary: string[];
  successCriteria: string[];
  constraints: string[];
}

export interface ModelRole {
  identity: string;
  expertise: string[];
  perspective: string;
  tone: 'empático' | 'profesional' | 'cercano' | 'formal';
  style: 'conversacional' | 'directo' | 'narrativo' | 'técnico';
  avoidBehaviors: string[];
}

export interface InteractionRules {
  mustDo: string[];
  mustNotDo: string[];
  priorityOrder: string[];
  uncertaintyHandling: {
    strategy: 'ask_clarification' | 'assume_best_intent' | 'provide_options';
    defaultResponse: string;
  };
  conflictResolution: {
    primaryRule: string;
    fallbackStrategy: string;
  };
}

export interface PromptStructure {
  systemInstructions: string;
  contextualInstructions: string;
  userInputTemplate: string;
  outputTemplate: string;
  examples: {
    input: string;
    output: string;
    context: string;
  }[];
}

export interface ContextSources {
  preloadedData: {
    documents: string[];
    knowledgeBase: string[];
    ragEnabled: boolean;
  };
  integrations: {
    apis: string[];
    tools: string[];
    externalData: string[];
  };
  updatePolicies: {
    frequency: 'session' | 'daily' | 'weekly' | 'manual';
    triggers: string[];
    validationRules: string[];
  };
}

export interface MemoryManagement {
  shortTerm: {
    sessionData: Record<string, any>;
    maxSize: number;
    cleanupStrategy: 'lru' | 'fifo' | 'priority';
  };
  longTerm: {
    persistentData: Record<string, any>;
    storageStrategy: 'firestore' | 'localStorage' | 'hybrid';
    retentionPolicy: string;
  };
  summarization: {
    strategy: 'key_points' | 'semantic' | 'hierarchical';
    maxLength: number;
    triggers: string[];
  };
}

export interface ErrorHandling {
  validationProtocols: {
    responseQuality: string[];
    contextRelevance: string[];
    userIntent: string[];
  };
  clarificationStrategies: {
    ambiguousInput: string;
    incompleteData: string;
    conflictingInfo: string;
  };
  fallbackResponses: {
    apiFailure: string;
    contextLoss: string;
    timeout: string;
  };
}

export interface QualityMetrics {
  responseQuality: {
    relevance: number;
    empathy: number;
    clarity: number;
    naturalness: number;
  };
  interactionFlow: {
    turnTaking: number;
    contextRetention: number;
    userEngagement: number;
  };
  assessmentSpecific: {
    questionClarity: number;
    responseCapture: number;
    followUpEffectiveness: number;
  };
}

// ============================================================================
// CONFIGURACIÓN PRINCIPAL DEL CONTEXTO
// ============================================================================

export const ASSESSMENT_CONTEXT: {
  objective: ContextObjective;
  modelRole: ModelRole;
  interactionRules: InteractionRules;
  promptStructure: PromptStructure;
  contextSources: ContextSources;
  memoryManagement: MemoryManagement;
  errorHandling: ErrorHandling;
  qualityMetrics: QualityMetrics;
} = {
  objective: {
    primary: "Conducir un assessment de conocimiento en IA generativa de manera empática y natural, recolectando perspectivas auténticas de los usuarios para construir una línea base de entendimiento organizacional.",
    secondary: [
      "Fomentar respuestas honestas y reflexivas",
      "Mantener un ambiente conversacional cómodo",
      "Capturar matices y profundidad en las respuestas",
      "Facilitar la expresión natural de experiencias con IA"
    ],
    successCriteria: [
      "Usuario completa el assessment en 5-10 minutos",
      "Respuestas muestran reflexión genuina",
      "Interacción se siente natural y no forzada",
      "Usuario se siente escuchado y valorado"
    ],
    constraints: [
      "No dar retroalimentación o juicios sobre respuestas",
      "No desviarse del propósito del assessment",
      "Mantener confidencialidad de respuestas",
      "Respetar límites de tiempo establecidos"
    ]
  },

  modelRole: {
    identity: "Anita-AI, asistente especializada en assessment de IA generativa",
    expertise: [
      "Facilitación de conversaciones sobre IA",
      "Captura de perspectivas organizacionales",
      "Creación de ambiente empático y seguro",
      "Gestión de flujos de assessment"
    ],
    perspective: "Facilitador empático que busca entender, no evaluar",
    tone: "empático",
    style: "conversacional",
    avoidBehaviors: [
      "Hacer juicios sobre respuestas del usuario",
      "Dar consejos técnicos específicos",
      "Mostrar preferencias por tecnologías",
      "Interrumpir respuestas del usuario"
    ]
  },

  interactionRules: {
    mustDo: [
      "Usar el nombre preferido del usuario",
      "Mostrar interés genuino en las respuestas",
      "Preguntar si desea ampliar respuestas",
      "Mantener el foco en el assessment",
      "Validar comprensión cuando sea necesario"
    ],
    mustNotDo: [
      "Evaluar o juzgar respuestas del usuario",
      "Dar opiniones personales sobre IA",
      "Solicitar información personal no relevante",
      "Forzar respuestas cuando el usuario no quiere continuar",
      "Revelar información de otros usuarios"
    ],
    priorityOrder: [
      "Empatía y conexión humana",
      "Captura de respuestas auténticas",
      "Eficiencia en el flujo del assessment",
      "Mantenimiento del contexto conversacional"
    ],
    uncertaintyHandling: {
      strategy: "ask_clarification",
      defaultResponse: "Me gustaría entender mejor tu perspectiva. ¿Podrías contarme un poco más sobre eso?"
    },
    conflictResolution: {
      primaryRule: "Priorizar la experiencia del usuario sobre la eficiencia del sistema",
      fallbackStrategy: "Reconocer la ambigüedad y ofrecer opciones claras"
    }
  },

  promptStructure: {
    systemInstructions: `Eres Anita-AI, una asistente especializada en assessment de IA generativa para Summan SAS.

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
- Evita jerga técnica innecesaria`,

    contextualInstructions: `CONTEXTO ACTUAL:
- Sesión: {sessionId}
- Usuario: {userName}
- Pregunta actual: {currentQuestion}
- Progreso: {questionIndex}/{totalQuestions}
- Tiempo transcurrido: {elapsedTime}

ESTADO DE LA CONVERSACIÓN:
- Fase: {conversationPhase}
- Última respuesta del usuario: {lastUserResponse}
- Contexto acumulado: {sessionContext}`,

    userInputTemplate: `ENTRADA DEL USUARIO:
{userInput}

ANÁLISIS REQUERIDO:
- Detectar si la respuesta está completa
- Identificar oportunidades para profundizar
- Evaluar si el usuario quiere continuar
- Determinar el siguiente paso apropiado`,

    outputTemplate: `RESPUESTA GENERADA:
{generatedResponse}

SIGUIENTE ACCIÓN:
- Tipo: {nextActionType}
- Pregunta: {nextQuestion}
- Contexto a mantener: {contextToKeep}`,

    examples: [
      {
        input: "La IA me ha ayudado mucho en mi trabajo diario",
        output: "Me encanta escuchar cómo la IA te está ayudando en tu día a día. ¿Podrías contarme un ejemplo específico de cómo la usas en tu trabajo?",
        context: "Usuario muestra experiencia positiva con IA"
      },
      {
        input: "No sé mucho sobre IA, pero me interesa aprender",
        output: "Es completamente normal estar en proceso de aprendizaje con la IA. ¿Qué te gustaría saber más sobre ella?",
        context: "Usuario muestra interés pero poca experiencia"
      }
    ]
  },

  contextSources: {
    preloadedData: {
      documents: [
        "assessment-questions.json",
        "company-context.json",
        "ai-knowledge-base.json"
      ],
      knowledgeBase: [
        "Términos básicos de IA generativa",
        "Casos de uso comunes en empresas",
        "Barreras típicas de adopción"
      ],
      ragEnabled: true
    },
    integrations: {
      apis: [
        "Gemini API para generación",
        "Firebase para persistencia",
        "Google Auth para identificación"
      ],
      tools: [
        "Sistema de transcripción de voz",
        "Síntesis de voz",
        "Gestión de sesiones"
      ],
      externalData: [
        "Tendencias actuales en IA",
        "Mejores prácticas organizacionales"
      ]
    },
    updatePolicies: {
      frequency: "session",
      triggers: [
        "Nueva sesión de usuario",
        "Cambio de pregunta",
        "Actualización de contexto"
      ],
      validationRules: [
        "Verificar relevancia del contexto",
        "Validar coherencia temporal",
        "Asegurar privacidad de datos"
      ]
    }
  },

  memoryManagement: {
    shortTerm: {
      sessionData: {},
      maxSize: 10,
      cleanupStrategy: "lru"
    },
    longTerm: {
      persistentData: {},
      storageStrategy: "firestore",
      retentionPolicy: "30 días para datos de sesión, 1 año para análisis agregados"
    },
    summarization: {
      strategy: "key_points",
      maxLength: 200,
      triggers: [
        "Cambio de pregunta",
        "Fin de sesión",
        "Límite de memoria alcanzado"
      ]
    }
  },

  errorHandling: {
    validationProtocols: {
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
    },
    clarificationStrategies: {
      ambiguousInput: "Me gustaría entender mejor tu perspectiva. ¿Podrías ser más específico?",
      incompleteData: "¿Hay algo más que te gustaría agregar a tu respuesta?",
      conflictingInfo: "Veo que hay diferentes aspectos aquí. ¿Podrías ayudarme a entender mejor tu punto de vista?"
    },
    fallbackResponses: {
      apiFailure: "Disculpa, estoy teniendo algunos problemas técnicos. ¿Podrías repetir tu respuesta?",
      contextLoss: "Permíteme retomar el hilo de nuestra conversación. Estábamos hablando sobre...",
      timeout: "Veo que necesitas un momento para pensar. Tómate tu tiempo, estoy aquí para escucharte."
    }
  },

  qualityMetrics: {
    responseQuality: {
      relevance: 0.9,
      empathy: 0.95,
      clarity: 0.85,
      naturalness: 0.9
    },
    interactionFlow: {
      turnTaking: 0.9,
      contextRetention: 0.85,
      userEngagement: 0.9
    },
    assessmentSpecific: {
      questionClarity: 0.9,
      responseCapture: 0.95,
      followUpEffectiveness: 0.85
    }
  }
};

// ============================================================================
// GESTOR DE CONTEXTO DINÁMICO
// ============================================================================

export class ContextManager {
  private sessionContext: Record<string, any> = {};
  private conversationHistory: Array<{
    timestamp: Date;
    userInput: string;
    agentResponse: string;
    context: Record<string, any>;
  }> = [];
  private currentPhase: string = 'initialization';

  constructor(private baseContext = ASSESSMENT_CONTEXT) {}

  /**
   * Actualiza el contexto de la sesión actual
   */
  updateSessionContext(key: string, value: any): void {
    this.sessionContext[key] = value;
    
    // Aplicar estrategia de limpieza si es necesario
    if (Object.keys(this.sessionContext).length > this.baseContext.memoryManagement.shortTerm.maxSize) {
      this.cleanupShortTermMemory();
    }
  }

  /**
   * Obtiene el contexto actual para generación de prompts
   */
  getCurrentContext(): Record<string, any> {
    return {
      ...this.baseContext,
      session: this.sessionContext,
      conversation: {
        history: this.conversationHistory.slice(-5), // Últimas 5 interacciones
        phase: this.currentPhase,
        summary: this.generateConversationSummary()
      }
    };
  }

  /**
   * Genera un prompt contextualizado para una situación específica
   */
  generateContextualPrompt(
    situation: 'greeting' | 'question_intro' | 'response_processing' | 'follow_up' | 'closing',
    userInput?: string
    // additionalContext?: Record<string, any>  // Comentado - no utilizado
  ): string {
    const context = this.getCurrentContext();
    
    let situationalInstructions = '';
    let userPrompt = '';

    switch (situation) {
      case 'greeting':
        situationalInstructions = `
SITUACIÓN: Saludo inicial y presentación del assessment
OBJETIVO: Establecer conexión empática y explicar el propósito
CONTEXTO: Primera interacción con el usuario
        `;
        userPrompt = `Genera un saludo cálido y empático para ${context.session.userName || 'el usuario'}. 
Explica brevemente el propósito del assessment de manera amigable y tranquilizadora.
Incluye que es una conversación natural, no un examen, y que quieres conocer su perspectiva sobre IA.`;
        break;

      case 'question_intro':
        situationalInstructions = `
SITUACIÓN: Introducción a una nueva pregunta del assessment
OBJETIVO: Presentar la pregunta de manera natural y conversacional
CONTEXTO: Transición entre preguntas
        `;
        userPrompt = `Estás por hacer la siguiente pregunta: "${context.session.currentQuestion}".
Introduce la pregunta de forma natural y conversacional.
Mantén el tono empático y cercano.
Sé específico y personalizado.`;
        break;

      case 'response_processing':
        situationalInstructions = `
SITUACIÓN: Procesamiento de respuesta del usuario
OBJETIVO: Mostrar comprensión y preparar seguimiento
CONTEXTO: Respuesta recién recibida
        `;
        userPrompt = `El usuario acaba de responder: "${userInput}"
Procesa esta respuesta mostrando comprensión y empatía.
Prepara una transición natural hacia la siguiente pregunta o seguimiento.`;
        break;

      case 'follow_up':
        situationalInstructions = `
SITUACIÓN: Seguimiento después de una respuesta
OBJETIVO: Invitar a ampliar o profundizar
CONTEXTO: Respuesta inicial recibida
        `;
        userPrompt = `El usuario acaba de responder una pregunta sobre IA.
Pregúntale de forma cálida y empática si desea agregar algo más a su respuesta.
Muestra interés genuino en lo que dijo.
Sé variado en tu forma de preguntar, no uses siempre la misma frase.`;
        break;

      case 'closing':
        situationalInstructions = `
SITUACIÓN: Cierre de la sesión de assessment
OBJETIVO: Agradecer y cerrar de manera positiva
CONTEXTO: Assessment completado
        `;
        userPrompt = `El assessment ha sido completado exitosamente.
Genera un cierre cálido y agradecido.
Reconoce la participación del usuario y la importancia de su contribución.`;
        break;
    }

    return `
${this.baseContext.promptStructure.systemInstructions}

${situationalInstructions}

${this.baseContext.promptStructure.contextualInstructions.replace(/\{(\w+)\}/g, (match, key) => {
  return context.session[key] || context.conversation[key] || match;
})}

${userPrompt}
    `.trim();
  }

  /**
   * Registra una interacción en el historial
   */
  recordInteraction(userInput: string, agentResponse: string): void {
    this.conversationHistory.push({
      timestamp: new Date(),
      userInput,
      agentResponse,
      context: { ...this.sessionContext }
    });

    // Mantener solo las últimas 20 interacciones
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  /**
   * Genera un resumen de la conversación
   */
  private generateConversationSummary(): string {
    if (this.conversationHistory.length === 0) return '';

    const keyPoints = this.conversationHistory
      .map(interaction => interaction.userInput)
      .slice(-3) // Últimas 3 respuestas del usuario
      .join('. ');

    return `Resumen de la conversación: ${keyPoints}`;
  }

  /**
   * Limpia la memoria a corto plazo según la estrategia configurada
   */
  private cleanupShortTermMemory(): void {
    const strategy = this.baseContext.memoryManagement.shortTerm.cleanupStrategy;
    const keys = Object.keys(this.sessionContext);

    switch (strategy) {
      case 'lru':
        // Implementar LRU (Least Recently Used)
        // Por simplicidad, eliminamos las claves más antiguas
        const keysToRemove = keys.slice(0, Math.floor(keys.length / 2));
        keysToRemove.forEach(key => delete this.sessionContext[key]);
        break;

      case 'fifo':
        // FIFO (First In, First Out)
        const oldestKey = keys[0];
        if (oldestKey) delete this.sessionContext[oldestKey];
        break;

      case 'priority':
        // Mantener solo las claves de alta prioridad
        const priorityKeys = ['userName', 'currentQuestion', 'sessionId'];
        const nonPriorityKeys = keys.filter(key => !priorityKeys.includes(key));
        nonPriorityKeys.slice(0, Math.floor(nonPriorityKeys.length / 2))
          .forEach(key => delete this.sessionContext[key]);
        break;
    }
  }

  /**
   * Valida la calidad de una respuesta generada
   */
  validateResponse(response: string): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Validar que no contenga juicios
    const judgmentWords = ['correcto', 'incorrecto', 'bien', 'mal', 'deberías', 'no deberías'];
    const hasJudgments = judgmentWords.some(word => 
      response.toLowerCase().includes(word)
    );
    if (hasJudgments) {
      issues.push('La respuesta contiene juicios sobre el usuario');
      suggestions.push('Eliminar palabras que impliquen evaluación');
    }

    // Validar empatía
    const empathyWords = ['entiendo', 'comprendo', 'me gusta', 'interesante', 'gracias'];
    const hasEmpathy = empathyWords.some(word => 
      response.toLowerCase().includes(word)
    );
    if (!hasEmpathy) {
      issues.push('La respuesta carece de empatía');
      suggestions.push('Incluir palabras que muestren comprensión y empatía');
    }

    // Validar longitud
    if (response.length < 20) {
      issues.push('La respuesta es demasiado corta');
      suggestions.push('Expandir la respuesta para ser más conversacional');
    }

    if (response.length > 300) {
      issues.push('La respuesta es demasiado larga');
      suggestions.push('Acortar la respuesta para mantener el flujo');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Maneja errores y ambigüedades
   */
  handleError(errorType: 'api_failure' | 'context_loss' | 'timeout' | 'ambiguous_input'): string {
    const fallbackResponses = this.baseContext.errorHandling.fallbackResponses;
    const clarificationStrategies = this.baseContext.errorHandling.clarificationStrategies;

    switch (errorType) {
      case 'api_failure':
        return fallbackResponses.apiFailure;
      case 'context_loss':
        return fallbackResponses.contextLoss;
      case 'timeout':
        return fallbackResponses.timeout;
      case 'ambiguous_input':
        return clarificationStrategies.ambiguousInput;
      default:
        return "Disculpa, necesito un momento para procesar eso. ¿Podrías repetirlo?";
    }
  }
}

// ============================================================================
// UTILIDADES Y HELPERS
// ============================================================================

/**
 * Analiza la intención del usuario en una respuesta
 */
export function analyzeUserIntent(userInput: string): {
  intent: 'complete_response' | 'incomplete_response' | 'confusion' | 'reluctance' | 'enthusiasm';
  confidence: number;
  keywords: string[];
} {
  const input = userInput.toLowerCase();
  
  // Detectar entusiasmo
  const enthusiasmWords = ['me encanta', 'fantástico', 'excelente', 'genial', 'muy bien'];
  const hasEnthusiasm = enthusiasmWords.some(word => input.includes(word));
  
  // Detectar confusión
  const confusionWords = ['no sé', 'no entiendo', 'confuso', 'no estoy seguro'];
  const hasConfusion = confusionWords.some(word => input.includes(word));
  
  // Detectar reticencia
  const reluctanceWords = ['no quiero', 'prefiero no', 'no me siento cómodo'];
  const hasReluctance = reluctanceWords.some(word => input.includes(word));
  
  // Detectar respuesta completa
  const completeIndicators = ['.', '!', '?', 'y eso es todo', 'eso es'];
  const hasCompleteIndicators = completeIndicators.some(indicator => input.includes(indicator));
  
  let intent: 'complete_response' | 'incomplete_response' | 'confusion' | 'reluctance' | 'enthusiasm';
  let confidence = 0.5;
  
  if (hasEnthusiasm) {
    intent = 'enthusiasm';
    confidence = 0.8;
  } else if (hasConfusion) {
    intent = 'confusion';
    confidence = 0.7;
  } else if (hasReluctance) {
    intent = 'reluctance';
    confidence = 0.6;
  } else if (hasCompleteIndicators && input.length > 20) {
    intent = 'complete_response';
    confidence = 0.7;
  } else {
    intent = 'incomplete_response';
    confidence = 0.6;
  }
  
  return {
    intent,
    confidence,
    keywords: [...enthusiasmWords, ...confusionWords, ...reluctanceWords]
      .filter(word => input.includes(word))
  };
}

/**
 * Genera métricas de calidad de la interacción
 */
export function generateQualityMetrics(
  userInput: string,
  agentResponse: string,
  interactionTime: number
): QualityMetrics {
  return {
    responseQuality: {
      relevance: calculateRelevance(userInput, agentResponse),
      empathy: calculateEmpathy(agentResponse),
      clarity: calculateClarity(agentResponse),
      naturalness: calculateNaturalness(agentResponse)
    },
    interactionFlow: {
      turnTaking: interactionTime < 5000 ? 0.9 : 0.7, // Menos de 5 segundos es ideal
      contextRetention: 0.85, // Basado en implementación actual
      userEngagement: calculateEngagement(userInput)
    },
    assessmentSpecific: {
      questionClarity: 0.9,
      responseCapture: userInput.length > 10 ? 0.95 : 0.7,
      followUpEffectiveness: 0.85
    }
  };
}

// Funciones auxiliares para cálculo de métricas
function calculateRelevance(userInput: string, agentResponse: string): number {
  const userWords = userInput.toLowerCase().split(' ');
  const agentWords = agentResponse.toLowerCase().split(' ');
  const commonWords = userWords.filter(word => agentWords.includes(word));
  return Math.min(commonWords.length / userWords.length, 1);
}

function calculateEmpathy(response: string): number {
  const empathyWords = ['entiendo', 'comprendo', 'me gusta', 'interesante', 'gracias', 'valioso'];
  const found = empathyWords.filter(word => response.toLowerCase().includes(word));
  return Math.min(found.length / empathyWords.length, 1);
}

function calculateClarity(response: string): number {
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  return avgLength < 100 ? 0.9 : 0.7; // Oraciones cortas son más claras
}

function calculateNaturalness(response: string): number {
  const naturalnessIndicators = ['¿', '!', '...', 'pues', 'entonces', 'bueno'];
  const found = naturalnessIndicators.filter(indicator => response.includes(indicator));
  return Math.min(found.length / naturalnessIndicators.length, 1);
}

function calculateEngagement(userInput: string): number {
  const engagementIndicators = ['porque', 'cuando', 'cómo', 'qué', 'dónde', 'cuál'];
  const found = engagementIndicators.filter(indicator => userInput.toLowerCase().includes(indicator));
  return Math.min(found.length / engagementIndicators.length, 1);
}

// ============================================================================
// EXPORTACIÓN PRINCIPAL
// ============================================================================

export default {
  ASSESSMENT_CONTEXT,
  ContextManager,
  analyzeUserIntent,
  generateQualityMetrics
}; 
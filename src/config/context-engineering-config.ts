/**
 * Configuración del Sistema de Context Engineering
 * Parámetros ajustables para el comportamiento del agente
 */

// Agregar tipo de índice para permitir acceso dinámico
export interface ContextEngineeringConfigType {
  [key: string]: any;
  objectives: {
    primaryGoal: string;
    successMetrics: {
      completionTime: { min: number; max: number; unit: string; };
      userSatisfaction: { target: number; min: number; };
      responseQuality: { target: number; min: number; };
      engagementLevel: { target: number; min: number; };
    };
    constraints: {
      timeLimit: { max: number; unit: string; };
      responseLength: { max: number; unit: string; };
      userInterruptions: { max: number; };
    };
  };
  model: {
    identity: string;
    role: string;
    expertise: string[];
    personality: {
      tone: string;
      style: string;
      culturalContext: string;
      formality: string;
    };
    avoidBehaviors: string[];
  };
  interaction: {
    rules: {
      mustDo: string[];
      mustNotDo: string[];
      priorityOrder: string[];
    };
    uncertaintyHandling: {
      strategy: string;
      defaultResponse: string;
      clarificationTriggers: string[];
    };
    conflictResolution: {
      primaryRule: string;
      fallbackStrategy: string;
      escalationThreshold: number;
    };
  };
  prompts: {
    structure: {
      systemInstructions: {
        includeRole: boolean;
        includeDirectives: boolean;
        includeContext: boolean;
        includeExamples: boolean;
      };
      userInstructions: {
        includeSituation: boolean;
        includeUserInput: boolean;
        includeContext: boolean;
        includeConstraints: boolean;
      };
      outputFormat: {
        maxLength: number;
        minLength: number;
        includeEmpathy: boolean;
        includePersonalization: boolean;
      };
    };
    templates: {
      greeting: {
        includePurpose: boolean;
        includeReassurance: boolean;
        includePersonalization: boolean;
      };
      questionIntro: {
        includeTransition: boolean;
        includeContext: boolean;
        includePersonalization: boolean;
      };
      responseProcessing: {
        includeUnderstanding: boolean;
        includeEmpathy: boolean;
        includeFollowUp: boolean;
      };
      followUp: {
        includeInterest: boolean;
        includeVariation: boolean;
        includeNonPressure: boolean;
      };
      namePreference: {
        includeOptions: boolean;
        includeNaturalness: boolean;
        includeEmpathy: boolean;
      };
      nameConfirmation: {
        includeConfirmation: boolean;
        includeTransition: boolean;
        includePersonalization: boolean;
      };
      closing: {
        includeGratitude: boolean;
        includeRecognition: boolean;
        includeWarmth: boolean;
      };
    };
    validation: {
      qualityThreshold: number;
      empathyRequired: boolean;
      personalizationRequired: boolean;
      noJudgmentRequired: boolean;
      lengthConstraints: {
        min: number;
        max: number;
      };
    };
  };
  context: {
    sources: {
      preloadedData: string[];
      integrations: string[];
      externalData: string[];
    };
    updatePolicies: {
      frequency: string;
      triggers: string[];
      validationRules: string[];
    };
  };
  memory: {
    shortTerm: {
      maxSize: number;
      cleanupStrategy: string;
      retentionTime: string;
    };
    longTerm: {
      storageStrategy: string;
      retentionPolicy: string;
      summarizationStrategy: string;
      maxSummaryLength: number;
    };
    conversationHistory: {
      maxEntries: number;
      includeContext: boolean;
      includeTimestamps: boolean;
      includeQualityMetrics: boolean;
    };
  };
  errorHandling: {
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
  };
  qualityMetrics: {
    responseQuality: {
      relevance: { target: number; weight: number; };
      empathy: { target: number; weight: number; };
      clarity: { target: number; weight: number; };
      naturalness: { target: number; weight: number; };
    };
    interactionFlow: {
      turnTaking: { target: number; weight: number; };
      contextRetention: { target: number; weight: number; };
      userEngagement: { target: number; weight: number; };
    };
    assessmentSpecific: {
      questionClarity: { target: number; weight: number; };
      responseCapture: { target: number; weight: number; };
      followUpEffectiveness: { target: number; weight: number; };
    };
    thresholds: {
      minimumQuality: number;
      warningThreshold: number;
      excellentThreshold: number;
    };
  };
  intentAnalysis: {
    detection: {
      enthusiasm: {
        keywords: string[];
        confidence: number;
      };
      confusion: {
        keywords: string[];
        confidence: number;
      };
      reluctance: {
        keywords: string[];
        confidence: number;
      };
      completeResponse: {
        indicators: string[];
        minLength: number;
        confidence: number;
      };
    };
    adjustment: {
      confusion: {
        action: string;
        promptAddition: string;
      };
      reluctance: {
        action: string;
        promptAddition: string;
      };
      enthusiasm: {
        action: string;
        promptAddition: string;
      };
    };
  };
  performance: {
    latency: {
      target: number; // ms
      warning: number; // ms
      critical: number; // ms
      optimization: {
        preloadTemplates: boolean;
        cacheContext: boolean;
        parallelProcessing: boolean;
      };
    };
    memory: {
      maxContextSize: number;
      cleanupInterval: number; // interacciones
      optimization: {
        compressHistory: boolean;
        prioritizeRecent: boolean;
        removeIrrelevant: boolean;
      };
    };
  };
  personalization: {
    nameHandling: {
      detectMultipleNames: boolean;
      askPreference: boolean;
      rememberPreference: boolean;
      useConsistently: boolean;
    };
    culturalContext: {
      region: string;
      dialect: string;
      formality: string;
      expressions: string[];
    };
    userPreferences: {
      trackInteractionStyle: boolean;
      adaptTone: boolean;
      rememberContext: boolean;
      personalizeExamples: boolean;
    };
  };
  security: {
    dataHandling: {
      anonymizePersonalData: boolean;
      encryptSensitiveInfo: boolean;
      retentionPolicy: string;
      deletionPolicy: string;
    };
    accessControl: {
      requireAuthentication: boolean;
      validateDomain: string;
      sessionTimeout: number; // minutos
      maxSessionsPerUser: number;
    };
    contentFiltering: {
      filterInappropriateContent: boolean;
      detectSensitiveTopics: boolean;
      redirectToHuman: boolean;
    };
  };
}

export const CONTEXT_ENGINEERING_CONFIG: ContextEngineeringConfigType = {
  // ============================================================================
  // CONFIGURACIÓN DE OBJETIVOS
  // ============================================================================
  objectives: {
    primaryGoal: "Conducir assessment de IA generativa de manera empática y natural",
    successMetrics: {
      completionTime: { min: 5, max: 10, unit: 'minutes' },
      userSatisfaction: { target: 0.8, min: 0.6 },
      responseQuality: { target: 0.85, min: 0.7 },
      engagementLevel: { target: 0.9, min: 0.7 }
    },
    constraints: {
      timeLimit: { max: 10, unit: "minutos" },
      responseLength: { max: 500, unit: "caracteres" },
      userInterruptions: { max: 3 }
    }
  },

  // ============================================================================
  // CONFIGURACIÓN DEL MODELO
  // ============================================================================
  model: {
    identity: "Anita-AI",
    role: "Facilitador empático de assessment",
    expertise: [
      "Facilitación de conversaciones sobre IA",
      "Captura de perspectivas organizacionales",
      "Creación de ambiente empático y seguro"
    ],
    personality: {
      tone: "empático",
      style: "conversacional",
      culturalContext: "colombiano (paisa)",
      formality: "cercano pero profesional"
    },
    avoidBehaviors: [
      "Evaluar o juzgar respuestas",
      "Dar consejos técnicos específicos",
      "Mostrar preferencias por tecnologías",
      "Interrumpir respuestas del usuario"
    ]
  },

  // ============================================================================
  // CONFIGURACIÓN DE INTERACCIÓN
  // ============================================================================
  interaction: {
    rules: {
      mustDo: [
        "Usar nombre preferido del usuario",
        "Mostrar interés genuino",
        "Preguntar si desea ampliar",
        "Mantener foco en assessment",
        "Validar comprensión cuando sea necesario"
      ],
      mustNotDo: [
        "Evaluar respuestas del usuario",
        "Dar opiniones personales sobre IA",
        "Solicitar información personal no relevante",
        "Forzar respuestas",
        "Revelar información de otros usuarios"
      ],
      priorityOrder: [
        "Empatía y conexión humana",
        "Captura de respuestas auténticas",
        "Eficiencia en el flujo",
        "Mantenimiento del contexto"
      ]
    },
    uncertaintyHandling: {
      strategy: "ask_clarification",
      defaultResponse: "Me gustaría entender mejor tu perspectiva. ¿Podrías contarme un poco más sobre eso?",
      clarificationTriggers: [
        "respuestas ambiguas",
        "información incompleta",
        "conflicto de información"
      ]
    },
    conflictResolution: {
      primaryRule: "Priorizar experiencia del usuario sobre eficiencia del sistema",
      fallbackStrategy: "Reconocer ambigüedad y ofrecer opciones claras",
      escalationThreshold: 3 // intentos antes de escalar
    }
  },

  // ============================================================================
  // CONFIGURACIÓN DE PROMPTS
  // ============================================================================
  prompts: {
    structure: {
      systemInstructions: {
        includeRole: true,
        includeDirectives: true,
        includeContext: true,
        includeExamples: true
      },
      userInstructions: {
        includeSituation: true,
        includeUserInput: true,
        includeContext: true,
        includeConstraints: true
      },
      outputFormat: {
        maxLength: 300,
        minLength: 50,
        includeEmpathy: true,
        includePersonalization: true
      }
    },
    templates: {
      greeting: {
        includePurpose: true,
        includeReassurance: true,
        includePersonalization: true
      },
      questionIntro: {
        includeTransition: true,
        includeContext: true,
        includePersonalization: true
      },
      responseProcessing: {
        includeUnderstanding: true,
        includeEmpathy: true,
        includeFollowUp: true
      },
      followUp: {
        includeInterest: true,
        includeVariation: true,
        includeNonPressure: true
      },
      namePreference: {
        includeOptions: true,
        includeNaturalness: true,
        includeEmpathy: true
      },
      nameConfirmation: {
        includeConfirmation: true,
        includeTransition: true,
        includePersonalization: true
      },
      closing: {
        includeGratitude: true,
        includeRecognition: true,
        includeWarmth: true
      }
    },
    validation: {
      qualityThreshold: 0.7,
      empathyRequired: true,
      personalizationRequired: true,
      noJudgmentRequired: true,
      lengthConstraints: {
        min: 20,
        max: 300
      }
    }
  },

  // ============================================================================
  // CONFIGURACIÓN DE CONTEXTO
  // ============================================================================
  context: {
    sources: {
      preloadedData: [
        "assessment-questions.json",
        "company-context.json",
        "ai-knowledge-base.json"
      ],
      integrations: [
        "Gemini API",
        "Firebase",
        "Google Auth"
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

  // ============================================================================
  // CONFIGURACIÓN DE MEMORIA
  // ============================================================================
  memory: {
    shortTerm: {
      maxSize: 10,
      cleanupStrategy: "lru",
      retentionTime: "session"
    },
    longTerm: {
      storageStrategy: "firestore",
      retentionPolicy: "30 días para sesiones, 1 año para análisis",
      summarizationStrategy: "key_points",
      maxSummaryLength: 200
    },
    conversationHistory: {
      maxEntries: 20,
      includeContext: true,
      includeTimestamps: true,
      includeQualityMetrics: true
    }
  },

  // ============================================================================
  // CONFIGURACIÓN DE MANEJO DE ERRORES
  // ============================================================================
  errorHandling: {
    validationProtocols: {
      responseQuality: [
        "Verificar empatía",
        "Asegurar no juicios",
        "Validar coherencia"
      ],
      contextRelevance: [
        "Confirmar contexto actual",
        "Verificar relevancia",
        "Validar no información obsoleta"
      ],
      userIntent: [
        "Detectar voluntad de continuar",
        "Identificar necesidad de clarificación",
        "Reconocer señales de frustración"
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

  // ============================================================================
  // CONFIGURACIÓN DE MÉTRICAS DE CALIDAD
  // ============================================================================
  qualityMetrics: {
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
    },
    thresholds: {
      minimumQuality: 0.7,
      warningThreshold: 0.8,
      excellentThreshold: 0.9
    }
  },

  // ============================================================================
  // CONFIGURACIÓN DE ANÁLISIS DE INTENCIÓN
  // ============================================================================
  intentAnalysis: {
    detection: {
      enthusiasm: {
        keywords: ['me encanta', 'fantástico', 'excelente', 'genial', 'muy bien'],
        confidence: 0.8
      },
      confusion: {
        keywords: ['no sé', 'no entiendo', 'confuso', 'no estoy seguro'],
        confidence: 0.7
      },
      reluctance: {
        keywords: ['no quiero', 'prefiero no', 'no me siento cómodo'],
        confidence: 0.6
      },
      completeResponse: {
        indicators: ['.', '!', '?', 'y eso es todo', 'eso es'],
        minLength: 20,
        confidence: 0.7
      }
    },
    adjustment: {
      confusion: {
        action: "add_clarity",
        promptAddition: "NOTA: El usuario muestra confusión. Sé más claro y ofrece más contexto."
      },
      reluctance: {
        action: "increase_empathy",
        promptAddition: "NOTA: El usuario muestra reticencia. Sé más empático y no presiones."
      },
      enthusiasm: {
        action: "deepen_engagement",
        promptAddition: "NOTA: El usuario muestra entusiasmo. Aprovecha para profundizar."
      }
    }
  },

  // ============================================================================
  // CONFIGURACIÓN DE LATENCIA Y RENDIMIENTO
  // ============================================================================
  performance: {
    latency: {
      target: 1000, // ms
      warning: 2000, // ms
      critical: 5000, // ms
      optimization: {
        preloadTemplates: true,
        cacheContext: true,
        parallelProcessing: true
      }
    },
    memory: {
      maxContextSize: 10,
      cleanupInterval: 5, // interacciones
      optimization: {
        compressHistory: true,
        prioritizeRecent: true,
        removeIrrelevant: true
      }
    }
  },

  // ============================================================================
  // CONFIGURACIÓN DE PERSONALIZACIÓN
  // ============================================================================
  personalization: {
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
      expressions: [
        "pues",
        "entonces",
        "bueno",
        "mire",
        "usted"
      ]
    },
    userPreferences: {
      trackInteractionStyle: true,
      adaptTone: true,
      rememberContext: true,
      personalizeExamples: true
    }
  },

  // ============================================================================
  // CONFIGURACIÓN DE SEGURIDAD Y PRIVACIDAD
  // ============================================================================
  security: {
    dataHandling: {
      anonymizePersonalData: true,
      encryptSensitiveInfo: true,
      retentionPolicy: "30 días",
      deletionPolicy: "automático"
    },
    accessControl: {
      requireAuthentication: true,
      validateDomain: "@summan.com",
      sessionTimeout: 30, // minutos
      maxSessionsPerUser: 1
    },
    contentFiltering: {
      filterInappropriateContent: true,
      detectSensitiveTopics: true,
      redirectToHuman: false
    }
  }
};

// ============================================================================
// FUNCIONES DE CONFIGURACIÓN
// ============================================================================

/**
 * Obtiene una configuración específica del sistema
 */
export function getConfig(path: string): any {
  const keys = path.split('.');
  let current = CONTEXT_ENGINEERING_CONFIG;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return current;
}

/**
 * Actualiza una configuración específica
 */
export function updateConfig(path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  let current = CONTEXT_ENGINEERING_CONFIG;
  
  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

/**
 * Valida la configuración actual
 */
export function validateConfig(): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Validar objetivos
  if (!CONTEXT_ENGINEERING_CONFIG.objectives.primaryGoal) {
    issues.push("Objetivo primario no definido");
  }
  
  // Validar métricas de calidad
  const qualityMetrics = CONTEXT_ENGINEERING_CONFIG.qualityMetrics;
  if (qualityMetrics.thresholds.minimumQuality > qualityMetrics.thresholds.warningThreshold) {
    issues.push("Umbral mínimo de calidad mayor que umbral de advertencia");
  }
  
  // Validar configuración de latencia
  if (CONTEXT_ENGINEERING_CONFIG.performance.latency.target > CONTEXT_ENGINEERING_CONFIG.performance.latency.warning) {
    issues.push("Latencia objetivo mayor que latencia de advertencia");
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Exporta la configuración para uso externo
 */
export default CONTEXT_ENGINEERING_CONFIG; 
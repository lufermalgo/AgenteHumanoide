export interface AgentContext {
  persona: {
    name: string;
    aiPronunciation: string;
    style: {
      tone: string;
      formality: string;
      avoidLastNames: boolean;
      noJargon: boolean;
      languageCode: string;
    };
  };
  voices: {
    defaultVoice: string;
    languageCode: string;
    alternatives: string[];
    sayNameAs: Record<string, string>;
  };
  interactionPolicies: {
    inScopeOnly: boolean;
    singleRunPerUser: boolean;
    showQuestionOnScreen: boolean;
    hideUserTranscriptionOnScreen: boolean;
    noButtons: boolean;
    bargeIn: boolean;
    fallbackIfAvatarFails: boolean;
  };
  timeConstraints: {
    targetLatencyMs: number;
    maxAcceptableLatencyMs: number;
    maxUserTurnMs: number;
    silenceCloseMs: number;
    followupExtraTurnMs: number;
    sessionDurationMin: number;
    sessionDurationMax: number;
  };
  turnTaking: {
    vad: {
      enabled: boolean;
      silenceMs: number;
      rmsThreshold: number;
    };
    askAddMore: boolean;
    addMoreUtterances: string[];
  };
  namePreference: {
    detectDoubleFirstName: boolean;
    askWhenTwoNames: boolean;
    questionTemplate: string;
    storeKey: string;
    neverUseLastNames: boolean;
  };
  intro: {
    say: string;
    rules: string[];
  };
  questionFlow: {
    readAloud: boolean;
    showOnScreen: boolean;
    confirmClose: boolean;
    afterAnswer: {
      say: string;
      interpretNo: string[];
    };
  };
  persistence: {
    enabled: boolean;
    collectionsPrefix: string;
    session: {
      fields: string[];
    };
    answer: {
      fields: string[];
    };
    resume: {
      enabled: boolean;
      fromLastQuestion: boolean;
    };
  };
  directives: string[];
  ui: {
    indicators: {
      speaking: string;
      listening: string;
      processing: string;
    };
    buttons: {
      visible: boolean;
    };
  };
  examples: Array<{
    title: string;
    dialog: Array<{
      role: 'assistant' | 'user';
      text: string;
    }>;
  }>;
}

export interface NameAnalysis {
  fullName: string;
  firstNames: string[];
  preferred: string;
  needsAsk: boolean;
  questionText?: string;
}

// Función para generar respuestas dinámicas usando Gemini
export async function generate_agent_response(
  context: AgentContext,
  situation: 'greeting' | 'name_preference' | 'name_confirmation' | 'add_more' | 'question_intro',
  userInput?: string,
  userName?: string,
  questionText?: string
): Promise<string> {
  
  const systemPrompt = `Eres ${context.persona.name} (pronunciado "${context.voices.sayNameAs[context.persona.name] || context.persona.name}"), un asistente de IA empático y cercano para realizar assessments de conocimiento en IA generativa.

TU PERSONALIDAD:
- ${context.persona.style.tone}
- ${context.persona.style.formality}
- ${context.persona.style.avoidLastNames ? 'Nunca uses apellidos del usuario' : ''}
- ${context.persona.style.noJargon ? 'Evita jerga técnica, usa lenguaje accesible' : ''}

DIRECTIVAS IMPORTANTES:
${context.directives.map(d => `- ${d}`).join('\n')}

REGLAS DE INTERACCIÓN:
${context.intro.rules.map(r => `- ${r}`).join('\n')}

IMPORTANTE: 
- Sé EMPÁTICO y CÁLIDO en cada respuesta
- Varía tu forma de expresarte, no uses siempre las mismas frases
- Mantén un tono conversacional natural
- Muestra genuino interés por la persona
- Sé específico y personalizado en tus respuestas`;

  let userPrompt = '';
  
  switch (situation) {
    case 'greeting':
      userPrompt = `Genera un saludo inicial cálido y empático para ${userName || 'el usuario'}. 
      Explica brevemente el propósito del assessment de manera amigable y tranquilizadora.
      Incluye que es una conversación natural, no un examen, y que quieres conocer su perspectiva sobre IA.
      Sé específico y personalizado.`;
      break;
      
    case 'name_preference':
      const firstNames = userName?.split(' ') || [];
      userPrompt = `El usuario se llama ${userName}. Detecto que tiene ${firstNames.length} nombre(s): ${firstNames.join(', ')}.
      Pregúntale de forma cálida y empática cómo prefiere que lo llame.
      Ofrece las opciones de manera natural y conversacional.
      Sé específico con sus nombres reales.`;
      break;
      
    case 'name_confirmation':
      userPrompt = `El usuario acaba de confirmar que prefiere que lo llame "${userName}".
      Confirma su elección de forma cálida y empática.
      Transición suavemente a la primera pregunta: "${questionText}".
      Sé personalizado y muestra que recuerdas su preferencia.`;
      break;
      
    case 'add_more':
      userPrompt = `El usuario acaba de responder una pregunta sobre IA.
      Pregúntale de forma cálida y empática si desea agregar algo más a su respuesta.
      Muestra interés genuino en lo que dijo.
      Sé variado en tu forma de preguntar, no uses siempre la misma frase.`;
      break;
      
    case 'question_intro':
      userPrompt = `Estás por hacer la siguiente pregunta: "${questionText}".
      Introduce la pregunta de forma natural y conversacional.
      Mantén el tono empático y cercano.
      Sé específico y personalizado.`;
      break;
  }

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        maxTokens: 200
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.text || get_fallback_response(situation, context, userName, questionText);
    }
  } catch (error) {
    console.error('Error generating response:', error);
  }

  // Fallback si falla la generación
  return get_fallback_response(situation, context, userName, questionText);
}

// Respuestas de fallback (más variadas que las actuales)
function get_fallback_response(
  situation: string, 
  context: AgentContext, 
  userName?: string, 
  questionText?: string
): string {
  const responses = {
    greeting: [
      `¡Hola ${userName || 'amigo'}! Soy ${context.voices.sayNameAs[context.persona.name] || context.persona.name}. Me alegra mucho conocerte.`,
      `Hola ${userName || 'querido'}, soy ${context.voices.sayNameAs[context.persona.name] || context.persona.name}. Qué gusto saludarte.`,
      `¡Hola ${userName || 'compañero'}! Soy ${context.voices.sayNameAs[context.persona.name] || context.persona.name}. Me encanta poder conversar contigo.`
    ],
    name_preference: [
      `Me encantaría saber cómo prefieres que te llame. ¿Te sientes más cómodo con ${userName?.split(' ')[0]}, ${userName?.split(' ')[1] || 'tu segundo nombre'}, o prefieres que use ambos?`,
      `Para que nuestra conversación sea más cercana, ¿cómo te gustaría que te llame? ¿${userName?.split(' ')[0]}, ${userName?.split(' ')[1] || 'tu segundo nombre'}, o ambos nombres?`,
      `Quiero que te sientas cómodo. ¿Cómo prefieres que te llame: ${userName?.split(' ')[0]}, ${userName?.split(' ')[1] || 'tu segundo nombre'}, o los dos juntos?`
    ],
    name_confirmation: [
      `¡Perfecto, ${userName}! Me encanta tu elección. Ahora, empecemos con nuestra primera pregunta: ${questionText}`,
      `Excelente, ${userName}. Me parece muy bien. Continuemos entonces con: ${questionText}`,
      `¡Genial, ${userName}! Me alegra saber cómo prefieres que te llame. Ahora vamos con: ${questionText}`
    ],
    add_more: [
      `Me encanta lo que me has contado. ¿Te gustaría agregar algo más a tu respuesta?`,
      `Qué interesante tu perspectiva. ¿Hay algo más que quieras compartir sobre eso?`,
      `Me parece muy valioso lo que dices. ¿Quieres complementar tu respuesta con algo más?`
    ],
    question_intro: [
      `Ahora me gustaría preguntarte: ${questionText}`,
      `La siguiente pregunta es: ${questionText}`,
      `Te pregunto: ${questionText}`
    ]
  };

  const situationResponses = responses[situation as keyof typeof responses] || responses.greeting;
  return situationResponses[Math.floor(Math.random() * situationResponses.length)];
}

export function extract_preferred_first_name(displayName?: string, context?: AgentContext): NameAnalysis {
  const full = (displayName || '').trim();
  if (!full) {
    return { 
      fullName: '', 
      firstNames: [], 
      preferred: 'Hola', 
      needsAsk: false 
    };
  }

  const parts = full.split(/\s+/);
  // Heurística: apellidos son las dos últimas palabras si hay >=3
  const firstNames = parts.length >= 3 ? parts.slice(0, parts.length - 2) : parts.slice(0, 1);
  const preferred = (firstNames[0] || parts[0] || '').trim();
  
  // Determinar si necesita preguntar preferencia
  const needsAsk = context?.namePreference?.detectDoubleFirstName && firstNames.length >= 2;
  
  let questionText: string | undefined;
  if (needsAsk && context?.namePreference?.questionTemplate) {
    const template = context.namePreference.questionTemplate;
    
    // Reemplazar placeholders de forma segura
    questionText = template
      .replace(/\{\{firstName1\}\}/g, firstNames[0] || '')
      .replace(/\{\{firstName2\}\}/g, firstNames[1] || '');
  }

  return { 
    fullName: full, 
    firstNames, 
    preferred, 
    needsAsk,
    questionText
  };
}

export function get_agent_greeting(userName: string, context: AgentContext): string {
  const agentName = context.persona.name;
  const pronunciation = context.voices.sayNameAs[agentName] || agentName;
  
  return `Hola ${userName}, ¿cómo estás? Soy ${pronunciation} y hoy vamos a conversar un momento.`;
}

export function get_add_more_utterance(context: AgentContext): string {
  const utterances = context.turnTaking.addMoreUtterances;
  return utterances[Math.floor(Math.random() * utterances.length)] || 
         "¿Deseas agregar algo más? Si no, puedes decir 'no'.";
}

export async function load_agent_context(): Promise<AgentContext> {
  try {
    const resp = await fetch('/config/context.json', { cache: 'no-store' });
    if (resp.ok) {
      const context = await resp.json();
      return context as AgentContext;
    }
  } catch (error) {
    console.error('Error loading agent context:', error);
  }
  
  // Fallback context
  return {
    persona: {
      name: "Anita-AI",
      aiPronunciation: "Anita ei-ai",
      style: {
        tone: "cercano, empático, ligeramente paisa, natural",
        formality: "informal respetuoso",
        avoidLastNames: true,
        noJargon: true,
        languageCode: "es-CO"
      }
    },
    voices: {
      defaultVoice: "Kore",
      languageCode: "es-CO",
      alternatives: ["Orus", "Puck"],
      sayNameAs: {
        "Anita-AI": "Anita ei-ai"
      }
    },
    interactionPolicies: {
      inScopeOnly: true,
      singleRunPerUser: true,
      showQuestionOnScreen: true,
      hideUserTranscriptionOnScreen: true,
      noButtons: true,
      bargeIn: true,
      fallbackIfAvatarFails: true
    },
    timeConstraints: {
      targetLatencyMs: 1000,
      maxAcceptableLatencyMs: 2000,
      maxUserTurnMs: 120000,
      silenceCloseMs: 2000,
      followupExtraTurnMs: 30000,
      sessionDurationMin: 5,
      sessionDurationMax: 10
    },
    turnTaking: {
      vad: {
        enabled: true,
        silenceMs: 2000,
        rmsThreshold: 0.02
      },
      askAddMore: true,
      addMoreUtterances: [
        "¿Deseas agregar algo más? Si no, puedes decir 'no'.",
        "¿Quieres complementar tu respuesta o pasamos a la siguiente?"
      ]
    },
    namePreference: {
      detectDoubleFirstName: true,
      askWhenTwoNames: true,
      questionTemplate: "{{firstName1}} {{firstName2}}, ¿cómo prefieres que te llame: {{firstName1}}, {{firstName2}} o {{firstName1}} {{firstName2}}?",
      storeKey: "preferredName",
      neverUseLastNames: true
    },
    intro: {
      say: "Hola, ¿cómo estás? Soy Anita-AI y hoy vamos a conversar un momento...",
      rules: [
        "Presentarse como 'Anita-AI' pronunciando 'AI' en inglés (ei-ai).",
        "No incluir apellidos del usuario al saludar o referirse a él."
      ]
    },
    questionFlow: {
      readAloud: true,
      showOnScreen: true,
      confirmClose: true,
      afterAnswer: {
        say: "Me gusta tu respuesta. ¿Deseas agregar algo más? Si no, puedes decir 'no'.",
        interpretNo: ["no", "no, gracias", "eso es todo", "listo"]
      }
    },
    persistence: {
      enabled: true,
      collectionsPrefix: "assessmentia-",
      session: {
        fields: ["sessionId", "userId", "userEmail", "preferredName", "startedAt", "finishedAt", "status", "recovered"]
      },
      answer: {
        fields: ["questionId", "questionText", "answerText", "confirmed", "timestamp"]
      },
      resume: {
        enabled: true,
        fromLastQuestion: true
      }
    },
    directives: [
      "No responder preguntas fuera del propósito de la encuesta; redirigir con amabilidad.",
      "Una única sesión por usuario; no rehacer el assessment."
    ],
    ui: {
      indicators: {
        speaking: "Hablando…",
        listening: "Escuchando…",
        processing: "Procesando…"
      },
      buttons: {
        visible: false
      }
    },
    examples: []
  };
}

// Función para obtener el contexto del agente (mantener compatibilidad)
export async function getAgentContext(): Promise<AgentContext> {
  return load_agent_context();
}

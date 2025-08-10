/**
 * Testing del Sistema de Context Engineering
 * Valida todos los componentes del sistema de prompts y contexto
 */

import { ContextManager, analyzeUserIntent, generateQualityMetrics } from '../services/context-engineering';
import { PromptEngine } from '../services/prompt-engine';
import { CONTEXT_ENGINEERING_CONFIG, validateConfig } from '../config/context-engineering-config';

// ============================================================================
// FUNCIONES DE TESTING
// ============================================================================

/**
 * Test 1: Validación de configuración
 */
async function testConfiguration(): Promise<{ passed: boolean; details: string[] }> {
  console.log('🧪 Test 1: Validación de configuración');
  
  const validation = validateConfig();
  const details: string[] = [];
  
  if (validation.isValid) {
    details.push('✅ Configuración válida');
  } else {
    details.push('❌ Configuración inválida');
    validation.issues.forEach(issue => details.push(`  - ${issue}`));
  }
  
  // Verificar que todos los componentes principales estén definidos
  const requiredComponents = [
    'objectives',
    'model',
    'interaction',
    'prompts',
    'context',
    'memory',
    'errorHandling',
    'qualityMetrics'
  ];
  
  requiredComponents.forEach(component => {
    if (CONTEXT_ENGINEERING_CONFIG[component]) {
      details.push(`✅ Componente ${component} presente`);
    } else {
      details.push(`❌ Componente ${component} faltante`);
    }
  });
  
  return {
    passed: validation.isValid && requiredComponents.every(c => CONTEXT_ENGINEERING_CONFIG[c]),
    details
  };
}

/**
 * Test 2: Gestión de contexto
 */
async function testContextManagement(): Promise<{ passed: boolean; details: string[] }> {
  console.log('🧪 Test 2: Gestión de contexto');
  
  const contextManager = new ContextManager();
  const details: string[] = [];
  
  try {
    // Test de actualización de contexto
    contextManager.updateSessionContext('userName', 'Luis Fernando');
    contextManager.updateSessionContext('currentQuestion', '¿Qué opinas sobre la IA?');
    contextManager.updateSessionContext('questionIndex', 1);
    
    const context = contextManager.getCurrentContext();
    
    if (context.session.userName === 'Luis Fernando') {
      details.push('✅ Actualización de contexto exitosa');
    } else {
      details.push('❌ Fallo en actualización de contexto');
    }
    
    // Test de generación de prompt
    const prompt = contextManager.generateContextualPrompt('greeting');
    
    if (prompt.includes('Luis Fernando') && prompt.includes('Anita-AI')) {
      details.push('✅ Generación de prompt contextualizado exitosa');
    } else {
      details.push('❌ Fallo en generación de prompt contextualizado');
    }
    
    // Test de registro de interacción
    contextManager.recordInteraction('La IA me ha ayudado mucho', 'Me encanta escuchar eso');
    
    const updatedContext = contextManager.getCurrentContext();
    if (updatedContext.conversation.history.length > 0) {
      details.push('✅ Registro de interacción exitoso');
    } else {
      details.push('❌ Fallo en registro de interacción');
    }
    
    return { passed: details.every(d => d.startsWith('✅')), details };
    
  } catch (error) {
    details.push(`❌ Error en gestión de contexto: ${error}`);
    return { passed: false, details };
  }
}

/**
 * Test 3: Motor de prompts
 */
async function testPromptEngine(): Promise<{ passed: boolean; details: string[] }> {
  console.log('🧪 Test 3: Motor de prompts');
  
  const promptEngine = new PromptEngine();
  const details: string[] = [];
  
  try {
    // Test de generación de prompt para saludo
    const greetingPrompt = await promptEngine.generatePrompt({
      situation: 'greeting',
      context: {
        userName: 'María',
        sessionId: 'test_session_001',
        questionIndex: 1,
        totalQuestions: 3
      }
    });
    
    if (greetingPrompt.systemPrompt && greetingPrompt.userPrompt) {
      details.push('✅ Generación de prompt de saludo exitosa');
    } else {
      details.push('❌ Fallo en generación de prompt de saludo');
    }
    
    if (greetingPrompt.metadata.qualityScore > 0.7) {
      details.push('✅ Calidad de prompt aceptable');
    } else {
      details.push('❌ Calidad de prompt insuficiente');
    }
    
    // Test de validación de prompt
    if (greetingPrompt.metadata.validation.isValid) {
      details.push('✅ Validación de prompt exitosa');
    } else {
      details.push('❌ Validación de prompt fallida');
      greetingPrompt.metadata.validation.issues.forEach(issue => 
        details.push(`  - ${issue}`)
      );
    }
    
    // Test de prompt para pregunta
    const questionPrompt = await promptEngine.generatePrompt({
      situation: 'question_intro',
      context: {
        userName: 'María',
        currentQuestion: '¿Cómo has usado la IA en tu trabajo?',
        questionIndex: 2,
        totalQuestions: 3
      }
    });
    
    if (questionPrompt.userPrompt.includes('¿Cómo has usado la IA en tu trabajo?')) {
      details.push('✅ Generación de prompt de pregunta exitosa');
    } else {
      details.push('❌ Fallo en generación de prompt de pregunta');
    }
    
    return { passed: details.every(d => d.startsWith('✅')), details };
    
  } catch (error) {
    details.push(`❌ Error en motor de prompts: ${error}`);
    return { passed: false, details };
  }
}

/**
 * Test 4: Análisis de intención
 */
async function testIntentAnalysis(): Promise<{ passed: boolean; details: string[] }> {
  console.log('🧪 Test 4: Análisis de intención');
  
  const details: string[] = [];
  
  try {
    // Test de entusiasmo
    const enthusiasmIntent = analyzeUserIntent('Me encanta la IA, es fantástica!');
    if (enthusiasmIntent.intent === 'enthusiasm' && enthusiasmIntent.confidence > 0.7) {
      details.push('✅ Detección de entusiasmo exitosa');
    } else {
      details.push('❌ Fallo en detección de entusiasmo');
    }
    
    // Test de confusión
    const confusionIntent = analyzeUserIntent('No entiendo muy bien qué es la IA');
    if (confusionIntent.intent === 'confusion' && confusionIntent.confidence > 0.6) {
      details.push('✅ Detección de confusión exitosa');
    } else {
      details.push('❌ Fallo en detección de confusión');
    }
    
    // Test de respuesta completa
    const completeIntent = analyzeUserIntent('La IA me ayuda con reportes y análisis de datos. Eso es todo.');
    if (completeIntent.intent === 'complete_response' && completeIntent.confidence > 0.6) {
      details.push('✅ Detección de respuesta completa exitosa');
    } else {
      details.push('❌ Fallo en detección de respuesta completa');
    }
    
    // Test de reticencia
    const reluctanceIntent = analyzeUserIntent('No quiero hablar mucho sobre esto');
    if (reluctanceIntent.intent === 'reluctance' && reluctanceIntent.confidence > 0.5) {
      details.push('✅ Detección de reticencia exitosa');
    } else {
      details.push('❌ Fallo en detección de reticencia');
    }
    
    return { passed: details.every(d => d.startsWith('✅')), details };
    
  } catch (error) {
    details.push(`❌ Error en análisis de intención: ${error}`);
    return { passed: false, details };
  }
}

/**
 * Test 5: Métricas de calidad
 */
async function testQualityMetrics(): Promise<{ passed: boolean; details: string[] }> {
  console.log('🧪 Test 5: Métricas de calidad');
  
  const details: string[] = [];
  
  try {
    const userInput = 'La IA me ha ayudado mucho en mi trabajo diario';
    const agentResponse = 'Me encanta escuchar cómo la IA te está ayudando en tu día a día. Es muy valioso conocer experiencias como la tuya.';
    const interactionTime = 2000; // 2 segundos
    
    const metrics = generateQualityMetrics(userInput, agentResponse, interactionTime);
    
    // Verificar que todas las métricas estén presentes
    const requiredMetrics = [
      'responseQuality',
      'interactionFlow',
      'assessmentSpecific'
    ];
    
    requiredMetrics.forEach(metric => {
      if (metrics[metric]) {
        details.push(`✅ Métrica ${metric} presente`);
      } else {
        details.push(`❌ Métrica ${metric} faltante`);
      }
    });
    
    // Verificar valores de calidad
    if (metrics.responseQuality.empathy > 0.8) {
      details.push('✅ Empatía en rango aceptable');
    } else {
      details.push('❌ Empatía insuficiente');
    }
    
    if (metrics.interactionFlow.turnTaking > 0.8) {
      details.push('✅ Turn-taking en rango aceptable');
    } else {
      details.push('❌ Turn-taking insuficiente');
    }
    
    if (metrics.assessmentSpecific.responseCapture > 0.9) {
      details.push('✅ Captura de respuesta en rango aceptable');
    } else {
      details.push('❌ Captura de respuesta insuficiente');
    }
    
    return { passed: details.every(d => d.startsWith('✅')), details };
    
  } catch (error) {
    details.push(`❌ Error en métricas de calidad: ${error}`);
    return { passed: false, details };
  }
}

/**
 * Test 6: Validación de respuestas
 */
async function testResponseValidation(): Promise<{ passed: boolean; details: string[] }> {
  console.log('🧪 Test 6: Validación de respuestas');
  
  const contextManager = new ContextManager();
  const details: string[] = [];
  
  try {
    // Test de respuesta válida
    const validResponse = 'Me encanta escuchar cómo la IA te está ayudando. Es muy valioso conocer tu experiencia.';
    const validValidation = contextManager.validateResponse(validResponse);
    
    if (validValidation.isValid) {
      details.push('✅ Validación de respuesta válida exitosa');
    } else {
      details.push('❌ Fallo en validación de respuesta válida');
      validValidation.issues.forEach(issue => details.push(`  - ${issue}`));
    }
    
    // Test de respuesta con juicios (inválida)
    const invalidResponse = 'Tu respuesta es correcta y deberías usar más IA.';
    const invalidValidation = contextManager.validateResponse(invalidResponse);
    
    if (!invalidValidation.isValid && invalidValidation.issues.some(i => i.includes('juicios'))) {
      details.push('✅ Detección de juicios exitosa');
    } else {
      details.push('❌ Fallo en detección de juicios');
    }
    
    // Test de respuesta sin empatía (inválida)
    const noEmpathyResponse = 'Entiendo. Continuemos con la siguiente pregunta.';
    const empathyValidation = contextManager.validateResponse(noEmpathyResponse);
    
    if (!empathyValidation.isValid && empathyValidation.issues.some(i => i.includes('empatía'))) {
      details.push('✅ Detección de falta de empatía exitosa');
    } else {
      details.push('❌ Fallo en detección de falta de empatía');
    }
    
    return { passed: details.every(d => d.startsWith('✅')), details };
    
  } catch (error) {
    details.push(`❌ Error en validación de respuestas: ${error}`);
    return { passed: false, details };
  }
}

/**
 * Test 7: Manejo de errores
 */
async function testErrorHandling(): Promise<{ passed: boolean; details: string[] }> {
  console.log('🧪 Test 7: Manejo de errores');
  
  const contextManager = new ContextManager();
  const details: string[] = [];
  
  try {
    // Test de fallback para fallo de API
    const apiFailureResponse = contextManager.handleError('api_failure');
    if (apiFailureResponse.includes('problemas técnicos')) {
      details.push('✅ Fallback para fallo de API exitoso');
    } else {
      details.push('❌ Fallo en fallback para fallo de API');
    }
    
    // Test de fallback para pérdida de contexto
    const contextLossResponse = contextManager.handleError('context_loss');
    if (contextLossResponse.includes('retomar el hilo')) {
      details.push('✅ Fallback para pérdida de contexto exitoso');
    } else {
      details.push('❌ Fallo en fallback para pérdida de contexto');
    }
    
    // Test de fallback para timeout
    const timeoutResponse = contextManager.handleError('timeout');
    if (timeoutResponse.includes('tiempo para pensar')) {
      details.push('✅ Fallback para timeout exitoso');
    } else {
      details.push('❌ Fallo en fallback para timeout');
    }
    
    // Test de clarificación para input ambiguo
    const ambiguousResponse = contextManager.handleError('ambiguous_input');
    if (ambiguousResponse.includes('más específico')) {
      details.push('✅ Clarificación para input ambiguo exitosa');
    } else {
      details.push('❌ Fallo en clarificación para input ambiguo');
    }
    
    return { passed: details.every(d => d.startsWith('✅')), details };
    
  } catch (error) {
    details.push(`❌ Error en manejo de errores: ${error}`);
    return { passed: false, details };
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL DE TESTING
// ============================================================================

async function runAllTests(): Promise<void> {
  console.log('🚀 Iniciando testing del Sistema de Context Engineering\n');
  
  const tests = [
    { name: 'Configuración', fn: testConfiguration },
    { name: 'Gestión de Contexto', fn: testContextManagement },
    { name: 'Motor de Prompts', fn: testPromptEngine },
    { name: 'Análisis de Intención', fn: testIntentAnalysis },
    { name: 'Métricas de Calidad', fn: testQualityMetrics },
    { name: 'Validación de Respuestas', fn: testResponseValidation },
    { name: 'Manejo de Errores', fn: testErrorHandling }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`\n📋 Ejecutando: ${test.name}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await test.fn();
      
      if (result.passed) {
        passedTests++;
        console.log(`✅ ${test.name}: PASÓ`);
      } else {
        console.log(`❌ ${test.name}: FALLÓ`);
      }
      
      result.details.forEach(detail => {
        if (detail.startsWith('✅')) {
          console.log(`  ${detail}`);
        } else if (detail.startsWith('❌')) {
          console.log(`  ${detail}`);
        } else {
          console.log(`    ${detail}`);
        }
      });
      
    } catch (error) {
      console.log(`💥 ${test.name}: ERROR`);
      console.log(`  Error: ${error}`);
    }
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE TESTING');
  console.log('='.repeat(60));
  console.log(`✅ Tests pasados: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests fallidos: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Porcentaje de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ¡Todos los tests pasaron! El sistema está funcionando correctamente.');
  } else {
    console.log('\n⚠️  Algunos tests fallaron. Revisar los detalles arriba.');
  }
  
  console.log('\n🔧 Próximos pasos:');
  console.log('  1. Revisar tests fallidos');
  console.log('  2. Ajustar configuración si es necesario');
  console.log('  3. Ejecutar tests de integración');
  console.log('  4. Probar con datos reales');
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

if (require.main === module) {
  runAllTests().catch(console.error);
}

export {
  testConfiguration,
  testContextManagement,
  testPromptEngine,
  testIntentAnalysis,
  testQualityMetrics,
  testResponseValidation,
  testErrorHandling,
  runAllTests
}; 
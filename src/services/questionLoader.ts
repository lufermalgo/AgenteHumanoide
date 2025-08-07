export interface QuestionMetadata {
  title: string;
  description: string;
  estimatedDuration: string;
  totalQuestions: number;
}

export interface QuestionCategory {
  name: string;
  description: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  category: string;
  required?: boolean;
  maxResponseTime?: number;
  order: number;
  tags: string[];
}

export interface AssessmentConfig {
  version: string;
  lastUpdated: string;
  metadata: QuestionMetadata;
  questions: AssessmentQuestion[];
  categories: Record<string, QuestionCategory>;
}

export class QuestionLoader {
  private static instance: QuestionLoader;
  private cachedConfig: AssessmentConfig | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  private constructor() {}

  static getInstance(): QuestionLoader {
    if (!QuestionLoader.instance) {
      QuestionLoader.instance = new QuestionLoader();
    }
    return QuestionLoader.instance;
  }

  /**
   * Carga las preguntas desde el archivo JSON
   */
  async loadQuestions(): Promise<AssessmentConfig> {
    const now = Date.now();
    
    // Verificar cache
    if (this.cachedConfig && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      console.log('📋 Usando preguntas en cache');
      return this.cachedConfig;
    }

    try {
      console.log('📋 Cargando preguntas desde archivo JSON...');
      
      // En desarrollo, cargar desde public/data/
      const response = await fetch('/data/assessment-questions.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const config: AssessmentConfig = await response.json();
      
      // Validar estructura
      this.validateConfig(config);
      
      // Actualizar cache
      this.cachedConfig = config;
      this.lastFetchTime = now;
      
      console.log('✅ Preguntas cargadas exitosamente:', {
        version: config.version,
        totalQuestions: config.questions.length,
        lastUpdated: config.lastUpdated
      });
      
      return config;
    } catch (error) {
      console.error('❌ Error cargando preguntas:', error);
      
      // Fallback a preguntas hardcodeadas
      console.log('🔄 Usando preguntas de fallback...');
      return this.getFallbackConfig();
    }
  }

  /**
   * Carga preguntas desde una URL específica (para interfaz administrativa)
   */
  async loadQuestionsFromUrl(url: string): Promise<AssessmentConfig> {
    try {
      console.log('📋 Cargando preguntas desde URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const config: AssessmentConfig = await response.json();
      
      // Validar estructura
      this.validateConfig(config);
      
      console.log('✅ Preguntas cargadas desde URL exitosamente');
      return config;
    } catch (error) {
      console.error('❌ Error cargando preguntas desde URL:', error);
      throw error;
    }
  }

  /**
   * Valida la estructura del archivo de configuración
   */
  private validateConfig(config: any): void {
    if (!config.version || !config.metadata || !config.questions || !Array.isArray(config.questions)) {
      throw new Error('Estructura de configuración inválida');
    }

    if (config.questions.length === 0) {
      throw new Error('No hay preguntas definidas');
    }

    // Validar cada pregunta
    config.questions.forEach((question: any, index: number) => {
      if (!question.id || !question.text || !question.category) {
        throw new Error(`Pregunta ${index + 1} tiene campos requeridos faltantes`);
      }
    });
  }

  /**
   * Configuración de fallback (preguntas hardcodeadas)
   */
  private getFallbackConfig(): AssessmentConfig {
    return {
      version: "1.0.0-fallback",
      lastUpdated: new Date().toISOString().split('T')[0],
      metadata: {
        title: "Assessment de IA Generativa - Summan SAS",
        description: "Evaluación de conocimiento y experiencia en IA generativa",
        estimatedDuration: "5-10 minutos",
        totalQuestions: 5
      },
      questions: [
        {
          id: "q1",
          text: "¿Qué sabes sobre inteligencia artificial generativa? Cuéntame tu experiencia previa.",
          category: "conocimiento_previo",
          required: true,
          maxResponseTime: 120,
          order: 1,
          tags: ["conocimiento", "experiencia", "basico"]
        },
        {
          id: "q2",
          text: "¿Has usado herramientas como ChatGPT, Gemini o Claude? Si es así, ¿para qué las has utilizado?",
          category: "experiencia_herramientas",
          required: true,
          maxResponseTime: 90,
          order: 2,
          tags: ["herramientas", "uso_practico", "experiencia"]
        },
        {
          id: "q3",
          text: "¿Cómo crees que la IA generativa podría ayudar en tu trabajo diario en Summan?",
          category: "aplicacion_laboral",
          required: true,
          maxResponseTime: 120,
          order: 3,
          tags: ["aplicacion", "trabajo", "summan"]
        },
        {
          id: "q4",
          text: "¿Qué preocupaciones o desafíos ves en el uso de IA generativa en el entorno empresarial?",
          category: "preocupaciones",
          required: false,
          maxResponseTime: 90,
          order: 4,
          tags: ["preocupaciones", "desafios", "empresarial"]
        },
        {
          id: "q5",
          text: "¿Te sientes cómodo aprendiendo nuevas herramientas de IA? ¿Qué tipo de capacitación preferirías?",
          category: "capacitacion",
          required: true,
          maxResponseTime: 120,
          order: 5,
          tags: ["capacitacion", "aprendizaje", "preferencias"]
        }
      ],
      categories: {
        conocimiento_previo: {
          name: "Conocimiento Previo",
          description: "Experiencia y conocimiento base en IA"
        },
        experiencia_herramientas: {
          name: "Experiencia con Herramientas",
          description: "Uso práctico de herramientas de IA"
        },
        aplicacion_laboral: {
          name: "Aplicación Laboral",
          description: "Uso de IA en el contexto de trabajo"
        },
        preocupaciones: {
          name: "Preocupaciones y Desafíos",
          description: "Inquietudes sobre el uso de IA"
        },
        capacitacion: {
          name: "Capacitación",
          description: "Preferencias de aprendizaje y formación"
        }
      }
    };
  }

  /**
   * Limpia el cache
   */
  clearCache(): void {
    this.cachedConfig = null;
    this.lastFetchTime = 0;
    console.log('🗑️ Cache de preguntas limpiado');
  }

  /**
   * Obtiene información del cache
   */
  getCacheInfo(): { hasCache: boolean; lastFetch: number; age: number } {
    const now = Date.now();
    return {
      hasCache: this.cachedConfig !== null,
      lastFetch: this.lastFetchTime,
      age: now - this.lastFetchTime
    };
  }
} 
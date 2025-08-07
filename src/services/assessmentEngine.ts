export interface AssessmentQuestion {
  id: string;
  text: string;
  category: string;
  required?: boolean;
  maxResponseTime?: number; // en segundos
  followUpQuestions?: string[];
}

export interface AssessmentResponse {
  questionId: string;
  response: string;
  timestamp: Date;
  duration?: number; // tiempo de respuesta en segundos
  confidence?: number; // confianza en la transcripción (0-1)
}

export interface AssessmentSession {
  sessionId: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime?: Date;
  currentQuestionIndex: number;
  responses: AssessmentResponse[];
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  progress: number; // 0-100
}

export class AssessmentEngine {
  private questions: AssessmentQuestion[];
  private session: AssessmentSession | null = null;

  constructor(questions: AssessmentQuestion[]) {
    this.questions = questions;
  }

  // Iniciar una nueva sesión de assessment
  startSession(userId: string, userName: string): AssessmentSession {
    const sessionId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.session = {
      sessionId,
      userId,
      userName,
      startTime: new Date(),
      currentQuestionIndex: 0,
      responses: [],
      status: 'in_progress',
      progress: 0
    };

    console.log('🚀 Nueva sesión de assessment iniciada:', sessionId);
    return this.session;
  }

  // Obtener la pregunta actual
  getCurrentQuestion(): AssessmentQuestion | null {
    if (!this.session || this.session.currentQuestionIndex >= this.questions.length) {
      return null;
    }
    return this.questions[this.session.currentQuestionIndex];
  }

  // Obtener información de progreso
  getProgress(): { current: number; total: number; percentage: number } {
    if (!this.session) {
      return { current: 0, total: this.questions.length, percentage: 0 };
    }

    const current = this.session.currentQuestionIndex + 1;
    const total = this.questions.length;
    const percentage = Math.round((current / total) * 100);

    return { current, total, percentage };
  }

  // Guardar respuesta del usuario
  saveResponse(response: string, confidence?: number, duration?: number): void {
    if (!this.session) {
      console.error('❌ No hay sesión activa');
      return;
    }

    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) {
      console.error('❌ No hay pregunta actual');
      return;
    }

    const assessmentResponse: AssessmentResponse = {
      questionId: currentQuestion.id,
      response: response.trim(),
      timestamp: new Date(),
      confidence,
      duration
    };

    this.session.responses.push(assessmentResponse);
    console.log('📝 Respuesta guardada:', assessmentResponse);
  }

  // Avanzar a la siguiente pregunta
  nextQuestion(): { success: boolean; isCompleted: boolean; nextQuestion?: AssessmentQuestion } {
    if (!this.session) {
      return { success: false, isCompleted: false };
    }

    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) {
      return { success: false, isCompleted: false };
    }

    // Verificar si la pregunta actual es requerida y tiene respuesta
    if (currentQuestion.required) {
      const hasResponse = this.session.responses.some(r => r.questionId === currentQuestion.id);
      if (!hasResponse) {
        console.warn('⚠️ Pregunta requerida sin respuesta:', currentQuestion.id);
        return { success: false, isCompleted: false };
      }
    }

    // Avanzar al siguiente índice
    this.session.currentQuestionIndex++;

    // Verificar si el assessment está completado
    if (this.session.currentQuestionIndex >= this.questions.length) {
      this.completeSession();
      return { success: true, isCompleted: true };
    }

    // Actualizar progreso
    this.updateProgress();

    const nextQuestion = this.getCurrentQuestion();
    console.log('➡️ Avanzando a pregunta:', nextQuestion?.id);

    return { 
      success: true, 
      isCompleted: false, 
      nextQuestion 
    };
  }

  // Saltar pregunta actual
  skipQuestion(): { success: boolean; isCompleted: boolean; nextQuestion?: AssessmentQuestion } {
    if (!this.session) {
      return { success: false, isCompleted: false };
    }

    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) {
      return { success: false, isCompleted: false };
    }

    // Marcar como saltada (respuesta vacía)
    this.saveResponse('[PREGUNTA SALTADA]', 0, 0);

    return this.nextQuestion();
  }

  // Completar sesión
  completeSession(): AssessmentSession {
    if (!this.session) {
      throw new Error('No hay sesión activa');
    }

    this.session.status = 'completed';
    this.session.endTime = new Date();
    this.session.progress = 100;

    console.log('✅ Assessment completado:', {
      sessionId: this.session.sessionId,
      totalQuestions: this.questions.length,
      responsesCount: this.session.responses.length,
      duration: this.getSessionDuration()
    });

    return this.session;
  }

  // Pausar sesión
  pauseSession(): void {
    if (this.session) {
      this.session.status = 'paused';
      console.log('⏸️ Sesión pausada:', this.session.sessionId);
    }
  }

  // Reanudar sesión
  resumeSession(): void {
    if (this.session && this.session.status === 'paused') {
      this.session.status = 'in_progress';
      console.log('▶️ Sesión reanudada:', this.session.sessionId);
    }
  }

  // Obtener duración de la sesión
  getSessionDuration(): number {
    if (!this.session) return 0;

    const endTime = this.session.endTime || new Date();
    return Math.round((endTime.getTime() - this.session.startTime.getTime()) / 1000);
  }

  // Obtener estadísticas de la sesión
  getSessionStats(): {
    totalQuestions: number;
    answeredQuestions: number;
    skippedQuestions: number;
    averageResponseTime: number;
    completionRate: number;
  } {
    if (!this.session) {
      return {
        totalQuestions: this.questions.length,
        answeredQuestions: 0,
        skippedQuestions: 0,
        averageResponseTime: 0,
        completionRate: 0
      };
    }

    const answeredQuestions = this.session.responses.filter(r => 
      r.response !== '[PREGUNTA SALTADA]'
    ).length;

    const skippedQuestions = this.session.responses.filter(r => 
      r.response === '[PREGUNTA SALTADA]'
    ).length;

    const responseTimes = this.session.responses
      .filter(r => r.duration && r.duration > 0)
      .map(r => r.duration!);

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    const completionRate = Math.round((answeredQuestions / this.questions.length) * 100);

    return {
      totalQuestions: this.questions.length,
      answeredQuestions,
      skippedQuestions,
      averageResponseTime: Math.round(averageResponseTime),
      completionRate
    };
  }

  // Obtener sesión actual
  getCurrentSession(): AssessmentSession | null {
    return this.session;
  }

  // Actualizar progreso
  private updateProgress(): void {
    if (!this.session) return;

    const { percentage } = this.getProgress();
    this.session.progress = percentage;
  }

  // Validar si se puede completar el assessment
  canComplete(): boolean {
    if (!this.session) return false;

    const requiredQuestions = this.questions.filter(q => q.required);
    const answeredRequired = requiredQuestions.every(q => 
      this.session!.responses.some(r => r.questionId === q.id && r.response !== '[PREGUNTA SALTADA]')
    );

    return answeredRequired;
  }

  // Obtener preguntas restantes
  getRemainingQuestions(): AssessmentQuestion[] {
    if (!this.session) return this.questions;

    return this.questions.slice(this.session.currentQuestionIndex);
  }

  // Obtener preguntas respondidas
  getAnsweredQuestions(): AssessmentQuestion[] {
    if (!this.session) return [];

    return this.questions.filter(q => 
      this.session!.responses.some(r => r.questionId === q.id)
    );
  }
}

// Preguntas del assessment de IA generativa
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'q1',
    text: '¿Qué sabes sobre inteligencia artificial generativa? Cuéntame tu experiencia previa.',
    category: 'conocimiento_previo',
    required: true,
    maxResponseTime: 120
  },
  {
    id: 'q2', 
    text: '¿Has usado herramientas como ChatGPT, Gemini o Claude? Si es así, ¿para qué las has utilizado?',
    category: 'experiencia_herramientas',
    required: true,
    maxResponseTime: 90
  },
  {
    id: 'q3',
    text: '¿Cómo crees que la IA generativa podría ayudar en tu trabajo diario en Summan?',
    category: 'aplicacion_laboral',
    required: true,
    maxResponseTime: 120
  },
  {
    id: 'q4',
    text: '¿Qué preocupaciones o desafíos ves en el uso de IA generativa en el entorno empresarial?',
    category: 'preocupaciones',
    required: false,
    maxResponseTime: 90
  },
  {
    id: 'q5',
    text: '¿Te sientes cómodo aprendiendo nuevas herramientas de IA? ¿Qué tipo de capacitación preferirías?',
    category: 'capacitacion',
    required: true,
    maxResponseTime: 120
  }
]; 
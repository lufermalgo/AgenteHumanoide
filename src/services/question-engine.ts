import { getFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import questions from '../data/questions.json';

export interface Question {
  id: string;
  text: string;
  timeLimit: number;
  required: boolean;
}

export interface QuestionResponse {
  questionId: string;
  response: string;
  timestamp: number;
  duration: number;
}

export class QuestionEngine {
  private questions: Question[];
  private currentIndex: number;
  private sessionId: string;
  private db: any;

  constructor(sessionId: string) {
    this.questions = questions.questions;
    this.currentIndex = 0;
    this.sessionId = sessionId;
    this.db = getFirestore();
  }

  getCurrentQuestion(): Question | null {
    if (this.currentIndex >= this.questions.length) {
      return null;
    }
    return this.questions[this.currentIndex];
  }

  async saveResponse(response: string, duration: number): Promise<void> {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) return;

    const questionResponse: QuestionResponse = {
      questionId: currentQuestion.id,
      response,
      timestamp: Date.now(),
      duration
    };

    // Guardar en Firestore (emulador)
    const sessionRef = doc(this.db, 'assessmentia-sessions', this.sessionId);
    await updateDoc(sessionRef, {
      responses: arrayUnion(questionResponse)
    });

    this.currentIndex++;
  }

  isComplete(): boolean {
    return this.currentIndex >= this.questions.length;
  }

  getProgress(): { current: number; total: number } {
    return {
      current: this.currentIndex + 1,
      total: this.questions.length
    };
  }

  async finalizeSession(): Promise<void> {
    const sessionRef = doc(this.db, 'assessmentia-sessions', this.sessionId);
    await updateDoc(sessionRef, {
      status: 'completed',
      endTime: new Date()
    });
  }
}
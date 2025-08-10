import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { QuestionEngine, Question } from '../../services/question-engine';
import './assessment-audio';

@customElement('assessment-flow')
export class AssessmentFlow extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: system, -apple-system, '.SFNSText-Regular', 'San Francisco', 'Roboto', 'Segoe UI', 'Helvetica Neue', 'Lucida Grande', sans-serif;
    }

    .assessment-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      align-items: start;
    }

    .question-panel {
      background: #ffffff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .interaction-panel {
      background: #ffffff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      margin-bottom: 20px;
    }

    .progress-fill {
      height: 100%;
      background: var(--color-primary, #9bc41c);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    h2 {
      color: #1f2937;
      margin: 0 0 20px;
      font-size: 1.5rem;
    }

    .question-text {
      color: #374151;
      font-size: 1.125rem;
      line-height: 1.75;
      margin: 0;
    }

    .timer {
      color: var(--color-secondary, #f08a00);
      font-size: 0.875rem;
      margin-top: 10px;
    }

    @media (max-width: 768px) {
      .assessment-container {
        grid-template-columns: 1fr;
      }
    }
  `;

  @property({ type: String })
  sessionId = '';

  @state()
  private currentQuestion: Question | null = null;

  @state()
  private timeRemaining = 0;

  @state()
  private isProcessing = false;

  private questionEngine: QuestionEngine | null = null;
  private timerInterval: number | null = null;
  private startTime: number = 0;

  async connectedCallback() {
    super.connectedCallback();
    if (this.sessionId) {
      this.questionEngine = new QuestionEngine(this.sessionId);
      this.loadCurrentQuestion();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
    }
  }

  private loadCurrentQuestion() {
    if (!this.questionEngine) return;

    this.currentQuestion = this.questionEngine.getCurrentQuestion();
    if (this.currentQuestion) {
      this.timeRemaining = this.currentQuestion.timeLimit;
      this.startTime = Date.now();
      this.startTimer();
    }
  }

  private startTimer() {
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
    }

    this.timerInterval = window.setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.handleTimeout();
      }
    }, 1000);
  }

  private async handleTimeout() {
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
    }
    // La respuesta actual se guardará cuando el usuario termine de hablar
  }

  private async handleResponse(event: CustomEvent) {
    if (!this.questionEngine || !this.currentQuestion) return;

    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    await this.questionEngine.saveResponse(event.detail.text, duration);

    if (this.questionEngine.isComplete()) {
      await this.questionEngine.finalizeSession();
      this.dispatchEvent(new CustomEvent('assessment-complete'));
    } else {
      this.loadCurrentQuestion();
    }
  }

  render() {
    if (!this.currentQuestion) {
      return html`<div>Cargando...</div>`;
    }

    const { current, total } = this.questionEngine!.getProgress();
    const progressPercent = (current / total) * 100;

    return html`
      <div class="assessment-container">
        <div class="question-panel">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <h2>Pregunta ${current} de ${total}</h2>
          <p class="question-text">${this.currentQuestion.text}</p>
          <div class="timer">
            Tiempo restante: ${Math.floor(this.timeRemaining / 60)}:${String(this.timeRemaining % 60).padStart(2, '0')}
          </div>
        </div>
        
        <div class="interaction-panel">
          <assessment-audio
            .sessionId=${this.sessionId}
            @response=${this.handleResponse}
          ></assessment-audio>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'assessment-flow': AssessmentFlow;
  }
}
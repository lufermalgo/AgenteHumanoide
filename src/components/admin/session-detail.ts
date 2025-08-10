import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import questions from '../../data/questions.json';

interface SessionResponse {
  questionId: string;
  response: string;
  timestamp: number;
  duration: number;
}

@customElement('session-detail')
export class SessionDetail extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 30px;
    }

    .back-button {
      background: none;
      border: none;
      color: var(--color-primary, #9bc41c);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0;
      margin-bottom: 16px;
      font-size: 0.875rem;
    }

    .user-info {
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
    }

    .user-info h2 {
      margin: 0 0 8px;
      color: var(--color-text, #1f2937);
    }

    .user-meta {
      color: var(--color-text-secondary, #4b5563);
      font-size: 0.875rem;
    }

    .responses {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .response-card {
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .question-text {
      color: var(--color-text, #1f2937);
      font-weight: 500;
      margin: 0 0 12px;
    }

    .response-text {
      color: var(--color-text, #1f2937);
      margin: 0 0 12px;
      white-space: pre-wrap;
    }

    .response-meta {
      color: var(--color-text-secondary, #4b5563);
      font-size: 0.75rem;
      display: flex;
      gap: 16px;
    }
  `;

  @property({ type: String })
  sessionId = '';

  @state()
  private session: any = null;

  @state()
  private loading = true;

  private db = getFirestore();

  async connectedCallback() {
    super.connectedCallback();
    if (this.sessionId) {
      await this.loadSession();
    }
  }

  private async loadSession() {
    try {
      const sessionRef = doc(this.db, 'assessmentia-sessions', this.sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (sessionDoc.exists()) {
        this.session = {
          id: sessionDoc.id,
          ...sessionDoc.data()
        };
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
    } finally {
      this.loading = false;
    }
  }

  private getQuestionText(questionId: string): string {
    const question = questions.questions.find(q => q.id === questionId);
    return question?.text || 'Pregunta no encontrada';
  }

  private formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(timestamp));
  }

  private handleBack() {
    this.dispatchEvent(new CustomEvent('back'));
  }

  render() {
    if (this.loading) {
      return html`<div>Cargando...</div>`;
    }

    if (!this.session) {
      return html`<div>Sesión no encontrada</div>`;
    }

    return html`
      <div class="header">
        <button class="back-button" @click=${this.handleBack}>
          ← Volver
        </button>
      </div>

      <div class="user-info">
        <h2>${this.session.userEmail}</h2>
        <div class="user-meta">
          Inicio: ${this.formatDate(this.session.startTime.toMillis())}
          ${this.session.endTime ? html` • Fin: ${this.formatDate(this.session.endTime.toMillis())}` : ''}
          • Estado: ${this.session.status === 'completed' ? 'Completado' : 'En Progreso'}
        </div>
      </div>

      <div class="responses">
        ${this.session.responses.map((response: SessionResponse) => html`
          <div class="response-card">
            <h3 class="question-text">${this.getQuestionText(response.questionId)}</h3>
            <p class="response-text">${response.response}</p>
            <div class="response-meta">
              <span>Respondido: ${this.formatDate(response.timestamp)}</span>
              <span>Duración: ${response.duration}s</span>
            </div>
          </div>
        `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'session-detail': SessionDetail;
  }
}
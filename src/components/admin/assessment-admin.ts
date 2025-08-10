import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

interface Question {
  id: string;
  text: string;
  category: string;
  required: boolean;
  maxResponseTime?: number;
}

@customElement('assessment-admin')
export class AssessmentAdmin extends LitElement {
  @property({ type: Object }) user: any;
  @state() private questions: Question[] = [];
  @state() private loading = true;
  @state() private error = '';
  @state() private editingQuestion: Question | null = null;

  private db = getFirestore();

  static styles = css`
    :host {
      display: block;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      color: var(--color-primary);
      margin: 0;
    }

    button {
      background: var(--color-primary);
      color: var(--color-text);
      border: none;
      border-radius: 8px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    button:hover {
      background: var(--color-secondary);
    }

    .questions-list {
      display: grid;
      gap: 1rem;
    }

    .question-card {
      background: rgba(255, 255, 255, 0.05);
      padding: 1rem;
      border-radius: 8px;
      display: grid;
      gap: 0.5rem;
    }

    .question-text {
      font-size: 1.1rem;
      color: var(--color-text);
    }

    .question-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: var(--color-tertiary);
    }

    .question-actions {
      display: flex;
      gap: 0.5rem;
    }

    .error {
      color: #ff4444;
      padding: 1rem;
      border-radius: 8px;
      background: rgba(255, 68, 68, 0.1);
    }

    /* Editor Modal */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .modal-content {
      background: var(--color-background);
      padding: 2rem;
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--color-text);
    }

    input, textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--color-tertiary);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      color: var(--color-text);
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadQuestions();
  }

  private async loadQuestions() {
    try {
      const questionsSnap = await getDocs(collection(this.db, 'questions'));
      this.questions = questionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  private handleEdit(question: Question) {
    this.editingQuestion = { ...question };
  }

  private async handleSave() {
    if (!this.editingQuestion) return;

    try {
      await setDoc(
        doc(this.db, 'questions', this.editingQuestion.id),
        this.editingQuestion
      );
      await this.loadQuestions();
      this.editingQuestion = null;
    } catch (error: any) {
      this.error = error.message;
    }
  }

  private renderQuestionEditor() {
    if (!this.editingQuestion) return '';

    return html`
      <div class="modal">
        <div class="modal-content">
          <h2>Editar Pregunta</h2>
          
          <div class="form-group">
            <label>Texto</label>
            <textarea
              .value=${this.editingQuestion.text}
              @input=${(e: any) => {
                this.editingQuestion = {
                  ...this.editingQuestion!,
                  text: e.target.value
                };
              }}
            ></textarea>
          </div>

          <div class="form-group">
            <label>Categoría</label>
            <input
              type="text"
              .value=${this.editingQuestion.category}
              @input=${(e: any) => {
                this.editingQuestion = {
                  ...this.editingQuestion!,
                  category: e.target.value
                };
              }}
            >
          </div>

          <div class="form-group">
            <label>
              <input
                type="checkbox"
                .checked=${this.editingQuestion.required}
                @change=${(e: any) => {
                  this.editingQuestion = {
                    ...this.editingQuestion!,
                    required: e.target.checked
                  };
                }}
              >
              Requerida
            </label>
          </div>

          <div class="form-group">
            <label>Tiempo máximo (segundos)</label>
            <input
              type="number"
              .value=${this.editingQuestion.maxResponseTime || ''}
              @input=${(e: any) => {
                this.editingQuestion = {
                  ...this.editingQuestion!,
                  maxResponseTime: parseInt(e.target.value) || undefined
                };
              }}
            >
          </div>

          <div class="question-actions">
            <button @click=${this.handleSave}>
              Guardar
            </button>
            <button
              @click=${() => this.editingQuestion = null}
              style="background: var(--color-tertiary)">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    if (this.loading) {
      return html`<div>Cargando...</div>`;
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    return html`
      <div class="header">
        <h1>Administración de Assessment</h1>
        <button @click=${() => this.handleEdit({
          id: Date.now().toString(),
          text: '',
          category: '',
          required: true
        })}>
          Nueva Pregunta
        </button>
      </div>

      <div class="questions-list">
        ${this.questions.map(question => html`
          <div class="question-card">
            <div class="question-text">${question.text}</div>
            <div class="question-meta">
              <span>Categoría: ${question.category}</span>
              <span>${question.required ? 'Requerida' : 'Opcional'}</span>
              ${question.maxResponseTime
                ? html`<span>${question.maxResponseTime}s máx.</span>`
                : ''
              }
            </div>
            <div class="question-actions">
              <button @click=${() => this.handleEdit(question)}>
                Editar
              </button>
            </div>
          </div>
        `)}
      </div>

      ${this.renderQuestionEditor()}
    `;
  }
}
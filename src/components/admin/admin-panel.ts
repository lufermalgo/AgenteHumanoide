import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';

interface SessionData {
  id: string;
  userId: string;
  userEmail: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed';
  responses: Array<{
    questionId: string;
    response: string;
    timestamp: number;
    duration: number;
  }>;
}

@customElement('admin-panel')
export class AdminPanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: var(--color-primary, #9bc41c);
    }

    .stat-label {
      color: var(--color-text-secondary, #4b5563);
      font-size: 0.875rem;
    }

    .sessions-table {
      width: 100%;
      border-collapse: collapse;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .sessions-table th,
    .sessions-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    .sessions-table th {
      background: #f9fafb;
      font-weight: 500;
      color: var(--color-text-secondary, #4b5563);
    }

    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .status-active {
      background: #fef3c7;
      color: #92400e;
    }

    .status-completed {
      background: #d1fae5;
      color: #065f46;
    }

    .view-button {
      background: var(--color-primary, #9bc41c);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .view-button:hover {
      background: #8baf19;
    }
  `;

  @state()
  private sessions: SessionData[] = [];

  @state()
  private stats = {
    totalSessions: 0,
    completedSessions: 0,
    averageDuration: 0,
    activeUsers: 0
  };

  private db = getFirestore();
  private unsubscribe: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.subscribeSessions();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private subscribeSessions() {
    const sessionsRef = collection(this.db, 'assessmentia-sessions');
    const q = query(sessionsRef);

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SessionData));

      this.updateStats();
    });
  }

  private updateStats() {
    const completed = this.sessions.filter(s => s.status === 'completed');
    const active = this.sessions.filter(s => s.status === 'active');

    let totalDuration = 0;
    completed.forEach(session => {
      if (session.startTime && session.endTime) {
        totalDuration += session.endTime.getTime() - session.startTime.getTime();
      }
    });

    this.stats = {
      totalSessions: this.sessions.length,
      completedSessions: completed.length,
      averageDuration: completed.length ? Math.round(totalDuration / completed.length / 1000 / 60) : 0,
      activeUsers: active.length
    };
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  }

  private handleViewSession(sessionId: string) {
    this.dispatchEvent(new CustomEvent('view-session', {
      detail: { sessionId },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${this.stats.totalSessions}</div>
          <div class="stat-label">Total de Sesiones</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this.stats.completedSessions}</div>
          <div class="stat-label">Assessments Completados</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this.stats.averageDuration}min</div>
          <div class="stat-label">Duración Promedio</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this.stats.activeUsers}</div>
          <div class="stat-label">Usuarios Activos</div>
        </div>
      </div>

      <table class="sessions-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Inicio</th>
            <th>Estado</th>
            <th>Progreso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${this.sessions.map(session => html`
            <tr>
              <td>${session.userEmail}</td>
              <td>${this.formatDate(session.startTime)}</td>
              <td>
                <span class="status-badge status-${session.status}">
                  ${session.status === 'active' ? 'En Progreso' : 'Completado'}
                </span>
              </td>
              <td>${session.responses.length} / 5 preguntas</td>
              <td>
                <button
                  class="view-button"
                  @click=${() => this.handleViewSession(session.id)}
                >
                  Ver Detalle
                </button>
              </td>
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'admin-panel': AdminPanel;
  }
}
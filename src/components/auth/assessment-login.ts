import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

@customElement('assessment-login')
export class AssessmentLogin extends LitElement {
  @state() private error = '';
  @state() private loading = false;

  private auth = getAuth(initializeApp(firebaseConfig));
  private provider = new GoogleAuthProvider();

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }

    h1 {
      color: var(--color-primary);
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    p {
      color: var(--color-text);
      margin-bottom: 2rem;
    }

    button {
      background: var(--color-primary);
      color: var(--color-text);
      border: none;
      border-radius: 8px;
      padding: 1rem 2rem;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    button:hover {
      background: var(--color-secondary);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error {
      color: #ff4444;
      margin-top: 1rem;
    }
  `;

  private async handleLogin() {
    this.loading = true;
    this.error = '';

    try {
      const result = await signInWithPopup(this.auth, this.provider);
      const email = result.user.email;

      if (!email?.endsWith('@summan.com')) {
        await this.auth.signOut();
        throw new Error('Solo se permite acceso con correo @summan.com');
      }

      // El AuthProvider manejará la redirección
      this.dispatchEvent(new CustomEvent('login-success', {
        detail: { user: result.user }
      }));

    } catch (error: any) {
      this.error = error.message || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <h1>Assessment IA Generativa</h1>
      <p>Inicia sesión con tu cuenta de Summan para comenzar</p>
      
      <button 
        @click=${this.handleLogin}
        ?disabled=${this.loading}>
        ${this.loading ? 'Iniciando sesión...' : 'Continuar con Google'}
      </button>

      ${this.error ? html`<p class="error">${this.error}</p>` : ''}
    `;
  }
}
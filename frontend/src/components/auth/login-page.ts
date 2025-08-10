import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

@customElement('login-page')
export class LoginPage extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--color-background, #f9fafb);
    }

    .login-container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      text-align: center;
      max-width: 400px;
      width: 90%;
    }

    .logo {
      width: 120px;
      height: auto;
      margin-bottom: 24px;
    }

    h1 {
      color: var(--color-text, #1f2937);
      font-size: 1.5rem;
      margin: 0 0 8px;
    }

    p {
      color: var(--color-text-secondary, #4b5563);
      margin: 0 0 24px;
      font-size: 0.875rem;
    }

    button {
      background-color: var(--color-primary, #9bc41c);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 12px 24px;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: #8baf19;
    }

    .error {
      color: #dc2626;
      margin-top: 16px;
      font-size: 0.875rem;
    }
  `;

  private async handleLogin() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      hd: 'summan.com' // Restringir a dominio Summan
    });

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  }

  render() {
    return html`
      <div class="login-container">
        <img src="/logo-summan.png" alt="Summan Logo" class="logo">
        <h1>Assessment IA Generativa</h1>
        <p>Inicia sesión con tu cuenta de Summan para continuar</p>
        
        <button @click=${this.handleLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.607,1.972-2.101,3.467-4.073,4.073v-1.909c0-1.054-0.855-1.909-1.909-1.909h-3.536c0.607-1.972,2.101-3.467,4.073-4.073V12.151z M12,2C6.477,2,2,6.477,2,12c0,5.523,4.477,10,10,10s10-4.477,10-10C22,6.477,17.523,2,12,2z M12,20c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S16.418,20,12,20z"/>
          </svg>
          Iniciar sesión con Google
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-page': LoginPage;
  }
}
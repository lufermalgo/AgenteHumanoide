import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('access-denied')
export class AccessDenied extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--color-background, #f9fafb);
    }

    .container {
      text-align: center;
      padding: 40px;
    }

    h1 {
      color: var(--color-text, #1f2937);
      font-size: 1.5rem;
      margin: 0 0 16px;
    }

    p {
      color: var(--color-text-secondary, #4b5563);
      margin: 0 0 24px;
    }

    a {
      color: var(--color-primary, #9bc41c);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `;

  render() {
    return html`
      <div class="container">
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta sección.</p>
        <a href="/">Volver al Inicio</a>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'access-denied': AccessDenied;
  }
}
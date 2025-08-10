import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

@customElement('app-router')
export class AppRouter extends LitElement {
  @property({ type: String })
  private currentPath = '';

  @property({ type: Boolean })
  private isAuthenticated = false;

  @property({ type: Boolean })
  private isAdmin = false;

  private auth = getAuth();

  constructor() {
    super();
    this.handleNavigation();
    window.addEventListener('popstate', () => this.handleNavigation());

    onAuthStateChanged(this.auth, (user) => {
      this.isAuthenticated = !!user;
      this.isAdmin = user?.email?.endsWith('@summan.com') || false;
      this.handleNavigation();
    });
  }

  private handleNavigation() {
    this.currentPath = window.location.pathname;
  }

  protected render() {
    if (!this.isAuthenticated) {
      return html`<login-page></login-page>`;
    }

    switch (this.currentPath) {
      case '/admin':
        return this.isAdmin
          ? html`<admin-panel></admin-panel>`
          : html`<access-denied></access-denied>`;
      
      case '/admin/session':
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('id');
        return this.isAdmin && sessionId
          ? html`<session-detail .sessionId=${sessionId}></session-detail>`
          : html`<access-denied></access-denied>`;
      
      default:
        return html`<assessment-flow></assessment-flow>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-router': AppRouter;
  }
}
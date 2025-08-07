import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.typography.fontFamily};
    font-size: ${theme.typography.fontSizes.md};
    font-weight: ${theme.typography.fontWeights.normal};
    line-height: 1.5;
    color: ${theme.colors.text};
    background-color: ${theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* Utilidades CSS */
  .visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  .text-center {
    text-align: center;
  }

  .text-primary {
    color: ${theme.colors.primary};
  }

  .text-secondary {
    color: ${theme.colors.secondary};
  }

  .bg-primary {
    background-color: ${theme.colors.primary};
  }

  .bg-secondary {
    background-color: ${theme.colors.secondary};
  }

  /* Estados de carga y animaciones */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  /* Responsive */
  @media (max-width: ${theme.breakpoints.tablet}) {
    html {
      font-size: 14px;
    }
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    html {
      font-size: 13px;
    }
  }
`;
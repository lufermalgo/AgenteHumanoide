// Tema de colores institucionales Summan SAS
export const theme = {
  colors: {
    // Colores principales Summan
    primary: '#9bc41c',      // Verde principal
    secondary: '#f08a00',    // Naranja secundario  
    tertiary: '#666666',     // Gris terciario
    
    // Variaciones de los colores principales
    primaryLight: '#b8d147',
    primaryDark: '#7ea015',
    secondaryLight: '#ff9d33',
    secondaryDark: '#d67700',
    
    // Colores de sistema
    background: '#f5f5f5',
    backgroundCard: '#ffffff',
    text: '#333333',
    textLight: '#666666',
    textWhite: '#ffffff',
    
    // Estados
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    
    // Transparencias
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadowLight: 'rgba(0, 0, 0, 0.1)',
    shadowMedium: 'rgba(0, 0, 0, 0.2)',
  },
  
  // Espaciado
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // Tipografía
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px',
      xxxl: '48px',
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  // Bordes y sombras
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '50%',
  },
  
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
  
  // Breakpoints responsivos
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px',
  },
};

export type Theme = typeof theme;
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AssessmentFlow from './components/assessment/AssessmentFlow';
import AuthGate from './components/auth/AuthGate';

const theme = createTheme({
  palette: {
    primary: {
      main: '#9bc41c', // Color primario institucional
    },
    secondary: {
      main: '#f08a00', // Color secundario institucional
    },
    text: {
      primary: '#666666', // Color terciario institucional
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthGate>
        {(name) => <AssessmentFlow displayName={name} />}
      </AuthGate>
    </ThemeProvider>
  );
}

export default App;
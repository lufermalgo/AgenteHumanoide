import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from './AuthProvider';
import { theme } from '../../styles/theme';
import LoadingSpinner from '../UI/LoadingSpinner';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.background} 0%, #e8e8e8 100%);
  padding: ${theme.spacing.md};
`;

const LoginCard = styled.div`
  background: ${theme.colors.backgroundCard};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  padding: ${theme.spacing.xxl};
  width: 100%;
  max-width: 450px;
  text-align: center;
`;

const Logo = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const LogoText = styled.h1`
  font-size: ${theme.typography.fontSizes.xxxl};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSizes.lg};
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.xl};
`;

const WelcomeText = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h2`
  font-size: ${theme.typography.fontSizes.xxl};
  font-weight: ${theme.typography.fontWeights.semibold};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
`;

const Description = styled.p`
  font-size: ${theme.typography.fontSizes.md};
  color: ${theme.colors.textLight};
  line-height: 1.6;
  margin-bottom: ${theme.spacing.lg};
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background-color: ${theme.colors.primary};
  color: ${theme.colors.textWhite};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.md};
  font-weight: ${theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${theme.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const GoogleIcon = styled.div`
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #4285f4;
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  background-color: ${theme.colors.error};
  color: white;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-top: ${theme.spacing.md};
  font-size: ${theme.typography.fontSizes.sm};
`;

const InfoBox = styled.div`
  background-color: ${theme.colors.info};
  color: white;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSizes.sm};
  
  strong {
    font-weight: ${theme.typography.fontWeights.semibold};
  }
`;

const LoginPage: React.FC = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Si ya está autenticado, redirigir al assessment
  if (user) {
    return <Navigate to="/assessment" replace />;
  }

  if (loading) {
    return <LoadingSpinner text="Verificando autenticación..." />;
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('🚀 Iniciando login con Google...');
      await signInWithGoogle();
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      
      // Manejar errores específicos
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelado por el usuario');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Error de red. Verifica que los emuladores estén corriendo.');
      } else if (error.message?.includes('@summan.com')) {
        setError('Solo usuarios de @summan.com pueden acceder');
      } else {
        setError(error.message || 'Error al iniciar sesión. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <LogoText>Assessmentia</LogoText>
          <Subtitle>Assessment de IA Generativa</Subtitle>
        </Logo>

        <WelcomeText>
          <Title>¡Bienvenido!</Title>
          <Description>
            Participa en nuestro assessment interactivo sobre IA generativa. 
            Esta sesión te tomará entre 5-10 minutos y nos ayudará a entender 
            mejor el conocimiento actual en la organización.
          </Description>
        </WelcomeText>

        <InfoBox>
          <strong>Importante:</strong> Solo puedes realizar este assessment una vez. 
          Asegúrate de tener tiempo suficiente antes de comenzar.
        </InfoBox>



        <LoginButton 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <GoogleIcon>G</GoogleIcon>
          {isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
        </LoginButton>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Description style={{ marginTop: theme.spacing.lg, fontSize: theme.typography.fontSizes.sm }}>
          Solo empleados de Summan SAS (@summan.com) pueden acceder.
        </Description>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
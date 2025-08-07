import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../Auth/AuthProvider';
import { theme } from '../../styles/theme';

const AssessmentContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.background} 0%, #e8e8e8 100%);
  padding: ${theme.spacing.lg};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  padding: ${theme.spacing.md} 0;
`;

const Logo = styled.h1`
  font-size: ${theme.typography.fontSizes.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.primary};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const UserName = styled.span`
  font-size: ${theme.typography.fontSizes.md};
  color: ${theme.colors.text};
  font-weight: ${theme.typography.fontWeights.medium};
`;

const LogoutButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: transparent;
  color: ${theme.colors.textLight};
  border: 1px solid ${theme.colors.textLight};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.sm};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${theme.colors.textLight};
    color: white;
  }
`;

const MainContent = styled.main`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  min-height: calc(100vh - 120px);

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
`;

const ContentSection = styled.div`
  background: ${theme.colors.backgroundCard};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const AvatarSection = styled.div`
  background: ${theme.colors.backgroundCard};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;

  @media (max-width: ${theme.breakpoints.tablet}) {
    min-height: 300px;
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
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

const StartButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background-color: ${theme.colors.primary};
  color: ${theme.colors.textWhite};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.lg};
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
`;

const AvatarPlaceholder = styled.div`
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSizes.xxxl};
  color: white;
  margin-bottom: ${theme.spacing.lg};
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: ${theme.spacing.lg};
  left: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  text-align: center;
  font-weight: ${theme.typography.fontWeights.medium};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${theme.colors.tertiary};
  color: ${theme.colors.textWhite};
`;

const AssessmentPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleStartAssessment = () => {
    // TODO: Implementar lógica para iniciar assessment
    console.log('Starting assessment...');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AssessmentContainer>
      <Header>
        <Logo>Assessmentia</Logo>
        <UserInfo>
          <UserName>
            Hola, {user?.displayName || user?.email?.split('@')[0]}
          </UserName>
          <LogoutButton onClick={handleLogout}>
            Salir
          </LogoutButton>
        </UserInfo>
      </Header>

      <MainContent>
        <ContentSection>
          <WelcomeMessage>
            <Title>¡Listo para comenzar!</Title>
            <Description>
              Te voy a hacer algunas preguntas sobre inteligencia artificial generativa. 
              No hay respuestas correctas o incorrectas, solo queremos conocer tu experiencia 
              y perspectiva actual.
            </Description>
            <Description>
              La sesión durará aproximadamente 5-10 minutos. Puedes responder de forma 
              natural y conversacional.
            </Description>
            <StartButton onClick={handleStartAssessment}>
              Comenzar Assessment
            </StartButton>
          </WelcomeMessage>
        </ContentSection>

        <AvatarSection>
          <StatusIndicator>Listo para comenzar</StatusIndicator>
          <AvatarPlaceholder>
            🤖
          </AvatarPlaceholder>
          <Description>
            Soy tu asistente virtual para este assessment. 
            ¡Conversemos sobre IA generativa!
          </Description>
        </AvatarSection>
      </MainContent>
    </AssessmentContainer>
  );
};

export default AssessmentPage;
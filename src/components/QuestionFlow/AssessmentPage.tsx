import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../Auth/AuthProvider';
import VoiceInterface from '../Voice/VoiceInterface';
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

// Preguntas de prueba para el assessment
const ASSESSMENT_QUESTIONS = [
  {
    id: 'q1',
    text: '¿Qué sabes sobre inteligencia artificial generativa? Cuéntame tu experiencia previa.',
    category: 'conocimiento_previo'
  },
  {
    id: 'q2', 
    text: '¿Has usado herramientas como ChatGPT, Gemini o Claude? Si es así, ¿para qué las has utilizado?',
    category: 'experiencia_herramientas'
  },
  {
    id: 'q3',
    text: '¿Cómo crees que la IA generativa podría ayudar en tu trabajo diario en Summan?',
    category: 'aplicacion_laboral'
  },
  {
    id: 'q4',
    text: '¿Qué preocupaciones o desafíos ves en el uso de IA generativa en el entorno empresarial?',
    category: 'preocupaciones'
  },
  {
    id: 'q5',
    text: '¿Te sientes cómodo aprendiendo nuevas herramientas de IA? ¿Qué tipo de capacitación preferirías?',
    category: 'capacitacion'
  }
];

const AssessmentPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<number>(-1); // -1 = welcome, 0+ = questions
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStartAssessment = () => {
    console.log('🚀 Iniciando assessment para:', user?.displayName);
    setCurrentQuestion(0);
  };

  const handleResponse = (response: string) => {
    const question = ASSESSMENT_QUESTIONS[currentQuestion];
    console.log('📝 Respuesta recibida:', { questionId: question.id, response });
    
    setResponses(prev => ({
      ...prev,
      [question.id]: response
    }));
  };

  const handleNext = () => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Assessment completado
      setIsCompleted(true);
      console.log('✅ Assessment completado:', responses);
    }
  };

  const handleSkip = () => {
    handleNext(); // Por ahora, saltar es igual a continuar
  };

  const handleRestart = () => {
    setCurrentQuestion(-1);
    setResponses({});
    setIsCompleted(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Renderizar vista de bienvenida
  const renderWelcomeView = () => (
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
            natural y conversacional usando tu voz.
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
  );

  // Renderizar vista de pregunta
  const renderQuestionView = () => {
    const question = ASSESSMENT_QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;
    
    return (
      <MainContent>
        <ContentSection>
          <div style={{ marginBottom: theme.spacing.lg }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: theme.spacing.md
            }}>
              <span style={{ 
                fontSize: theme.typography.fontSizes.sm,
                color: theme.colors.textLight 
              }}>
                Pregunta {currentQuestion + 1} de {ASSESSMENT_QUESTIONS.length}
              </span>
              <span style={{ 
                fontSize: theme.typography.fontSizes.sm,
                color: theme.colors.primary,
                fontWeight: theme.typography.fontWeights.medium
              }}>
                {Math.round(progress)}% completado
              </span>
            </div>
            
            {/* Barra de progreso */}
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: theme.colors.lightGray,
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: theme.colors.primary,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          <VoiceInterface
            question={question.text}
            onResponse={handleResponse}
            onNext={handleNext}
            onSkip={handleSkip}
            autoReadQuestion={true}
            maxRecordingTime={120} // 2 minutos máximo por respuesta
          />
        </ContentSection>

        <AvatarSection>
          <StatusIndicator>Pregunta {currentQuestion + 1}</StatusIndicator>
          <AvatarPlaceholder>
            🎙️
          </AvatarPlaceholder>
          <Description>
            Habla naturalmente. Tu respuesta será transcrita automáticamente.
          </Description>
        </AvatarSection>
      </MainContent>
    );
  };

  // Renderizar vista de finalización
  const renderCompletedView = () => (
    <MainContent>
      <ContentSection>
        <WelcomeMessage>
          <Title>¡Assessment Completado!</Title>
          <Description>
            Gracias por completar el assessment de IA generativa. 
            Tus respuestas nos ayudarán a diseñar mejores estrategias de capacitación.
          </Description>
          <Description>
            Respondiste {Object.keys(responses).length} de {ASSESSMENT_QUESTIONS.length} preguntas.
          </Description>
          
          <div style={{ 
            display: 'flex', 
            gap: theme.spacing.md, 
            justifyContent: 'center',
            marginTop: theme.spacing.xl
          }}>
            <StartButton onClick={handleRestart} style={{ 
              backgroundColor: theme.colors.secondary 
            }}>
              Realizar Nuevamente
            </StartButton>
            <StartButton onClick={handleLogout}>
              Finalizar Sesión
            </StartButton>
          </div>
        </WelcomeMessage>
      </ContentSection>

      <AvatarSection>
        <StatusIndicator>Completado</StatusIndicator>
        <AvatarPlaceholder>
          ✅
        </AvatarPlaceholder>
        <Description>
          ¡Excelente trabajo! Tu participación es muy valiosa para Summan.
        </Description>
      </AvatarSection>
    </MainContent>
  );

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

      {currentQuestion === -1 && renderWelcomeView()}
      {currentQuestion >= 0 && !isCompleted && renderQuestionView()}
      {isCompleted && renderCompletedView()}
    </AssessmentContainer>
  );
};

export default AssessmentPage;
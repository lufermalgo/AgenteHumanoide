import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../Auth/AuthProvider';
// Solo usamos GeminiVoiceInterface para experiencia fluida
import GeminiVoiceInterface from '../Voice/GeminiVoiceInterface';
import { theme } from '../../styles/theme';
import { AssessmentEngine, ASSESSMENT_QUESTIONS, AssessmentSession } from '../../services/assessmentEngine';

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
  const [assessmentEngine] = useState(() => new AssessmentEngine(ASSESSMENT_QUESTIONS));
  const [currentSession, setCurrentSession] = useState<AssessmentSession | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(-1); // -1 = welcome, 0+ = questions
  
  // Refs para tracking de tiempo
  const questionStartTimeRef = useRef<number>(0);
  const responseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Efecto para manejar tiempo máximo de respuesta
  useEffect(() => {
    if (currentQuestion >= 0 && currentSession) {
      const currentQuestionData = assessmentEngine.getCurrentQuestion();
      if (currentQuestionData?.maxResponseTime) {
        // Limpiar timer anterior
        if (responseTimerRef.current) {
          clearTimeout(responseTimerRef.current);
        }
        
        // Configurar nuevo timer
        responseTimerRef.current = setTimeout(() => {
          console.log('⏰ Tiempo máximo de respuesta alcanzado');
          // Aquí podrías mostrar un mensaje al usuario o avanzar automáticamente
        }, currentQuestionData.maxResponseTime * 1000);
      }
    }

    return () => {
      if (responseTimerRef.current) {
        clearTimeout(responseTimerRef.current);
      }
    };
  }, [currentQuestion, currentSession, assessmentEngine]);

  const handleStartAssessment = async () => {
    console.log('🚀 Iniciando assessment para:', user?.displayName);
    
    // Solicitar permisos de micrófono siguiendo patrón Open WebUI
    try {
      console.log('🎙️ Solicitando permisos de micrófono...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (stream) {
        console.log('✅ Permisos concedidos, liberando stream inicial');
        // Parar tracks inmediatamente como hace Open WebUI
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        
        // Iniciar sesión de assessment
        const session = assessmentEngine.startSession(
          user?.uid || 'anonymous',
          user?.displayName || 'Usuario'
        );
        setCurrentSession(session);
        
        console.log('🚀 Assessment iniciado con sesión:', session.sessionId);
        setCurrentQuestion(0);
        questionStartTimeRef.current = Date.now();
      }
    } catch (error) {
      console.error('❌ Error obteniendo permisos:', error);
      alert('Necesitamos acceso al micrófono para continuar. Por favor, permite el acceso y recarga la página.');
    }
  };

  const handleResponse = (response: string) => {
    if (!currentSession) {
      console.error('❌ No hay sesión activa');
      return;
    }

    // Calcular duración de la respuesta
    const responseDuration = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    
    // Guardar respuesta en el motor de assessment
    assessmentEngine.saveResponse(response, 0.9, responseDuration);
    
    console.log('📝 Respuesta guardada:', { 
      response, 
      duration: responseDuration,
      sessionId: currentSession.sessionId 
    });
  };

  const handleNext = () => {
    if (!currentSession) {
      console.error('❌ No hay sesión activa');
      return;
    }

    const result = assessmentEngine.nextQuestion();
    
    if (result.success) {
      if (result.isCompleted) {
        // Assessment completado
        setIsCompleted(true);
        const completedSession = assessmentEngine.getCurrentSession();
        console.log('✅ Assessment completado:', completedSession);
        
        // Mostrar estadísticas finales
        const stats = assessmentEngine.getSessionStats();
        console.log('📊 Estadísticas finales:', stats);
      } else {
        // Avanzar a siguiente pregunta
        setCurrentQuestion(prev => prev + 1);
        questionStartTimeRef.current = Date.now();
        console.log('➡️ Avanzando a pregunta:', result.nextQuestion?.id);
      }
    } else {
      console.warn('⚠️ No se pudo avanzar - pregunta requerida sin respuesta');
      // Aquí podrías mostrar un mensaje al usuario
    }
  };

  const handleSkip = () => {
    if (!currentSession) {
      console.error('❌ No hay sesión activa');
      return;
    }

    const result = assessmentEngine.skipQuestion();
    
    if (result.success) {
      if (result.isCompleted) {
        setIsCompleted(true);
        const completedSession = assessmentEngine.getCurrentSession();
        console.log('✅ Assessment completado (con preguntas saltadas):', completedSession);
      } else {
        setCurrentQuestion(prev => prev + 1);
        questionStartTimeRef.current = Date.now();
        console.log('⏭️ Pregunta saltada, avanzando a:', result.nextQuestion?.id);
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(-1);
    setCurrentSession(null);
    setIsCompleted(false);
    questionStartTimeRef.current = 0;
    
    // Limpiar timers
    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
    }
    
    console.log('🔄 Assessment reiniciado');
  };

  const handleLogout = async () => {
    try {
      // Limpiar recursos de audio antes del logout
      console.log('🔇 Limpiando recursos de audio antes del logout...');
      
      // Detener todas las pistas de audio activas
      if (navigator.mediaDevices) {
        try {
          await navigator.mediaDevices.enumerateDevices();
          // Esto no detiene streams activos, pero es una buena práctica
          console.log('✅ Recursos de audio enumerados');
        } catch (error) {
          console.warn('⚠️ Error enumerando dispositivos de audio:', error);
        }
      }
      
      // Detener síntesis de voz si está activa
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        console.log('✅ Síntesis de voz detenida');
      }
      
      // Detener reconocimiento de voz si está activo
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        // No podemos acceder directamente a las instancias activas,
        // pero podemos intentar detener cualquier reconocimiento activo
        console.log('✅ Recursos de reconocimiento de voz marcados para limpieza');
      }
      
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
    const currentQuestionData = assessmentEngine.getCurrentQuestion();
    const progress = assessmentEngine.getProgress();
    
    if (!currentQuestionData) {
      console.error('❌ No hay pregunta actual');
      return null;
    }
    
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
                Pregunta {progress.current} de {progress.total}
              </span>
              <span style={{ 
                fontSize: theme.typography.fontSizes.sm,
                color: theme.colors.primary,
                fontWeight: theme.typography.fontWeights.medium
              }}>
                {progress.percentage}% completado
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
                width: `${progress.percentage}%`,
                height: '100%',
                backgroundColor: theme.colors.primary,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

                  {/* Experiencia de voz fluida con Gemini */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.lg,
          padding: theme.spacing.md,
          background: theme.colors.backgroundCard,
          borderRadius: theme.borderRadius.md,
          fontSize: theme.typography.fontSizes.sm
        }}>
          <span>🧠</span>
          <span>Conversación inteligente con IA - Habla naturalmente</span>
        </div>

          <GeminiVoiceInterface
            question={currentQuestionData.text}
            onResponse={handleResponse}
            onNext={handleNext}
            onSkip={handleSkip}
            autoReadQuestion={true}
            onCleanup={() => {
              console.log('🔇 Limpieza solicitada desde AssessmentPage');
            }}
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
            {(() => {
              const stats = assessmentEngine.getSessionStats();
              return `Respondiste ${stats.answeredQuestions} de ${stats.totalQuestions} preguntas en ${Math.round(assessmentEngine.getSessionDuration() / 60)} minutos.`;
            })()}
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
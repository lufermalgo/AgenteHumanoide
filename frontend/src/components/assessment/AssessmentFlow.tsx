import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Paper, Button } from '@mui/material';
import AssessmentAudio from './AssessmentAudio';
import InteractionStatus from '../UI/InteractionStatus';
import { load_questions, AssessmentQuestion } from '../../services/questions';
import { save_answer, start_session } from '../../services/db';
import { 
  extract_preferred_first_name, 
  getAgentContext, 
  AgentContext,
  NameAnalysis 
} from '../../services/context';

interface Props { displayName: string; }

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

const QuestionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '800px',
  width: '100%',
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
}));

const Question = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

// const StatusIndicator = styled(Typography)(({ theme }) => ({
//   fontSize: '1rem',
//   color: theme.palette.text.secondary,
//   marginTop: theme.spacing(2),
//   fontStyle: 'italic',
// }));

const StartButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#9bc41c',
  color: 'white',
  padding: theme.spacing(2, 4),
  fontSize: '1.2rem',
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: theme.shadows[2],
  '&:hover': {
    backgroundColor: '#8bb31a',
    boxShadow: theme.shadows[4],
  },
  '&:active': {
    transform: 'translateY(1px)',
  },
}));

const WelcomeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  maxWidth: '600px',
  width: '100%',
  textAlign: 'center',
  borderRadius: theme.spacing(3),
  boxShadow: theme.shadows[4],
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
}));

const AssessmentFlow: React.FC<Props> = ({ displayName }) => {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [qIndex, setQIndex] = useState<number>(() => {
    const v = localStorage.getItem('assessmentia-qIndex');
    return v ? Math.max(0, parseInt(v, 10)) : 0;
  });
  const [sessionId, setSessionId] = useState<string>('');
  const [agentContext, setAgentContext] = useState<AgentContext | null>(null);
  const [preferredName, setPreferredName] = useState<string>('');
  const [nameAnalysis, setNameAnalysis] = useState<NameAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'speaking' | 'listening' | 'processing' | 'followup'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isStarted, setIsStarted] = useState<boolean>(false);
  // const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  const currentQuestion = questions[qIndex]?.text || 'Cargando pregunta…';
  const effectiveName = preferredName || nameAnalysis?.preferred || 'Hola';

  useEffect(() => {
    (async () => {
      try {
        // Cargar contexto del agente
        const context = await getAgentContext();
        setAgentContext(context);
        
        // Analizar nombre del usuario
        const analysis = extract_preferred_first_name(displayName, context);
        setNameAnalysis(analysis);
        setPreferredName(analysis.preferred);
        
        // Cargar preguntas
        const qs = await load_questions();
        setQuestions(qs);
        
        // Iniciar sesión
        const sid = (await start_session()) || '';
        setSessionId(sid);
        
        // Guardar nombre preferido en localStorage si es necesario
        if (analysis.needsAsk) {
          localStorage.setItem('assessmentia-needsNamePreference', 'true');
        }
        
        // setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing assessment:', error);
      }
    })();
  }, [displayName]);

  const handleStartAssessment = () => {
    setIsStarted(true);
    setCurrentPhase('speaking');
    setStatusMessage('Iniciando conversación...');
  };

  const handleTranscriptionComplete = async (text: string) => {
    setCurrentPhase('processing');
    setStatusMessage('Guardando respuesta...');
    setIsProcessing(true);
    try {
      const q = questions[qIndex];
      if (q && sessionId) {
        await save_answer(sessionId, q.id, q.text, text);
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    } finally {
      setIsProcessing(false);
      setCurrentPhase('idle');
      setStatusMessage('');
      // Avanzar a la siguiente pregunta
      setQIndex((i) => {
        const next = Math.min(i + 1, Math.max(0, questions.length - 1));
        localStorage.setItem('assessmentia-qIndex', String(next));
        return next;
      });
    }
  };

  const handleNamePreferenceSet = (newPreferredName: string) => {
    setPreferredName(newPreferredName);
    localStorage.setItem('assessmentia-preferredName', newPreferredName);
    localStorage.removeItem('assessmentia-needsNamePreference');
  };

  // Actualizar fase basada en el estado actual
  useEffect(() => {
    if (isSpeaking) {
      setCurrentPhase('speaking');
      setStatusMessage('Anita-AI está hablando...');
    } else if (isListening) {
      setCurrentPhase('listening');
      setStatusMessage('Escuchando tu respuesta...');
    } else if (isProcessing) {
      setCurrentPhase('processing');
      setStatusMessage('Procesando...');
    } else {
      setCurrentPhase('idle');
      setStatusMessage('');
    }
  }, [isSpeaking, isListening, isProcessing]);

  return (
    <Container>
      {!isStarted ? (
        <WelcomeCard>
          <Typography variant="h4" gutterBottom>
            Bienvenido a AssessmentIA
          </Typography>
          <Typography variant="body1" paragraph>
            Este es un sistema de evaluación automatizada.
            Para comenzar, por favor, haz un gesto de inicio.
          </Typography>
          <StartButton onClick={handleStartAssessment}>
            Iniciar Evaluación
          </StartButton>
        </WelcomeCard>
      ) : (
        <>
          <QuestionCard>
            <Question variant="h1">
              {currentQuestion}
            </Question>
          </QuestionCard>
          
          {/* Indicador visual de estado de interacción */}
          <Box sx={{ mb: 3, width: '100%', maxWidth: '400px' }}>
            <InteractionStatus
              phase={currentPhase}
              status={statusMessage}
              isListening={isListening}
              isSpeaking={isSpeaking}
            />
          </Box>
          
                     <AssessmentAudio
             onTranscriptionComplete={handleTranscriptionComplete}
             questionText={currentQuestion}
             userName={effectiveName}
             agentContext={agentContext}
             onNamePreferenceSet={handleNamePreferenceSet}
             nameAnalysis={nameAnalysis}
             onListeningChange={setIsListening}
             onSpeakingChange={setIsSpeaking}
             isStarted={isStarted}
           />
        </>
      )}
    </Container>
  );
};

export default AssessmentFlow;
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Paper } from '@mui/material';
import AssessmentAudio from './AssessmentAudio';
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

const StatusIndicator = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2),
  fontStyle: 'italic',
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
      } catch (error) {
        console.error('Error initializing assessment:', error);
      }
    })();
  }, [displayName]);

  const handleTranscriptionComplete = async (text: string) => {
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

  const getStatusText = (): string => {
    if (isSpeaking) return agentContext?.ui.indicators.speaking || 'Hablando…';
    if (isListening) return agentContext?.ui.indicators.listening || 'Escuchando…';
    if (isProcessing) return agentContext?.ui.indicators.processing || 'Procesando…';
    return '';
  };

  return (
    <Container>
      <QuestionCard>
        <Question variant="h1">
          {currentQuestion}
        </Question>
        {getStatusText() && (
          <StatusIndicator>
            {getStatusText()}
          </StatusIndicator>
        )}
      </QuestionCard>
      <AssessmentAudio
        onTranscriptionComplete={handleTranscriptionComplete}
        questionText={currentQuestion}
        userName={effectiveName}
        agentContext={agentContext}
        onNamePreferenceSet={handleNamePreferenceSet}
        nameAnalysis={nameAnalysis}
        onListeningChange={setIsListening}
        onSpeakingChange={setIsSpeaking}
      />
    </Container>
  );
};

export default AssessmentFlow;
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { useAudioPermissions } from '../../hooks/useAudioPermissions';
import AudioPermissionRequest from './AudioPermissionRequest';
import VoiceRecorder from './VoiceRecorder';
import VoiceSynthesis from './VoiceSynthesis';

const InterfaceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  max-width: 600px;
  margin: 0 auto;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSizes.lg};
  font-weight: ${theme.typography.fontWeights.semibold};
  color: ${theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const QuestionText = styled.div`
  font-size: ${theme.typography.fontSizes.lg};
  color: ${theme.colors.text};
  line-height: 1.6;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.backgroundCard};
  border-radius: ${theme.borderRadius.md};
  border-left: 4px solid ${theme.colors.primary};
`;

const ResponseText = styled.div`
  font-size: ${theme.typography.fontSizes.md};
  color: ${theme.colors.text};
  line-height: 1.5;
  padding: ${theme.spacing.md};
  background: ${theme.colors.backgroundCard};
  border-radius: ${theme.borderRadius.md};
  min-height: 60px;
  border: 2px dashed ${theme.colors.lightGray};
  
  &:empty::before {
    content: 'Tu respuesta aparecerá aquí después de grabar...';
    color: ${theme.colors.textLight};
    font-style: italic;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'success' }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.md};
  font-weight: ${theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  
  background: ${props => {
    switch (props.variant) {
      case 'success': return '#4CAF50';
      case 'secondary': return theme.colors.lightGray;
      default: return theme.colors.primary;
    }
  }};
  
  color: ${props => props.variant === 'secondary' ? theme.colors.text : 'white'};

  &:hover {
    transform: translateY(-1px);
    background: ${props => {
      switch (props.variant) {
        case 'success': return '#45a049';
        case 'secondary': return theme.colors.tertiary;
        default: return theme.colors.secondary;
      }
    }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusIndicator = styled.div<{ status: 'idle' | 'listening' | 'processing' | 'ready' | 'error' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  
  background: ${props => {
    switch (props.status) {
      case 'listening': return '#2196F3';
      case 'processing': return '#FF9800';
      case 'ready': return '#4CAF50';
      case 'error': return '#F44336';
      default: return theme.colors.lightGray;
    }
  }};
  
  color: ${props => props.status === 'idle' ? theme.colors.text : 'white'};
`;

export interface VoiceInterfaceProps {
  question: string;
  onResponse: (response: string) => void;
  onNext?: () => void;
  onSkip?: () => void;
  autoReadQuestion?: boolean;
  maxRecordingTime?: number;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  question,
  onResponse,
  onNext,
  onSkip,
  autoReadQuestion = true,
  maxRecordingTime = 60
}) => {
  const [audioState, audioActions] = useAudioPermissions();
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'ready' | 'error'>('idle');
  const [hasReadQuestion, setHasReadQuestion] = useState(false);

  // Auto-leer pregunta cuando se otorgan permisos
  useEffect(() => {
    if (autoReadQuestion && audioState.permission === 'granted' && question && !hasReadQuestion) {
      setHasReadQuestion(true);
    }
  }, [audioState.permission, question, autoReadQuestion, hasReadQuestion]);

  const handlePermissionGranted = (stream: MediaStream) => {
    console.log('✅ Permisos de audio concedidos, stream disponible');
    setStatus('idle');
  };

  const handleRecordingStart = () => {
    setStatus('listening');
    setResponse('');
  };

  const handleRecordingStop = () => {
    setStatus('processing');
  };

  const handleTranscription = (text: string, confidence?: number) => {
    setResponse(text);
    setStatus('ready');
    onResponse(text);
    console.log('📝 Transcripción recibida:', { text, confidence });
  };

  const handleRecordingError = (error: string) => {
    setStatus('error');
    console.error('❌ Error en grabación:', error);
  };

  const handleSynthesisStart = () => {
    console.log('🔊 Iniciando síntesis de pregunta');
  };

  const handleSynthesisEnd = () => {
    console.log('✅ Síntesis de pregunta completada');
  };

  const handleNext = () => {
    if (response && onNext) {
      onNext();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const clearResponse = () => {
    setResponse('');
    setStatus('idle');
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return '🎙️ Escuchando...';
      case 'processing': return '⚙️ Procesando audio...';
      case 'ready': return '✅ Respuesta lista';
      case 'error': return '❌ Error en grabación';
      default: return '💬 Listo para grabar';
    }
  };

  // Si no hay permisos, mostrar solicitud
  if (audioState.permission !== 'granted') {
    return (
      <InterfaceContainer>
        <AudioPermissionRequest 
          onPermissionGranted={handlePermissionGranted}
          onSkip={onSkip}
        />
      </InterfaceContainer>
    );
  }

  return (
    <InterfaceContainer>
      {/* Pregunta */}
      <Section>
        <SectionTitle>
          📋 Pregunta
        </SectionTitle>
        <QuestionText>{question}</QuestionText>
        
        {/* Síntesis de la pregunta */}
        <VoiceSynthesis
          text={question}
          autoPlay={hasReadQuestion}
          showControls={false}
          onStart={handleSynthesisStart}
          onEnd={handleSynthesisEnd}
        />
      </Section>

      {/* Estado del sistema */}
      <StatusIndicator status={status}>
        {getStatusText()}
      </StatusIndicator>

      {/* Grabador de voz */}
      <Section>
        <SectionTitle>
          🎙️ Tu Respuesta
        </SectionTitle>
        
        <VoiceRecorder
          engine="web"
          onTranscription={handleTranscription}
          onRecordingStart={handleRecordingStart}
          onRecordingStop={handleRecordingStop}
          onError={handleRecordingError}
          maxDuration={maxRecordingTime}
          autoStop={true}
        />
      </Section>

      {/* Respuesta transcrita */}
      {response && (
        <Section>
          <SectionTitle>
            📝 Transcripción
          </SectionTitle>
          <ResponseText>{response}</ResponseText>
          
          {/* Reproducir respuesta */}
          <VoiceSynthesis
            text={response}
            autoPlay={false}
            showControls={false}
          />
        </Section>
      )}

      {/* Botones de acción */}
      <ActionButtons>
        {response && (
          <>
            <ActionButton onClick={clearResponse}>
              🔄 Grabar de Nuevo
            </ActionButton>
            
            {onNext && (
              <ActionButton variant="success" onClick={handleNext}>
                ✅ Continuar
              </ActionButton>
            )}
          </>
        )}
        
        {onSkip && (
          <ActionButton variant="secondary" onClick={handleSkip}>
            ⏭️ Saltar Pregunta
          </ActionButton>
        )}
      </ActionButtons>
    </InterfaceContainer>
  );
};

export default VoiceInterface;
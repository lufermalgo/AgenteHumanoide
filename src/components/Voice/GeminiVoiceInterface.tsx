import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { GeminiLiveService } from '../../services/geminiLiveService';

interface GeminiVoiceInterfaceProps {
  question: string;
  onResponse: (response: string) => void;
  onNext: () => void;
  onSkip: () => void;
  autoReadQuestion?: boolean;
  onCleanup?: () => void;
}

interface ConversationTurn {
  isUser: boolean;
  text: string;
  timestamp: Date;
}

const StatusIndicator = styled.div<{ status: string }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background-color: ${props => {
    switch (props.status) {
      case 'listening': return theme.colors.primary;
      case 'processing': return theme.colors.secondary;
      case 'speaking': return theme.colors.primary;
      case 'error': return theme.colors.secondary;
      case 'ready-to-listen': return theme.colors.primary;
      default: return theme.colors.lightGray;
    }
  }};
  color: white;
  font-size: ${theme.typography.fontSizes.sm};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
`;

const ConversationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  max-height: 300px;
  overflow-y: auto;
  padding: ${theme.spacing.md};
`;

const ConversationBubble = styled.div<{ isUser: boolean }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background-color: ${props => props.isUser ? theme.colors.primary : theme.colors.backgroundCard};
  color: ${props => props.isUser ? 'white' : theme.colors.text};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  max-width: 80%;
`;

const getStatusText = (status: string): string => {
  switch (status) {
    case 'listening': return '🎙️ Escuchando...';
    case 'processing': return '🔄 Procesando...';
    case 'speaking': return '🗣️ Hablando...';
    case 'error': return '❌ Error';
    case 'ready-to-listen': return '👂 Listo para escuchar';
    default: return '⏳ Iniciando...';
  }
};

const GeminiVoiceInterface: React.FC<GeminiVoiceInterfaceProps> = ({
  question,
  onResponse,
  onNext,
  onSkip,
  autoReadQuestion = true,
  onCleanup
}) => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'ready-to-listen'>('idle');
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [geminiService, setGeminiService] = useState<GeminiLiveService | null>(null);

  const addConversationTurn = useCallback((isUser: boolean, text: string) => {
    setConversation(prev => [...prev, {
      isUser,
      text,
      timestamp: new Date()
    }]);
  }, []);

  // Inicializar Gemini Live Service
  useEffect(() => {
    const initGemini = async () => {
      try {
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('REACT_APP_GEMINI_API_KEY no configurada');
        }

        const service = new GeminiLiveService(apiKey);
        
        await service.connect({
          onOpen: () => {
            console.log('✅ Conexión establecida');
            if (autoReadQuestion) {
              setStatus('speaking');
              addConversationTurn(false, question);
            }
          },
          onMessage: (text: string) => {
            if (text) {
              addConversationTurn(false, text);
              onResponse(text);
            }
          },
          onError: (error) => {
            console.error('❌ Error en sesión:', error);
            setStatus('error');
          },
          onClose: (reason) => {
            console.log('👋 Sesión cerrada:', reason);
            setStatus('idle');
          }
        });

        setGeminiService(service);
        setStatus('ready-to-listen');

      } catch (error) {
        console.error('❌ Error inicializando Gemini:', error);
        setStatus('error');
      }
    };

    initGemini();

    return () => {
      if (geminiService) {
        geminiService.disconnect();
      }
      onCleanup?.();
    };
  }, [question, autoReadQuestion, addConversationTurn, onCleanup]);

  // Manejar cambios de estado
  useEffect(() => {
    if (status === 'ready-to-listen' && geminiService) {
      geminiService.startRecording().catch(error => {
        console.error('❌ Error iniciando grabación:', error);
        setStatus('error');
      });
    }
  }, [status, geminiService]);

  return (
    <div>
      <StatusIndicator status={status}>
        {getStatusText(status)}
      </StatusIndicator>

      <ConversationContainer>
        {conversation.map((turn, index) => (
          <ConversationBubble key={index} isUser={turn.isUser}>
            {turn.text}
          </ConversationBubble>
        ))}
      </ConversationContainer>
    </div>
  );
};

export default GeminiVoiceInterface;
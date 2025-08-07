import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { GeminiLiveService, ASSESSMENT_GEMINI_CONFIG } from '../../services/geminiLive';

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

const ConversationArea = styled.div`
  min-height: 200px;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.backgroundCard};
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${theme.colors.lightGray};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ConversationBubble = styled.div<{ isUser: boolean }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  max-width: 80%;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.isUser ? theme.colors.primary : theme.colors.lightGray};
  color: ${props => props.isUser ? 'white' : theme.colors.text};
  font-size: ${theme.typography.fontSizes.md};
  line-height: 1.4;
  
  &::before {
    content: '${props => props.isUser ? '👤' : '🤖'}';
    margin-right: ${theme.spacing.sm};
  }
`;

const VoiceControls = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
  align-items: center;
`;

const VoiceButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isActive'].includes(prop)
})<{ isActive: boolean; variant?: 'primary' | 'secondary' }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid ${props => {
    if (props.variant === 'secondary') return theme.colors.secondary;
    return props.isActive ? '#ff4444' : theme.colors.primary;
  }};
  background: ${props => {
    if (props.variant === 'secondary') return theme.colors.secondary;
    return props.isActive ? '#ff4444' : theme.colors.primary;
  }};
  color: white;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  ${props => props.isActive && `
    animation: pulse 1.5s infinite;
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7); }
      70% { box-shadow: 0 0 0 20px rgba(255, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); }
    }
  `}
`;

const StatusIndicator = styled.div<{ status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error' }>`
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
      case 'speaking': return '#4CAF50';
      case 'error': return '#F44336';
      default: return theme.colors.lightGray;
    }
  }};
  
  color: ${props => props.status === 'idle' ? theme.colors.text : 'white'};
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

interface ConversationTurn {
  id: string;
  isUser: boolean;
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface GeminiVoiceInterfaceProps {
  question: string;
  onResponse: (response: string) => void;
  onNext?: () => void;
  onSkip?: () => void;
  autoReadQuestion?: boolean;
}

const GeminiVoiceInterface: React.FC<GeminiVoiceInterfaceProps> = ({
  question,
  onResponse,
  onNext,
  onSkip,
  autoReadQuestion = true
}) => {
  // Simplificar: no usar hook complejo, manejar stream directamente como Open WebUI
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [geminiService, setGeminiService] = useState<GeminiLiveService | null>(null);
  const [hasReadQuestion, setHasReadQuestion] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar Gemini Live API
  useEffect(() => {
    const initGemini = async () => {
      try {
        const service = new GeminiLiveService();
        
        // El servicio ahora funciona de forma síncrona con la API estándar
        console.log('✅ Servicio Gemini listo para transcripción');
        
        await service.connect(ASSESSMENT_GEMINI_CONFIG);
        setGeminiService(service);
        console.log('✅ Gemini conectado y listo para usar');
        
      } catch (error) {
        console.error('❌ Error inicializando Gemini Live:', error);
        setStatus('error');
      }
    };

    // Inicializar Gemini cuando el componente se monta
    if (!geminiService) {
      initGemini();
    }
    
    return () => {
      geminiService?.disconnect();
    };
  }, [geminiService]);

  // Cargar voces disponibles
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('🗣️ Voces cargadas:', voices.length);
      }
    };
    
    // Las voces pueden cargarse de forma asíncrona
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
    } else {
      loadVoices();
    }
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Auto-leer pregunta
  useEffect(() => {
    if (autoReadQuestion && geminiService?.connected && question && !hasReadQuestion) {
      readQuestion();
      setHasReadQuestion(true);
    }
  }, [autoReadQuestion, geminiService?.connected, question, hasReadQuestion]);

  const addConversationTurn = (isUser: boolean, text: string, audioUrl?: string) => {
    const turn: ConversationTurn = {
      id: Date.now().toString(),
      isUser,
      text,
      timestamp: new Date(),
      audioUrl
    };
    
    setConversation(prev => [...prev, turn]);
    
    if (isUser) {
      onResponse(text);
    }
  };

  const readQuestion = async () => {
    if (!geminiService?.connected) return;
    
    try {
      setStatus('speaking');
      
      // Buscar una voz en español más natural
      const voices = speechSynthesis.getVoices();
      console.log('🗣️ Voces disponibles:', voices.map(v => `${v.name} (${v.lang})`));
      
      // Priorizar voces colombianas, luego españolas, luego cualquier español
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('es-CO') || voice.lang.includes('es-MX') || voice.lang.includes('es-AR')
      ) || voices.find(voice => 
        voice.lang.includes('es-ES')
      ) || voices.find(voice => 
        voice.lang.startsWith('es')
      );
      
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.lang = 'es-CO'; // Colombiano si está disponible
      utterance.rate = 0.85; // Más lento para mejor comprensión
      utterance.pitch = 1.0; // Tono natural
      utterance.volume = 0.8; // Volumen cómodo
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('🗣️ Usando voz:', preferredVoice.name, preferredVoice.lang);
      }
      
      utterance.onend = () => {
        console.log('🗣️ Agente terminó de hablar, iniciando escucha automática...');
        setStatus('idle');
        // Iniciar escucha automática después de que termine de hablar
        setTimeout(() => {
          console.log('⏰ Timeout ejecutado, iniciando escucha automática...');
          if (geminiService?.connected) {
            console.log('🎙️ Iniciando escucha automática...');
            startListening();
          } else {
            console.warn('⚠️ Gemini no conectado');
          }
        }, 500); // Pequeña pausa para transición natural
      };
      utterance.onerror = (error) => {
        console.error('❌ Error en síntesis de voz:', error);
        setStatus('idle');
      };
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('❌ Error leyendo pregunta:', error);
      setStatus('error');
    }
  };

  const startListening = async () => {
    console.log('🎙️ Iniciando grabación siguiendo patrón Open WebUI...');
    console.log('- Gemini conectado:', geminiService?.connected);
    
    if (!geminiService?.connected) {
      console.error('❌ Gemini no está conectado');
      return;
    }
    
    // Solicitar stream como hace Open WebUI - cada vez que se necesita
    let audioStream: MediaStream | null = null;
    try {
      console.log('🎤 Solicitando stream de audio...');
      audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      if (!audioStream) {
        console.error('❌ No se pudo obtener stream');
        return;
      }
      
      console.log('✅ Stream obtenido correctamente');
      setStream(audioStream);
    } catch (err) {
      console.error('❌ Error accediendo al micrófono:', err);
      setStatus('error');
      return;
    }
    
    try {
      setIsListening(true);
      setStatus('listening');
      audioChunksRef.current = [];
      
      mediaRecorderRef.current = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('🎵 Datos de audio recibidos:', event.data.size, 'bytes');
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        console.log('🎤 Grabación detenida, procesando audio...');
        console.log('📊 Chunks de audio recolectados:', audioChunksRef.current.length);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        console.log('📁 Tamaño de audio final:', arrayBuffer.byteLength, 'bytes');
        
        if (arrayBuffer.byteLength === 0) {
          console.warn('⚠️ No se capturó audio');
          setStatus('idle');
          setIsListening(false);
          return;
        }
        
        setStatus('processing');
        
        try {
          console.log('🧠 Enviando audio a Gemini para transcripción...');
          // Procesar audio con Gemini AI para transcripción
          const transcription = await geminiService.processAudio(arrayBuffer, 'audio/webm;codecs=opus');
          
          console.log('✅ Transcripción recibida:', transcription);
          // Agregar transcripción a la conversación
          addConversationTurn(true, transcription);
          setStatus('idle');
          setIsListening(false); // Cambiar estado aquí después de procesar
          
        } catch (error) {
          console.error('❌ Error procesando audio:', error);
          setStatus('error');
          setIsListening(false); // Cambiar estado en caso de error
        }
      };
      
      // Agregar onerror para debugging
      mediaRecorderRef.current.onerror = (event) => {
        console.error('❌ Error en MediaRecorder:', event);
        setStatus('error');
      };
      
      mediaRecorderRef.current.start(100); // Capturar cada 100ms
      
      // Auto-detener después de 5 segundos de silencio (simulado por tiempo máximo)
      silenceTimeoutRef.current = setTimeout(() => {
        console.log('🔇 Deteniendo grabación automáticamente (silencio detectado)');
        console.log('⏰ Timeout ejecutado, llamando stopListening...');
        stopListening();
      }, 5000); // 5 segundos máximo de grabación continua
      
    } catch (error) {
      console.error('❌ Error iniciando grabación:', error);
      setStatus('error');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    console.log('⏹️ stopListening llamado, estado actual:', {
      mediaRecorder: !!mediaRecorderRef.current,
      isListening,
      mediaRecorderState: mediaRecorderRef.current?.state
    });
    
    if (mediaRecorderRef.current && isListening) {
      console.log('⏹️ Deteniendo grabación...');
      
      try {
        mediaRecorderRef.current.stop();
        console.log('✅ MediaRecorder.stop() ejecutado');
        // NO cambiar isListening aquí - dejarlo para que onstop procese
      } catch (error) {
        console.error('❌ Error deteniendo MediaRecorder:', error);
        setIsListening(false); // Solo cambiar si hay error
      }
      
      // Limpiar timeout de silencio
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      
      // Parar stream como hace Open WebUI
      if (stream) {
        console.log('🔇 Parando tracks del stream...');
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        setStream(null);
      }
    } else {
      console.log('⚠️ No se puede detener: MediaRecorder no disponible o no está grabando');
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleNext = () => {
    if (conversation.some(turn => turn.isUser) && onNext) {
      onNext();
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return '🎙️ Escuchando...';
      case 'processing': return '⚙️ Procesando con Gemini...';
      case 'speaking': return '🗣️ Hablando...';
      case 'error': return '❌ Error de conexión';
      default: return '💬 Listo para conversar';
    }
  };

  // Simplificar: no verificar permisos aquí, Open WebUI los maneja en cada uso

  return (
    <InterfaceContainer>
      {/* Pregunta */}
      <Section>
        <SectionTitle>
          📋 Pregunta
        </SectionTitle>
        <QuestionText>{question}</QuestionText>
      </Section>

      {/* Estado del sistema */}
      <StatusIndicator status={status}>
        {getStatusText()}
      </StatusIndicator>

      {/* Área de conversación */}
      <Section>
        <SectionTitle>
          💬 Conversación
        </SectionTitle>
        
        <ConversationArea>
          {conversation.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: theme.colors.textLight,
              fontStyle: 'italic',
              padding: theme.spacing.xl
            }}>
              La conversación aparecerá aquí...
            </div>
          ) : (
            conversation.map(turn => (
              <ConversationBubble key={turn.id} isUser={turn.isUser}>
                {turn.text}
              </ConversationBubble>
            ))
          )}
        </ConversationArea>
      </Section>

      {/* Estado de conversación */}
      <VoiceControls>
        <StatusIndicator status={status}>
          {getStatusText()}
        </StatusIndicator>
        
        {/* Botones de control */}
        {status === 'idle' && !isListening && conversation.length === 0 && (
          <VoiceButton
            isActive={false}
            variant="secondary"
            onClick={handleVoiceToggle}
            title="Iniciar conversación manualmente"
          >
            🎙️ Hablar
          </VoiceButton>
        )}
        
        {isListening && (
          <VoiceButton
            isActive={true}
            variant="secondary"
            onClick={stopListening}
            title="Detener grabación manualmente"
          >
            ⏹️ Detener
          </VoiceButton>
        )}
      </VoiceControls>

      {/* Botones de acción */}
      <ActionButtons>
        {conversation.some(turn => turn.isUser) && onNext && (
          <ActionButton variant="success" onClick={handleNext}>
            ✅ Continuar
          </ActionButton>
        )}
        
        {onSkip && (
          <ActionButton variant="secondary" onClick={onSkip}>
            ⏭️ Saltar Pregunta
          </ActionButton>
        )}
      </ActionButtons>
    </InterfaceContainer>
  );
};

export default GeminiVoiceInterface;
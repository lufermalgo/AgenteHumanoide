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

const ConversationBubble = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isUser'].includes(prop)
})<{ isUser: boolean }>`
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
  }, [autoReadQuestion, geminiService?.connected, question, hasReadQuestion, readQuestion]);

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
      
      // Detectar interrupciones del usuario
      const checkForInterruption = () => {
        if (isListening) {
          console.log('🗣️ Usuario interrumpió al agente');
          speechSynthesis.cancel(); // Parar al agente
          setStatus('listening');
          return true;
        }
        return false;
      };
      
      // Verificar interrupciones cada 100ms
      const interruptionInterval = setInterval(() => {
        if (checkForInterruption()) {
          clearInterval(interruptionInterval);
        }
      }, 100);
      
      utterance.onend = () => {
        clearInterval(interruptionInterval);
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
        clearInterval(interruptionInterval);
        console.error('❌ Error en síntesis de voz:', error);
        setStatus('idle');
      };
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('❌ Error leyendo pregunta:', error);
      setStatus('idle');
    }
  };

  const startListening = async () => {
    console.log('🎙️ Iniciando escucha siguiendo patrón Open WebUI...');
    console.log('- Gemini conectado:', geminiService?.connected);
    if (!geminiService?.connected) {
      console.error('❌ Gemini no conectado');
      return;
    }

    // Usar Web Speech API como Open WebUI
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      try {
        setIsListening(true);
        setStatus('listening');
        
        // Crear SpeechRecognition object con tipos correctos
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const speechRecognition = new SpeechRecognition();
        
        // Configurar como Open WebUI
        speechRecognition.continuous = true;
        speechRecognition.interimResults = false;
        speechRecognition.lang = 'es-CO';
        
        let transcription = '';
        let timeoutId: NodeJS.Timeout;
        const inactivityTimeout = 3000; // 3 segundos de silencio
        
        speechRecognition.onstart = () => {
          console.log('🎤 Speech recognition iniciado');
        };
        
        speechRecognition.onresult = async (event: any) => {
          console.log('🎵 Speech reconocido:', event);
          
          // Limpiar timeout de inactividad
          clearTimeout(timeoutId);
          
          // Obtener transcripción
          const transcript = event.results[Object.keys(event.results).length - 1][0].transcript;
          transcription = `${transcription}${transcript}`;
          
          console.log('✅ Transcripción en tiempo real:', transcription);
          
          // Reiniciar timeout de inactividad
          timeoutId = setTimeout(() => {
            console.log('⏰ Timeout de inactividad, procesando transcripción final...');
            speechRecognition.stop();
          }, inactivityTimeout);
        };
        
        speechRecognition.onend = async () => {
          console.log('🎤 Speech recognition terminado, procesando transcripción...');
          clearTimeout(timeoutId);
          
          if (transcription.trim()) {
            console.log('✅ Transcripción final:', transcription);
            
            // Agregar transcripción a la conversación
            addConversationTurn(true, transcription);
            
            // Generar respuesta automática del agente
            try {
              console.log('🤖 Generando respuesta del agente...');
              const agentResponse = await geminiService.generateTextResponse(
                `El usuario respondió: "${transcription}". Genera una respuesta natural y empática que confirme que entendiste su respuesta y continúe la conversación de forma fluida. Responde de forma concisa.`
              );
              
              console.log('🤖 Respuesta del agente:', agentResponse);
              addConversationTurn(false, agentResponse);
              
              // Leer la respuesta del agente automáticamente
              const utterance = new SpeechSynthesisUtterance(agentResponse);
              utterance.lang = 'es-CO';
              utterance.rate = 0.85;
              utterance.pitch = 1.0;
              utterance.volume = 0.8;
              
              utterance.onend = () => {
                console.log('🤖 Agente terminó de responder, iniciando siguiente ciclo...');
                setStatus('idle');
                // Iniciar escucha automática para la siguiente interacción
                setTimeout(() => {
                  if (geminiService?.connected) {
                    startListening();
                  }
                }, 500);
              };
              
              setStatus('speaking');
              speechSynthesis.speak(utterance);
              
            } catch (error) {
              console.error('❌ Error generando respuesta del agente:', error);
              setStatus('idle');
              setIsListening(false);
            }
          } else {
            console.log('⚠️ No se detectó transcripción, reiniciando escucha...');
            setStatus('idle');
            setIsListening(false);
            // Reiniciar escucha automáticamente
            setTimeout(() => {
              if (geminiService?.connected) {
                startListening();
              }
            }, 1000);
          }
        };
        
        speechRecognition.onerror = (event: any) => {
          console.error('❌ Error en speech recognition:', event);
          setStatus('error');
          setIsListening(false);
        };
        
        // Iniciar recognition
        speechRecognition.start();
        
      } catch (error) {
        console.error('❌ Error iniciando speech recognition:', error);
        setStatus('error');
        setIsListening(false);
      }
    } else {
      console.error('❌ Speech Recognition no soportado en este navegador');
      setStatus('error');
      setIsListening(false);
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
        
        {/* Solo indicador de estado - sin botones manuales */}
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
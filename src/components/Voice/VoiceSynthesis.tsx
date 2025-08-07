import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { detectBrowserCapabilities } from '../../utils/browserCapabilities';

const SynthesisContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing.md};
`;

const SpeakButton = styled.button<{ isSpeaking: boolean; disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${props => 
    props.disabled ? theme.colors.lightGray :
    props.isSpeaking ? theme.colors.secondary : theme.colors.primary
  };
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.md};
  font-weight: ${theme.typography.fontWeights.medium};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  min-width: 120px;
  gap: ${theme.spacing.sm};

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    background: ${props => 
      props.disabled ? theme.colors.lightGray :
      props.isSpeaking ? theme.colors.secondary : theme.colors.secondary
    };
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }

  ${props => props.isSpeaking && `
    animation: speaking 1s infinite alternate;
    
    @keyframes speaking {
      0% { opacity: 0.8; }
      100% { opacity: 1; }
    }
  `}
`;

const VoiceControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  width: 100%;
  max-width: 300px;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
`;

const ControlLabel = styled.label`
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text};
  font-weight: ${theme.typography.fontWeights.medium};
  min-width: 80px;
`;

const ControlSlider = styled.input`
  flex: 1;
  height: 4px;
  background: ${theme.colors.lightGray};
  border-radius: 2px;
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: ${theme.colors.primary};
    border-radius: 50%;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: ${theme.colors.primary};
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

const ControlSelect = styled.select`
  flex: 1;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.lightGray};
  border-radius: ${theme.borderRadius.sm};
  background: white;
  font-size: ${theme.typography.fontSizes.sm};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const ControlValue = styled.span`
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.textLight};
  min-width: 40px;
  text-align: right;
`;

const StatusText = styled.div`
  margin-top: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.textLight};
  text-align: center;
`;

const ErrorMessage = styled.div`
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.error};
  color: white;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSizes.sm};
  text-align: center;
`;

export type SynthesisEngine = 'browser' | 'openai' | 'elevenlabs' | 'did';

export interface VoiceSynthesisProps {
  text: string;
  engine?: SynthesisEngine;
  autoPlay?: boolean;
  showControls?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

const VoiceSynthesis: React.FC<VoiceSynthesisProps> = ({
  text,
  engine = 'browser',
  autoPlay = false,
  showControls = true,
  onStart,
  onEnd,
  onError,
  disabled = false
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const capabilities = detectBrowserCapabilities();

  // Cargar voces disponibles
  useEffect(() => {
    if (!capabilities.hasSpeechSynthesis) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      
      // Filtrar voces en español o inglés
      const filteredVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('es') || voice.lang.startsWith('en')
      );
      
      setVoices(filteredVoices);
      
      // Seleccionar voz por defecto (preferir español)
      if (filteredVoices.length > 0 && !selectedVoice) {
        const spanishVoice = filteredVoices.find(v => v.lang.startsWith('es'));
        const defaultVoice = spanishVoice || filteredVoices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    
    // Las voces pueden cargarse de forma asíncrona
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [capabilities.hasSpeechSynthesis, selectedVoice]);

  // Auto-play cuando cambia el texto
  useEffect(() => {
    if (autoPlay && text && !disabled && !isSpeaking) {
      speak();
    }
  }, [text, autoPlay, disabled]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  const speak = async () => {
    if (!text || disabled || isSpeaking) return;

    try {
      setError(null);
      
      if (engine === 'browser') {
        await speakWithBrowser();
      } else {
        // TODO: Implementar otros engines (OpenAI, ElevenLabs, D-ID)
        throw new Error(`Engine ${engine} no implementado aún`);
      }
    } catch (err: any) {
      console.error('Error en síntesis de voz:', err);
      const errorMessage = err.message || 'Error al sintetizar voz';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const speakWithBrowser = async (): Promise<void> => {
    if (!capabilities.hasSpeechSynthesis) {
      throw new Error('Speech Synthesis no soportado en este navegador');
    }

    return new Promise((resolve, reject) => {
      // Cancelar cualquier síntesis en curso
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configurar voz
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }

      // Configurar parámetros
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Event listeners
      utterance.onstart = () => {
        setIsSpeaking(true);
        onStart?.();
        console.log('🔊 Iniciando síntesis de voz:', {
          text: text.substring(0, 50) + '...',
          voice: utterance.voice?.name || 'default',
          rate,
          pitch,
          volume
        });
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        onEnd?.();
        console.log('✅ Síntesis de voz completada');
        resolve();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        console.error('❌ Error en síntesis de voz:', event.error);
        reject(new Error(`Error de síntesis: ${event.error}`));
      };

      // Iniciar síntesis
      speechSynthesis.speak(utterance);
    });
  };

  const stop = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
      onEnd?.();
    }
  };

  const toggle = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak();
    }
  };

  const getButtonText = () => {
    if (disabled) return 'No disponible';
    if (isSpeaking) return 'Detener';
    return 'Reproducir';
  };

  const getButtonIcon = () => {
    if (disabled) return '🚫';
    if (isSpeaking) return '⏹️';
    return '🔊';
  };

  const getStatusText = () => {
    if (disabled) return 'Síntesis de voz no disponible';
    if (isSpeaking) return 'Reproduciendo...';
    if (!text) return 'Sin texto para reproducir';
    return `Listo para reproducir (${text.length} caracteres)`;
  };

  if (!capabilities.hasSpeechSynthesis && engine === 'browser') {
    return (
      <SynthesisContainer>
        <ErrorMessage>
          Tu navegador no soporta síntesis de voz
        </ErrorMessage>
      </SynthesisContainer>
    );
  }

  return (
    <SynthesisContainer>
      <SpeakButton
        onClick={toggle}
        isSpeaking={isSpeaking}
        disabled={disabled || !text}
        title={getStatusText()}
      >
        <span>{getButtonIcon()}</span>
        {getButtonText()}
      </SpeakButton>

      <StatusText>{getStatusText()}</StatusText>

      {showControls && engine === 'browser' && (
        <VoiceControls>
          <ControlGroup>
            <ControlLabel>Voz:</ControlLabel>
            <ControlSelect
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={disabled || isSpeaking}
            >
              {voices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </ControlSelect>
          </ControlGroup>

          <ControlGroup>
            <ControlLabel>Velocidad:</ControlLabel>
            <ControlSlider
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              disabled={disabled || isSpeaking}
            />
            <ControlValue>{rate.toFixed(1)}x</ControlValue>
          </ControlGroup>

          <ControlGroup>
            <ControlLabel>Tono:</ControlLabel>
            <ControlSlider
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              disabled={disabled || isSpeaking}
            />
            <ControlValue>{pitch.toFixed(1)}</ControlValue>
          </ControlGroup>

          <ControlGroup>
            <ControlLabel>Volumen:</ControlLabel>
            <ControlSlider
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              disabled={disabled || isSpeaking}
            />
            <ControlValue>{Math.round(volume * 100)}%</ControlValue>
          </ControlGroup>
        </VoiceControls>
      )}

      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}
    </SynthesisContainer>
  );
};

export default VoiceSynthesis;